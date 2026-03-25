const mongoose = require('mongoose');

const priceEstimationSchema = new mongoose.Schema({
    property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property' },

    input: {
        city: { type: String, required: true },
        locality: { type: String, required: true },
        propertyType: { type: String, required: true },
        areaSqft: { type: Number, required: true },
        bedrooms: { type: Number },
        bathrooms: { type: Number },
        floorNumber: { type: Number },
        totalFloors: { type: Number },
        ageYears: { type: Number },
        furnishing: { type: String },
        amenities: [{ type: String }]
    },

    estimatedPrice: { type: Number, required: true },
    priceLow: { type: Number, required: true },
    priceHigh: { type: Number, required: true },
    pricePerSqft: { type: Number },
    confidenceScore: { type: Number, min: 0, max: 100, required: true },
    estimationMethod: {
        type: String,
        enum: ['comparable_analysis', 'market_trend', 'llm_reasoning', 'hybrid'],
        default: 'hybrid'
    },

    comparableCount: { type: Number, default: 0 },
    comparableRadiusKm: { type: Number },
    marketTrend6mPct: { type: Number },
    marketTrend12mPct: { type: Number },

    factorsJson: { type: mongoose.Schema.Types.Mixed },
    sourceBreakdown: { type: mongoose.Schema.Types.Mixed },
    llmReasoning: { type: String },

    agentResults: {
        comparable: {
            estimatedPricePerSqft: { type: Number },
            estimatedTotalPrice: { type: Number },
            comparableCount: { type: Number },
            avgSimilarityScore: { type: Number },
            searchRadiusKm: { type: Number },
            adjustmentsApplied: [{ factor: String, impactPct: Number }],
            comparablesUsed: [{ type: mongoose.Schema.Types.Mixed }]
        },
        marketTrend: {
            projectedPricePerSqft: { type: Number },
            trend6mPct: { type: Number },
            trend12mPct: { type: Number },
            demandScore: { type: Number },
            seasonalityAdjustmentPct: { type: Number },
            dataPointsUsed: { type: Number },
            monthlyData: [{ type: mongoose.Schema.Types.Mixed }]
        },
        llmReasoning: {
            estimatedPriceTotal: { type: Number },
            estimatedPricePerSqft: { type: Number },
            confidence: { type: Number },
            reasoning: { type: String },
            positiveFactors: [{ type: String }],
            negativeFactors: [{ type: String }],
            riskFactors: [{ type: String }],
            marketTiming: { type: String, enum: ['good', 'neutral', 'wait'] },
            timingReasoning: { type: String }
        }
    },

    estimatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'failed'],
        default: 'pending'
    },
    processingTimeMs: { type: Number },
    error: { type: String }
}, { timestamps: true });

priceEstimationSchema.index({ property: 1, createdAt: -1 });
priceEstimationSchema.index({ createdAt: 1 });

module.exports = mongoose.model('PriceEstimation', priceEstimationSchema);
