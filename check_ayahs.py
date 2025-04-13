import json

with open('surahs.json', 'r') as f:
    data = json.load(f)

for surah in data['surahs']:
    ayah_count = len(surah.get('ayahs', []))
    print(f"Surah: {surah['title']}")
    print(f"  Ayahs: {ayah_count}")
    
    # If there are ayahs, print the first and last ayah numbers
    if ayah_count > 0:
        first_ayah = surah['ayahs'][0]['number']
        last_ayah = surah['ayahs'][-1]['number']
        print(f"  First ayah number: {first_ayah}")
        print(f"  Last ayah number: {last_ayah}")
        
        # Check if there are missing ayahs
        if last_ayah > ayah_count:
            print(f"  WARNING: Missing ayahs! Last number is {last_ayah} but only {ayah_count} ayahs present.")
        
        # Check if ayahs are limited to 5
        if ayah_count == 5 and last_ayah > 5:
            print(f"  WARNING: Only 5 ayahs present but surah has more!")
    
    print()
