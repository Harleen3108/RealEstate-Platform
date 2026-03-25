const ScrapedListing = require('../../models/ScrapedListing');

class OutlierDetector {
    async detectOutliers() {
        console.log('[OUTLIER] Starting outlier detection...');
        let flagged = 0;

        flagged += await this.detectPriceDeviations();
        flagged += await this.detectImpossibleCombinations();
        flagged += await this.detectZeroValues();
        flagged += await this.detectUnrealisticFloors();
        flagged += await this.detectCrossSourcePriceManipulation();

        console.log(`[OUTLIER] Done: ${flagged} listings flagged`);
        return { flagged };
    }

    async detectPriceDeviations() {
        let flagged = 0;
        const groups = await ScrapedListing.aggregate([
            { $match: { pricePerSqft: { $gt: 0 }, isOutlier: false, isActive: true } },
            {
                $group: {
                    _id: { city: '$city', locality: '$locality', propertyType: '$propertyType' },
                    prices: { $push: '$pricePerSqft' },
                    listingIds: { $push: '$_id' },
                    count: { $sum: 1 }
                }
            },
            { $match: { count: { $gte: 5 } } }
        ]);

        for (const group of groups) {
            const sorted = [...group.prices].sort((a, b) => a - b);
            const q1 = sorted[Math.floor(sorted.length * 0.25)];
            const q3 = sorted[Math.floor(sorted.length * 0.75)];
            const iqr = q3 - q1;
            const lowerBound = q1 - 1.5 * iqr;
            const upperBound = q3 + 1.5 * iqr;

            for (let i = 0; i < group.prices.length; i++) {
                if (group.prices[i] < lowerBound || group.prices[i] > upperBound) {
                    const reason = group.prices[i] < lowerBound ? 'price_deviation_low' : 'price_deviation_high';
                    await ScrapedListing.findByIdAndUpdate(group.listingIds[i], {
                        $set: { isOutlier: true, outlierReason: reason }
                    });
                    flagged++;
                }
            }
        }
        return flagged;
    }

    async detectImpossibleCombinations() {
        const r1 = await ScrapedListing.updateMany(
            { bedrooms: { $gte: 5 }, areaSqft: { $lt: 500, $gt: 0 }, isOutlier: false },
            { $set: { isOutlier: true, outlierReason: 'impossible_area_bhk_mismatch' } }
        );
        return r1.modifiedCount || 0;
    }

    async detectZeroValues() {
        const result = await ScrapedListing.updateMany(
            { isOutlier: false, $or: [{ listedPrice: 0 }, { listedPrice: null }, { areaSqft: 0 }] },
            { $set: { isOutlier: true, outlierReason: 'zero_value_field' } }
        );
        return result.modifiedCount || 0;
    }

    async detectUnrealisticFloors() {
        const result = await ScrapedListing.updateMany(
            { isOutlier: false, $or: [{ totalFloors: { $gt: 100 } }, { floorNumber: { $gt: 100 } }] },
            { $set: { isOutlier: true, outlierReason: 'unrealistic_floor_count' } }
        );
        return result.modifiedCount || 0;
    }

    async detectCrossSourcePriceManipulation() {
        let flagged = 0;
        const groups = await ScrapedListing.aggregate([
            { $match: { propertyGroupId: { $exists: true, $ne: null }, listedPrice: { $gt: 0 }, isOutlier: false } },
            { $group: { _id: '$propertyGroupId', prices: { $push: '$listedPrice' }, listingIds: { $push: '$_id' }, count: { $sum: 1 } } },
            { $match: { count: { $gte: 2 } } }
        ]);

        for (const group of groups) {
            const variance = (Math.max(...group.prices) - Math.min(...group.prices)) / Math.min(...group.prices);
            if (variance > 0.50) {
                await ScrapedListing.updateMany(
                    { _id: { $in: group.listingIds } },
                    { $set: { isOutlier: true, outlierReason: 'cross_source_price_manipulation' } }
                );
                flagged += group.listingIds.length;
            }
        }
        return flagged;
    }
}

module.exports = OutlierDetector;
