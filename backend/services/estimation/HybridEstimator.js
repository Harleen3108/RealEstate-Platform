const ComparableAnalysisAgent = require('./ComparableAnalysisAgent');
const MarketTrendAgent = require('./MarketTrendAgent');
const LLMReasoningAgent = require('./LLMReasoningAgent');
const PriceEstimation = require('../../models/PriceEstimation');
const GeocodingService = require('../normalization/GeocodingService');
const { getBenchmark } = require('./locationBenchmarks');

class HybridEstimator {
    constructor() {
        this.comparableAgent = new ComparableAnalysisAgent();
        this.trendAgent = new MarketTrendAgent();
        this.llmAgent = new LLMReasoningAgent();
    }

    async estimate(params, userId = null) {
        const startTime = Date.now();

        // Parse location into city + locality
        const { city, locality } = this.parseLocation(params.location || '', params.city, params.locality);
        const propertyType = params.propertyType || 'Apartment';
        const areaSqft = params.size || params.areaSqft || 0;

        // Geocode the location for proximity queries
        let geoCoords = null;
        try {
            const geocoder = new GeocodingService();
            const geo = await geocoder.geocode(locality, city);
            if (geo) geoCoords = [geo.longitude, geo.latitude];
        } catch (e) {
            console.log('[ESTIMATOR] Geocoding skipped:', e.message);
        }

        const estimationParams = {
            city, locality, propertyType, areaSqft,
            bedrooms: params.bedrooms, bathrooms: params.bathrooms,
            floorNumber: params.floorNumber || params.floor,
            totalFloors: params.totalFloors,
            ageYears: params.ageYears || params.age,
            furnishing: params.furnishing,
            amenities: params.amenities || [],
            geoCoords
        };

        // Step 1: Run comparable and trend agents in parallel
        const [compResult, trendResult] = await Promise.allSettled([
            this.comparableAgent.estimate(estimationParams),
            this.trendAgent.estimate(estimationParams)
        ]);

        const comp = compResult.status === 'fulfilled' ? compResult.value : null;
        const trend = trendResult.status === 'fulfilled' ? trendResult.value : null;

        // Step 2: Run LLM reasoning with context from other agents
        let llm = null;
        try {
            llm = await this.llmAgent.estimate(estimationParams, comp, trend);
        } catch (e) {
            console.error('[ESTIMATOR] LLM failed:', e.message);
        }

        // Step 2b: Get location benchmark as reference
        const benchmark = getBenchmark(city, locality);
        const benchmarkPricePerSqft = benchmark ? benchmark.avg : 0;

        // Step 3: Dynamic weight calculation
        let weights = { comparable: 0.45, trend: 0.25, llm: 0.30 };

        if (!comp || comp.comparableCount < 5) {
            weights.comparable -= 0.10;
            weights.llm += 0.10;
        }
        if (!trend || trend.dataPointsUsed < 3) {
            weights.trend -= 0.10;
            weights.comparable += 0.10;
        }
        if (!llm || llm.confidence < 50) {
            weights.llm -= 0.15;
            weights.comparable += 0.15;
        }
        if (!llm || llm.estimatedPriceTotal === 0) {
            // LLM failed entirely — redistribute
            const llmWeight = weights.llm;
            weights.llm = 0;
            weights.comparable += llmWeight * 0.6;
            weights.trend += llmWeight * 0.4;
        }
        if (comp && comp.comparablesUsed && comp.comparablesUsed.some(c => c.source === 'govt_registry')) {
            weights.comparable += 0.10;
            weights.llm = Math.max(0, weights.llm - 0.10);
        }

        // Normalize weights to sum to 1.0
        const totalWeight = weights.comparable + weights.trend + weights.llm;
        if (totalWeight > 0) {
            weights.comparable /= totalWeight;
            weights.trend /= totalWeight;
            weights.llm /= totalWeight;
        }

        // Step 4: Calculate weighted price per sqft
        let weightedPricePerSqft = 0;
        let contributors = 0;

        if (comp && comp.estimatedPricePerSqft > 0) {
            weightedPricePerSqft += comp.estimatedPricePerSqft * weights.comparable;
            contributors++;
        }
        if (trend && trend.projectedPricePerSqft > 0) {
            weightedPricePerSqft += trend.projectedPricePerSqft * weights.trend;
            contributors++;
        }
        if (llm && llm.estimatedPricePerSqft > 0) {
            weightedPricePerSqft += llm.estimatedPricePerSqft * weights.llm;
            contributors++;
        }

        // If weighted approach produces 0, use any available estimate
        if (weightedPricePerSqft === 0) {
            if (comp && comp.estimatedPricePerSqft > 0) weightedPricePerSqft = comp.estimatedPricePerSqft;
            else if (llm && llm.estimatedPricePerSqft > 0) weightedPricePerSqft = llm.estimatedPricePerSqft;
            else if (trend && trend.projectedPricePerSqft > 0) weightedPricePerSqft = trend.projectedPricePerSqft;
            else if (benchmarkPricePerSqft > 0) weightedPricePerSqft = benchmarkPricePerSqft;
        }

        // Sanity check: if estimate is wildly off from benchmark, blend toward benchmark
        if (benchmarkPricePerSqft > 0 && weightedPricePerSqft > 0) {
            const ratio = weightedPricePerSqft / benchmarkPricePerSqft;
            if (ratio > 2.5 || ratio < 0.3) {
                // Extreme divergence — blend 50/50 with benchmark
                weightedPricePerSqft = Math.round((weightedPricePerSqft + benchmarkPricePerSqft) / 2);
            } else if (ratio > 1.5 || ratio < 0.5) {
                // Moderate divergence — blend 70/30 toward estimate
                weightedPricePerSqft = Math.round(weightedPricePerSqft * 0.7 + benchmarkPricePerSqft * 0.3);
            }
        }

        const estimatedPrice = Math.round(weightedPricePerSqft * areaSqft);
        const pricePerSqft = Math.round(weightedPricePerSqft);

        // Step 5: Confidence score
        let confidence = 50;
        if (comp) confidence = Math.max(confidence, 30 + Math.min(comp.comparableCount * 3, 30));
        if (trend && trend.dataPointsUsed >= 6) confidence += 10;
        if (llm && llm.confidence > 0) confidence = Math.round((confidence + llm.confidence) / 2);
        if (contributors >= 3) confidence += 10;
        confidence = Math.min(95, Math.max(10, confidence));

        // Step 6: Price range
        const spread = (100 - confidence) / 200;
        const priceLow = Math.round(estimatedPrice * (1 - spread));
        const priceHigh = Math.round(estimatedPrice * (1 + spread));

        // Step 7: Build factors
        const factors = [];
        if (comp && comp.adjustmentsApplied) {
            comp.adjustmentsApplied.forEach(a => {
                factors.push({ name: a.factor, impactPct: a.impactPct, direction: a.impactPct >= 0 ? 'positive' : 'negative' });
            });
        }
        if (llm) {
            (llm.positiveFactors || []).forEach(f => factors.push({ name: f, impactPct: 0, direction: 'positive' }));
            (llm.negativeFactors || []).forEach(f => factors.push({ name: f, impactPct: 0, direction: 'negative' }));
        }

        const processingTimeMs = Date.now() - startTime;

        // Step 8: Save to database
        const estimation = await PriceEstimation.create({
            property: params.propertyId || null,
            input: { city, locality, propertyType, areaSqft, bedrooms: params.bedrooms, bathrooms: params.bathrooms, floorNumber: params.floorNumber, ageYears: params.ageYears, furnishing: params.furnishing, amenities: params.amenities },
            estimatedPrice,
            priceLow,
            priceHigh,
            pricePerSqft,
            confidenceScore: confidence,
            estimationMethod: 'hybrid',
            comparableCount: comp ? comp.comparableCount : 0,
            comparableRadiusKm: comp ? comp.searchRadiusKm : 0,
            marketTrend6mPct: trend ? trend.trend6mPct : null,
            marketTrend12mPct: trend ? trend.trend12mPct : null,
            factorsJson: factors,
            sourceBreakdown: {
                comparable: { weight: weights.comparable, pricePerSqft: comp ? comp.estimatedPricePerSqft : 0, count: comp ? comp.comparableCount : 0 },
                trend: { weight: weights.trend, pricePerSqft: trend ? trend.projectedPricePerSqft : 0, dataPoints: trend ? trend.dataPointsUsed : 0 },
                llm: { weight: weights.llm, pricePerSqft: llm ? llm.estimatedPricePerSqft : 0, confidence: llm ? llm.confidence : 0 }
            },
            llmReasoning: llm ? llm.reasoning : null,
            agentResults: {
                comparable: comp || {},
                marketTrend: trend || {},
                llmReasoning: llm || {}
            },
            estimatedBy: userId,
            status: 'completed',
            processingTimeMs
        });

        return {
            _id: estimation._id,
            estimationId: estimation._id,
            estimatedPrice,
            priceLow,
            priceHigh,
            pricePerSqft,
            confidenceScore: confidence,
            estimationMethod: 'hybrid',
            sourceBreakdown: estimation.sourceBreakdown,
            factors,
            llmReasoning: llm ? llm.reasoning : null,
            marketTiming: llm ? llm.marketTiming : 'neutral',
            timingReasoning: llm ? llm.timingReasoning : '',
            comparableCount: comp ? comp.comparableCount : 0,
            trendData: {
                trend6mPct: trend ? trend.trend6mPct : 0,
                trend12mPct: trend ? trend.trend12mPct : 0,
                demandScore: trend ? trend.demandScore : 0
            },
            processingTimeMs,
            createdAt: estimation.createdAt
        };
    }

    parseLocation(location, city, locality) {
        if (city && locality) return { city, locality };
        if (!location) return { city: city || 'Unknown', locality: locality || 'Unknown' };

        // Try to parse "Locality, City" format
        const parts = location.split(',').map(s => s.trim());
        if (parts.length >= 2) {
            return { locality: parts[0], city: parts[parts.length - 1] };
        }
        return { city: location, locality: location };
    }
}

module.exports = HybridEstimator;
