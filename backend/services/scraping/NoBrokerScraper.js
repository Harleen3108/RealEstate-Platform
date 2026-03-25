const ScraperAgent = require('./ScraperAgent');
const { CITY_URL_CONFIG } = require('./cityConfig');
const { getMockListingsForCity } = require('./mockData');

class NoBrokerScraper extends ScraperAgent {
    constructor() {
        super('nobroker', {
            baseUrl: 'https://www.nobroker.in',
            rateLimitPerMinute: 10
        });
    }

    async scrape({ city, locality, propertyType, bedrooms }) {
        this.logAction('scrape_start', { city, locality });

        if (process.env.SCRAPER_USE_MOCK !== 'false') {
            const listings = getMockListingsForCity(city, 'nobroker');
            this.logAction('scrape_complete_mock', { city, count: listings.length });
            return listings;
        }

        try {
            const cityConfig = CITY_URL_CONFIG[city];
            if (!cityConfig || !cityConfig.nobroker) {
                this.logAction('scrape_skip', { city, reason: 'no_url_config' });
                return [];
            }

            // NoBroker uses API endpoints — attempt JSON API first
            const apiUrl = `https://www.nobroker.in/api/v3/multi/property/filter?searchParam=${encodeURIComponent(city)}&type=sale`;

            const response = await this.fetchWithRetry(apiUrl, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            if (response.data && response.data.data) {
                const listings = this.parseApiResponse(response.data.data, city);
                this.logAction('scrape_complete', { city, count: listings.length });
                return listings;
            }

            return [];
        } catch (error) {
            this.logAction('scrape_error', { city, error: error.message });
            return [];
        }
    }

    parseApiResponse(data, city) {
        if (!Array.isArray(data)) return [];

        return data.map((item, idx) => {
            try {
                return {
                    source: 'nobroker',
                    sourceListingId: `nb_${item.id || idx}_${Date.now()}`,
                    sourceUrl: item.shortUrl || '',
                    propertyType: this.mapPropertyType(item.type || item.propertyType || ''),
                    city,
                    locality: item.locality || item.address || city,
                    areaSqft: item.propertySize || item.carpetArea || 0,
                    bedrooms: item.bhk || null,
                    bathrooms: item.bathroom || null,
                    floorNumber: item.floor || null,
                    totalFloors: item.totalFloor || null,
                    listedPrice: item.rent || item.price || 0,
                    amenities: item.amenities || [],
                    furnishingStatus: this.mapFurnishing(item.furnishing),
                    rawData: item,
                    scrapedAt: new Date()
                };
            } catch (e) {
                return null;
            }
        }).filter(Boolean);
    }

    mapPropertyType(type) {
        if (!type) return 'Apartment';
        const lower = type.toLowerCase();
        if (lower.includes('villa') || lower.includes('house') || lower.includes('bungalow')) return 'Villa';
        if (lower.includes('plot') || lower.includes('land')) return 'Land';
        if (lower.includes('commercial') || lower.includes('office') || lower.includes('shop')) return 'Commercial';
        return 'Apartment';
    }

    mapFurnishing(value) {
        if (!value) return null;
        const lower = value.toLowerCase();
        if (lower.includes('full') || lower === 'furnished') return 'furnished';
        if (lower.includes('semi')) return 'semi_furnished';
        if (lower.includes('un')) return 'unfurnished';
        return null;
    }
}

module.exports = NoBrokerScraper;
