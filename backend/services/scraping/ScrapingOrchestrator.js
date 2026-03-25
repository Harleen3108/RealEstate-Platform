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

    async runFullScrape(triggeredBy = 'cron', userId = null) {
        const job = await ScrapingJob.create({
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

        console.log(`[ORCHESTRATOR] Started job ${job._id} (${triggeredBy})`);

        let totalListings = 0;
        let totalNew = 0;

        for (const city of TARGET_CITIES) {
            const cityResults = await Promise.allSettled(
                this.scrapers.map(async (scraper, idx) => {
                    const sourceEntry = job.sources[idx];
                    sourceEntry.status = 'running';
                    sourceEntry.startedAt = new Date();
                    await job.save();

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
                                if (e.code !== 11000) { // Ignore duplicate key errors
                                    sourceEntry.errors.push(`${city}: ${e.message}`);
                                }
                            }
                        }

                        sourceEntry.listingsFound += listings.length;
                        sourceEntry.listingsNew += newCount;
                        sourceEntry.status = 'completed';
                        sourceEntry.completedAt = new Date();

                        return { source: scraper.sourceName, city, count: listings.length, new: newCount };
                    } catch (error) {
                        sourceEntry.status = 'failed';
                        sourceEntry.errors.push(`${city}: ${error.message}`);
                        sourceEntry.completedAt = new Date();
                        return { source: scraper.sourceName, city, count: 0, error: error.message };
                    }
                })
            );

            for (const result of cityResults) {
                if (result.status === 'fulfilled') {
                    totalListings += result.value.count;
                    totalNew += result.value.new || 0;
                }
            }

            await job.save();
        }

        // Finalize job
        const failedSources = job.sources.filter(s => s.status === 'failed').length;
        job.status = failedSources === job.sources.length ? 'failed' :
                     failedSources > 0 ? 'partial' : 'completed';
        job.listingsFound = totalListings;
        job.listingsNew = totalNew;
        job.completedAt = new Date();
        await job.save();

        console.log(`[ORCHESTRATOR] Job ${job._id} completed: ${totalListings} listings, ${totalNew} new`);

        return job;
    }

    async runCityScrape(city, triggeredBy = 'api', userId = null) {
        const job = await ScrapingJob.create({
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
