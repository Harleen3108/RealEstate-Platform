const mockScrapedListings = [
    {
        source: 'magicbricks',
        sourceListingId: 'mb_test_001',
        propertyType: 'Apartment',
        city: 'Bangalore',
        locality: 'Whitefield',
        areaSqft: 1200,
        bedrooms: 2,
        bathrooms: 2,
        floorNumber: 5,
        totalFloors: 15,
        listedPrice: 7500000,
        pricePerSqft: 6250,
        amenities: ['Gym', 'Swimming Pool', 'Parking'],
        furnishingStatus: 'semi_furnished',
        ageOfProperty: 3,
        coordinates: { type: 'Point', coordinates: [77.7480, 12.9698] },
        scrapedAt: new Date('2025-03-01')
    },
    {
        source: '99acres',
        sourceListingId: '99a_test_002',
        propertyType: 'Apartment',
        city: 'Bangalore',
        locality: 'Whitefield',
        areaSqft: 1350,
        bedrooms: 3,
        bathrooms: 2,
        floorNumber: 8,
        totalFloors: 20,
        listedPrice: 9200000,
        pricePerSqft: 6815,
        amenities: ['Gym', 'Swimming Pool', 'Parking', 'Club House'],
        furnishingStatus: 'furnished',
        ageOfProperty: 1,
        coordinates: { type: 'Point', coordinates: [77.7510, 12.9710] },
        scrapedAt: new Date('2025-03-02')
    },
    {
        source: 'housing',
        sourceListingId: 'hc_test_003',
        propertyType: 'Apartment',
        city: 'Bangalore',
        locality: 'Koramangala',
        areaSqft: 1100,
        bedrooms: 2,
        bathrooms: 2,
        floorNumber: 3,
        totalFloors: 10,
        listedPrice: 8800000,
        pricePerSqft: 8000,
        amenities: ['Gym', 'Parking'],
        furnishingStatus: 'unfurnished',
        ageOfProperty: 5,
        coordinates: { type: 'Point', coordinates: [77.6245, 12.9352] },
        scrapedAt: new Date('2025-03-01')
    },
    {
        source: 'magicbricks',
        sourceListingId: 'mb_test_004',
        propertyType: 'Villa',
        city: 'Bangalore',
        locality: 'Whitefield',
        areaSqft: 2500,
        bedrooms: 4,
        bathrooms: 3,
        floorNumber: null,
        totalFloors: 2,
        listedPrice: 25000000,
        pricePerSqft: 10000,
        amenities: ['Garden', 'Parking', 'Club House'],
        furnishingStatus: 'furnished',
        ageOfProperty: 2,
        coordinates: { type: 'Point', coordinates: [77.7520, 12.9720] },
        scrapedAt: new Date('2025-03-03')
    },
    {
        source: 'nobroker',
        sourceListingId: 'nb_test_005',
        propertyType: 'Apartment',
        city: 'Mumbai',
        locality: 'Andheri West',
        areaSqft: 900,
        bedrooms: 2,
        bathrooms: 1,
        floorNumber: 12,
        totalFloors: 25,
        listedPrice: 15000000,
        pricePerSqft: 16667,
        amenities: ['Gym', 'Swimming Pool', 'Parking', 'Security'],
        furnishingStatus: 'semi_furnished',
        ageOfProperty: 4,
        coordinates: { type: 'Point', coordinates: [72.8362, 19.1364] },
        scrapedAt: new Date('2025-03-02')
    }
];

const mockOutlierListings = [
    {
        source: 'magicbricks',
        sourceListingId: 'mb_outlier_001',
        propertyType: 'Apartment',
        city: 'Bangalore',
        locality: 'Whitefield',
        areaSqft: 1200,
        bedrooms: 2,
        bathrooms: 2,
        listedPrice: 500000,  // Way too cheap — outlier
        pricePerSqft: 417
    },
    {
        source: '99acres',
        sourceListingId: '99a_outlier_002',
        propertyType: 'Apartment',
        city: 'Bangalore',
        locality: 'Whitefield',
        areaSqft: 50,  // Impossible: 3BHK in 50 sqft
        bedrooms: 3,
        bathrooms: 2,
        listedPrice: 7000000,
        pricePerSqft: 140000
    },
    {
        source: 'housing',
        sourceListingId: 'hc_outlier_003',
        propertyType: 'Apartment',
        city: 'Mumbai',
        locality: 'Andheri',
        areaSqft: 1000,
        bedrooms: 2,
        bathrooms: 2,
        floorNumber: 150,  // Impossible floor number
        listedPrice: 12000000,
        pricePerSqft: 12000
    }
];

module.exports = { mockScrapedListings, mockOutlierListings };
