const cheerio = require('cheerio');
const ScraperAgent = require('./ScraperAgent');
const { CITY_URL_CONFIG } = require('./cityConfig');
const { getMockListingsForCity } = require('./mockData');

class MagicBricksScraper extends ScraperAgent {
    constructor() {
        super('magicbricks', {
            baseUrl: 'https://www.magicbricks.com',
            rateLimitPerMinute: 20
        });
    }

    async scrape({ city, locality, propertyType, bedrooms }) {
        this.logAction('scrape_start', { city, locality });

        if (process.env.SCRAPER_USE_MOCK !== 'false') {
            const listings = getMockListingsForCity(city, 'magicbricks');
            this.logAction('scrape_complete_mock', { city, count: listings.length });
            return listings;
        }

        try {
            const cityConfig = CITY_URL_CONFIG[city];
            if (!cityConfig || !cityConfig.magicbricks) {
                this.logAction('scrape_skip', { city, reason: 'no_url_config' });
                return [];
            }

            let url = `${this.baseUrl}${cityConfig.magicbricks}`;
            if (locality) url += `&keyword=${encodeURIComponent(locality)}`;
            if (bedrooms) url += `&bedroom=${bedrooms}`;

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

        $('.mb-srp__card').each((_, el) => {
            try {
                const title = $(el).find('.mb-srp__card--title').text().trim();
                const priceText = $(el).find('.mb-srp__card__price--amount').text().trim();
                const areaText = $(el).find('.mb-srp__card__summary--value').first().text().trim();
                const localityText = $(el).find('.mb-srp__card--locality').text().trim();
                const configText = $(el).find('.mb-srp__card__summary--title').first().text().trim();
                const link = $(el).find('a.mb-srp__card--title').attr('href');

                if (!priceText || !areaText) return;

                const bedrooms = this.extractBHK(configText || title);
                const area = parseInt(areaText.replace(/[^0-9]/g, ''));

                listings.push({
                    source: 'magicbricks',
                    sourceListingId: `mb_${Buffer.from(link || title).toString('base64').slice(0, 20)}`,
                    sourceUrl: link ? `${this.baseUrl}${link}` : '',
                    propertyType: this.mapPropertyType(configText || title),
                    city,
                    locality: localityText || city,
                    areaSqft: area || 0,
                    bedrooms: bedrooms || 0,
                    listedPrice: this.parsePrice(priceText),
                    rawData: { title, priceText, areaText, localityText, configText },
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
}

module.exports = MagicBricksScraper;
