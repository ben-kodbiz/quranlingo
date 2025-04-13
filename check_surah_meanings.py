#!/usr/bin/env python3
"""
Script to check which surahs have words in the word_meanings.js file.
This helps identify which surahs need to have their word meanings added.
"""

import json
import re
import os

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
    words = set()
    
    # Extract words from ayahs
    if 'ayahs' in surah:
        for ayah in surah['ayahs']:
            if 'words' in ayah:
                for word in ayah['words']:
                    if 'arabic' in word:
                        words.add(word['arabic'])
    
    # Extract words from questions
    if 'questions' in surah:
        for question in surah['questions']:
            if 'arabic' in question:
                words.add(question['arabic'])
    
    return words

def main():
    # Load surahs
    surahs_data = load_surahs()
    if not surahs_data:
        print("Failed to load surahs data. Exiting.")
        return
    
    # Extract word meanings
    word_meanings = extract_word_meanings()
    print(f"Found {len(word_meanings)} words in word_meanings.js")
    
    # Check each surah
    print("\nSurah Coverage Analysis:")
    print("=" * 50)
    print(f"{'Surah':<30} {'Words':<8} {'Covered':<8} {'Coverage %':<10} {'Status'}")
    print("-" * 50)
    
    surahs_to_fix = []
    
    for surah in surahs_data['surahs']:
        surah_id = surah.get('id', 'unknown')
        surah_title = surah.get('title', 'Unknown Surah')
        
        # Skip surahs that are not actual Quranic surahs
        if surah_id in ['basic-quranic-words', 'common-quranic-verbs']:
            continue
            
        # Get all words in the surah
        surah_words = get_surah_words(surah)
        
        if not surah_words:
            print(f"{surah_title:<30} {'N/A':<8} {'N/A':<8} {'N/A':<10} {'No words found'}")
            continue
        
        # Check how many words are covered
        covered_words = surah_words.intersection(word_meanings)
        coverage_percent = len(covered_words) / len(surah_words) * 100 if surah_words else 0
        
        status = "✅ Complete" if coverage_percent >= 90 else "❌ Needs fixing"
        
        print(f"{surah_title:<30} {len(surah_words):<8} {len(covered_words):<8} {coverage_percent:.1f}%{' ':<4} {status}")
        
        # Add to the list of surahs to fix if coverage is low
        if coverage_percent < 90 and len(surah_words) > 0:
            surahs_to_fix.append({
                'id': surah_id,
                'title': surah_title,
                'total_words': len(surah_words),
                'covered_words': len(covered_words),
                'coverage_percent': coverage_percent,
                'missing_words': list(surah_words - covered_words)
            })
    
    # Print summary of surahs to fix
    print("\nSurahs Needing Word Meanings:")
    print("=" * 50)
    for i, surah in enumerate(surahs_to_fix, 1):
        print(f"{i}. {surah['title']} - {surah['coverage_percent']:.1f}% coverage")
        print(f"   Missing {len(surah['missing_words'])} words out of {surah['total_words']}")
    
    # Print specific information about Al-Ghashiyah
    al_ghashiyah = next((s for s in surahs_to_fix if 'ghashiyah' in s['id'].lower()), None)
    if al_ghashiyah:
        print("\nSurah Al-Ghashiyah Details:")
        print("=" * 50)
        print(f"Total words: {al_ghashiyah['total_words']}")
        print(f"Covered words: {al_ghashiyah['covered_words']}")
        print(f"Missing words: {len(al_ghashiyah['missing_words'])}")
        print("\nMissing Arabic words:")
        for word in al_ghashiyah['missing_words']:
            print(f"- {word}")

if __name__ == "__main__":
    main()
