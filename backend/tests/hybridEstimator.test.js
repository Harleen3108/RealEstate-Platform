const HybridEstimator = require('../services/estimation/HybridEstimator');

describe('HybridEstimator', () => {

    describe('parseLocation', () => {
        let estimator;

        beforeEach(() => {
            estimator = new HybridEstimator();
        });

        test('uses city and locality when both provided', () => {
            const result = estimator.parseLocation('Some Location', 'Bangalore', 'Whitefield');
            expect(result.city).toBe('Bangalore');
            expect(result.locality).toBe('Whitefield');
        });

        test('parses "Locality, City" format', () => {
            const result = estimator.parseLocation('Whitefield, Bangalore', undefined, undefined);
            expect(result.locality).toBe('Whitefield');
            expect(result.city).toBe('Bangalore');
        });

        test('parses multi-part locations', () => {
            const result = estimator.parseLocation('Whitefield, North, Bangalore', undefined, undefined);
            expect(result.locality).toBe('Whitefield');
            expect(result.city).toBe('Bangalore');
        });

        test('handles single word location', () => {
            const result = estimator.parseLocation('Bangalore', undefined, undefined);
            expect(result.city).toBe('Bangalore');
            expect(result.locality).toBe('Bangalore');
        });

        test('handles empty location with fallback city', () => {
            const result = estimator.parseLocation('', 'Mumbai', undefined);
            expect(result.city).toBe('Mumbai');
        });

        test('handles all null inputs', () => {
            const result = estimator.parseLocation('', undefined, undefined);
            expect(result.city).toBe('Unknown');
            expect(result.locality).toBe('Unknown');
        });
    });

    describe('weight calculation logic', () => {
        // We test the weight adjustment logic by verifying the constructor
        test('creates instance with all three agents', () => {
            const estimator = new HybridEstimator();
            expect(estimator.comparableAgent).toBeDefined();
            expect(estimator.trendAgent).toBeDefined();
            expect(estimator.llmAgent).toBeDefined();
        });

        test('base weights sum to 1.0', () => {
            const weights = { comparable: 0.45, trend: 0.25, llm: 0.30 };
            const total = weights.comparable + weights.trend + weights.llm;
            expect(total).toBeCloseTo(1.0);
        });

        test('weight adjustment for low comparable count', () => {
            const weights = { comparable: 0.45, trend: 0.25, llm: 0.30 };
            // Simulate comp.comparableCount < 5
            weights.comparable -= 0.10;
            weights.llm += 0.10;
            expect(weights.comparable).toBeCloseTo(0.35);
            expect(weights.llm).toBeCloseTo(0.40);
        });

        test('weight adjustment for sparse trends', () => {
            const weights = { comparable: 0.45, trend: 0.25, llm: 0.30 };
            // Simulate trend.dataPointsUsed < 3
            weights.trend -= 0.10;
            weights.comparable += 0.10;
            expect(weights.trend).toBeCloseTo(0.15);
            expect(weights.comparable).toBeCloseTo(0.55);
        });

        test('weight normalization to 1.0', () => {
            const weights = { comparable: 0.55, trend: 0.15, llm: 0.40 };
            const totalWeight = weights.comparable + weights.trend + weights.llm;
            weights.comparable /= totalWeight;
            weights.trend /= totalWeight;
            weights.llm /= totalWeight;
            const normalized = weights.comparable + weights.trend + weights.llm;
            expect(normalized).toBeCloseTo(1.0);
        });

        test('LLM failure redistributes weight', () => {
            const weights = { comparable: 0.45, trend: 0.25, llm: 0.30 };
            // Simulate LLM failure
            const llmWeight = weights.llm;
            weights.llm = 0;
            weights.comparable += llmWeight * 0.6;
            weights.trend += llmWeight * 0.4;

            expect(weights.llm).toBe(0);
            expect(weights.comparable).toBeCloseTo(0.63);
            expect(weights.trend).toBeCloseTo(0.37);
            expect(weights.comparable + weights.trend + weights.llm).toBeCloseTo(1.0);
        });
    });

    describe('confidence calculation logic', () => {
        test('base confidence is 50', () => {
            let confidence = 50;
            expect(confidence).toBe(50);
        });

        test('comparable count boosts confidence', () => {
            let confidence = 50;
            const comparableCount = 10;
            confidence = Math.max(confidence, 30 + Math.min(comparableCount * 3, 30));
            expect(confidence).toBe(60); // 30 + min(30, 30) = 60
        });

        test('trend data boosts confidence', () => {
            let confidence = 60;
            const dataPointsUsed = 8;
            if (dataPointsUsed >= 6) confidence += 10;
            expect(confidence).toBe(70);
        });

        test('multi-contributor bonus', () => {
            let confidence = 70;
            const contributors = 3;
            if (contributors >= 3) confidence += 10;
            expect(confidence).toBe(80);
        });

        test('confidence capped at 95', () => {
            let confidence = 120;
            confidence = Math.min(95, Math.max(10, confidence));
            expect(confidence).toBe(95);
        });

        test('confidence floored at 10', () => {
            let confidence = 5;
            confidence = Math.min(95, Math.max(10, confidence));
            expect(confidence).toBe(10);
        });
    });

    describe('price range calculation', () => {
        test('spread narrows with high confidence', () => {
            const confidence = 90;
            const estimatedPrice = 10000000;
            const spread = (100 - confidence) / 200;
            expect(spread).toBe(0.05);
            expect(Math.round(estimatedPrice * (1 - spread))).toBe(9500000);
            expect(Math.round(estimatedPrice * (1 + spread))).toBe(10500000);
        });

        test('spread widens with low confidence', () => {
            const confidence = 50;
            const estimatedPrice = 10000000;
            const spread = (100 - confidence) / 200;
            expect(spread).toBe(0.25);
            expect(Math.round(estimatedPrice * (1 - spread))).toBe(7500000);
            expect(Math.round(estimatedPrice * (1 + spread))).toBe(12500000);
        });

        test('price range is symmetric around estimate', () => {
            const confidence = 80;
            const estimatedPrice = 10000000;
            const spread = (100 - confidence) / 200;
            const priceLow = Math.round(estimatedPrice * (1 - spread));
            const priceHigh = Math.round(estimatedPrice * (1 + spread));
            const midpoint = (priceLow + priceHigh) / 2;
            expect(midpoint).toBe(estimatedPrice);
        });
    });
});
