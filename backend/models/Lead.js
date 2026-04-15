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
    isFlagged: { type: Boolean, default: false },
    assignedMember: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    paymentDetails: {
        purposeOrScopeOfWork: { type: String },
        status: { type: String, enum: ['Active', 'Complete', 'Pending'], default: 'Pending' },
        onboardingDate: { type: Date },
        totalProjectValue: { type: Number, default: 0 },
        advanceReceived: { type: Number, default: 0 },
        advanceDate: { type: Date },
        finalPayment: { type: Number, default: 0 },
        finalPaymentDate: { type: Date },
        totalCollected: { type: Number, default: 0 },
        balanceDue: { type: Number, default: 0 }
    }
}, { timestamps: true });

leadSchema.pre('save', function(next) {
    if (this.paymentDetails) {
        this.paymentDetails.totalCollected = (this.paymentDetails.advanceReceived || 0) + (this.paymentDetails.finalPayment || 0);
        this.paymentDetails.balanceDue = (this.paymentDetails.totalProjectValue || 0) - this.paymentDetails.totalCollected;
    }
    next();
});

module.exports = mongoose.model('Lead', leadSchema);
