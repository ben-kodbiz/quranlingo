module.exports = {
  testEnvironment: 'jsdom',
  moduleFileExtensions: ['js', 'json'],
  transform: {},
  testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'app.js',
    'word_meanings.js',
    'pwa.js',
    'install.js',
    'version.js',
    '!**/node_modules/**',
    '!**/vendor/**'
  ],
  coverageReporters: ['text', 'lcov'],
  testPathIgnorePatterns: ['/node_modules/'],
  verbose: true
};
