const mongoose = require('mongoose');

const scrapingJobSchema = new mongoose.Schema({
    sourceName: {
        type: String,
        enum: ['magicbricks', '99acres', 'housing_com', 'nobroker', 'govt_registry', 'all']
    },
    city: { type: String },
    locality: { type: String },

    status: {
        type: String,
        enum: ['queued', 'running', 'completed', 'failed', 'rate_limited', 'partial'],
        default: 'queued'
    },

    listingsFound: { type: Number, default: 0 },
    listingsNew: { type: Number, default: 0 },
    listingsUpdated: { type: Number, default: 0 },
    errorMessage: { type: String },

    sources: [{
        name: { type: String },
        status: {
            type: String,
            enum: ['pending', 'running', 'completed', 'failed'],
            default: 'pending'
        },
        listingsFound: { type: Number, default: 0 },
        listingsNew: { type: Number, default: 0 },
        errors: [{ type: String }],
        startedAt: { type: Date },
        completedAt: { type: Date }
    }],

    triggeredBy: {
        type: String,
        enum: ['cron', 'manual', 'api'],
        default: 'cron'
    },
    triggeredByUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    startedAt: { type: Date },
    completedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('ScrapingJob', scrapingJobSchema);
