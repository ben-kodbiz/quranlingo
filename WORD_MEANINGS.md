# Word Meanings in QuranLingo

This document provides information about the word meanings feature in QuranLingo and the progress of adding comprehensive meanings for all surahs.

## Overview

QuranLingo provides multiple meanings for Arabic words to help users understand the nuances and depth of Quranic vocabulary. These meanings are sourced from Almaany.com and other reputable Arabic dictionaries.

## Current Status

As of the latest update, the following surahs have complete word meanings coverage:

- ✅ Surah Al-Ghashiyah (The Overwhelming) - 100% coverage
- ✅ Surah Al-Inshiqaq (The Splitting Asunder) - 100% coverage

The following surahs have partial coverage:
- Surah Al-Ikhlas (The Sincerity) - 83.3% coverage
- Surah Al-Ikhlas (Sincerity) - 60.0% coverage
- Surah Al-Falaq (The Daybreak) - 17.6% coverage
- Surah Al-Infitar (The Cleaving Asunder) - 18.8% coverage
- Surah Az-Zalzalah (The Earthquake) - 17.6% coverage
- Surah At-Takwir (The Folding Up) - 15.4% coverage
- Surah Al-Masad (The Palm Fiber) - 13.6% coverage
- Surah Al-Fajr (The Dawn) - 13.3% coverage

## How to Use

1. In the Vocabulary mode, click on "Show All Meanings" to see multiple meanings for the current word
2. If no meanings are available, you can click "Search on Almaany" to look up the word on Almaany.com

## Adding More Meanings

To add meanings for more surahs:

1. Use the `check_surah_meanings.py` script to identify which surahs need meanings:
   ```bash
   python3 check_surah_meanings.py
   ```

2. Use the `check_missing_words.py` script to identify specific missing words in a surah:
   ```bash
   python3 check_missing_words.py <surah_id>
   ```

3. Add the missing words to `word_meanings.js` following the existing format:
   ```javascript
   'Arabic Word': [
     'Meaning 1',
     'Meaning 2',
     'Meaning 3',
     'Meaning 4',
     'Meaning 5'
   ],
   ```

4. Run the check scripts again to verify the coverage

## Roadmap

The plan for completing word meanings for all surahs:

1. **Phase 1 (Current)**: Complete meanings for frequently used surahs
   - Al-Ghashiyah ✅
   - Al-Inshiqaq ✅
   - Al-Ikhlas (in progress)
   - Al-Fatihah (planned)
   - An-Nas (planned)
   - Al-Falaq (planned)

2. **Phase 2**: Add meanings for remaining surahs in Juz Amma
   - Focus on shorter surahs first
   - Prioritize based on frequency of use in the app

3. **Phase 3**: Implement automated scraping
   - Enhance the scraping script to automatically fetch meanings from Almaany.com
   - Create a workflow to regularly update the meanings database

## Contributing

If you'd like to contribute word meanings:

1. Fork the repository
2. Add meanings for a specific surah
3. Run the check scripts to verify coverage
4. Submit a pull request

Please ensure that each Arabic word has at least 5 different meanings to provide a comprehensive understanding of the word's usage in different contexts.
