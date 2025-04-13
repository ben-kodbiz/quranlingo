#!/usr/bin/env python3
"""
Script to scrape Arabic word meanings from Almaany.com and store them in a JSON file.
This script extracts all Arabic words from the surahs.json file and fetches their
meanings from Almaany.com.
"""

import json
import time
import os
import re
import argparse
from urllib.parse import quote
import requests
from bs4 import BeautifulSoup
from tqdm import tqdm

# Constants
ALMAANY_BASE_URL = "https://www.almaany.com/en/dict/ar-en/"
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Connection': 'keep-alive',
    'Referer': 'https://www.almaany.com/en/'
}
OUTPUT_FILE = "word_meanings.json"
DELAY = 2  # Delay between requests in seconds to avoid rate limiting

def load_surahs():
    """Load the surahs from the JSON file."""
    try:
        with open('surahs.json', 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f"Error loading surahs.json: {e}")
        return None

def extract_arabic_words(surahs_data):
    """Extract all unique Arabic words from the surahs data."""
    unique_words = set()
    
    for surah in surahs_data['surahs']:
        # Extract words from ayahs
        if 'ayahs' in surah:
            for ayah in surah['ayahs']:
                if 'words' in ayah:
                    for word in ayah['words']:
                        if 'arabic' in word:
                            unique_words.add(word['arabic'])
        
        # Extract words from questions
        if 'questions' in surah:
            for question in surah['questions']:
                if 'arabic' in question:
                    unique_words.add(question['arabic'])
    
    return list(unique_words)

def load_existing_meanings():
    """Load existing meanings from the output file if it exists."""
    if os.path.exists(OUTPUT_FILE):
        try:
            with open(OUTPUT_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            print(f"Error loading existing meanings: {e}")
    return {}

def scrape_word_meanings(word):
    """Scrape meanings for a given Arabic word from Almaany.com."""
    url = ALMAANY_BASE_URL + quote(word)
    meanings = []
    
    try:
        response = requests.get(url, headers=HEADERS, timeout=10)
        if response.status_code == 200:
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Find the meanings section
            meaning_sections = soup.select('.panel-body .meaning-results li')
            
            for section in meaning_sections:
                meaning_text = section.get_text(strip=True)
                # Clean up the meaning text
                meaning_text = re.sub(r'\s+', ' ', meaning_text)
                if meaning_text:
                    meanings.append(meaning_text)
            
            # If no meanings found in the list items, try alternative selectors
            if not meanings:
                meaning_divs = soup.select('.panel-body .meaning-results')
                for div in meaning_divs:
                    text = div.get_text(strip=True)
                    # Split by numbers or bullet points and clean
                    parts = re.split(r'\d+\.\s*|\•\s*', text)
                    for part in parts:
                        if part.strip():
                            meanings.append(part.strip())
        else:
            print(f"Failed to fetch {url}: Status code {response.status_code}")
    except Exception as e:
        print(f"Error scraping {word}: {e}")
    
    return meanings

def main():
    parser = argparse.ArgumentParser(description='Scrape Arabic word meanings from Almaany.com')
    parser.add_argument('--limit', type=int, default=None, help='Limit the number of words to scrape')
    args = parser.parse_args()
    
    # Load surahs data
    surahs_data = load_surahs()
    if not surahs_data:
        print("Failed to load surahs data. Exiting.")
        return
    
    # Extract unique Arabic words
    arabic_words = extract_arabic_words(surahs_data)
    print(f"Found {len(arabic_words)} unique Arabic words")
    
    # Load existing meanings
    word_meanings = load_existing_meanings()
    print(f"Loaded {len(word_meanings)} existing word meanings")
    
    # Determine which words need to be scraped
    words_to_scrape = [word for word in arabic_words if word not in word_meanings]
    if args.limit and args.limit < len(words_to_scrape):
        words_to_scrape = words_to_scrape[:args.limit]
    
    print(f"Scraping meanings for {len(words_to_scrape)} words")
    
    # Scrape meanings for each word
    for word in tqdm(words_to_scrape, desc="Scraping words"):
        meanings = scrape_word_meanings(word)
        if meanings:
            word_meanings[word] = meanings
            # Save after each successful scrape to avoid losing data
            with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
                json.dump(word_meanings, f, ensure_ascii=False, indent=2)
        
        # Add delay to avoid rate limiting
        time.sleep(DELAY)
    
    print(f"Completed scraping. Total words with meanings: {len(word_meanings)}")
    print(f"Results saved to {OUTPUT_FILE}")

if __name__ == "__main__":
    main()
