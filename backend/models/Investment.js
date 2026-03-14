const mongoose = require('mongoose');

const investmentSchema = new mongoose.Schema({
    investor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    propertyName: { type: String, required: true },
    location: { type: String },
    propertyType: { type: String, enum: ['Residential', 'Commercial', 'Industrial', 'Land'], default: 'Residential' },
    purchasePrice: { type: Number, required: true },
    currentValue: { type: Number, required: true },
    investmentDate: { type: Date, required: true },
    ownershipPercentage: { type: Number, required: true },
    documents: [{ type: String }],
    notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Investment', investmentSchema);
