const mongoose = require('mongoose');

const leaseAgreementSchema = new mongoose.Schema({
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
    
    // Property Details
    propertyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property'
    },
    propertyAddress: {
        type: String,
        required: true
    },
    propertyType: {
        type: String,
        enum: ['Apartment', 'Villa', 'House', 'Studio', 'Room'],
        default: 'Apartment'
    },
    bhk: {
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
    landlordAddress: {
        type: String
    },
    landlordAadharNumber: {
        type: String
    },
    
    // Lease Terms
    rentAmount: {
        type: Number,
        required: true
    },
    rentDueDate: {
        type: Number, // Day of month (1-31)
        default: 1
    },
    depositAmount: {
        type: Number,
        required: true
    },
    maintenanceCharges: {
        type: Number,
        default: 0
    },
    leasePeriodMonths: {
        type: Number,
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    
    // Terms & Conditions
    rentIncreasePercentage: {
        type: Number,
        default: 0
    },
    increaseFrequencyMonths: {
        type: Number,
        default: 12
    },
    utilitiesIncluded: [String], // e.g., ['water', 'electricity', 'internet']
    utilitiesNotIncluded: [String],
    noticePeriodMonths: {
        type: Number,
        default: 1
    },
    
    // Special Conditions
    petPolicy: {
        type: String,
        enum: ['Allowed', 'Not Allowed', 'With Permission'],
        default: 'Not Allowed'
    },
    smokingPolicy: {
        type: String,
        enum: ['Allowed', 'Not Allowed', 'Balcony Only'],
        default: 'Not Allowed'
    },
    guestPolicy: {
        type: String
    },
    additionalTerms: {
        type: String
    },
    
    // Status
    status: {
        type: String,
        enum: ['draft', 'active', 'expired', 'terminated'],
        default: 'draft'
    },
    isLandlordSigned: {
        type: Boolean,
        default: false
    },
    isTenantSigned: {
        type: Boolean,
        default: false
    },
    signedAt: {
        type: Date
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

// Auto-calculate end date if not provided
leaseAgreementSchema.pre('save', function() {
    if (!this.endDate && this.startDate && this.leasePeriodMonths) {
        const endDate = new Date(this.startDate);
        endDate.setMonth(endDate.getMonth() + this.leasePeriodMonths);
        this.endDate = endDate;
    }
});

// Auto-update status based on dates
leaseAgreementSchema.methods.updateStatus = function() {
    const now = new Date();
    if (now < this.startDate) {
        this.status = 'draft';
    } else if (now >= this.startDate && now <= this.endDate) {
        this.status = 'active';
    } else {
        this.status = 'expired';
    }
    return this.status;
};

module.exports = mongoose.model('LeaseAgreement', leaseAgreementSchema);
