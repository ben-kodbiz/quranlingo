/**
 * Tests for word_meanings.js
 */

// Import the word meanings
const fs = require('fs');
const path = require('path');

describe('Word Meanings', () => {
  let WORD_MEANINGS;

  beforeAll(() => {
    // Read the word_meanings.js file
    const wordMeaningsPath = path.join(__dirname, '..', 'word_meanings.js');
    const wordMeaningsContent = fs.readFileSync(wordMeaningsPath, 'utf8');
    
    // Extract the WORD_MEANINGS object from the file
    // This is a simple way to evaluate the file content and get the object
    const wordMeaningsScript = new Function(`
      ${wordMeaningsContent}
      return WORD_MEANINGS;
    `);
    
    WORD_MEANINGS = wordMeaningsScript();
  });

  test('WORD_MEANINGS should be defined', () => {
    expect(WORD_MEANINGS).toBeDefined();
  });

  test('WORD_MEANINGS should be an object', () => {
    expect(typeof WORD_MEANINGS).toBe('object');
  });

  test('WORD_MEANINGS should not be empty', () => {
    expect(Object.keys(WORD_MEANINGS).length).toBeGreaterThan(0);
  });

  test('Each word should have an array of meanings', () => {
    Object.keys(WORD_MEANINGS).forEach(word => {
      expect(Array.isArray(WORD_MEANINGS[word])).toBe(true);
      expect(WORD_MEANINGS[word].length).toBeGreaterThan(0);
    });
  });

  test('Should contain words from Surah Al-Ikhlas', () => {
    expect(WORD_MEANINGS['قُلْ']).toBeDefined();
    expect(WORD_MEANINGS['هُوَ']).toBeDefined();
    expect(WORD_MEANINGS['اللَّهُ']).toBeDefined();
    expect(WORD_MEANINGS['أَحَدٌ']).toBeDefined();
  });

  test('Should contain words from Surah Al-Inshiqaq', () => {
    expect(WORD_MEANINGS['إِذَا']).toBeDefined();
    expect(WORD_MEANINGS['السَّمَاءُ']).toBeDefined();
    expect(WORD_MEANINGS['انشَقَّتْ']).toBeDefined();
  });

  test('Each meaning should be a non-empty string', () => {
    Object.keys(WORD_MEANINGS).forEach(word => {
      WORD_MEANINGS[word].forEach(meaning => {
        expect(typeof meaning).toBe('string');
        expect(meaning.length).toBeGreaterThan(0);
      });
    });
  });
});
