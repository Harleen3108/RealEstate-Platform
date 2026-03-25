const cron = require('node-cron');
const ScrapingOrchestrator = require('./ScrapingOrchestrator');

let scheduledTask = null;
let trendTask = null;

const startScheduler = () => {
    const scrapeSchedule = process.env.CRON_SCRAPE_SCHEDULE || '0 2 * * *'; // Daily 2 AM
    const orchestrator = new ScrapingOrchestrator();

    // Daily full scrape
    scheduledTask = cron.schedule(scrapeSchedule, async () => {
        console.log(`[SCHEDULER] Starting daily scrape at ${new Date().toISOString()}`);
        try {
            const job = await orchestrator.runFullScrape('cron');
            console.log(`[SCHEDULER] Daily scrape completed: ${job.listingsFound} listings`);

            // Run normalization pipeline after scraping
            try {
                const NormalizerService = require('../normalization/NormalizerService');
                const normalizer = new NormalizerService();
                await normalizer.normalizeAll();
                console.log('[SCHEDULER] Post-scrape normalization completed');
            } catch (normErr) {
                console.error('[SCHEDULER] Normalization failed:', normErr.message);
            }
        } catch (error) {
            console.error('[SCHEDULER] Daily scrape failed:', error.message);
        }
    });

    // Weekly market trends aggregation (Sunday 3 AM)
    trendTask = cron.schedule('0 3 * * 0', async () => {
        console.log(`[SCHEDULER] Starting weekly market trends aggregation`);
        try {
            const MarketTrendAgent = require('../estimation/MarketTrendAgent');
            const trendAgent = new MarketTrendAgent();
            await trendAgent.generateTrendsFromListings();
            console.log('[SCHEDULER] Market trends aggregation completed');
        } catch (error) {
            console.error('[SCHEDULER] Market trends aggregation failed:', error.message);
        }
    });

    console.log(`[SCHEDULER] Scraping scheduled: ${scrapeSchedule}`);
    console.log('[SCHEDULER] Market trends aggregation: Sundays 3 AM');
};

const stopScheduler = () => {
    if (scheduledTask) {
        scheduledTask.stop();
        scheduledTask = null;
    }
    if (trendTask) {
        trendTask.stop();
        trendTask = null;
    }
    console.log('[SCHEDULER] All scheduled tasks stopped');
};

module.exports = { startScheduler, stopScheduler };
