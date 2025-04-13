/**
 * Tests for sw.js (Service Worker)
 */

const fs = require('fs');
const path = require('path');

describe('Service Worker', () => {
  let swContent;

  beforeAll(() => {
    // Read the sw.js file
    const swPath = path.join(__dirname, '..', 'sw.js');
    swContent = fs.readFileSync(swPath, 'utf8');
  });

  test('Service Worker should define CACHE_NAME', () => {
    expect(swContent).toContain('const CACHE_NAME');
  });

  test('Service Worker should define urlsToCache', () => {
    expect(swContent).toContain('const urlsToCache');
  });

  test('Service Worker should include version.js in cache list', () => {
    expect(swContent).toContain('./version.js');
  });

  test('Service Worker should include word_meanings.js in cache list', () => {
    // This test will fail if word_meanings.js is not in the cache list
    // We'll need to update sw.js to include it
    expect(swContent).toContain('./word_meanings.js');
  });

  test('Service Worker should handle install event', () => {
    expect(swContent).toContain("self.addEventListener('install'");
  });

  test('Service Worker should handle fetch event', () => {
    expect(swContent).toContain("self.addEventListener('fetch'");
  });

  test('Service Worker should handle activate event', () => {
    expect(swContent).toContain("self.addEventListener('activate'");
  });
});
