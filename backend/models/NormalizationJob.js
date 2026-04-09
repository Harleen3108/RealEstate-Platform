const mongoose = require('mongoose');

const normalizationJobSchema = new mongoose.Schema({
    status: {
        type: String,
        enum: ['queued', 'cleaning', 'geocoding', 'deduplicating', 'analyzing_outliers', 'completed', 'failed'],
        default: 'queued'
    },
    totalRecords: { type: Number, default: 0 },
    processedRecords: { type: Number, default: 0 },
    
    results: {
        cleaned: { type: Number, default: 0 },
        geocoded: { type: Number, default: 0 },
        deduplicated: { type: Number, default: 0 },
        outliersFound: { type: Number, default: 0 },
        errors: { type: Number, default: 0 }
    },

    errorMessage: { type: String },
    
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('NormalizationJob', normalizationJobSchema);
