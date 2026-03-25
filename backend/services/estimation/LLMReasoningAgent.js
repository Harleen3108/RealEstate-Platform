const OpenAI = require('openai');
const { getBenchmark, getNearbyBenchmarks } = require('./locationBenchmarks');

class LLMReasoningAgent {
    constructor() {
        this.client = null;
        this.timeout = parseInt(process.env.LLM_TIMEOUT_SECONDS || '30') * 1000;
    }

    getClient() {
        if (!this.client) {
            const apiKey = process.env.OPENAI_API_KEY;
            if (!apiKey || apiKey === 'your_openai_api_key_here') {
                return null;
            }
            this.client = new OpenAI({ apiKey });
        }
        return this.client;
    }

    async estimate(params, comparableData, trendData) {
        const client = this.getClient();
        if (!client) {
            console.log('[LLM] No OpenAI API key configured, returning fallback estimate');
            return this.getFallbackEstimate(params, comparableData, trendData);
        }

        const prompt = this.buildPrompt(params, comparableData, trendData);

        try {
            const response = await Promise.race([
                client.chat.completions.create({
                    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
                    max_tokens: 1024,
                    messages: [
                        { role: 'system', content: 'You are an expert Indian real estate valuation analyst with deep knowledge of property markets across Indian cities, micro-market dynamics, builder reputations, infrastructure impact, and RERA compliance. Always respond with valid JSON only, no markdown.' },
                        { role: 'user', content: prompt }
                    ]
                }),
                new Promise((_, reject) => setTimeout(() => reject(new Error('LLM timeout')), this.timeout))
            ]);

            const text = response.choices[0].message.content;
            const parsed = this.parseResponse(text);

            // Validation: if LLM estimate diverges >30% from comparable, reduce confidence
            if (comparableData && comparableData.estimatedTotalPrice > 0 && parsed.estimatedPriceTotal > 0) {
                const divergence = Math.abs(parsed.estimatedPriceTotal - comparableData.estimatedTotalPrice) / comparableData.estimatedTotalPrice;
                if (divergence > 0.30) {
                    parsed.confidence = Math.max(0, parsed.confidence - 20);
                    parsed.riskFactors = parsed.riskFactors || [];
                    parsed.riskFactors.push('LLM estimate diverges >30% from comparable analysis');
                }
            }

            return parsed;
        } catch (error) {
            console.error(`[LLM] Error: ${error.message}`);
            return this.getFallbackEstimate(params, comparableData, trendData);
        }
    }

    buildPrompt(params, comparableData, trendData) {
        const compSection = comparableData && comparableData.estimatedPricePerSqft > 0
            ? `COMPARABLE ANALYSIS RESULT:
Estimated price/sqft: Rs.${comparableData.estimatedPricePerSqft}
Based on ${comparableData.comparableCount} comparable properties
Average similarity score: ${comparableData.avgSimilarityScore}
Adjustments: ${JSON.stringify(comparableData.adjustmentsApplied || [])}
Top comparables: ${JSON.stringify((comparableData.comparablesUsed || []).slice(0, 5))}`
            : 'COMPARABLE ANALYSIS: No comparable data available';

        const trendSection = trendData && trendData.projectedPricePerSqft > 0
            ? `MARKET TREND RESULT:
6-month trend: ${trendData.trend6mPct}%
12-month trend: ${trendData.trend12mPct}%
Demand score: ${trendData.demandScore}/100
Seasonal adjustment: ${trendData.seasonalityAdjustmentPct}%
Projected price/sqft: Rs.${trendData.projectedPricePerSqft}`
            : 'MARKET TRENDS: No trend data available';

        // Location benchmark context
        const benchmark = getBenchmark(params.city, params.locality);
        const nearbyAreas = getNearbyBenchmarks(params.city, params.locality, 5);

        let locationSection = '';
        if (benchmark) {
            locationSection = `\nLOCATION MARKET REFERENCE (2025-2026 data):
${params.locality}, ${params.city}: Avg Rs.${benchmark.avg}/sqft (Range: Rs.${benchmark.min}-${benchmark.max}/sqft) | Tier: ${benchmark.tier}
City average for ${benchmark.cityName || params.city}: Rs.${benchmark.cityAvg}/sqft`;

            if (nearbyAreas.length > 0) {
                locationSection += `\nNearby areas for comparison:`;
                nearbyAreas.forEach(a => {
                    locationSection += `\n  - ${a.locality}: Rs.${a.avg}/sqft (${a.tier})`;
                });
            }

            locationSection += `\n\nIMPORTANT: Use these location benchmarks to calibrate your estimate. The price/sqft should fall within or near the range for this specific locality. If comparable data suggests a very different price, factor in the benchmark range and explain the discrepancy.`;
        }

        return `Given the property details and analysis data below, provide a price estimation.

PROPERTY:
City: ${params.city}, Locality: ${params.locality}
Type: ${params.propertyType}, Config: ${params.bedrooms || 'N/A'} BHK, Area: ${params.areaSqft} sq.ft
Floor: ${params.floorNumber || 'N/A'}/${params.totalFloors || 'N/A'}, Age: ${params.ageYears || 'N/A'} years
Furnishing: ${params.furnishing || 'N/A'}
Amenities: ${(params.amenities || []).join(', ') || 'N/A'}

${compSection}

${trendSection}
${locationSection}

Your estimate MUST account for:
1. Micro-market positioning — ${params.locality} within ${params.city} (premium/mid/affordable area)
2. Property-specific attributes — floor, age, furnishing, amenities
3. Current market conditions — supply/demand, recent infrastructure developments
4. Comparable validation — cross-check against provided comparables and location benchmarks

Respond ONLY in this JSON format with no additional text:
{
  "estimatedPriceTotal": <number in INR>,
  "estimatedPricePerSqft": <number>,
  "confidence": <number 0-100>,
  "reasoning": "<2-3 paragraph detailed explanation covering location analysis, property factors, and market context>",
  "positiveFactors": ["<factor1>", "<factor2>"],
  "negativeFactors": ["<factor1>", "<factor2>"],
  "riskFactors": ["<risk1>", "<risk2>"],
  "marketTiming": "<good | neutral | wait>",
  "timingReasoning": "<1 sentence explanation>"
}`;
    }

    parseResponse(text) {
        try {
            // Strip markdown code fences if present
            let cleaned = text.trim();
            if (cleaned.startsWith('```json')) cleaned = cleaned.slice(7);
            else if (cleaned.startsWith('```')) cleaned = cleaned.slice(3);
            if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3);
            cleaned = cleaned.trim();

            const parsed = JSON.parse(cleaned);
            return {
                estimatedPriceTotal: parsed.estimatedPriceTotal || 0,
                estimatedPricePerSqft: parsed.estimatedPricePerSqft || 0,
                confidence: Math.min(100, Math.max(0, parsed.confidence || 50)),
                reasoning: parsed.reasoning || '',
                positiveFactors: parsed.positiveFactors || [],
                negativeFactors: parsed.negativeFactors || [],
                riskFactors: parsed.riskFactors || [],
                marketTiming: ['good', 'neutral', 'wait'].includes(parsed.marketTiming) ? parsed.marketTiming : 'neutral',
                timingReasoning: parsed.timingReasoning || ''
            };
        } catch (error) {
            console.error('[LLM] Failed to parse response:', error.message);
            return this.getEmptyResult();
        }
    }

    getFallbackEstimate(params, comparableData, trendData) {
        // Use location benchmarks as primary fallback
        const benchmark = getBenchmark(params.city, params.locality);
        let estimate = 0;
        let pricePerSqft = 0;

        if (benchmark && benchmark.avg > 0) {
            pricePerSqft = benchmark.avg;
            estimate = pricePerSqft * params.areaSqft;
        } else if (comparableData && comparableData.estimatedTotalPrice > 0) {
            estimate = comparableData.estimatedTotalPrice;
            pricePerSqft = comparableData.estimatedPricePerSqft;
        } else if (trendData && trendData.projectedPricePerSqft > 0) {
            pricePerSqft = trendData.projectedPricePerSqft;
            estimate = pricePerSqft * params.areaSqft;
        }

        return {
            estimatedPriceTotal: estimate,
            estimatedPricePerSqft: pricePerSqft,
            confidence: benchmark ? 55 : 40,
            reasoning: benchmark
                ? `Estimation based on location benchmark data for ${params.locality}, ${params.city} (avg Rs.${benchmark.avg}/sqft, tier: ${benchmark.tier}). LLM reasoning unavailable.`
                : 'Estimation based on available comparable and trend data (LLM unavailable).',
            positiveFactors: [],
            negativeFactors: [],
            riskFactors: ['LLM reasoning unavailable — estimate based on benchmark/comparable data'],
            marketTiming: 'neutral',
            timingReasoning: 'Unable to assess market timing without LLM analysis.'
        };
    }

    getEmptyResult() {
        return {
            estimatedPriceTotal: 0, estimatedPricePerSqft: 0, confidence: 0,
            reasoning: '', positiveFactors: [], negativeFactors: [], riskFactors: [],
            marketTiming: 'neutral', timingReasoning: ''
        };
    }
}

module.exports = LLMReasoningAgent;
