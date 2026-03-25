/**
 * Location Benchmarks — Realistic average price per sqft (INR) for Indian localities.
 * Used by the estimation pipeline as reference data when comparable listings are sparse
 * and as context for the LLM reasoning agent.
 *
 * Data reflects approximate 2025-2026 market rates for residential apartments.
 * Source: aggregated from public market reports, MagicBricks, 99acres, Housing.com
 */

const LOCATION_BENCHMARKS = {
    'Mumbai': {
        cityAvg: 18000,
        premium: 1.0,
        localities: {
            'Bandra West':       { avg: 45000, min: 35000, max: 60000, tier: 'ultra_premium' },
            'Bandra East':       { avg: 32000, min: 25000, max: 42000, tier: 'premium' },
            'Juhu':              { avg: 42000, min: 30000, max: 55000, tier: 'ultra_premium' },
            'Worli':             { avg: 48000, min: 35000, max: 65000, tier: 'ultra_premium' },
            'Lower Parel':       { avg: 38000, min: 28000, max: 50000, tier: 'premium' },
            'Andheri West':      { avg: 22000, min: 16000, max: 30000, tier: 'mid_premium' },
            'Andheri East':      { avg: 18000, min: 14000, max: 24000, tier: 'mid' },
            'Powai':             { avg: 20000, min: 15000, max: 28000, tier: 'mid_premium' },
            'Goregaon West':     { avg: 17000, min: 13000, max: 23000, tier: 'mid' },
            'Goregaon East':     { avg: 15000, min: 11000, max: 20000, tier: 'mid' },
            'Malad West':        { avg: 16000, min: 12000, max: 22000, tier: 'mid' },
            'Malad East':        { avg: 14000, min: 10000, max: 19000, tier: 'mid' },
            'Borivali West':     { avg: 15000, min: 11000, max: 20000, tier: 'mid' },
            'Borivali East':     { avg: 13000, min: 9000,  max: 18000, tier: 'affordable' },
            'Kandivali West':    { avg: 14500, min: 10000, max: 19000, tier: 'mid' },
            'Thane West':        { avg: 12000, min: 8000,  max: 17000, tier: 'affordable' },
            'Thane East':        { avg: 10000, min: 7000,  max: 14000, tier: 'affordable' },
            'Dadar':             { avg: 30000, min: 22000, max: 40000, tier: 'premium' },
            'Prabhadevi':        { avg: 35000, min: 26000, max: 48000, tier: 'premium' },
            'BKC':               { avg: 40000, min: 30000, max: 55000, tier: 'ultra_premium' },
            'Navi Mumbai':       { avg: 9000,  min: 6000,  max: 14000, tier: 'affordable' },
            'Kharghar':          { avg: 10000, min: 7000,  max: 14000, tier: 'affordable' },
            'Panvel':            { avg: 7000,  min: 5000,  max: 10000, tier: 'budget' },
            'Chembur':           { avg: 20000, min: 15000, max: 27000, tier: 'mid_premium' },
            'Mulund':            { avg: 16000, min: 12000, max: 22000, tier: 'mid' },
            'Vikhroli':          { avg: 15000, min: 11000, max: 20000, tier: 'mid' },
            'Ghatkopar':         { avg: 18000, min: 13000, max: 25000, tier: 'mid' },
            'Mira Road':         { avg: 8000,  min: 5500,  max: 12000, tier: 'budget' },
            'Vasai':             { avg: 6500,  min: 4500,  max: 9500,  tier: 'budget' },
        }
    },
    'Delhi NCR': {
        cityAvg: 8500,
        premium: 0.8,
        localities: {
            'Greater Kailash':   { avg: 18000, min: 14000, max: 25000, tier: 'premium' },
            'Defence Colony':    { avg: 22000, min: 16000, max: 30000, tier: 'premium' },
            'Vasant Kunj':       { avg: 12000, min: 9000,  max: 16000, tier: 'mid_premium' },
            'Saket':             { avg: 14000, min: 10000, max: 20000, tier: 'mid_premium' },
            'Dwarka':            { avg: 7500,  min: 5500,  max: 10000, tier: 'mid' },
            'Rohini':            { avg: 7000,  min: 5000,  max: 9500,  tier: 'mid' },
            'Lajpat Nagar':      { avg: 11000, min: 8000,  max: 15000, tier: 'mid' },
            'Hauz Khas':         { avg: 16000, min: 12000, max: 22000, tier: 'premium' },
            'Connaught Place':   { avg: 25000, min: 18000, max: 35000, tier: 'ultra_premium' },
            'South Extension':   { avg: 17000, min: 13000, max: 24000, tier: 'premium' },
            'Green Park':        { avg: 15000, min: 11000, max: 20000, tier: 'premium' },
            'Karol Bagh':        { avg: 10000, min: 7000,  max: 14000, tier: 'mid' },
            'Rajouri Garden':    { avg: 9000,  min: 6500,  max: 12000, tier: 'mid' },
            'Pitampura':         { avg: 8000,  min: 6000,  max: 11000, tier: 'mid' },
            'Janakpuri':         { avg: 8500,  min: 6000,  max: 11500, tier: 'mid' },
            'Chattarpur':        { avg: 7000,  min: 5000,  max: 10000, tier: 'affordable' },
            'Mehrauli':          { avg: 6500,  min: 4500,  max: 9000,  tier: 'affordable' },
            'Mayur Vihar':       { avg: 8500,  min: 6000,  max: 12000, tier: 'mid' },
        }
    },
    'Bangalore': {
        cityAvg: 8000,
        premium: 0.85,
        localities: {
            'Koramangala':       { avg: 12000, min: 9000,  max: 17000, tier: 'premium' },
            'Indiranagar':       { avg: 14000, min: 10000, max: 19000, tier: 'premium' },
            'HSR Layout':        { avg: 10000, min: 7500,  max: 14000, tier: 'mid_premium' },
            'Whitefield':        { avg: 7500,  min: 5500,  max: 10000, tier: 'mid' },
            'Marathahalli':      { avg: 7000,  min: 5000,  max: 9500,  tier: 'mid' },
            'Electronic City':   { avg: 5500,  min: 4000,  max: 7500,  tier: 'affordable' },
            'Sarjapur Road':     { avg: 7000,  min: 5000,  max: 10000, tier: 'mid' },
            'Hebbal':            { avg: 9000,  min: 6500,  max: 12000, tier: 'mid_premium' },
            'Yelahanka':         { avg: 6000,  min: 4500,  max: 8000,  tier: 'affordable' },
            'Devanahalli':       { avg: 5000,  min: 3500,  max: 7000,  tier: 'budget' },
            'JP Nagar':          { avg: 8500,  min: 6000,  max: 11500, tier: 'mid' },
            'Bannerghatta Road': { avg: 6500,  min: 4500,  max: 9000,  tier: 'affordable' },
            'MG Road':           { avg: 15000, min: 10000, max: 20000, tier: 'premium' },
            'Jayanagar':         { avg: 11000, min: 8000,  max: 15000, tier: 'mid_premium' },
            'Rajajinagar':       { avg: 10000, min: 7000,  max: 14000, tier: 'mid_premium' },
            'Banashankari':      { avg: 7500,  min: 5500,  max: 10000, tier: 'mid' },
            'Bellandur':         { avg: 7000,  min: 5000,  max: 9500,  tier: 'mid' },
            'Hennur':            { avg: 6000,  min: 4000,  max: 8500,  tier: 'affordable' },
        }
    },
    'Gurgaon': {
        cityAvg: 9500,
        premium: 0.9,
        localities: {
            'Golf Course Road':  { avg: 18000, min: 13000, max: 25000, tier: 'ultra_premium' },
            'DLF Phase 5':       { avg: 15000, min: 11000, max: 20000, tier: 'premium' },
            'DLF Phase 1':       { avg: 12000, min: 9000,  max: 16000, tier: 'premium' },
            'DLF Phase 2':       { avg: 11000, min: 8000,  max: 15000, tier: 'mid_premium' },
            'DLF Phase 3':       { avg: 10000, min: 7500,  max: 14000, tier: 'mid_premium' },
            'MG Road':           { avg: 10000, min: 7000,  max: 14000, tier: 'mid_premium' },
            'Sohna Road':        { avg: 6500,  min: 4500,  max: 9000,  tier: 'affordable' },
            'Sector 56':         { avg: 9000,  min: 6500,  max: 12000, tier: 'mid' },
            'Sector 57':         { avg: 8500,  min: 6000,  max: 11500, tier: 'mid' },
            'Sector 82':         { avg: 5500,  min: 4000,  max: 7500,  tier: 'affordable' },
            'Sector 67':         { avg: 8000,  min: 5500,  max: 11000, tier: 'mid' },
            'Sector 49':         { avg: 7000,  min: 5000,  max: 10000, tier: 'mid' },
            'Dwarka Expressway': { avg: 7500,  min: 5000,  max: 10500, tier: 'mid' },
            'New Gurgaon':       { avg: 6000,  min: 4000,  max: 8500,  tier: 'affordable' },
        }
    },
    'Noida': {
        cityAvg: 6500,
        premium: 0.65,
        localities: {
            'Sector 150':        { avg: 6000,  min: 4500,  max: 8000,  tier: 'mid' },
            'Sector 75':         { avg: 5500,  min: 4000,  max: 7500,  tier: 'affordable' },
            'Sector 137':        { avg: 5800,  min: 4200,  max: 7800,  tier: 'mid' },
            'Sector 128':        { avg: 7000,  min: 5000,  max: 9500,  tier: 'mid' },
            'Sector 44':         { avg: 8000,  min: 6000,  max: 11000, tier: 'mid_premium' },
            'Sector 62':         { avg: 6500,  min: 4500,  max: 9000,  tier: 'mid' },
            'Sector 76':         { avg: 5500,  min: 3800,  max: 7500,  tier: 'affordable' },
            'Sector 78':         { avg: 5800,  min: 4000,  max: 8000,  tier: 'mid' },
            'Greater Noida West':{ avg: 3800,  min: 2800,  max: 5500,  tier: 'budget' },
            'Greater Noida':     { avg: 4000,  min: 3000,  max: 5500,  tier: 'budget' },
            'Noida Expressway':  { avg: 6500,  min: 4500,  max: 9000,  tier: 'mid' },
        }
    },
    'Pune': {
        cityAvg: 7500,
        premium: 0.75,
        localities: {
            'Koregaon Park':     { avg: 14000, min: 10000, max: 20000, tier: 'premium' },
            'Kalyani Nagar':     { avg: 12000, min: 9000,  max: 16000, tier: 'premium' },
            'Baner':             { avg: 9000,  min: 6500,  max: 12000, tier: 'mid_premium' },
            'Hinjewadi':         { avg: 7000,  min: 5000,  max: 9500,  tier: 'mid' },
            'Kothrud':           { avg: 10000, min: 7000,  max: 13000, tier: 'mid_premium' },
            'Wakad':             { avg: 7000,  min: 5000,  max: 9500,  tier: 'mid' },
            'Aundh':             { avg: 10000, min: 7500,  max: 13000, tier: 'mid_premium' },
            'Viman Nagar':       { avg: 9500,  min: 7000,  max: 13000, tier: 'mid_premium' },
            'Hadapsar':          { avg: 6000,  min: 4000,  max: 8500,  tier: 'affordable' },
            'Kharadi':           { avg: 8000,  min: 5500,  max: 11000, tier: 'mid' },
            'Pimpri Chinchwad':  { avg: 5500,  min: 3800,  max: 7500,  tier: 'affordable' },
            'Magarpatta':        { avg: 8500,  min: 6000,  max: 11500, tier: 'mid' },
            'Undri':             { avg: 5000,  min: 3500,  max: 7000,  tier: 'budget' },
            'Bavdhan':           { avg: 7500,  min: 5500,  max: 10000, tier: 'mid' },
            'Wagholi':           { avg: 4500,  min: 3000,  max: 6500,  tier: 'budget' },
        }
    },
    'Hyderabad': {
        cityAvg: 7000,
        premium: 0.75,
        localities: {
            'Jubilee Hills':     { avg: 14000, min: 10000, max: 20000, tier: 'ultra_premium' },
            'Banjara Hills':     { avg: 13000, min: 9000,  max: 18000, tier: 'premium' },
            'Gachibowli':        { avg: 8000,  min: 6000,  max: 11000, tier: 'mid_premium' },
            'Madhapur':          { avg: 8500,  min: 6000,  max: 12000, tier: 'mid_premium' },
            'Kondapur':          { avg: 7000,  min: 5000,  max: 9500,  tier: 'mid' },
            'Kukatpally':        { avg: 5500,  min: 4000,  max: 7500,  tier: 'affordable' },
            'Manikonda':         { avg: 6000,  min: 4500,  max: 8000,  tier: 'mid' },
            'Begumpet':          { avg: 9000,  min: 6500,  max: 12000, tier: 'mid_premium' },
            'Secunderabad':      { avg: 6500,  min: 4500,  max: 9000,  tier: 'mid' },
            'Miyapur':           { avg: 5000,  min: 3500,  max: 7000,  tier: 'affordable' },
            'Nallagandla':       { avg: 6000,  min: 4000,  max: 8500,  tier: 'mid' },
            'Kokapet':           { avg: 7500,  min: 5500,  max: 10000, tier: 'mid_premium' },
            'Financial District':{ avg: 8000,  min: 6000,  max: 11000, tier: 'mid_premium' },
            'Pocharam':          { avg: 4000,  min: 2800,  max: 5500,  tier: 'budget' },
            'Shamshabad':        { avg: 4500,  min: 3000,  max: 6500,  tier: 'budget' },
        }
    },
    'Chennai': {
        cityAvg: 7000,
        premium: 0.7,
        localities: {
            'Adyar':             { avg: 12000, min: 9000,  max: 16000, tier: 'premium' },
            'T Nagar':           { avg: 14000, min: 10000, max: 19000, tier: 'premium' },
            'Anna Nagar':        { avg: 11000, min: 8000,  max: 15000, tier: 'mid_premium' },
            'Velachery':         { avg: 7500,  min: 5500,  max: 10000, tier: 'mid' },
            'OMR':               { avg: 6500,  min: 4500,  max: 9000,  tier: 'mid' },
            'Sholinganallur':    { avg: 7000,  min: 5000,  max: 9500,  tier: 'mid' },
            'Nungambakkam':      { avg: 15000, min: 11000, max: 20000, tier: 'premium' },
            'Mylapore':          { avg: 13000, min: 9500,  max: 17000, tier: 'premium' },
            'Tambaram':          { avg: 4500,  min: 3000,  max: 6500,  tier: 'budget' },
            'Porur':             { avg: 6000,  min: 4500,  max: 8000,  tier: 'affordable' },
            'Perambur':          { avg: 7000,  min: 5000,  max: 9500,  tier: 'mid' },
            'Perungudi':         { avg: 7500,  min: 5500,  max: 10000, tier: 'mid' },
            'Guindy':            { avg: 9000,  min: 6500,  max: 12500, tier: 'mid_premium' },
            'Thiruvanmiyur':     { avg: 10000, min: 7500,  max: 14000, tier: 'mid_premium' },
            'Medavakkam':        { avg: 5000,  min: 3500,  max: 7000,  tier: 'affordable' },
        }
    },
    'Ahmedabad': {
        cityAvg: 5500,
        premium: 0.55,
        localities: {
            'SG Highway':        { avg: 6500,  min: 4500,  max: 9000,  tier: 'mid' },
            'Prahlad Nagar':     { avg: 7000,  min: 5000,  max: 9500,  tier: 'mid_premium' },
            'Satellite':         { avg: 7500,  min: 5500,  max: 10000, tier: 'mid_premium' },
            'Vastrapur':         { avg: 7000,  min: 5000,  max: 9500,  tier: 'mid_premium' },
            'Bodakdev':          { avg: 7500,  min: 5500,  max: 10000, tier: 'mid_premium' },
            'Thaltej':           { avg: 6000,  min: 4000,  max: 8500,  tier: 'mid' },
            'Navrangpura':       { avg: 8000,  min: 6000,  max: 11000, tier: 'mid_premium' },
            'Bopal':             { avg: 4500,  min: 3200,  max: 6500,  tier: 'affordable' },
            'South Bopal':       { avg: 5000,  min: 3500,  max: 7000,  tier: 'affordable' },
            'Gota':              { avg: 4000,  min: 3000,  max: 5500,  tier: 'budget' },
            'Chandkheda':        { avg: 3500,  min: 2500,  max: 5000,  tier: 'budget' },
            'Maninagar':         { avg: 4500,  min: 3000,  max: 6500,  tier: 'affordable' },
            'Ambawadi':          { avg: 8500,  min: 6000,  max: 11500, tier: 'premium' },
        }
    },
    'Kolkata': {
        cityAvg: 5000,
        premium: 0.5,
        localities: {
            'Salt Lake':         { avg: 6500,  min: 4500,  max: 9000,  tier: 'mid_premium' },
            'Rajarhat':          { avg: 5000,  min: 3500,  max: 7000,  tier: 'mid' },
            'New Town':          { avg: 5500,  min: 4000,  max: 7500,  tier: 'mid' },
            'EM Bypass':         { avg: 7000,  min: 5000,  max: 9500,  tier: 'mid_premium' },
            'Alipore':           { avg: 12000, min: 8000,  max: 16000, tier: 'premium' },
            'Ballygunge':        { avg: 10000, min: 7000,  max: 14000, tier: 'premium' },
            'Park Street':       { avg: 11000, min: 8000,  max: 15000, tier: 'premium' },
            'Howrah':            { avg: 3500,  min: 2500,  max: 5000,  tier: 'budget' },
            'Garia':             { avg: 4500,  min: 3000,  max: 6500,  tier: 'affordable' },
            'Dum Dum':           { avg: 4000,  min: 2800,  max: 5500,  tier: 'affordable' },
            'Jadavpur':          { avg: 6000,  min: 4500,  max: 8000,  tier: 'mid' },
            'Lake Town':         { avg: 5500,  min: 4000,  max: 7500,  tier: 'mid' },
            'Behala':            { avg: 3800,  min: 2500,  max: 5500,  tier: 'budget' },
        }
    }
};

/**
 * Get benchmark pricing for a city+locality.
 * Returns { avg, min, max, tier, cityAvg } or null.
 */
function getBenchmark(city, locality) {
    if (!city) return null;

    // Normalize city name
    const cityKey = Object.keys(LOCATION_BENCHMARKS).find(
        k => k.toLowerCase() === city.toLowerCase() ||
             city.toLowerCase().includes(k.toLowerCase()) ||
             k.toLowerCase().includes(city.toLowerCase())
    );
    if (!cityKey) return null;

    const cityData = LOCATION_BENCHMARKS[cityKey];
    if (!locality) {
        return { avg: cityData.cityAvg, min: Math.round(cityData.cityAvg * 0.5), max: Math.round(cityData.cityAvg * 2.5), tier: 'city_average', cityAvg: cityData.cityAvg, cityName: cityKey };
    }

    // Fuzzy match locality
    const localityLower = locality.toLowerCase();
    const localityKey = Object.keys(cityData.localities).find(k => {
        const kLower = k.toLowerCase();
        return kLower === localityLower ||
               localityLower.includes(kLower) ||
               kLower.includes(localityLower);
    });

    if (localityKey) {
        return { ...cityData.localities[localityKey], cityAvg: cityData.cityAvg, cityName: cityKey, localityName: localityKey };
    }

    // Return city average as fallback
    return { avg: cityData.cityAvg, min: Math.round(cityData.cityAvg * 0.6), max: Math.round(cityData.cityAvg * 2.0), tier: 'city_average', cityAvg: cityData.cityAvg, cityName: cityKey };
}

/**
 * Get nearby locality benchmarks for context (same city, similar tier).
 */
function getNearbyBenchmarks(city, locality, limit = 5) {
    const benchmark = getBenchmark(city, locality);
    if (!benchmark?.cityName) return [];

    const cityData = LOCATION_BENCHMARKS[benchmark.cityName];
    if (!cityData?.localities) return [];

    return Object.entries(cityData.localities)
        .filter(([name]) => name.toLowerCase() !== (locality || '').toLowerCase())
        .map(([name, data]) => ({ locality: name, ...data }))
        .sort((a, b) => Math.abs(a.avg - (benchmark.avg || cityData.cityAvg)) - Math.abs(b.avg - (benchmark.avg || cityData.cityAvg)))
        .slice(0, limit);
}

module.exports = { LOCATION_BENCHMARKS, getBenchmark, getNearbyBenchmarks };
