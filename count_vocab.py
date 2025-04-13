import json

with open('github_surahs.json', 'r') as f:
    data = json.load(f)

total_words = 0
total_questions = 0
total_ayah_words = 0

for surah in data['surahs']:
    questions_count = len(surah.get('questions', []))
    total_questions += questions_count

    ayah_words_count = 0
    if 'ayahs' in surah:
        for ayah in surah.get('ayahs', []):
            ayah_words_count += len(ayah.get('words', []))

    total_ayah_words += ayah_words_count
    total_words += questions_count + ayah_words_count

    print(f"Surah: {surah.get('title', 'Unknown')}")
    print(f"  Questions: {questions_count}")
    print(f"  Ayah Words: {ayah_words_count}")
    print(f"  Total: {questions_count + ayah_words_count}")
    print()

print(f"Total questions: {total_questions}")
print(f"Total ayah words: {total_ayah_words}")
print(f"Total vocabulary items: {total_words}")
