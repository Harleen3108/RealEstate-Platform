const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { protect, authorize } = require('../middleware/authMiddleware');
const Property = require('../models/Property');
const PriceEstimation = require('../models/PriceEstimation');
const ScrapingJob = require('../models/ScrapingJob');
const MarketTrend = require('../models/MarketTrend');
const ScrapedListing = require('../models/ScrapedListing');
const HybridEstimator = require('../services/estimation/HybridEstimator');
const ScrapingOrchestrator = require('../services/scraping/ScrapingOrchestrator');
const NormalizerService = require('../services/normalization/NormalizerService');
const GeocodingService = require('../services/normalization/GeocodingService');
const DeduplicationService = require('../services/normalization/DeduplicationService');
const OutlierDetector = require('../services/normalization/OutlierDetector');
const NormalizationJob = require('../models/NormalizationJob');


// @desc    Estimate price for given parameters (ad-hoc)
// @route   POST /api/estimation/estimate
// @access  Private
router.post('/estimate', protect, async (req, res) => {
    try {
        const { city, locality, location, propertyType, size, areaSqft, bedrooms, bathrooms, floorNumber, totalFloors, ageYears, furnishing, amenities } = req.body;

        const resolvedCity = city || '';
        const resolvedLocality = locality || '';
        const resolvedArea = size || areaSqft;

        if ((!resolvedCity && !location) || !propertyType || !resolvedArea) {
            return res.status(400).json({ message: 'city/location, propertyType, and size/areaSqft are required' });
        }

        const estimator = new HybridEstimator();
        const result = await estimator.estimate({
            city: resolvedCity, locality: resolvedLocality, location,
            propertyType, size: Number(resolvedArea), areaSqft: Number(resolvedArea),
            bedrooms: bedrooms ? Number(bedrooms) : undefined,
            bathrooms: bathrooms ? Number(bathrooms) : undefined,
            floorNumber: floorNumber ? Number(floorNumber) : undefined,
            totalFloors: totalFloors ? Number(totalFloors) : undefined,
            ageYears: ageYears ? Number(ageYears) : undefined,
            furnishing, amenities: amenities || []
        }, req.user._id);

        res.json(result);
    } catch (error) {
        console.error('[ESTIMATION] Error:', error.message);
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get estimation for an existing property
// @route   GET /api/estimation/property/:propertyId
// @access  Private
router.get('/property/:propertyId', protect, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.propertyId)) {
            return res.status(400).json({ message: 'Invalid property ID' });
        }

        // Check for recent cached estimation
        const existing = await PriceEstimation.findOne({
            property: req.params.propertyId,
            status: 'completed'
        }).sort({ createdAt: -1 });

        if (existing) {
            const hoursOld = (Date.now() - existing.createdAt.getTime()) / (1000 * 60 * 60);
            if (hoursOld < (parseInt(process.env.ESTIMATION_CACHE_TTL_HOURS) || 24)) {
                return res.json(existing);
            }
        }

        // Generate new estimation
        const property = await Property.findById(req.params.propertyId);
        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }

        const estimator = new HybridEstimator();
        const result = await estimator.estimate({
            propertyId: property._id,
            location: property.location,
            propertyType: property.propertyType,
            size: property.size,
            bedrooms: property.bedrooms,
            bathrooms: property.bathrooms,
            amenities: property.amenities
        }, req.user._id);

        // Update Property with AI estimation
        property.aiEstimation = {
            estimatedPrice: result.estimatedPrice,
            confidence: result.confidenceScore,
            pricePerSqft: result.pricePerSqft,
            priceLow: result.priceLow,
            priceHigh: result.priceHigh,
            lastEstimatedAt: new Date(),
            estimationId: result._id,
            marketTiming: result.marketTiming,
            llmReasoning: result.llmReasoning
        };
        await property.save();

        res.json(result);
    } catch (error) {
        console.error('[ESTIMATION] Error:', error.message);
        res.status(500).json({ message: error.message });
    }
});

// @desc    Re-estimate property price
// @route   POST /api/estimation/property/:propertyId/re-estimate
// @access  Private
router.post('/property/:propertyId/re-estimate', protect, async (req, res) => {
    try {
        const property = await Property.findById(req.params.propertyId);
        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }

        const estimator = new HybridEstimator();
        const result = await estimator.estimate({
            propertyId: property._id,
            location: property.location,
            propertyType: property.propertyType,
            size: property.size,
            bedrooms: property.bedrooms,
            bathrooms: property.bathrooms,
            amenities: property.amenities
        }, req.user._id);

        property.aiEstimation = {
            estimatedPrice: result.estimatedPrice,
            confidence: result.confidenceScore,
            pricePerSqft: result.pricePerSqft,
            priceLow: result.priceLow,
            priceHigh: result.priceHigh,
            lastEstimatedAt: new Date(),
            estimationId: result._id,
            marketTiming: result.marketTiming,
            llmReasoning: result.llmReasoning
        };
        await property.save();

        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Bulk estimate for multiple properties
// @route   POST /api/estimation/bulk
// @access  Private/Admin
router.post('/bulk', protect, authorize('Admin'), async (req, res) => {
    try {
        const { filters, forceRefresh } = req.body;
        const query = {};
        if (filters?.city) query.location = new RegExp(filters.city, 'i');
        if (filters?.propertyType) query.propertyType = filters.propertyType;
        if (filters?.createdAfter) query.createdAt = { $gte: new Date(filters.createdAfter) };

        const limit = Math.min(filters?.limit || 100, 1000);
        const properties = await Property.find(query).limit(limit);

        const results = [];
        const estimator = new HybridEstimator();

        for (const property of properties) {
            // Skip if recent estimation exists and not forcing refresh
            if (!forceRefresh && property.aiEstimation?.lastEstimatedAt) {
                const daysOld = (Date.now() - property.aiEstimation.lastEstimatedAt.getTime()) / (1000 * 60 * 60 * 24);
                if (daysOld < 7) {
                    results.push({ propertyId: property._id, status: 'skipped', reason: 'recent_estimation_exists' });
                    continue;
                }
            }

            try {
                const result = await estimator.estimate({
                    propertyId: property._id,
                    location: property.location,
                    propertyType: property.propertyType,
                    size: property.size,
                    bedrooms: property.bedrooms,
                    bathrooms: property.bathrooms,
                    amenities: property.amenities
                }, req.user._id);

                property.aiEstimation = {
                    estimatedPrice: result.estimatedPrice,
                    confidence: result.confidenceScore,
                    pricePerSqft: result.pricePerSqft,
                    priceLow: result.priceLow,
                    priceHigh: result.priceHigh,
                    lastEstimatedAt: new Date(),
                    estimationId: result._id,
                    marketTiming: result.marketTiming
                };
                await property.save();

                results.push({ propertyId: property._id, status: 'completed', estimatedPrice: result.estimatedPrice });
            } catch (err) {
                results.push({ propertyId: property._id, status: 'failed', error: err.message });
            }
        }

        res.json({
            total: properties.length,
            completed: results.filter(r => r.status === 'completed').length,
            skipped: results.filter(r => r.status === 'skipped').length,
            failed: results.filter(r => r.status === 'failed').length,
            results
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Compare properties with AI pricing
// @route   POST /api/estimation/compare
// @access  Private
router.post('/compare', protect, async (req, res) => {
    try {
        const { propertyIds } = req.body;
        if (!propertyIds || propertyIds.length < 2 || propertyIds.length > 5) {
            return res.status(400).json({ message: 'Provide 2-5 propertyIds to compare' });
        }

        const properties = await Property.find({ _id: { $in: propertyIds } }).populate('agency', 'name');

        const comparisons = properties.map(p => {
            const priceDiff = p.aiEstimation?.estimatedPrice
                ? ((p.price - p.aiEstimation.estimatedPrice) / p.aiEstimation.estimatedPrice * 100).toFixed(1)
                : null;

            let dealFlag = null;
            if (priceDiff !== null) {
                if (parseFloat(priceDiff) > 15) dealFlag = 'potentially_overpriced';
                else if (parseFloat(priceDiff) < -10) dealFlag = 'good_deal';
                else dealFlag = 'fair_price';
            }

            return {
                propertyId: p._id,
                title: p.title,
                location: p.location,
                propertyType: p.propertyType,
                listedPrice: p.price,
                size: p.size,
                bedrooms: p.bedrooms,
                agency: p.agency?.name,
                aiEstimation: p.aiEstimation || null,
                priceDifferencePct: priceDiff,
                dealFlag
            };
        });

        // Find best value
        const withEstimates = comparisons.filter(c => c.aiEstimation);
        let recommendation = null;
        if (withEstimates.length >= 2) {
            const bestValue = withEstimates.reduce((best, c) =>
                !best || (c.aiEstimation.pricePerSqft < best.aiEstimation.pricePerSqft) ? c : best, null);
            const highestConfidence = withEstimates.reduce((best, c) =>
                !best || (c.aiEstimation.confidence > best.aiEstimation.confidence) ? c : best, null);

            recommendation = {
                bestValue: bestValue?.propertyId,
                highestConfidence: highestConfidence?.propertyId,
                reasoning: `${bestValue?.title} offers the best value at Rs.${bestValue?.aiEstimation?.pricePerSqft}/sqft. ${highestConfidence?.title} has the highest confidence score of ${highestConfidence?.aiEstimation?.confidence}%.`
            };
        }

        res.json({ comparisons, recommendation });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get market trends
// @route   GET /api/estimation/trends
// @access  Private
router.get('/trends', protect, async (req, res) => {
    try {
        const { city, locality, propertyType } = req.query;
        
        // If a specific city or locality is provided, return its direct history
        if (city || locality) {
            const query = {};
            if (city) query.city = new RegExp(`^${city}$`, 'i');
            if (locality) query.locality = new RegExp(`^${locality}$`, 'i');
            if (propertyType) query.propertyType = propertyType;

            const trends = await MarketTrend.find(query).sort({ periodEnd: -1 }).limit(24);
            return res.json(trends);
        }

        // No city specified: Show aggregate "National" trends by grouping all cities by month
        const match = {};
        if (propertyType) match.propertyType = propertyType;

        const aggregatedTrends = await MarketTrend.aggregate([
            { $match: match },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m', date: '$periodEnd' } },
                    avgPricePerSqft: { $avg: '$avgPricePerSqft' },
                    listingCount: { $sum: '$listingCount' },
                    periodEnd: { $first: '$periodEnd' }
                }
            },
            { $sort: { periodEnd: -1 } },
            { $limit: 24 }
        ]);

        res.json(aggregatedTrends);
    } catch (error) {
        console.error('[TRENDS_API] Error:', error);
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get price intelligence dashboard data
// @route   GET /api/estimation/dashboard
// @access  Private
router.get('/dashboard', protect, async (req, res) => {
    try {
        const totalEstimations = await PriceEstimation.countDocuments({ status: 'completed' });

        const recentEstimations = await PriceEstimation.find({ status: 'completed' })
            .sort({ createdAt: -1 }).limit(10)
            .populate('property', 'title location price');

        const avgConfidenceResult = await PriceEstimation.aggregate([
            { $match: { status: 'completed' } },
            { $group: { _id: null, avg: { $avg: '$confidenceScore' } } }
        ]);

        const trendSummary = await MarketTrend.aggregate([
            { $sort: { periodEnd: -1 } },
            {
                $group: {
                    _id: { city: '$city', locality: '$locality' },
                    latestAvgPrice: { $first: '$avgPricePerSqft' },
                    priceChangePct: { $first: '$priceChangePct' },
                    demandScore: { $first: '$demandScore' },
                    listingCount: { $first: '$listingCount' }
                }
            },
            { $sort: { demandScore: -1 } },
            { $limit: 10 }
        ]);

        const totalListings = await ScrapedListing.countDocuments({ isActive: true });
        const latestJob = await ScrapingJob.findOne().sort({ createdAt: -1 });

        res.json({
            totalEstimations,
            avgConfidence: Math.round(avgConfidenceResult[0]?.avg || 0),
            recentEstimations,
            trendSummary,
            totalListings,
            latestScrapingJob: latestJob
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get scraping job status
// @route   GET /api/estimation/scraping/status
// @access  Private/Admin
router.get('/scraping/status', protect, authorize('Admin'), async (req, res) => {
    try {
        const latest = await ScrapingJob.findOne().sort({ createdAt: -1 });
        const history = await ScrapingJob.find().sort({ createdAt: -1 }).limit(10);
        res.json({ latest, history });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Trigger manual scraping
// @route   POST /api/estimation/scraping/trigger
// @access  Private/Admin
router.post('/scraping/trigger', protect, authorize('Admin'), async (req, res) => {
    try {
        const { city } = req.body || {};
        const orchestrator = new ScrapingOrchestrator();

        // Create a placeholder job to get an ID for tracking
        const job = await ScrapingJob.create({
            sourceName: 'all',
            city: city || 'All Cities',
            status: 'running',
            triggeredBy: 'manual',
            triggeredByUser: req.user._id,
            startedAt: new Date(),
            sources: orchestrator.scrapers.map(s => ({
                name: s.sourceName,
                status: 'pending',
                listingsFound: 0,
                listingsNew: 0,
                errors: []
            }))
        });

        // Run the scraping job in the background
        setImmediate(async () => {
            try {
                if (city) {
                    await orchestrator.runCityScrape(city, 'manual', req.user._id, job._id);
                } else {
                    await orchestrator.runFullScrape('manual', req.user._id, job._id);
                }
            } catch (err) {
                console.error('[ASYNC_SCRAPE_FAIL]', err);
                await ScrapingJob.findByIdAndUpdate(job._id, { 
                    status: 'failed', 
                    errorMessage: err.message 
                });
            }
        });

        res.status(202).json({ 
            message: 'Scraping job started in background', 
            jobId: job._id, 
            status: 'running' 
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Trigger normalization pipeline (Async)
// @route   POST /api/estimation/normalize
// @access  Private/Admin
router.post('/normalize', protect, authorize('Admin'), async (req, res) => {
    try {
        const job = await NormalizationJob.create({
            status: 'queued',
            totalRecords: await ScrapedListing.countDocuments({})
        });

        // Run the pipeline in the background
        setImmediate(async () => {
            try {
                // Step 1: Cleaning
                await NormalizationJob.findByIdAndUpdate(job._id, { status: 'cleaning' });
                const normalizer = new NormalizerService();
                const cleanResult = await normalizer.normalizeAll();
                await NormalizationJob.findByIdAndUpdate(job._id, { 
                    'results.cleaned': cleanResult.normalized,
                    status: 'geocoding'
                });

                // Step 2: Geocoding (passes job id for granular updates)
                const geocoder = new GeocodingService();
                const geoResult = await geocoder.geocodeListings(job._id);
                await NormalizationJob.findByIdAndUpdate(job._id, { 
                    'results.geocoded': geoResult.geocoded,
                    status: 'deduplicating'
                });

                // Step 3: Deduplication
                const dedup = new DeduplicationService();
                const dedupResult = await dedup.deduplicate();
                await NormalizationJob.findByIdAndUpdate(job._id, { 
                    'results.deduplicated': dedupResult.duplicatesRemoved,
                    status: 'analyzing_outliers'
                });

                // Step 4: Outlier Detection
                const outlier = new OutlierDetector();
                const outlierResult = await outlier.detectOutliers();
                await NormalizationJob.findByIdAndUpdate(job._id, { 
                    'results.outliersFound': outlierResult.outliersDetected,
                    status: 'completed',
                    completedAt: new Date()
                });

            } catch (err) {
                console.error('[ASYNC_NORM_FAIL]', err);
                await NormalizationJob.findByIdAndUpdate(job._id, { 
                    status: 'failed', 
                    errorMessage: err.message 
                });
            }
        });

        res.status(202).json({ 
            message: 'Normalization pipeline started in background', 
            jobId: job._id 
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get normalization job status
// @route   GET /api/estimation/normalize/status/:jobId
// @access  Private/Admin
router.get('/normalize/status/:jobId', protect, authorize('Admin'), async (req, res) => {
    try {
        const job = await NormalizationJob.findById(req.params.jobId);
        if (!job) return res.status(404).json({ message: 'Job not found' });
        res.json(job);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get available localities for autocomplete
// @route   GET /api/estimation/localities
// @access  Private
router.get('/localities', protect, async (req, res) => {
    try {
        const { city, q } = req.query;
        const match = { isActive: true };
        if (city) match.city = new RegExp(city, 'i');

        const localities = await ScrapedListing.aggregate([
            { $match: match },
            { $group: { _id: '$locality', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 50 }
        ]);

        let results = localities.map(l => ({ locality: l._id, count: l.count }));

        if (q) {
            const query = q.toLowerCase();
            results = results.filter(r => r.locality && r.locality.toLowerCase().includes(query));
        }

        res.json(results);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get available cities
// @route   GET /api/estimation/cities
// @access  Private
router.get('/cities', protect, async (req, res) => {
    try {
        const cities = await ScrapedListing.distinct('city', { isActive: true });
        res.json(cities.filter(Boolean).sort());
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Direct LLM estimate (benchmarks + GPT only, no database agents)
// @route   POST /api/estimation/direct-estimate
// @access  Private
router.post('/direct-estimate', protect, async (req, res) => {
    try {
        const { location, propertyType, size, areaSqft, bedrooms, bathrooms, price } = req.body;
        const area = size || areaSqft;

        if (!location || !area) {
            return res.status(400).json({ message: 'location and size/areaSqft are required' });
        }

        const { getBenchmark } = require('../services/estimation/locationBenchmarks');
        const LLMReasoningAgent = require('../services/estimation/LLMReasoningAgent');

        // Parse location
        const parts = location.split(',').map(s => s.trim());
        let city = '', locality = '';
        if (parts.length >= 2) {
            locality = parts[0];
            city = parts[parts.length - 1];
        } else {
            city = parts[0];
            locality = parts[0];
        }

        const benchmark = getBenchmark(city, locality);
        const llm = new LLMReasoningAgent();

        const params = {
            city, locality,
            propertyType: propertyType || 'Apartment',
            areaSqft: Number(area),
            bedrooms: bedrooms ? Number(bedrooms) : undefined,
            bathrooms: bathrooms ? Number(bathrooms) : undefined
        };

        const llmResult = await llm.estimate(params, null, null);

        let estimatedPrice = llmResult.estimatedPriceTotal || 0;
        let pricePerSqft = llmResult.estimatedPricePerSqft || 0;

        if (estimatedPrice === 0 && benchmark) {
            pricePerSqft = benchmark.avg;
            estimatedPrice = pricePerSqft * Number(area);
        }

        // Benchmark sanity check
        if (benchmark && benchmark.avg > 0 && pricePerSqft > 0) {
            const ratio = pricePerSqft / benchmark.avg;
            if (ratio > 2.5 || ratio < 0.4) {
                pricePerSqft = Math.round((pricePerSqft + benchmark.avg) / 2);
                estimatedPrice = pricePerSqft * Number(area);
            }
        }

        const confidence = llmResult.confidence || (benchmark ? 55 : 30);
        const priceLow = Math.round(estimatedPrice * 0.9);
        const priceHigh = Math.round(estimatedPrice * 1.1);

        let verdict = null;
        if (price && estimatedPrice > 0) {
            const diff = ((Number(price) - estimatedPrice) / estimatedPrice * 100);
            if (diff > 15) verdict = { label: 'Overvalued', diffPct: diff.toFixed(1) };
            else if (diff < -10) verdict = { label: 'Undervalued', diffPct: diff.toFixed(1) };
            else verdict = { label: 'Fair Price', diffPct: diff.toFixed(1) };
        }

        res.json({
            estimatedPrice: Math.round(estimatedPrice),
            pricePerSqft: Math.round(pricePerSqft),
            priceLow, priceHigh, confidence,
            reasoning: llmResult.reasoning,
            marketTiming: llmResult.marketTiming,
            positiveFactors: llmResult.positiveFactors,
            negativeFactors: llmResult.negativeFactors,
            verdict,
            benchmark: benchmark ? { avg: benchmark.avg, min: benchmark.min, max: benchmark.max, tier: benchmark.tier } : null
        });
    } catch (error) {
        console.error('[DIRECT-ESTIMATE] Error:', error.message);
        res.status(500).json({ message: error.message });
    }
});

// @desc    Batch estimate for properties missing AI estimates
// @route   POST /api/estimation/batch-property-estimate
// @access  Private
router.post('/batch-property-estimate', protect, async (req, res) => {
    try {
        const { propertyIds } = req.body;
        if (!propertyIds || !Array.isArray(propertyIds)) {
            return res.status(400).json({ message: 'propertyIds array required' });
        }

        const properties = await Property.find({
            _id: { $in: propertyIds },
            $or: [
                { 'aiEstimation.estimatedPrice': { $exists: false } },
                { 'aiEstimation.estimatedPrice': null },
                { 'aiEstimation.estimatedPrice': 0 }
            ]
        });

        if (properties.length === 0) {
            return res.json({ estimated: 0, results: {} });
        }

        const { getBenchmark } = require('../services/estimation/locationBenchmarks');
        const LLMReasoningAgent = require('../services/estimation/LLMReasoningAgent');
        const llm = new LLMReasoningAgent();
        const results = {};

        for (const prop of properties) {
            try {
                const parts = (prop.location || '').split(',').map(s => s.trim());
                let city = '', locality = '';
                if (parts.length >= 2) { locality = parts[0]; city = parts[parts.length - 1]; }
                else { city = parts[0]; locality = parts[0]; }

                const llmResult = await llm.estimate({
                    city, locality,
                    propertyType: prop.propertyType,
                    areaSqft: prop.size,
                    bedrooms: prop.bedrooms,
                    bathrooms: prop.bathrooms
                }, null, null);

                let estimatedPrice = llmResult.estimatedPriceTotal || 0;
                let pricePerSqft = llmResult.estimatedPricePerSqft || 0;

                const benchmark = getBenchmark(city, locality);
                if (estimatedPrice === 0 && benchmark) {
                    pricePerSqft = benchmark.avg;
                    estimatedPrice = pricePerSqft * prop.size;
                }

                if (estimatedPrice > 0) {
                    const aiEst = {
                        estimatedPrice: Math.round(estimatedPrice),
                        confidence: llmResult.confidence || 50,
                        pricePerSqft: Math.round(pricePerSqft),
                        priceLow: Math.round(estimatedPrice * 0.9),
                        priceHigh: Math.round(estimatedPrice * 1.1),
                        lastEstimatedAt: new Date(),
                        marketTiming: llmResult.marketTiming || 'neutral'
                    };
                    await Property.findByIdAndUpdate(prop._id, { aiEstimation: aiEst });
                    results[prop._id] = aiEst;
                }
            } catch (err) {
                console.error(`[BATCH-EST] Failed for ${prop._id}:`, err.message);
            }
        }

        res.json({ estimated: Object.keys(results).length, results });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Quick batch estimate for investment portfolio
// @route   POST /api/estimation/portfolio-estimate
// @access  Private
router.post('/portfolio-estimate', protect, async (req, res) => {
    try {
        const { investments } = req.body;
        if (!investments || !Array.isArray(investments)) {
            return res.status(400).json({ message: 'investments array is required' });
        }

        const { getBenchmark } = require('../services/estimation/locationBenchmarks');
        const estimator = new HybridEstimator();
        const results = {};

        for (const inv of investments) {
            if (!inv._id || !inv.location) {
                results[inv._id] = { error: 'Missing location' };
                continue;
            }

            try {
                // Parse location: "Locality, City" or just city
                const parts = inv.location.split(',').map(s => s.trim());
                let city = '', locality = '';
                if (parts.length >= 2) {
                    locality = parts[0];
                    city = parts[parts.length - 1];
                } else {
                    city = parts[0];
                    locality = parts[0];
                }

                const areaSqft = inv.areaSqft || 0;
                const bedrooms = inv.bedrooms || undefined;
                const propertyType = inv.propertyType === 'Residential' ? 'Apartment' : inv.propertyType;

                // If area is available, run full estimation
                if (areaSqft > 0) {
                    const result = await estimator.estimate({
                        city, locality, propertyType,
                        size: areaSqft, areaSqft,
                        bedrooms
                    }, req.user._id);

                    results[inv._id] = {
                        estimatedPrice: result.estimatedPrice,
                        pricePerSqft: result.pricePerSqft,
                        priceLow: result.priceLow,
                        priceHigh: result.priceHigh,
                        confidence: result.confidenceScore,
                        marketTiming: result.marketTiming,
                        reasoning: result.llmReasoning
                    };
                } else {
                    // No area — use benchmark price/sqft only
                    const benchmark = getBenchmark(city, locality);
                    if (benchmark) {
                        results[inv._id] = {
                            pricePerSqft: benchmark.avg,
                            priceLow: null,
                            priceHigh: null,
                            confidence: 45,
                            tier: benchmark.tier,
                            benchmarkOnly: true,
                            reasoning: `Market rate for ${locality}, ${city}: Rs.${benchmark.avg}/sqft (${benchmark.tier} area). Add property area for a full AI estimate.`
                        };
                    } else {
                        results[inv._id] = { error: 'Location not in benchmark database' };
                    }
                }
            } catch (err) {
                results[inv._id] = { error: err.message };
            }
        }

        res.json(results);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
