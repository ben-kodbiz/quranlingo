# Arabic Word Meanings Scraper

This document explains how to use the scraping functionality to enhance the QuranLingo app with comprehensive Arabic word meanings from Almaany.com.

## Overview

The QuranLingo app now includes a feature to display multiple meanings for Arabic words. These meanings can be sourced from:

1. Built-in meanings in the app's codebase
2. Scraped meanings from Almaany.com stored in a JSON file

## Files

- `scrape_almaany.py`: Python script to scrape word meanings from Almaany.com
- `integrate_meanings.py`: Python script to convert the scraped JSON data to a JavaScript file
- `word_meanings.js`: JavaScript file containing the scraped meanings (generated or sample)

## How to Use the Scraper

### Prerequisites

Make sure you have Python 3.6+ installed with the following packages:
- requests
- beautifulsoup4
- tqdm

You can install them with:
```bash
pip install requests beautifulsoup4 tqdm
```

### Step 1: Scrape Meanings

Run the scraping script to fetch meanings for all Arabic words in the surahs.json file:

```bash
python scrape_almaany.py
```

This will:
- Extract all unique Arabic words from surahs.json
- Scrape meanings for each word from Almaany.com
- Save the results to word_meanings.json

You can limit the number of words to scrape (useful for testing):

```bash
python scrape_almaany.py --limit 10
```

### Step 2: Integrate the Meanings

After scraping, run the integration script to convert the JSON data to a JavaScript file:

```bash
python integrate_meanings.py
```

This will generate `word_meanings.js` with the scraped meanings in a format that can be used by the app.

### Step 3: Use the Meanings in the App

The app will automatically use the meanings from `word_meanings.js` when available. If a word doesn't have scraped meanings, it will fall back to the built-in meanings.

## Manual Lookup

If a word doesn't have meanings in the database, users can click the "Search on Almaany" button to open Almaany.com in a new tab with the word pre-searched.

## Updating the Meanings

To update the meanings:

1. Run the scraper again to get the latest meanings
2. Run the integration script to update the JavaScript file
3. Commit and push the changes to the repository

## Notes

- The scraper respects Almaany.com's servers by adding a delay between requests
- The scraper saves progress after each word, so it can be interrupted and resumed
- The integration script creates a clean JavaScript file that can be easily imported

## Troubleshooting

If you encounter issues:

1. Check your internet connection
2. Make sure you have the required Python packages installed
3. Try running with a small limit first to test the functionality
4. Check the Almaany.com website structure hasn't changed

## Future Enhancements

Possible improvements to the scraping functionality:

1. Add support for more dictionaries and sources
2. Implement a server-side API to fetch meanings on demand
3. Add a user contribution system for meanings
4. Improve the parsing of meanings to extract more structured data
