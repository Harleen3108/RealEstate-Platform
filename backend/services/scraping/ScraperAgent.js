const axios = require('axios');

const USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:121.0) Gecko/20100101 Firefox/121.0',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (iPad; CPU OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1'
];

class ScraperAgent {
    constructor(sourceName, options = {}) {
        this.sourceName = sourceName;
        this.baseUrl = options.baseUrl || '';
        this.rateLimitPerMinute = options.rateLimitPerMinute || 15;
        this.retryMax = options.retryMax || 3;
        this.retryDelaySeconds = options.retryDelaySeconds || 5;
        this.requestCount = 0;
        this.lastRequestTime = 0;
    }

    getRandomUserAgent() {
        return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
    }

    async delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    getRandomDelay() {
        return 2000 + Math.random() * 3000; // 2-5 seconds
    }

    async checkRateLimit() {
        const now = Date.now();
        const oneMinuteAgo = now - 60000;

        if (this.lastRequestTime > oneMinuteAgo) {
            this.requestCount++;
        } else {
            this.requestCount = 1;
            this.lastRequestTime = now;
        }

        if (this.requestCount > this.rateLimitPerMinute) {
            const waitTime = 60000 - (now - this.lastRequestTime);
            console.log(`[${this.sourceName}] Rate limit reached, waiting ${waitTime}ms`);
            await this.delay(waitTime);
            this.requestCount = 1;
            this.lastRequestTime = Date.now();
        }
    }

    async fetchWithRetry(url, options = {}) {
        let lastError;
        for (let attempt = 0; attempt < this.retryMax; attempt++) {
            try {
                await this.checkRateLimit();
                await this.delay(this.getRandomDelay());

                const response = await axios.get(url, {
                    headers: {
                        'User-Agent': this.getRandomUserAgent(),
                        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                        'Accept-Language': 'en-US,en;q=0.9',
                        'Accept-Encoding': 'gzip, deflate, br',
                        ...options.headers
                    },
                    timeout: 30000,
                    proxy: process.env.PROXY_URL ? { host: process.env.PROXY_URL } : false,
                    ...options
                });

                return response;
            } catch (error) {
                lastError = error;
                const delayMs = this.retryDelaySeconds * 1000 * Math.pow(2, attempt);
                console.log(`[${this.sourceName}] Attempt ${attempt + 1}/${this.retryMax} failed: ${error.message}. Retrying in ${delayMs}ms`);

                if (error.response && error.response.status === 403) {
                    console.log(`[${this.sourceName}] Possible IP block detected`);
                }

                if (error.response && error.response.status === 429) {
                    console.log(`[${this.sourceName}] Rate limited by server`);
                    await this.delay(60000);
                    continue;
                }

                await this.delay(delayMs);
            }
        }
        throw lastError;
    }

    async scrape(params) {
        throw new Error(`${this.sourceName}: scrape() must be implemented by subclass`);
    }

    parseListing(rawData) {
        throw new Error(`${this.sourceName}: parseListing() must be implemented by subclass`);
    }

    logAction(action, details = {}) {
        console.log(JSON.stringify({
            timestamp: new Date().toISOString(),
            agent: this.sourceName,
            action,
            ...details
        }));
    }
}

module.exports = ScraperAgent;
