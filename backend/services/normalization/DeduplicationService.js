const mongoose = require('mongoose');
const ScrapedListing = require('../../models/ScrapedListing');
const GeocodingService = require('./GeocodingService');

class DeduplicationService {
    async deduplicate() {
        console.log('[DEDUP] Starting deduplication...');
        let duplicatesFound = 0, groupsCreated = 0;

        const groups = await ScrapedListing.aggregate([
            { $match: { isOutlier: false, isActive: true } },
            {
                $group: {
                    _id: { city: '$city', locality: '$locality', propertyType: '$propertyType', bedrooms: '$bedrooms' },
                    listings: { $push: { _id: '$_id', source: '$source', areaSqft: '$areaSqft', listedPrice: '$listedPrice', geoLocation: '$geoLocation', propertyGroupId: '$propertyGroupId' } },
                    count: { $sum: 1 }
                }
            },
            { $match: { count: { $gt: 1 } } }
        ]);

        for (const group of groups) {
            const listings = group.listings;
            for (let i = 0; i < listings.length; i++) {
                for (let j = i + 1; j < listings.length; j++) {
                    if (listings[i].source === listings[j].source) continue;
                    if (this.areDuplicates(listings[i], listings[j])) {
                        const groupId = listings[i].propertyGroupId || listings[j].propertyGroupId || new mongoose.Types.ObjectId();
                        await ScrapedListing.updateMany(
                            { _id: { $in: [listings[i]._id, listings[j]._id] } },
                            { $set: { propertyGroupId: groupId } }
                        );
                        duplicatesFound++;
                        if (!listings[i].propertyGroupId && !listings[j].propertyGroupId) groupsCreated++;
                    }
                }
            }
        }

        console.log(`[DEDUP] Done: ${duplicatesFound} duplicates, ${groupsCreated} groups`);
        return { duplicatesFound, groupsCreated };
    }

    areDuplicates(a, b) {
        let matchScore = 0, totalChecks = 0;

        if (a.areaSqft && b.areaSqft) {
            totalChecks++;
            if (Math.abs(a.areaSqft - b.areaSqft) / Math.max(a.areaSqft, b.areaSqft) <= 0.05) matchScore++;
        }
        if (a.listedPrice && b.listedPrice) {
            totalChecks++;
            if (Math.abs(a.listedPrice - b.listedPrice) / Math.max(a.listedPrice, b.listedPrice) <= 0.20) matchScore++;
        }
        if (a.geoLocation?.coordinates?.length === 2 && b.geoLocation?.coordinates?.length === 2) {
            totalChecks++;
            const dist = GeocodingService.haversineDistance(
                a.geoLocation.coordinates[1], a.geoLocation.coordinates[0],
                b.geoLocation.coordinates[1], b.geoLocation.coordinates[0]
            );
            if (dist <= 0.1) matchScore++;
        }

        return totalChecks >= 2 && matchScore >= 2;
    }
}

module.exports = DeduplicationService;
