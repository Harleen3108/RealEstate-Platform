const mongoose = require('mongoose');

const geoCacheSchema = new mongoose.Schema({
    query: { type: String, required: true, unique: true },
    latitude: { type: Number },
    longitude: { type: Number },
    displayName: { type: String },
    city: { type: String },
    state: { type: String },
    pinCode: { type: String },
    cachedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// TTL: auto-expire after 180 days
geoCacheSchema.index({ cachedAt: 1 }, { expireAfterSeconds: 180 * 24 * 60 * 60 });

module.exports = mongoose.model('GeoCache', geoCacheSchema);
