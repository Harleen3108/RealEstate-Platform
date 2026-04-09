const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const MarketTrend = require('../models/MarketTrend');
const { TARGET_CITIES } = require('../services/scraping/cityConfig');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const basePrices = {
    'Mumbai': 18000,
    'Delhi NCR': 7500,
    'Bangalore': 9500,
    'Pune': 6500,
    'Hyderabad': 6000,
    'Chennai': 7000,
    'Gurgaon': 10500,
    'Noida': 5500,
    'Ahmedabad': 4500,
    'Kolkata': 5000
};

async function seedTrends() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected');

        console.log('Clearing existing trends...');
        await MarketTrend.deleteMany({});

        const propertyTypes = ['Apartment', 'Villa', 'Commercial', 'Land'];
        let createdCount = 0;

        for (const city of TARGET_CITIES) {
            const basePrice = basePrices[city] || 8000;

            for (const type of propertyTypes) {
                // Generate 24 months of data starting from 2 years ago up to current month
                let currentPrice = basePrice * (type === 'Villa' ? 1.5 : type === 'Commercial' ? 2 : type === 'Land' ? 0.8 : 1);
                
                // Backtrack to 24 months ago to start the simulation
                let simulatedPrice = currentPrice * 0.8; // Start 20% lower 2 years ago

                for (let i = 24; i >= 0; i--) {
                    const date = new Date();
                    date.setMonth(date.getMonth() - i);
                    date.setDate(1); 
                    
                    const periodStart = new Date(date);
                    periodStart.setHours(0,0,0,0);
                    
                    const periodEnd = new Date(date);
                    periodEnd.setMonth(periodEnd.getMonth() + 1);
                    periodEnd.setDate(0); // Last day of previous month
                    periodEnd.setHours(12, 0, 0, 0); // Noon to stay safe across timezones

                    // Random volatility (-1% to +3% monthly growth)
                    const growth = (Math.random() * 0.04) - 0.01;
                    simulatedPrice = Math.round(simulatedPrice * (1 + growth));

                    await MarketTrend.create({
                        city,
                        locality: 'All Localities',
                        propertyType: type,
                        periodStart,
                        periodEnd,
                        avgPricePerSqft: simulatedPrice,
                        medianPricePerSqft: Math.round(simulatedPrice * 0.95),
                        minPricePerSqft: Math.round(simulatedPrice * 0.75),
                        maxPricePerSqft: Math.round(simulatedPrice * 1.3),
                        listingCount: Math.round(80 + Math.random() * 300),
                        priceChangePct: +(growth * 100).toFixed(1),
                        demandScore: Math.round(50 + Math.random() * 40)
                    });
                    createdCount++;
                }
            }
            console.log(`Generated 24-month trends for ${city}`);
        }

        console.log(`\nSuccessfully seeded ${createdCount} market trend records.`);
        console.log('The Market Trends chart should now show multiple months and years correctly.');
        process.exit(0);
    } catch (err) {
        console.error('Seed error:', err.stack);
        process.exit(1);
    }
}

seedTrends();
