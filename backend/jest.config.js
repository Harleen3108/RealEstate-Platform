module.exports = {
    testEnvironment: 'node',
    testMatch: ['**/tests/**/*.test.js'],
    collectCoverageFrom: [
        'services/estimation/**/*.js',
        'services/normalization/**/*.js',
        'services/scraping/**/*.js'
    ],
    coverageDirectory: 'coverage',
    verbose: true,
    testTimeout: 10000
};
