const ScrapedListing = require('../../models/ScrapedListing');
const stringSimilarity = require('string-similarity');

const CITY_MAPPINGS = {
    'bengaluru': 'Bangalore', 'bengalooru': 'Bangalore', 'blr': 'Bangalore', 'bangalore': 'Bangalore',
    'bombay': 'Mumbai', 'mumbai': 'Mumbai',
    'ncr': 'Delhi NCR', 'new delhi': 'Delhi NCR', 'delhi': 'Delhi NCR', 'delhi ncr': 'Delhi NCR',
    'gurugram': 'Gurgaon', 'gurgaon': 'Gurgaon',
    'calcutta': 'Kolkata', 'kolkata': 'Kolkata',
    'pune': 'Pune', 'poona': 'Pune',
    'secundrabad': 'Hyderabad', 'secunderabad': 'Hyderabad', 'hyderabad': 'Hyderabad',
    'madras': 'Chennai', 'chennai': 'Chennai',
    'noida': 'Noida', 'greater noida': 'Noida',
    'ahmedabad': 'Ahmedabad', 'amdavad': 'Ahmedabad'
};

const PROPERTY_TYPE_MAPPINGS = {
    'builder floor': 'Apartment', 'flat': 'Apartment', 'apartment': 'Apartment',
    'studio apartment': 'Apartment', 'studio': 'Apartment', 'duplex': 'Apartment', 'penthouse': 'Apartment',
    'row house': 'Villa', 'farmhouse': 'Villa', 'villa': 'Villa', 'bungalow': 'Villa',
    'independent house': 'Villa', 'independent_house': 'Villa',
    'residential plot': 'Land', 'plot': 'Land', 'land': 'Land',
    'commercial shop': 'Commercial', 'commercial': 'Commercial', 'office space': 'Commercial',
    'office': 'Commercial', 'shop': 'Commercial', 'showroom': 'Commercial'
};

const AREA_MULTIPLIERS = {
    'sq.m': 10.764, 'sqm': 10.764, 'square meter': 10.764, 'square meters': 10.764,
    'sq.yards': 9.0, 'sq yards': 9.0, 'sq.yd': 9.0, 'gaj': 9.0,
    'acres': 43560, 'acre': 43560, 'hectares': 107639, 'hectare': 107639,
    'guntha': 1089, 'gunta': 1089, 'cent': 435.6, 'bigha': 27000, 'marla': 272.25, 'kanal': 5445
};

const AMENITY_MAPPINGS = {
    'car parking': 'parking', 'parking': 'parking', 'covered parking': 'parking',
    'gymnasium': 'gym', 'gym': 'gym', 'fitness center': 'gym',
    'swimming pool': 'swimming_pool', 'pool': 'swimming_pool',
    'garden': 'garden', 'landscape garden': 'garden',
    'security': 'security', '24x7 security': 'security', 'gated security': 'security',
    'lift': 'lift', 'elevator': 'lift',
    'power backup': 'power_backup', 'power back up': 'power_backup',
    'water supply': 'water_supply', '24x7 water': 'water_supply',
    'club house': 'club_house', 'clubhouse': 'club_house',
    'play area': 'play_area', 'kids play area': 'play_area',
    'jogging track': 'jogging_track', 'walking track': 'jogging_track',
    'sports facility': 'sports_facility', 'sports': 'sports_facility',
    'fire safety': 'fire_safety', 'fire fighting': 'fire_safety',
    'cctv': 'cctv', 'surveillance': 'cctv',
    'intercom': 'intercom', 'video door phone': 'intercom',
    'rainwater harvesting': 'rainwater_harvesting',
    'waste management': 'waste_management', 'concierge': 'concierge'
};

class NormalizerService {
    normalizeCity(rawCity) {
        if (!rawCity) return null;
        return CITY_MAPPINGS[rawCity.trim().toLowerCase()] || rawCity.trim();
    }

    normalizePropertyType(rawType) {
        if (!rawType) return 'Apartment';
        return PROPERTY_TYPE_MAPPINGS[rawType.trim().toLowerCase()] || 'Apartment';
    }

    normalizePrice(rawPrice) {
        if (!rawPrice && rawPrice !== 0) return null;
        if (typeof rawPrice === 'number') return rawPrice;
        const str = String(rawPrice).trim().replace(/[₹,\s]/g, '');

        const rangeMatch = str.match(/([\d.]+)\s*(?:L|Lac|Lakh)?\s*[-–]\s*([\d.]+)\s*(?:L|Lac|Lakh)/i);
        if (rangeMatch) return Math.round((parseFloat(rangeMatch[1]) * 100000 + parseFloat(rangeMatch[2]) * 100000) / 2);

        const crMatch = str.match(/^([\d.]+)\s*(?:Cr|Crore|cr)$/i);
        if (crMatch) return Math.round(parseFloat(crMatch[1]) * 10000000);

        const lacMatch = str.match(/^([\d.]+)\s*(?:L|Lac|Lakh|Lakhs|lac)$/i);
        if (lacMatch) return Math.round(parseFloat(lacMatch[1]) * 100000);

        const num = parseFloat(str.replace(/,/g, ''));
        return isNaN(num) ? null : Math.round(num);
    }

    normalizeArea(rawArea) {
        if (!rawArea && rawArea !== 0) return null;
        if (typeof rawArea === 'number') return rawArea;
        const str = String(rawArea).trim().toLowerCase();
        const numMatch = str.match(/([\d,.]+)/);
        if (!numMatch) return null;
        const num = parseFloat(numMatch[1].replace(/,/g, ''));
        if (isNaN(num)) return null;

        for (const [unit, multiplier] of Object.entries(AREA_MULTIPLIERS)) {
            if (str.includes(unit)) return Math.round(num * multiplier);
        }
        return Math.round(num);
    }

    extractBHK(rawText) {
        if (!rawText) return null;
        const str = String(rawText);
        const match = str.match(/(\d)\s*(?:BHK|bhk|Bed|bed|Bedroom|bedroom|RK|rk)/i);
        if (match) return parseInt(match[1]);
        const wordMap = { 'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5 };
        for (const [word, num] of Object.entries(wordMap)) {
            if (str.toLowerCase().includes(`${word} bed`)) return num;
        }
        if (str.toLowerCase().includes('studio')) return 1;
        return null;
    }

    normalizeAmenities(rawAmenities) {
        if (!rawAmenities || !Array.isArray(rawAmenities)) return [];
        const normalized = new Set();
        for (const amenity of rawAmenities) {
            const key = String(amenity).trim().toLowerCase();
            const mapped = AMENITY_MAPPINGS[key];
            if (mapped) {
                normalized.add(mapped);
            } else {
                const allKeys = Object.keys(AMENITY_MAPPINGS);
                if (allKeys.length > 0) {
                    const best = stringSimilarity.findBestMatch(key, allKeys);
                    if (best.bestMatch.rating > 0.7) {
                        normalized.add(AMENITY_MAPPINGS[best.bestMatch.target]);
                    }
                }
            }
        }
        return [...normalized];
    }

    normalizeLocality(rawLocality, city) {
        if (!rawLocality) return null;
        return rawLocality.trim()
            .replace(/,?\s*\d{6}$/, '')
            .replace(/,?\s*India$/i, '')
            .replace(new RegExp(`,?\\s*${city}$`, 'i'), '')
            .trim() || rawLocality.trim();
    }

    async normalizeAll() {
        console.log('[NORMALIZER] Starting normalization...');
        const cursor = ScrapedListing.find({}).cursor();
        let normalized = 0;
        let errors = 0;

        for await (const listing of cursor) {
            try {
                const updates = {};
                if (listing.city) {
                    const normCity = this.normalizeCity(listing.city);
                    if (normCity !== listing.city) updates.city = normCity;
                }
                if (listing.locality) {
                    const normLocality = this.normalizeLocality(listing.locality, listing.city);
                    if (normLocality !== listing.locality) updates.locality = normLocality;
                }
                if (listing.propertyType) {
                    const normType = this.normalizePropertyType(listing.propertyType);
                    if (normType !== listing.propertyType) updates.propertyType = normType;
                }
                if (listing.amenities && listing.amenities.length > 0) {
                    updates.amenities = this.normalizeAmenities(listing.amenities);
                }
                if (!listing.bedrooms && listing.rawData) {
                    const bhk = this.extractBHK(listing.rawData.title || '');
                    if (bhk) updates.bedrooms = bhk;
                }
                if (listing.listedPrice && listing.areaSqft && listing.areaSqft > 0) {
                    updates.pricePerSqft = Math.round(listing.listedPrice / listing.areaSqft);
                }
                if (Object.keys(updates).length > 0) {
                    await ScrapedListing.findByIdAndUpdate(listing._id, { $set: updates });
                    normalized++;
                }
            } catch (e) {
                errors++;
            }
        }

        console.log(`[NORMALIZER] Done: ${normalized} normalized, ${errors} errors`);
        return { normalized, errors };
    }
}

module.exports = NormalizerService;
