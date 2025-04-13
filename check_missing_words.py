#!/usr/bin/env python3
"""
Script to check which words are missing from a specific surah in word_meanings.js.
"""

import json
import re
import sys

# Constants
SURAHS_FILE = 'surahs.json'
WORD_MEANINGS_FILE = 'word_meanings.js'

def load_surahs():
    """Load the surahs from the JSON file."""
    try:
        with open(SURAHS_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f"Error loading surahs.json: {e}")
        return None

def extract_word_meanings():
    """Extract word meanings from the JavaScript file."""
    try:
        with open(WORD_MEANINGS_FILE, 'r', encoding='utf-8') as f:
            content = f.read()
            
            # Extract the WORD_MEANINGS object using regex
            match = re.search(r'const WORD_MEANINGS = \{([\s\S]*?)\};', content)
            if not match:
                print("Could not find WORD_MEANINGS object in the file.")
                return {}
            
            # Get all Arabic words in the file
            words = re.findall(r"'([^']+)':", match.group(1))
            return set(words)
    except Exception as e:
        print(f"Error extracting word meanings: {e}")
        return set()

def get_surah_words(surah):
    """Get all words from a surah."""
    words = []
    
    # Extract words from ayahs
    if 'ayahs' in surah:
        for ayah in surah['ayahs']:
            if 'words' in ayah:
                for word in ayah['words']:
                    if 'arabic' in word:
                        words.append({
                            'arabic': word['arabic'],
                            'meaning': word['meaning'],
                            'meaning_my': word.get('meaning_my', word['meaning'])
                        })
    
    # Extract words from questions
    if 'questions' in surah:
        for question in surah['questions']:
            if 'arabic' in question:
                words.append({
                    'arabic': question['arabic'],
                    'meaning': question['meaning'],
                    'meaning_my': question.get('meaning_my', question['meaning'])
                })
    
    return words

def main():
    if len(sys.argv) < 2:
        print("Usage: python check_missing_words.py <surah_id>")
        return
    
    surah_id = sys.argv[1]
    
    # Load surahs
    surahs_data = load_surahs()
    if not surahs_data:
        print("Failed to load surahs data. Exiting.")
        return
    
    # Find the specified surah
    surah = next((s for s in surahs_data['surahs'] if s.get('id') == surah_id), None)
    if not surah:
        print(f"Surah with ID '{surah_id}' not found.")
        return
    
    # Extract word meanings
    word_meanings = extract_word_meanings()
    print(f"Found {len(word_meanings)} words in word_meanings.js")
    
    # Get all words in the surah
    surah_words = get_surah_words(surah)
    
    # Check which words are missing
    missing_words = []
    covered_words = []
    
    for word in surah_words:
        if word['arabic'] in word_meanings:
            covered_words.append(word)
        else:
            missing_words.append(word)
    
    # Print results
    print(f"\nSurah: {surah['title']}")
    print(f"Total words: {len(surah_words)}")
    print(f"Covered words: {len(covered_words)}")
    print(f"Missing words: {len(missing_words)}")
    
    if missing_words:
        print("\nMissing words:")
        for i, word in enumerate(missing_words, 1):
            print(f"{i}. Arabic: {word['arabic']}")
            print(f"   Meaning: {word['meaning']}")
            print(f"   Meaning (MY): {word['meaning_my']}")
            print()

if __name__ == "__main__":
    main()
