const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
    property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
    agency: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    message: { type: String },
    status: { 
        type: String, 
        enum: ['New Lead', 'Contacted', 'Site Visit', 'Negotiation', 'Booked', 'Sold', 'Lost', 'Closed'], 
        default: 'New Lead' 
    },
    source: {
        type: String,
        enum: ['Zillow Premium', 'Realtor.com', 'Facebook Ads', 'Organic Search', 'Direct'],
        default: 'Direct'
    },
    notes: [{ 
        content: String, 
        date: { type: Date, default: Date.now } 
    }],
    isFlagged: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Lead', leadSchema);
