const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    propertyType: { 
        type: String, 
        enum: ['Apartment', 'Villa', 'Commercial', 'Land', 'PG', 'CoLiving'], 
        required: true 
    },
    price: { type: Number, required: true },
    size: { type: Number, required: true }, // in sqft
    bedrooms: { type: Number },
    bathrooms: { type: Number },
    agency: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { 
        type: String, 
        enum: ['Available', 'Reserved', 'Under Contract', 'Sold', 'Blocked'], 
        default: 'Available' 
    },
    isApproved: { type: Boolean, default: false },
    images: [{ type: String }],
    documents: [{ type: String }],
    amenities: [{ type: String }],
    mapLocation: { type: String },
    builder: { type: String },

    // AI Price Estimation
    aiEstimation: {
        estimatedPrice: { type: Number },
        confidence: { type: Number },
        pricePerSqft: { type: Number },
        priceLow: { type: Number },
        priceHigh: { type: Number },
        lastEstimatedAt: { type: Date },
        estimationId: { type: mongoose.Schema.Types.ObjectId, ref: 'PriceEstimation' },
        marketTiming: { type: String, enum: ['good', 'neutral', 'wait'] },
        llmReasoning: { type: String }
    }
}, { timestamps: true });

module.exports = mongoose.model('Property', propertySchema);
