const mongoose = require('mongoose');

const marketTrendSchema = new mongoose.Schema({
    city: { type: String, required: true },
    locality: { type: String, required: true },
    propertyType: {
        type: String,
        enum: ['Apartment', 'Villa', 'Commercial', 'Land'],
        required: true
    },
    bedrooms: { type: Number },

    periodStart: { type: Date, required: true },
    periodEnd: { type: Date, required: true },

    avgPricePerSqft: { type: Number },
    medianPricePerSqft: { type: Number },
    minPricePerSqft: { type: Number },
    maxPricePerSqft: { type: Number },
    listingCount: { type: Number, default: 0 },

    priceChangePct: { type: Number },
    demandScore: { type: Number, min: 0, max: 100 }
}, { timestamps: true });

marketTrendSchema.index(
    { city: 1, locality: 1, propertyType: 1, periodEnd: 1 },
    { unique: true }
);

module.exports = mongoose.model('MarketTrend', marketTrendSchema);
