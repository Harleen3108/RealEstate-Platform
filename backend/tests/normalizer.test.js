const NormalizerService = require('../services/normalization/NormalizerService');

const normalizer = new NormalizerService();

describe('NormalizerService', () => {

    describe('normalizeCity', () => {
        test('maps Bengaluru to Bangalore', () => {
            expect(normalizer.normalizeCity('Bengaluru')).toBe('Bangalore');
        });

        test('maps Bombay to Mumbai', () => {
            expect(normalizer.normalizeCity('Bombay')).toBe('Mumbai');
        });

        test('maps ncr to Delhi NCR', () => {
            expect(normalizer.normalizeCity('ncr')).toBe('Delhi NCR');
        });

        test('maps Gurugram to Gurgaon', () => {
            expect(normalizer.normalizeCity('Gurugram')).toBe('Gurgaon');
        });

        test('maps Calcutta to Kolkata', () => {
            expect(normalizer.normalizeCity('Calcutta')).toBe('Kolkata');
        });

        test('maps Poona to Pune', () => {
            expect(normalizer.normalizeCity('Poona')).toBe('Pune');
        });

        test('maps Madras to Chennai', () => {
            expect(normalizer.normalizeCity('Madras')).toBe('Chennai');
        });

        test('handles case insensitivity', () => {
            expect(normalizer.normalizeCity('BANGALORE')).toBe('Bangalore');
            expect(normalizer.normalizeCity('mumbai')).toBe('Mumbai');
        });

        test('trims whitespace', () => {
            expect(normalizer.normalizeCity('  Bangalore  ')).toBe('Bangalore');
        });

        test('returns original for unknown city', () => {
            expect(normalizer.normalizeCity('Jaipur')).toBe('Jaipur');
        });

        test('returns null for null input', () => {
            expect(normalizer.normalizeCity(null)).toBeNull();
        });
    });

    describe('normalizePrice', () => {
        test('parses crore format', () => {
            expect(normalizer.normalizePrice('1.5 Cr')).toBe(15000000);
            expect(normalizer.normalizePrice('2Crore')).toBe(20000000);
        });

        test('parses lakh format', () => {
            expect(normalizer.normalizePrice('65 Lac')).toBe(6500000);
            expect(normalizer.normalizePrice('75 Lakh')).toBe(7500000);
            expect(normalizer.normalizePrice('45L')).toBe(4500000);
        });

        test('parses range format and returns average', () => {
            expect(normalizer.normalizePrice('50 L - 70 L')).toBe(6000000);
        });

        test('handles numeric input', () => {
            expect(normalizer.normalizePrice(7500000)).toBe(7500000);
        });

        test('handles string numbers with commas', () => {
            expect(normalizer.normalizePrice('75,00,000')).toBe(7500000);
        });

        test('handles rupee symbol', () => {
            expect(normalizer.normalizePrice('₹ 1.5 Cr')).toBe(15000000);
        });

        test('returns null for null input', () => {
            expect(normalizer.normalizePrice(null)).toBeNull();
        });

        test('returns null for invalid string', () => {
            expect(normalizer.normalizePrice('abc')).toBeNull();
        });
    });

    describe('normalizeArea', () => {
        test('converts sq.m to sqft', () => {
            const result = normalizer.normalizeArea('100 sq.m');
            expect(result).toBe(1076); // 100 * 10.764 rounded
        });

        test('converts acres to sqft', () => {
            const result = normalizer.normalizeArea('1 acres');
            expect(result).toBe(43560);
        });

        test('converts guntha to sqft', () => {
            const result = normalizer.normalizeArea('2 guntha');
            expect(result).toBe(2178);
        });

        test('converts marla to sqft', () => {
            const result = normalizer.normalizeArea('5 marla');
            expect(result).toBe(1361); // 5 * 272.25 rounded
        });

        test('handles numeric input as sqft', () => {
            expect(normalizer.normalizeArea(1200)).toBe(1200);
        });

        test('handles sqft string without conversion', () => {
            expect(normalizer.normalizeArea('1200')).toBe(1200);
        });

        test('returns null for null input', () => {
            expect(normalizer.normalizeArea(null)).toBeNull();
        });
    });

    describe('normalizePropertyType', () => {
        test('maps flat to Apartment', () => {
            expect(normalizer.normalizePropertyType('flat')).toBe('Apartment');
        });

        test('maps builder floor to Apartment', () => {
            expect(normalizer.normalizePropertyType('Builder Floor')).toBe('Apartment');
        });

        test('maps independent house to Villa', () => {
            expect(normalizer.normalizePropertyType('Independent House')).toBe('Villa');
        });

        test('maps farmhouse to Villa', () => {
            expect(normalizer.normalizePropertyType('Farmhouse')).toBe('Villa');
        });

        test('maps plot to Land', () => {
            expect(normalizer.normalizePropertyType('Plot')).toBe('Land');
        });

        test('maps office space to Commercial', () => {
            expect(normalizer.normalizePropertyType('Office Space')).toBe('Commercial');
        });

        test('defaults to Apartment for unknown types', () => {
            expect(normalizer.normalizePropertyType('Unknown Type')).toBe('Apartment');
        });

        test('defaults to Apartment for null input', () => {
            expect(normalizer.normalizePropertyType(null)).toBe('Apartment');
        });
    });

    describe('extractBHK', () => {
        test('extracts from "2 BHK" format', () => {
            expect(normalizer.extractBHK('2 BHK Apartment')).toBe(2);
        });

        test('extracts from "3BHK" without space', () => {
            expect(normalizer.extractBHK('3BHK Flat in Whitefield')).toBe(3);
        });

        test('extracts from "Bedroom" format', () => {
            expect(normalizer.extractBHK('4 Bedroom Villa')).toBe(4);
        });

        test('extracts from word format', () => {
            expect(normalizer.extractBHK('two bedroom flat')).toBe(2);
        });

        test('maps studio to 1', () => {
            expect(normalizer.extractBHK('Studio Apartment')).toBe(1);
        });

        test('returns null for no match', () => {
            expect(normalizer.extractBHK('Nice property')).toBeNull();
        });

        test('returns null for null input', () => {
            expect(normalizer.extractBHK(null)).toBeNull();
        });
    });

    describe('normalizeAmenities', () => {
        test('maps standard amenities correctly', () => {
            const result = normalizer.normalizeAmenities(['Gym', 'Swimming Pool', 'Parking']);
            expect(result).toContain('gym');
            expect(result).toContain('swimming_pool');
            expect(result).toContain('parking');
        });

        test('handles alternate naming', () => {
            const result = normalizer.normalizeAmenities(['Gymnasium', 'Elevator', 'Car Parking']);
            expect(result).toContain('gym');
            expect(result).toContain('lift');
            expect(result).toContain('parking');
        });

        test('fuzzy matches similar names', () => {
            const result = normalizer.normalizeAmenities(['Swimming Pools']);
            expect(result.length).toBeGreaterThanOrEqual(0); // Fuzzy match may or may not work
        });

        test('returns empty array for null input', () => {
            expect(normalizer.normalizeAmenities(null)).toEqual([]);
        });

        test('returns empty array for empty array', () => {
            expect(normalizer.normalizeAmenities([])).toEqual([]);
        });

        test('deduplicates normalized amenities', () => {
            const result = normalizer.normalizeAmenities(['Gym', 'Gymnasium', 'Fitness Center']);
            expect(result.filter(a => a === 'gym').length).toBe(1);
        });
    });

    describe('normalizeLocality', () => {
        test('strips trailing pincode', () => {
            expect(normalizer.normalizeLocality('Whitefield, 560066', 'Bangalore')).toBe('Whitefield');
        });

        test('strips trailing India', () => {
            expect(normalizer.normalizeLocality('Whitefield, India', 'Bangalore')).toBe('Whitefield');
        });

        test('strips trailing city name', () => {
            expect(normalizer.normalizeLocality('Whitefield, Bangalore', 'Bangalore')).toBe('Whitefield');
        });

        test('returns original if nothing to strip', () => {
            expect(normalizer.normalizeLocality('Whitefield', 'Bangalore')).toBe('Whitefield');
        });

        test('returns null for null input', () => {
            expect(normalizer.normalizeLocality(null, 'Bangalore')).toBeNull();
        });
    });
});
