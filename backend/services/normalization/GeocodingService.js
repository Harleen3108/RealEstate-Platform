const axios = require('axios');
const GeoCache = require('../../models/GeoCache');
const ScrapedListing = require('../../models/ScrapedListing');

class GeocodingService {
    constructor() {
        this.userAgent = process.env.NOMINATIM_USER_AGENT || 'RealEstatePlatform/1.0';
        this.lastRequestTime = 0;
        this.minRequestInterval = 1100;
    }

    async delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async respectRateLimit() {
        const now = Date.now();
        const elapsed = now - this.lastRequestTime;
        if (elapsed < this.minRequestInterval) {
            await this.delay(this.minRequestInterval - elapsed);
        }
        this.lastRequestTime = Date.now();
    }

    async geocode(location, city) {
        const query = `${location}, ${city}, India`.toLowerCase().trim();

        const cached = await GeoCache.findOne({ query });
        if (cached) {
            return { latitude: cached.latitude, longitude: cached.longitude, displayName: cached.displayName, fromCache: true };
        }

        await this.respectRateLimit();

        try {
            const response = await axios.get('https://nominatim.openstreetmap.org/search', {
                params: { q: `${location}, ${city}, India`, format: 'json', limit: 1, countrycodes: 'in' },
                headers: { 'User-Agent': this.userAgent },
                timeout: 10000
            });

            if (response.data && response.data.length > 0) {
                const result = response.data[0];
                const geoResult = {
                    latitude: parseFloat(result.lat),
                    longitude: parseFloat(result.lon),
                    displayName: result.display_name,
                    fromCache: false
                };

                await GeoCache.findOneAndUpdate(
                    { query },
                    { query, latitude: geoResult.latitude, longitude: geoResult.longitude, displayName: geoResult.displayName, city, cachedAt: new Date() },
                    { upsert: true }
                );

                return geoResult;
            }
            return null;
        } catch (error) {
            console.error(`[GEOCODING] Error: ${error.message}`);
            return null;
        }
    }

    async geocodeListings() {
        console.log('[GEOCODING] Starting batch geocoding...');
        const listings = await ScrapedListing.find({
            $or: [{ geoLocation: null }, { geoLocation: { $exists: false } }, { 'geoLocation.coordinates': { $size: 0 } }],
            locality: { $exists: true, $ne: null },
            city: { $exists: true, $ne: null }
        }).limit(500);

        let geocoded = 0, failed = 0;
        for (const listing of listings) {
            try {
                const result = await this.geocode(listing.locality, listing.city);
                if (result) {
                    await ScrapedListing.findByIdAndUpdate(listing._id, {
                        $set: { geoLocation: { type: 'Point', coordinates: [result.longitude, result.latitude] } }
                    });
                    geocoded++;
                } else { failed++; }
            } catch (error) { failed++; }
        }

        console.log(`[GEOCODING] Done: ${geocoded} geocoded, ${failed} failed`);
        return { total: listings.length, geocoded, failed };
    }

    static haversineDistance(lat1, lon1, lat2, lon2) {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }
}

module.exports = GeocodingService;
