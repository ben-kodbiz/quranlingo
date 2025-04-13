import json

# Actual ayah counts for each surah in the Quran
actual_ayah_counts = {
    "al-fatihah": 7,
    "al-ikhlas": 4,
    "an-nas": 6,
    "al-falaq": 5,
    "al-kafirun": 6,
    "al-masad": 5,
    "an-nasr": 3,
    "al-kawthar": 3,
    "al-maun": 7,
    "quraysh": 4,
    "al-fil": 5,
    "al-humazah": 9,
    "al-asr": 3,
    "at-takathur": 8,
    "al-qariah": 11,
    "al-adiyat": 11,
    "az-zalzalah": 8,
    "al-bayyinah": 8,
    "al-qadr": 5,
    "al-alaq": 19,
    "at-tin": 8,
    "ash-sharh": 8,
    "ad-duha": 11,
    "al-lail": 21,
    "ash-shams": 15,
    "al-balad": 20,
    "al-fajr": 30,
    "al-ghashiyah": 26,
    "al-ala": 19,
    "at-tariq": 17,
    "al-buruj": 22,
    "al-inshiqaq": 25,
    "al-mutaffifin": 36,
    "al-infitar": 19,
    "at-takwir": 29,
    "abasa": 42,
    "an-naziat": 46,
    "an-naba": 40
}

with open('surahs.json', 'r') as f:
    data = json.load(f)

missing_ayahs = []

for surah in data['surahs']:
    surah_id = surah.get('id')
    if surah_id in actual_ayah_counts:
        actual_count = actual_ayah_counts[surah_id]
        current_count = len(surah.get('ayahs', []))
        
        print(f"Surah: {surah['title']}")
        print(f"  Current ayahs: {current_count}")
        print(f"  Actual ayahs: {actual_count}")
        
        if current_count < actual_count:
            print(f"  MISSING: {actual_count - current_count} ayahs")
            missing_ayahs.append({
                'id': surah_id,
                'title': surah['title'],
                'missing': actual_count - current_count,
                'current': current_count,
                'actual': actual_count
            })
        print()

print("\nSummary of Missing Ayahs:")
for item in missing_ayahs:
    print(f"{item['title']}: Missing {item['missing']} ayahs (has {item['current']}, should have {item['actual']})")
