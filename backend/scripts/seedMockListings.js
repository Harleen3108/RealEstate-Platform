/**
 * Seed script — Populates the database with mock scraped listings
 * so the AI Price Estimation feature has data to work with.
 *
 * Run: node scripts/seedMockListings.js
 */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const ScrapedListing = require('../models/ScrapedListing');
const { getMockListingsForCity } = require('../services/scraping/mockData');
const { TARGET_CITIES } = require('../services/scraping/cityConfig');
const NormalizerService = require('../services/normalization/NormalizerService');

async function seed() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected');

        const existing = await ScrapedListing.countDocuments();
        if (existing > 0) {
            console.log(`Database already has ${existing} listings. Skipping seed.`);
            console.log('To re-seed, run: node scripts/seedMockListings.js --force');
            if (!process.argv.includes('--force')) {
                process.exit(0);
            }
            console.log('--force flag detected, clearing and re-seeding...');
            await ScrapedListing.deleteMany({});
        }

        const normalizer = new NormalizerService();
        const sources = ['magicbricks', '99acres', 'housing', 'nobroker', 'govt_registry'];
        let total = 0;

        for (const city of TARGET_CITIES) {
            console.log(`Seeding ${city}...`);
            for (const source of sources) {
                const listings = getMockListingsForCity(city, source);
                for (const listing of listings) {
                    try {
                        const normalizedCity = normalizer.normalizeCity(listing.city) || listing.city;
                        const normalizedType = normalizer.normalizePropertyType(listing.propertyType) || listing.propertyType;

                        await ScrapedListing.findOneAndUpdate(
                            { source: listing.source, sourceListingId: listing.sourceListingId },
                            {
                                ...listing,
                                city: normalizedCity,
                                propertyType: normalizedType,
                                pricePerSqft: listing.areaSqft > 0 ? Math.round(listing.listedPrice / listing.areaSqft) : 0,
                                isActive: true,
                                isOutlier: false,
                                scrapedAt: new Date()
                            },
                            { upsert: true, new: true }
                        );
                        total++;
                    } catch (e) {
                        // Skip duplicates silently
                    }
                }
            }
        }

        console.log(`\nDone! Seeded ${total} mock listings across ${TARGET_CITIES.length} cities.`);
        console.log('\nThe AI Price Estimation feature is now ready to use.');
        console.log('Tip: To enable Claude AI reasoning, set a real ANTHROPIC_API_KEY in .env');
        process.exit(0);
    } catch (err) {
        console.error('Seed failed:', err.message);
        process.exit(1);
    }
}

seed();
