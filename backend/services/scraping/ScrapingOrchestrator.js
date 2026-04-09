const ScrapingJob = require('../../models/ScrapingJob');
const ScrapedListing = require('../../models/ScrapedListing');
const MagicBricksScraper = require('./MagicBricksScraper');
const NinetyNineAcresScraper = require('./NinetyNineAcresScraper');
const HousingComScraper = require('./HousingComScraper');
const NoBrokerScraper = require('./NoBrokerScraper');
const GovtRegistryScraper = require('./GovtRegistryScraper');
const { TARGET_CITIES } = require('./cityConfig');

class ScrapingOrchestrator {
    constructor() {
        this.scrapers = [
            new MagicBricksScraper(),
            new NinetyNineAcresScraper(),
            new HousingComScraper(),
            new NoBrokerScraper(),
            new GovtRegistryScraper()
        ];
    }

    async runFullScrape(triggeredBy = 'cron', userId = null, existingJobId = null) {
        let job;
        if (existingJobId) {
            job = await ScrapingJob.findById(existingJobId);
        }

        if (!job) {
            job = await ScrapingJob.create({
                sourceName: 'all',
                status: 'running',
                triggeredBy,
                triggeredByUser: userId,
                startedAt: new Date(),
                sources: this.scrapers.map(s => ({
                    name: s.sourceName,
                    status: 'pending',
                    listingsFound: 0,
                    listingsNew: 0,
                    errors: []
                }))
            });
        }

        console.log(`[ORCHESTRATOR] Started job ${job._id} (${triggeredBy})`);

        let totalListings = 0;
        let totalNew = 0;

        for (const city of TARGET_CITIES) {
            // Update source statuses to 'running' for this city atomically
            await ScrapingJob.findByIdAndUpdate(job._id, {
                $set: { 'sources.$[].status': 'running' }
            });

            const cityResults = await Promise.allSettled(
                this.scrapers.map(async (scraper, idx) => {
                    const timeoutPromise = new Promise((_, reject) => 
                        setTimeout(() => reject(new Error('Task timed out after 45s')), 45000)
                    );

                    try {
                        const listings = await Promise.race([
                            scraper.scrape({ city }),
                            timeoutPromise
                        ]);

                        let newCount = 0;
                        for (const listing of listings) {
                            try {
                                await ScrapedListing.findOneAndUpdate(
                                    { source: listing.source, sourceListingId: listing.sourceListingId },
                                    { $set: listing },
                                    { upsert: true, new: true }
                                );
                                newCount++;
                            } catch (e) {
                                if (e.code !== 11000) {
                                    await ScrapingJob.findByIdAndUpdate(job._id, {
                                        $push: { [`sources.${idx}.errors`]: `${city}: ${e.message}` }
                                    });
                                }
                            }
                        }

                        // Atomic update of counts to ensure UI reflects progress
                        await ScrapingJob.findByIdAndUpdate(job._id, {
                            $inc: { 
                                [`sources.${idx}.listingsFound`]: listings.length,
                                [`sources.${idx}.listingsNew`]: newCount
                            }
                        });
                        
                        return { source: scraper.sourceName, city, count: listings.length, new: newCount };
                    } catch (error) {
                        console.error(`[ORCHESTRATOR] Scraper ${scraper.sourceName} failed for ${city}: ${error.message}`);
                        return { source: scraper.sourceName, city, count: 0, error: error.message };
                    }
                })
            );

            // Update terminal statuses for this city iteration
            for (let idx = 0; idx < cityResults.length; idx++) {
                const result = cityResults[idx];
                const isSuccess = result.status === 'fulfilled' && !result.value.error;
                
                const update = {
                    $set: { [`sources.${idx}.completedAt`]: new Date() }
                };

                if (!isSuccess) {
                    const err = result.status === 'rejected' ? (result.reason?.message || 'Rejected') : result.value.error;
                    update.$set[`sources.${idx}.status`] = 'failed';
                    update.$push = { [`sources.${idx}.errors`]: `${city}: ${err}` };
                } else {
                    // Update total counts in local variables for final job update
                    totalListings += result.value.count;
                    totalNew += result.value.new || 0;
                }

                await ScrapingJob.findByIdAndUpdate(job._id, update);
            }
        }

        // Finalize job status
        const finalJob = await ScrapingJob.findById(job._id);
        const failedSources = finalJob.sources.filter(s => s.status === 'failed').length;
        
        await ScrapingJob.findByIdAndUpdate(job._id, {
            $set: {
                status: failedSources === finalJob.sources.length ? 'failed' :
                        failedSources > 0 ? 'partial' : 'completed',
                listingsFound: totalListings,
                listingsNew: totalNew,
                completedAt: new Date()
            }
        });

        console.log(`[ORCHESTRATOR] Job ${job._id} completed: ${totalListings} listings, ${totalNew} new`);
        return finalJob;
    }

    async runCityScrape(city, triggeredBy = 'api', userId = null, existingJobId = null) {
        let job;
        if (existingJobId) {
            job = await ScrapingJob.findById(existingJobId);
        }

        if (!job) {
            job = await ScrapingJob.create({
                sourceName: 'all',
                city,
                status: 'running',
                triggeredBy,
                triggeredByUser: userId,
                startedAt: new Date(),
                sources: this.scrapers.map(s => ({
                    name: s.sourceName,
                    status: 'pending',
                    listingsFound: 0,
                    listingsNew: 0,
                    errors: []
                }))
            });
        }

        const results = await Promise.allSettled(
            this.scrapers.map(async (scraper, idx) => {
                const sourceEntry = job.sources[idx];
                sourceEntry.status = 'running';
                sourceEntry.startedAt = new Date();

                try {
                    const listings = await scraper.scrape({ city });
                    let newCount = 0;

                    for (const listing of listings) {
                        try {
                            await ScrapedListing.findOneAndUpdate(
                                { source: listing.source, sourceListingId: listing.sourceListingId },
                                { $set: listing },
                                { upsert: true, new: true }
                            );
                            newCount++;
                        } catch (e) {
                            if (e.code !== 11000) {
                                sourceEntry.errors.push(e.message);
                            }
                        }
                    }

                    sourceEntry.listingsFound = listings.length;
                    sourceEntry.listingsNew = newCount;
                    sourceEntry.status = 'completed';
                    sourceEntry.completedAt = new Date();

                    return { source: scraper.sourceName, count: listings.length, new: newCount };
                } catch (error) {
                    sourceEntry.status = 'failed';
                    sourceEntry.errors.push(error.message);
                    sourceEntry.completedAt = new Date();
                    return { source: scraper.sourceName, count: 0, error: error.message };
                }
            })
        );

        const totalListings = results.reduce((sum, r) =>
            sum + (r.status === 'fulfilled' ? r.value.count : 0), 0);
        const totalNew = results.reduce((sum, r) =>
            sum + (r.status === 'fulfilled' ? (r.value.new || 0) : 0), 0);

        const failedSources = job.sources.filter(s => s.status === 'failed').length;
        job.status = failedSources === job.sources.length ? 'failed' :
                     failedSources > 0 ? 'partial' : 'completed';
        job.listingsFound = totalListings;
        job.listingsNew = totalNew;
        job.completedAt = new Date();
        await job.save();

        return job;
    }

    async getJobStatus(jobId) {
        return ScrapingJob.findById(jobId);
    }

    async getRecentJobs(limit = 10) {
        return ScrapingJob.find().sort({ createdAt: -1 }).limit(limit);
    }
}

module.exports = ScrapingOrchestrator;
