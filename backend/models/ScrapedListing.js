const mongoose = require('mongoose');

const scrapedListingSchema = new mongoose.Schema({
    source: {
        type: String,
        enum: ['magicbricks', '99acres', 'housing_com', 'nobroker', 'govt_registry'],
        required: true
    },
    sourceListingId: { type: String, required: true },
    sourceUrl: { type: String },

    propertyType: {
        type: String,
        enum: ['Apartment', 'Villa', 'Commercial', 'Land', 'independent_house', 'plot', 'penthouse'],
    },
    city: { type: String, index: true },
    locality: { type: String, index: true },
    subLocality: { type: String },

    geoLocation: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number] } // [longitude, latitude]
    },

    areaSqft: { type: Number },
    bedrooms: { type: Number },
    bathrooms: { type: Number },
    floorNumber: { type: Number },
    totalFloors: { type: Number },
    ageOfPropertyYears: { type: Number },

    listedPrice: { type: Number },
    pricePerSqft: { type: Number },

    amenities: [{ type: String }],
    furnishingStatus: {
        type: String,
        enum: ['furnished', 'semi_furnished', 'unfurnished']
    },
    facingDirection: { type: String },

    rawData: { type: mongoose.Schema.Types.Mixed },

    scrapedAt: { type: Date, default: Date.now },
    listingDate: { type: Date },
    isActive: { type: Boolean, default: true },

    propertyGroupId: { type: mongoose.Schema.Types.ObjectId, index: true },
    isOutlier: { type: Boolean, default: false },
    outlierReason: { type: String },

    scrapingJobId: { type: mongoose.Schema.Types.ObjectId, ref: 'ScrapingJob' }
}, { timestamps: true });

// Geospatial index for proximity queries
scrapedListingSchema.index({ geoLocation: '2dsphere' });

// Unique per source for dedup
scrapedListingSchema.index({ source: 1, sourceListingId: 1 }, { unique: true });

// Compound index for comparable queries
scrapedListingSchema.index({ city: 1, locality: 1, propertyType: 1, bedrooms: 1 });

// Index on scrape time
scrapedListingSchema.index({ scrapedAt: 1 });

// Computed price per sqft before save
scrapedListingSchema.pre('save', function () {
    if (this.listedPrice && this.areaSqft && this.areaSqft > 0) {
        this.pricePerSqft = Math.round(this.listedPrice / this.areaSqft);
    }
});

module.exports = mongoose.model('ScrapedListing', scrapedListingSchema);
