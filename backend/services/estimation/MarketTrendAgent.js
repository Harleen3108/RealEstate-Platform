const MarketTrend = require('../../models/MarketTrend');
const ScrapedListing = require('../../models/ScrapedListing');

class MarketTrendAgent {
    async estimate(params) {
        const { city, locality, propertyType, bedrooms } = params;

        // Step 1: Query existing market trends
        let trends = await MarketTrend.find({
            city: new RegExp(`^${city}$`, 'i'),
            locality: new RegExp(locality, 'i'),
            propertyType
        }).sort({ periodEnd: -1 }).limit(12).lean();

        // Step 2: If sparse, generate on-the-fly from scraped listings
        if (trends.length < 3) {
            trends = await this.generateOnTheFly(city, locality, propertyType, bedrooms);
        }

        if (trends.length === 0) {
            return {
                projectedPricePerSqft: 0, trend6mPct: 0, trend12mPct: 0,
                demandScore: 50, seasonalityAdjustmentPct: 0, dataPointsUsed: 0, monthlyData: []
            };
        }

        // Step 3: Calculate metrics
        const monthlyData = trends.map(t => ({
            month: t.periodEnd ? new Date(t.periodEnd).toISOString().slice(0, 7) : t.period,
            avgPricePerSqft: t.avgPricePerSqft,
            listingCount: t.listingCount
        }));

        // 3-month moving average
        const recent3 = trends.slice(0, Math.min(3, trends.length));
        const movingAvg = recent3.reduce((s, t) => s + t.avgPricePerSqft, 0) / recent3.length;

        // 6-month trend
        const trend6mPct = trends.length >= 6
            ? ((trends[0].avgPricePerSqft - trends[5].avgPricePerSqft) / trends[5].avgPricePerSqft * 100)
            : (trends.length >= 2 ? ((trends[0].avgPricePerSqft - trends[trends.length - 1].avgPricePerSqft) / trends[trends.length - 1].avgPricePerSqft * 100) : 0);

        // 12-month trend
        const trend12mPct = trends.length >= 12
            ? ((trends[0].avgPricePerSqft - trends[11].avgPricePerSqft) / trends[11].avgPricePerSqft * 100)
            : trend6mPct;

        // Linear regression slope for projection
        const slope = this.linearRegressionSlope(trends.map(t => t.avgPricePerSqft).reverse());

        // Demand score
        const avgListings = trends.reduce((s, t) => s + (t.listingCount || 0), 0) / trends.length;
        const recentListings = trends[0]?.listingCount || avgListings;
        const demandScore = Math.min(100, Math.max(0, Math.round((recentListings / Math.max(avgListings, 1)) * 50)));

        // Seasonal adjustment for Indian market
        const currentMonth = new Date().getMonth() + 1;
        let seasonalityAdjustmentPct = 0;
        if (currentMonth >= 10 && currentMonth <= 12) seasonalityAdjustmentPct = 2; // Diwali
        else if (currentMonth >= 1 && currentMonth <= 3) seasonalityAdjustmentPct = 1; // FY end
        else if (currentMonth >= 5 && currentMonth <= 7) seasonalityAdjustmentPct = -1; // Monsoon

        // Project current price
        const projectedPricePerSqft = Math.round(movingAvg + slope + (movingAvg * seasonalityAdjustmentPct / 100));

        return {
            projectedPricePerSqft,
            trend6mPct: +trend6mPct.toFixed(2),
            trend12mPct: +trend12mPct.toFixed(2),
            demandScore,
            seasonalityAdjustmentPct,
            dataPointsUsed: trends.length,
            monthlyData
        };
    }

    async generateOnTheFly(city, locality, propertyType, bedrooms) {
        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

        const match = {
            city: new RegExp(`^${city}$`, 'i'),
            isOutlier: false, isActive: true,
            pricePerSqft: { $gt: 0 },
            scrapedAt: { $gte: twelveMonthsAgo }
        };
        if (locality) match.locality = new RegExp(locality, 'i');
        if (propertyType) match.propertyType = propertyType;

        const monthlyAgg = await ScrapedListing.aggregate([
            { $match: match },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m', date: '$scrapedAt' } },
                    avgPricePerSqft: { $avg: '$pricePerSqft' },
                    medianPrices: { $push: '$pricePerSqft' },
                    minPricePerSqft: { $min: '$pricePerSqft' },
                    maxPricePerSqft: { $max: '$pricePerSqft' },
                    listingCount: { $sum: 1 }
                }
            },
            { $sort: { _id: -1 } },
            { $limit: 12 }
        ]);

        return monthlyAgg.map(m => ({
            period: m._id,
            periodEnd: new Date(`${m._id}-28`),
            avgPricePerSqft: Math.round(m.avgPricePerSqft),
            medianPricePerSqft: this.median(m.medianPrices),
            minPricePerSqft: m.minPricePerSqft,
            maxPricePerSqft: m.maxPricePerSqft,
            listingCount: m.listingCount
        }));
    }

    async generateTrendsFromListings() {
        console.log('[MARKET_TRENDS] Generating trends from listings...');

        const groups = await ScrapedListing.aggregate([
            { $match: { isOutlier: false, isActive: true, pricePerSqft: { $gt: 0 } } },
            {
                $group: {
                    _id: {
                        city: '$city', locality: '$locality', propertyType: '$propertyType',
                        month: { $dateToString: { format: '%Y-%m', date: '$scrapedAt' } }
                    },
                    avgPricePerSqft: { $avg: '$pricePerSqft' },
                    minPricePerSqft: { $min: '$pricePerSqft' },
                    maxPricePerSqft: { $max: '$pricePerSqft' },
                    prices: { $push: '$pricePerSqft' },
                    listingCount: { $sum: 1 }
                }
            }
        ]);

        let created = 0;
        for (const g of groups) {
            const periodStart = new Date(`${g._id.month}-01`);
            const periodEnd = new Date(periodStart);
            periodEnd.setMonth(periodEnd.getMonth() + 1);
            periodEnd.setDate(periodEnd.getDate() - 1);

            await MarketTrend.findOneAndUpdate(
                { city: g._id.city, locality: g._id.locality, propertyType: g._id.propertyType, periodEnd },
                {
                    city: g._id.city, locality: g._id.locality, propertyType: g._id.propertyType,
                    periodStart, periodEnd,
                    avgPricePerSqft: Math.round(g.avgPricePerSqft),
                    medianPricePerSqft: this.median(g.prices),
                    minPricePerSqft: g.minPricePerSqft,
                    maxPricePerSqft: g.maxPricePerSqft,
                    listingCount: g.listingCount
                },
                { upsert: true }
            );
            created++;
        }

        console.log(`[MARKET_TRENDS] Generated ${created} trend records`);
        return { created };
    }

    linearRegressionSlope(values) {
        if (values.length < 2) return 0;
        const n = values.length;
        const xSum = (n * (n - 1)) / 2;
        const ySum = values.reduce((s, v) => s + v, 0);
        const xySum = values.reduce((s, v, i) => s + i * v, 0);
        const x2Sum = values.reduce((s, _, i) => s + i * i, 0);
        return (n * xySum - xSum * ySum) / (n * x2Sum - xSum * xSum) || 0;
    }

    median(arr) {
        if (!arr || arr.length === 0) return 0;
        const sorted = [...arr].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
    }
}

module.exports = MarketTrendAgent;
