const ScrapedListing = require('../../models/ScrapedListing');
const GeocodingService = require('../normalization/GeocodingService');

class ComparableAnalysisAgent {
    async estimate(params) {
        const { city, locality, propertyType, areaSqft, bedrooms, floorNumber, ageYears, furnishing, amenities, geoCoords } = params;

        // Step 1: Find comparables — start with tight filters, expand if needed
        let comparables = await this.findComparables(city, locality, propertyType, bedrooms, geoCoords, 3000);

        // Step 2: Expand search if not enough
        if (comparables.length < 5) {
            comparables = await this.findComparables(city, locality, propertyType, bedrooms, geoCoords, 5000);
        }
        if (comparables.length < 5) {
            // Relax bedrooms by ±1
            comparables = await this.findComparables(city, locality, propertyType, null, geoCoords, 5000);
        }
        if (comparables.length < 3) {
            // Relax to city-wide
            comparables = await this.findComparablesCityWide(city, propertyType, bedrooms);
        }

        if (comparables.length === 0) {
            return { estimatedPricePerSqft: 0, estimatedTotalPrice: 0, comparableCount: 0, avgSimilarityScore: 0, searchRadiusKm: 5, adjustmentsApplied: [], comparablesUsed: [] };
        }

        // Step 3: Score each comparable
        const scored = comparables.map(comp => {
            const score = this.calculateSimilarity(comp, { areaSqft, bedrooms, floorNumber, ageYears, furnishing, geoCoords });
            return { ...comp.toObject ? comp.toObject() : comp, similarityScore: score };
        });

        // Step 4: Take top 15 by similarity
        scored.sort((a, b) => b.similarityScore - a.similarityScore);
        const topComps = scored.slice(0, 15);

        // Step 5: Weighted average price per sqft
        const totalWeight = topComps.reduce((sum, c) => sum + c.similarityScore, 0);
        let weightedPricePerSqft = totalWeight > 0
            ? topComps.reduce((sum, c) => sum + (c.pricePerSqft || 0) * c.similarityScore, 0) / totalWeight
            : topComps.reduce((sum, c) => sum + (c.pricePerSqft || 0), 0) / topComps.length;

        // Step 6: Apply adjustments
        const adjustments = [];

        // Floor premium: +3% per floor above 5th
        if (floorNumber && floorNumber > 5) {
            const floorPremium = Math.min((floorNumber - 5) * 0.03, 0.15); // Cap at 15%
            weightedPricePerSqft *= (1 + floorPremium);
            adjustments.push({ factor: 'high_floor_premium', impactPct: +(floorPremium * 100).toFixed(1) });
        }

        // Age discount: -5% per 5 years above comparable average
        if (ageYears) {
            const avgCompAge = topComps.reduce((s, c) => s + (c.ageOfPropertyYears || 0), 0) / topComps.length;
            if (ageYears > avgCompAge + 5) {
                const agePenalty = Math.min(Math.floor((ageYears - avgCompAge) / 5) * 0.05, 0.20);
                weightedPricePerSqft *= (1 - agePenalty);
                adjustments.push({ factor: 'age_discount', impactPct: -(agePenalty * 100).toFixed(1) });
            }
        }

        // Furnishing adjustment
        if (furnishing === 'unfurnished') {
            weightedPricePerSqft *= 0.98;
            adjustments.push({ factor: 'unfurnished_discount', impactPct: -2 });
        } else if (furnishing === 'furnished') {
            weightedPricePerSqft *= 1.03;
            adjustments.push({ factor: 'furnished_premium', impactPct: 3 });
        }

        // Premium amenities bonus
        const premiumAmenities = ['swimming_pool', 'club_house', 'gym'];
        if (amenities && premiumAmenities.every(a => amenities.includes(a))) {
            weightedPricePerSqft *= 1.08;
            adjustments.push({ factor: 'premium_amenities', impactPct: 8 });
        }

        const estimatedPricePerSqft = Math.round(weightedPricePerSqft);
        const estimatedTotalPrice = Math.round(estimatedPricePerSqft * areaSqft);
        const avgSimilarityScore = topComps.reduce((s, c) => s + c.similarityScore, 0) / topComps.length;

        return {
            estimatedPricePerSqft,
            estimatedTotalPrice,
            comparableCount: topComps.length,
            avgSimilarityScore: +avgSimilarityScore.toFixed(2),
            searchRadiusKm: 5,
            adjustmentsApplied: adjustments,
            comparablesUsed: topComps.slice(0, 5).map(c => ({
                id: c._id, price: c.listedPrice, pricePerSqft: c.pricePerSqft,
                similarityScore: +c.similarityScore.toFixed(2), source: c.source, locality: c.locality
            }))
        };
    }

    async findComparables(city, locality, propertyType, bedrooms, geoCoords, maxDistanceMeters) {
        const query = {
            city, propertyType,
            isOutlier: false, isActive: true,
            pricePerSqft: { $gt: 0 }, areaSqft: { $gt: 0 }
        };

        if (bedrooms) query.bedrooms = bedrooms;

        // Use geospatial query if coordinates available
        if (geoCoords && geoCoords.length === 2) {
            query.geoLocation = {
                $near: {
                    $geometry: { type: 'Point', coordinates: geoCoords },
                    $maxDistance: maxDistanceMeters
                }
            };
        } else {
            // Fallback to locality text match
            query.locality = new RegExp(locality, 'i');
        }

        try {
            return await ScrapedListing.find(query).limit(50).lean();
        } catch (error) {
            // If geospatial index not ready, fallback to locality match
            delete query.geoLocation;
            query.locality = new RegExp(locality, 'i');
            return await ScrapedListing.find(query).limit(50).lean();
        }
    }

    async findComparablesCityWide(city, propertyType, bedrooms) {
        const query = {
            city, propertyType,
            isOutlier: false, isActive: true,
            pricePerSqft: { $gt: 0 }, areaSqft: { $gt: 0 }
        };
        if (bedrooms) query.bedrooms = bedrooms;
        return await ScrapedListing.find(query).limit(30).lean();
    }

    calculateSimilarity(comp, target) {
        let score = 0;

        // Area difference: weight 0.30
        if (comp.areaSqft && target.areaSqft) {
            const areaDiff = Math.abs(comp.areaSqft - target.areaSqft) / target.areaSqft;
            score += 0.30 * Math.max(0, 1 - areaDiff);
        }

        // Location distance: weight 0.25
        if (comp.geoLocation?.coordinates?.length === 2 && target.geoCoords?.length === 2) {
            const dist = GeocodingService.haversineDistance(
                comp.geoLocation.coordinates[1], comp.geoLocation.coordinates[0],
                target.geoCoords[1], target.geoCoords[0]
            );
            score += 0.25 * Math.max(0, 1 - dist / 5);
        } else {
            score += 0.15; // Partial credit for same locality
        }

        // Age difference: weight 0.15
        if (comp.ageOfPropertyYears != null && target.ageYears != null) {
            const ageDiff = Math.abs(comp.ageOfPropertyYears - target.ageYears);
            score += 0.15 * Math.max(0, 1 - ageDiff / 20);
        } else {
            score += 0.075;
        }

        // Floor difference: weight 0.10
        if (comp.floorNumber != null && target.floorNumber != null) {
            const floorDiff = Math.abs(comp.floorNumber - target.floorNumber);
            score += 0.10 * Math.max(0, 1 - floorDiff / 30);
        } else {
            score += 0.05;
        }

        // Furnishing match: weight 0.10
        if (comp.furnishingStatus && target.furnishing) {
            if (comp.furnishingStatus === target.furnishing) score += 0.10;
            else score += 0.05;
        } else {
            score += 0.05;
        }

        // Source bonus: weight 0.10
        if (comp.source === 'govt_registry') score += 0.10;
        else score += 0.05;

        return Math.min(score, 1.0);
    }
}

module.exports = ComparableAnalysisAgent;
