const cheerio = require('cheerio');
const ScraperAgent = require('./ScraperAgent');
const { CITY_URL_CONFIG } = require('./cityConfig');
const { getMockListingsForCity } = require('./mockData');

class NinetyNineAcresScraper extends ScraperAgent {
    constructor() {
        super('99acres', {
            baseUrl: 'https://www.99acres.com',
            rateLimitPerMinute: 15
        });
    }

    async scrape({ city, locality, propertyType, bedrooms }) {
        this.logAction('scrape_start', { city, locality });

        if (process.env.SCRAPER_USE_MOCK !== 'false') {
            const listings = getMockListingsForCity(city, '99acres');
            this.logAction('scrape_complete_mock', { city, count: listings.length });
            return listings;
        }

        try {
            const cityConfig = CITY_URL_CONFIG[city];
            if (!cityConfig || !cityConfig['99acres']) {
                this.logAction('scrape_skip', { city, reason: 'no_url_config' });
                return [];
            }

            let url = `${this.baseUrl}${cityConfig['99acres']}`;
            if (locality) url += `&keyword=${encodeURIComponent(locality)}`;
            if (bedrooms) url += `&bedroom_num=${bedrooms}`;

            const response = await this.fetchWithRetry(url);
            const listings = this.parseListings(response.data, city);

            this.logAction('scrape_complete', { city, count: listings.length });
            return listings;
        } catch (error) {
            this.logAction('scrape_error', { city, error: error.message });
            return [];
        }
    }

    parseListings(html, city) {
        const $ = cheerio.load(html);
        const listings = [];

        $('[class*="projectTuple"], [class*="srpTuple"]').each((_, el) => {
            try {
                const title = $(el).find('[class*="projName"], [class*="tupleLink"]').text().trim();
                const priceText = $(el).find('[class*="price"], [class*="configurationCards__price"]').first().text().trim();
                const areaText = $(el).find('[class*="area"], [class*="carpetArea"]').first().text().trim();
                const localityText = $(el).find('[class*="locality"], [class*="projectTuple__subHeading"]').text().trim();
                const link = $(el).find('a').first().attr('href');

                if (!priceText) return;

                listings.push({
                    source: '99acres',
                    sourceListingId: `99a_${Buffer.from(link || title || String(Date.now())).toString('base64').slice(0, 20)}`,
                    sourceUrl: link ? (link.startsWith('http') ? link : `${this.baseUrl}${link}`) : '',
                    propertyType: this.mapPropertyType(title),
                    city,
                    locality: localityText || city,
                    areaSqft: this.parseArea(areaText),
                    bedrooms: this.extractBHK(title),
                    listedPrice: this.parsePrice(priceText),
                    rawData: { title, priceText, areaText, localityText },
                    scrapedAt: new Date()
                });
            } catch (e) {
                // Skip malformed listings
            }
        });

        return listings;
    }

    extractBHK(text) {
        if (!text) return null;
        const match = text.match(/(\d)\s*BHK/i) || text.match(/(\d)\s*Bed/i);
        return match ? parseInt(match[1]) : null;
    }

    mapPropertyType(text) {
        if (!text) return 'Apartment';
        const lower = text.toLowerCase();
        if (lower.includes('villa') || lower.includes('house') || lower.includes('bungalow')) return 'Villa';
        if (lower.includes('plot') || lower.includes('land')) return 'Land';
        if (lower.includes('commercial') || lower.includes('office') || lower.includes('shop')) return 'Commercial';
        return 'Apartment';
    }

    parsePrice(priceStr) {
        if (!priceStr) return 0;
        const str = priceStr.replace(/[₹,\s]/g, '');
        const crMatch = str.match(/([\d.]+)\s*(?:Cr|Crore)/i);
        if (crMatch) return Math.round(parseFloat(crMatch[1]) * 10000000);
        const lacMatch = str.match(/([\d.]+)\s*(?:L|Lac|Lakh)/i);
        if (lacMatch) return Math.round(parseFloat(lacMatch[1]) * 100000);
        return parseInt(str.replace(/\D/g, '')) || 0;
    }

    parseArea(areaStr) {
        if (!areaStr) return 0;
        const num = parseInt(areaStr.replace(/[^0-9]/g, ''));
        if (areaStr.toLowerCase().includes('sq.m') || areaStr.toLowerCase().includes('sqm')) {
            return Math.round(num * 10.764);
        }
        return num || 0;
    }
}

module.exports = NinetyNineAcresScraper;
