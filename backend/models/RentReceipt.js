const mongoose = require('mongoose');

const rentReceiptSchema = new mongoose.Schema({
    // Receipt Details
    receiptNumber: {
        type: String,
        unique: true,
        sparse: true  // Allow null for new documents before pre-save generates it
    },
    receiptDate: {
        type: Date,
        default: Date.now
    },
    receiptMonth: {
        type: String, // 'YYYY-MM' format
        required: true
    },
    
    // Tenant Details
    tenantName: {
        type: String,
        required: true
    },
    tenantEmail: {
        type: String,
        required: true
    },
    tenantPhone: {
        type: String,
        required: true
    },
    tenantAddress: {
        type: String
    },
    tenantAadharNumber: {
        type: String
    },
    
    // Landlord Details
    landlordName: {
        type: String,
        required: true
    },
    landlordEmail: {
        type: String,
        required: true
    },
    landlordPhone: {
        type: String,
        required: true
    },
    landlordPAN: {
        type: String
    },
    landlordAddress: {
        type: String
    },
    
    // Property Details
    propertyAddress: {
        type: String,
        required: true
    },
    propertyType: {
        type: String
    },
    
    // Payment Details
    rentAmount: {
        type: Number,
        required: true
    },
    maintenanceCharges: {
        type: Number,
        default: 0
    },
    securityDeposit: {
        type: Number,
        default: 0
    },
    parkingCharges: {
        type: Number,
        default: 0
    },
    otherCharges: {
        type: Number,
        default: 0
    },
    totalAmount: {
        type: Number,
        default: 0  // Will be calculated in pre-save hook
    },
    
    // Payment Method
    paymentMethod: {
        type: String,
        enum: ['Cash', 'Cheque', 'Bank Transfer', 'Digital Payment', 'Online'],
        default: 'Bank Transfer'
    },
    paymentDetails: {
        chequeNumber: String,
        bankName: String,
        transactionId: String,
        reference: String
    },
    
    // Period Details
    period: {
        type: String, // e.g., "April 2026"
        required: true
    },
    
    // Lease Reference
    leaseAgreementId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'LeaseAgreement'
    },
    
    // Status
    status: {
        type: String,
        enum: ['draft', 'issued', 'accepted', 'cancelled'],
        default: 'draft'
    },
    isLandlordSigned: {
        type: Boolean,
        default: false
    },
    signedDate: {
        type: Date
    },
    
    // Notes & Terms
    notes: {
        type: String
    },
    termsAndConditions: {
        type: String
    },
    
    // Document Storage
    documentPath: {
        type: String // PDF file path
    },
    
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true });

// Auto-generate receipt number and calculate total
rentReceiptSchema.pre('save', async function() {
    // Generate receipt number if not present
    if (!this.receiptNumber) {
        const count = await mongoose.model('RentReceipt').countDocuments();
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        this.receiptNumber = `RR-${year}${month}-${String(count + 1).padStart(5, '0')}`;
    }
    
    // Always calculate total amount from components
    this.totalAmount = (this.rentAmount || 0) + 
                      (this.maintenanceCharges || 0) + 
                      (this.securityDeposit || 0) + 
                      (this.parkingCharges || 0) + 
                      (this.otherCharges || 0);
});

module.exports = mongoose.model('RentReceipt', rentReceiptSchema);
