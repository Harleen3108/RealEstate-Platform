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
    
    // Financial Details
    loanInformation: {
        loanTaken: { type: Boolean, default: false },
        bankName: { type: String },
        loanAmount: { type: Number },
        interestRate: { type: Number },
        loanStartDate: { type: Date },
        loanTenure: { type: String }, // years/months
        emiAmount: { type: Number }
    },
    paymentTracking: {
        totalPropertyCost: { type: Number },
        amountPaid: { type: Number },
        pendingAmount: { type: Number },
        paymentType: { 
            type: String, 
            enum: ['Loan', 'Cash', 'Mixed'],
            default: 'Cash'
        }
    },
    cashPayments: {
        cashPaidAmount: { type: Number },
        paymentDates: [{ type: Date }]
    },
    insuranceDetails: {
        provider: { type: String },
        insuranceType: { 
            type: String, 
            enum: ['home', 'property', 'loan insurance']
        },
        premiumAmount: { type: Number },
        policyStartDate: { type: Date },
        policyEndDate: { type: Date }
    },

    documents: [{ type: String }],
    notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Investment', investmentSchema);
