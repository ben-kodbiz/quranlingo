const { createApp } = Vue;

createApp({
    data() {
        return {
            currentScreen: 'menu', // 'menu', 'lesson', 'result', 'wordArrangement'
            lessonMode: 'vocabulary', // 'vocabulary', 'quiz', 'arrangement', 'pairs', 'fullSurah'
            language: localStorage.getItem('language') || 'en', // 'en' for English, 'my' for Bahasa Melayu
            currentLessonIndex: 0,
            currentQuestionIndex: 0,
            selectedAnswer: null,
            isCorrect: false,
            progress: 0,
            isLoading: true,
            lessons: [],
            darkMode: localStorage.getItem('darkMode') === 'true',
            xpPoints: parseInt(localStorage.getItem('xpPoints')) || 0,
            xpGained: 0, // Temporary storage for XP gained in current question
            achievements: JSON.parse(localStorage.getItem('achievements')) || [],
            showAchievement: false,
            currentAchievement: null,
            hearts: 3, // For the lives feature
            maxHearts: 3,
            streak: {
                current: parseInt(localStorage.getItem('currentStreak')) || 0,
                lastLogin: localStorage.getItem('lastLogin') || null,
                best: parseInt(localStorage.getItem('bestStreak')) || 0
            },
            // Vocabulary mode data
            currentVocabIndex: 0,
            currentVocabWords: [],
            randomizedQuestions: [], // For randomized quiz questions
            randomizedAyahs: [], // For randomized word arrangement

            // Word arrangement mode data
            currentAyahIndex: 0,
            shuffledOptions: [],
            selectedOptions: [],
            highlightedWordIndex: null,
            wordTiles: [], // For the word arrangement feature
            correctArrangement: [], // The correct order of words
            userArrangement: [], // The user's arrangement of words

            // Pairs game data
            pairsWords: [], // All words for the pairs game
            pairsSelected: null, // Currently selected word
            pairsMatched: [], // Pairs that have been matched
            pairsScore: 0, // Score for the current game
            pairsErrors: 0, // Number of errors in the current game

            // Additional meanings data
            showAdditionalMeanings: false, // Whether to show additional meanings
            wordMeanings: [] // Array of additional meanings for the current word
        };
    },

    created() {
        // Load the Surah data from the JSON file
        fetch('surahs.json')
            .then(response => response.json())
            .then(data => {
                this.lessons = data.surahs;
                this.isLoading = false;
            })
            .catch(error => {
                console.error('Error loading Surah data:', error);
                this.isLoading = false;
            });

        // Apply dark mode from localStorage on page load
        this.applyTheme();

        // Listen for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', this.checkSystemTheme);

        // Update streak
        this.updateStreak();
    },

    computed: {
        currentLesson() {
            return this.lessons[this.currentLessonIndex];
        },

        currentQuestion() {
            // Use randomized questions if available, otherwise use the original questions
            if (this.randomizedQuestions && this.randomizedQuestions.length > 0) {
                return this.randomizedQuestions[this.currentQuestionIndex];
            } else {
                return this.currentLesson.questions[this.currentQuestionIndex];
            }
        },

        currentVocabWord() {
            if (this.currentVocabWords.length === 0) {
                return { arabic: '', meaning: '', meaning_my: '' };
            }
            const word = this.currentVocabWords[this.currentVocabIndex];
            return word;
        },

        localizedMeaning() {
            if (this.currentVocabWords.length === 0) return '';
            const word = this.currentVocabWords[this.currentVocabIndex];
            return this.language === 'en' ? word.meaning : (word.meaning_my || word.meaning);
        },

        currentAyah() {
            if (!this.currentLesson.ayahs || this.currentLesson.ayahs.length === 0) {
                return { number: 1, text: '', translation: '', translation_my: '', words: [] };
            }

            // Use randomized ayahs if available, otherwise use the original ayahs
            if (this.randomizedAyahs && this.randomizedAyahs.length > 0) {
                return this.randomizedAyahs[this.currentAyahIndex];
            } else {
                return this.currentLesson.ayahs[this.currentAyahIndex];
            }
        },

        localizedTranslation() {
            if (!this.currentAyah) return '';
            return this.language === 'en' ? this.currentAyah.translation : (this.currentAyah.translation_my || this.currentAyah.translation);
        },

        localizedTitle() {
            if (!this.currentLesson) return '';
            return this.language === 'en' ? this.currentLesson.title : (this.currentLesson.title_my || this.currentLesson.title);
        },

        localizedDescription() {
            if (!this.currentLesson) return '';
            return this.language === 'en' ? this.currentLesson.description : (this.currentLesson.description_my || this.currentLesson.description);
        },

        isArrangementComplete() {
            return this.selectedOptions.length === this.currentAyah.words.length &&
                   this.selectedOptions.every(option => option !== null);
        },

        hasAyahsData() {
            return this.currentLesson &&
                   this.currentLesson.ayahs &&
                   this.currentLesson.ayahs.length > 0 &&
                   this.currentLesson.ayahs[0].words &&
                   this.currentLesson.ayahs[0].words.length > 0;
        },

        isPairsGameComplete() {
            return this.pairsMatched.length === this.pairsWords.length / 2;
        },

        totalQuestions() {
            return this.lessons.reduce((total, lesson) => total + this.getTotalVocabularyCount(lesson), 0);
        },

        completedQuestions() {
            let completed = 0;
            for (let i = 0; i < this.currentLessonIndex; i++) {
                completed += this.getTotalVocabularyCount(this.lessons[i]);
            }
            completed += this.currentQuestionIndex;
            return completed;
        }
    },

    methods: {
        // Calculate total vocabulary count for a lesson, including words from ayahs and questions
        getTotalVocabularyCount(lesson) {
            let count = 0;

            // Count words from ayahs
            if (lesson.ayahs && lesson.ayahs.length > 0) {
                lesson.ayahs.forEach(ayah => {
                    if (ayah.words && ayah.words.length > 0) {
                        count += ayah.words.length;
                    }
                });
            }

            // Always add questions count (not just as a fallback)
            if (lesson.questions) {
                count += lesson.questions.length;
            }

            return count;
        },

        // Format Arabic word to highlight specific parts if needed
        formatArabicWord(word) {
            // This is a placeholder for more advanced formatting
            // You could highlight specific parts of the word based on the lesson
            return word;
        },

        selectLesson(index) {
            this.currentLessonIndex = index;
            this.currentQuestionIndex = 0;
            this.currentVocabIndex = 0;
            this.currentAyahIndex = 0;
            this.progress = 0;
            this.lessonMode = 'vocabulary';
            this.currentScreen = 'lesson';
            this.showAdditionalMeanings = false;

            // Initialize vocabulary words from the lesson
            this.initializeVocabularyMode();

            // Initialize word meanings
            this.updateWordMeanings();
        },

        initializeVocabularyMode() {
            // Extract all words from the ayahs for vocabulary learning
            this.currentVocabWords = [];
            this.currentVocabIndex = 0;
            this.showAdditionalMeanings = false;

            if (this.currentLesson.ayahs && this.currentLesson.ayahs.length > 0) {
                // Create a randomized copy of the ayahs
                const randomizedAyahs = [...this.currentLesson.ayahs];
                this.shuffleArray(randomizedAyahs);

                // Get words from randomized ayahs
                randomizedAyahs.forEach(ayah => {
                    if (ayah.words && ayah.words.length > 0) {
                        // Create a randomized copy of the words
                        const randomizedWords = [...ayah.words];
                        this.shuffleArray(randomizedWords);
                        this.currentVocabWords = this.currentVocabWords.concat(randomizedWords);
                    }
                });
            } else {
                // Create a randomized copy of the questions
                const randomizedQuestions = [...this.currentLesson.questions];
                this.shuffleArray(randomizedQuestions);

                // Fallback to randomized questions if no ayahs are available
                randomizedQuestions.forEach(question => {
                    this.currentVocabWords.push({
                        arabic: question.arabic,
                        meaning: question.meaning,
                        meaning_my: question.meaning_my || question.meaning
                    });
                });
            }

            // Initialize word meanings for the first word
            if (this.currentVocabWords.length > 0) {
                this.updateWordMeanings();
            }
        },

        switchMode(mode) {
            this.lessonMode = mode;

            if (mode === 'vocabulary') {
                this.initializeVocabularyMode();
                this.showAdditionalMeanings = false;
                this.updateWordMeanings();
            } else if (mode === 'quiz') {
                this.currentQuestionIndex = 0;
                this.progress = 0;
                this.selectedAnswer = null;
            } else if (mode === 'arrangement') {
                this.initializeArrangementMode();
            } else if (mode === 'pairs') {
                this.initializePairsGame();
            } else if (mode === 'fullSurah') {
                // No special initialization needed for full surah display
                // Just switch to the mode and the template will handle the display
            }
        },

        initializePairsGame() {
            // Reset game state
            this.pairsWords = [];
            this.pairsSelected = null;
            this.pairsMatched = [];
            this.pairsScore = 0;
            this.pairsErrors = 0;

            // Get words from the current lesson
            let words = [];

            if (this.currentLesson.ayahs && this.currentLesson.ayahs.length > 0) {
                // Create a randomized copy of the ayahs
                const randomizedAyahs = [...this.currentLesson.ayahs];
                this.shuffleArray(randomizedAyahs);

                // Get words from randomized ayahs
                randomizedAyahs.forEach(ayah => {
                    if (ayah.words && ayah.words.length > 0) {
                        // Create a randomized copy of the words
                        const randomizedWords = [...ayah.words];
                        this.shuffleArray(randomizedWords);
                        words = words.concat(randomizedWords);
                    }
                });
            } else if (this.currentLesson.questions && this.currentLesson.questions.length > 0) {
                // Create a randomized copy of the questions
                const randomizedQuestions = [...this.currentLesson.questions];
                this.shuffleArray(randomizedQuestions);

                // Fallback to randomized questions if no ayahs are available
                randomizedQuestions.forEach(question => {
                    words.push({
                        arabic: question.arabic,
                        meaning: question.meaning,
                        meaning_my: question.meaning_my || question.meaning
                    });
                });
            }

            // Limit to a reasonable number of pairs (max 8 pairs = 16 cards)
            const maxPairs = 8;
            words = words.slice(0, maxPairs);

            // Create pairs array with both Arabic and English versions
            words.forEach(word => {
                // Get the appropriate meaning based on language
                const meaningText = this.language === 'en' ? word.meaning : (word.meaning_my || word.meaning);

                // Add Arabic word
                this.pairsWords.push({
                    id: this.generateUniqueId(),
                    text: word.arabic,
                    type: 'arabic',
                    pairId: word.meaning, // Use English meaning as the pair identifier (consistent across languages)
                    matched: false
                });

                // Add translated meaning
                this.pairsWords.push({
                    id: this.generateUniqueId(),
                    text: meaningText,
                    type: 'english',
                    pairId: word.meaning, // Use English meaning as the pair identifier
                    matched: false
                });
            });

            // Shuffle the pairs
            this.shuffleArray(this.pairsWords);
        },

        generateUniqueId() {
            return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        },

        selectPairsWord(word) {
            // If the word is already matched, do nothing
            if (word.matched) {
                return;
            }

            // If no word is selected, select this one
            if (!this.pairsSelected) {
                this.pairsSelected = word;
                return;
            }

            // If the same word is clicked again, deselect it
            if (this.pairsSelected.id === word.id) {
                this.pairsSelected = null;
                return;
            }

            // Check if the words match
            if (this.pairsSelected.pairId === word.pairId && this.pairsSelected.type !== word.type) {
                // Mark both words as matched
                this.pairsWords = this.pairsWords.map(w => {
                    if (w.id === this.pairsSelected.id || w.id === word.id) {
                        return { ...w, matched: true };
                    }
                    return w;
                });

                // Add to matched pairs
                this.pairsMatched.push(this.pairsSelected.pairId);

                // Award points
                this.pairsScore += 10;
                this.awardXP(5); // Award XP for each correct match

                // Reset selected word
                this.pairsSelected = null;

                // Check if game is complete
                if (this.isPairsGameComplete) {
                    // Award bonus points for completing the game
                    const bonus = Math.max(0, 50 - (this.pairsErrors * 5));
                    this.pairsScore += bonus;
                    this.awardXP(bonus / 5); // Convert bonus points to XP

                    setTimeout(() => {
                        alert(`Congratulations! You completed the pairs game with ${this.pairsScore} points!`);
                    }, 500);
                }
            } else {
                // Words don't match or same type (both Arabic or both English)
                this.pairsSelected = null;
                this.pairsErrors++;

                // Briefly show the selection was incorrect
                setTimeout(() => {
                    // Reset selected word
                    this.pairsSelected = null;
                }, 500);
            }
        },

        initializeArrangementMode() {
            this.currentAyahIndex = 0;
            this.selectedOptions = [];
            this.highlightedWordIndex = null;

            if (this.currentLesson.ayahs && this.currentLesson.ayahs.length > 0) {
                // Randomize ayahs order
                this.randomizedAyahs = [...this.currentLesson.ayahs];
                this.shuffleArray(this.randomizedAyahs);

                // Update currentAyahIndex to use the first randomized ayah
                this.currentAyahIndex = 0;

                // Create shuffled options from the randomized ayah's words
                const randomizedAyah = this.randomizedAyahs[this.currentAyahIndex];
                this.shuffledOptions = [...randomizedAyah.words];
                this.shuffleArray(this.shuffledOptions);

                // Initialize empty slots for selected options
                this.selectedOptions = Array(randomizedAyah.words.length).fill(null);
            } else {
                // If no ayahs data is available, create a simple arrangement from questions
                console.log('No ayahs data found, creating arrangement from questions');

                // Create a mock ayah from the first question
                const mockWords = [];
                if (this.currentLesson.questions && this.currentLesson.questions.length > 0) {
                    // Create a randomized copy of the questions
                    const randomizedQuestions = [...this.currentLesson.questions];
                    this.shuffleArray(randomizedQuestions);

                    // Take the first 4 questions or all if less than 4
                    const questionsToUse = randomizedQuestions.slice(0, Math.min(4, randomizedQuestions.length));

                    questionsToUse.forEach(question => {
                        mockWords.push({
                            arabic: question.arabic,
                            meaning: question.meaning,
                            meaning_my: question.meaning_my || question.meaning
                        });
                    });

                    // Create a mock ayah
                    if (!this.currentLesson.ayahs) {
                        this.currentLesson.ayahs = [];
                    }

                    this.currentLesson.ayahs.push({
                        number: 1,
                        text: mockWords.map(w => w.arabic).join(' '),
                        translation: mockWords.map(w => w.meaning).join(' '),
                        words: mockWords
                    });

                    // Now initialize with the mock ayah
                    this.shuffledOptions = [...mockWords];
                    this.shuffleArray(this.shuffledOptions);
                    this.selectedOptions = Array(mockWords.length).fill(null);
                } else {
                    console.error('No questions or ayahs available for arrangement mode');
                }
            }
        },

        shuffleArray(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
            return array;
        },

        prevVocabWord() {
            if (this.currentVocabIndex > 0) {
                this.currentVocabIndex--;
                // Update meanings for the new word
                this.updateWordMeanings();
            }
        },

        nextVocabWord() {
            if (this.currentVocabIndex < this.currentVocabWords.length - 1) {
                this.currentVocabIndex++;
                // Update meanings for the new word
                this.updateWordMeanings();
            }
        },

        toggleAdditionalMeanings() {
            this.showAdditionalMeanings = !this.showAdditionalMeanings;
            if (this.showAdditionalMeanings) {
                // Update the meanings when showing them
                this.updateWordMeanings();
            }
        },

        updateWordMeanings() {
            const word = this.currentVocabWord;
            const arabic = word.arabic;

            // Get word info from our database
            const wordInfo = this.getWordAdditionalInfo(arabic);

            // Get the appropriate meanings based on language
            if (this.language === 'en') {
                this.wordMeanings = wordInfo.additionalMeanings || [];
            } else {
                this.wordMeanings = wordInfo.additionalMeaningsMy || wordInfo.additionalMeanings || [];
            }
        },

        // Check if a surah is only showing partial ayahs
        isSurahPartial(lesson) {
            // Define the actual ayah counts for each surah
            const actualAyahCounts = {
                'al-fatihah': 7,
                'al-ikhlas': 4,
                'an-nas': 6,
                'al-falaq': 5,
                'al-kafirun': 6,
                'al-masad': 5,
                'an-nasr': 3,
                'al-kawthar': 3,
                'al-maun': 7,
                'quraysh': 4,
                'al-fil': 5,
                'al-humazah': 9,
                'al-asr': 3,
                'at-takathur': 8,
                'al-qariah': 11,
                'al-adiyat': 11,
                'az-zalzalah': 8,
                'al-bayyinah': 8,
                'al-qadr': 5,
                'al-alaq': 19,
                'at-tin': 8,
                'ash-sharh': 8,
                'ad-duha': 11,
                'al-lail': 21,
                'ash-shams': 15,
                'al-balad': 20,
                'al-fajr': 30,
                'al-ghashiyah': 26,
                'al-ala': 19,
                'at-tariq': 17,
                'al-buruj': 22,
                'al-inshiqaq': 25,
                'al-mutaffifin': 36,
                'al-infitar': 19,
                'at-takwir': 29,
                'abasa': 42,
                'an-naziat': 46,
                'an-naba': 40
            };

            // If the lesson has an ID and it's in our list of actual counts
            if (lesson && lesson.id && actualAyahCounts[lesson.id]) {
                // Check if the number of ayahs in the lesson is less than the actual count
                const currentAyahCount = lesson.ayahs ? lesson.ayahs.length : 0;
                return currentAyahCount > 0 && currentAyahCount < actualAyahCounts[lesson.id];
            }

            return false;
        },

        // Get a link to the full surah online
        getFullSurahLink(lesson) {
            // Map of surah IDs to their numbers in the Quran
            const surahNumbers = {
                'al-fatihah': 1,
                'al-ikhlas': 112,
                'an-nas': 114,
                'al-falaq': 113,
                'al-kafirun': 109,
                'al-masad': 111,
                'an-nasr': 110,
                'al-kawthar': 108,
                'al-maun': 107,
                'quraysh': 106,
                'al-fil': 105,
                'al-humazah': 104,
                'al-asr': 103,
                'at-takathur': 102,
                'al-qariah': 101,
                'al-adiyat': 100,
                'az-zalzalah': 99,
                'al-bayyinah': 98,
                'al-qadr': 97,
                'al-alaq': 96,
                'at-tin': 95,
                'ash-sharh': 94,
                'ad-duha': 93,
                'al-lail': 92,
                'ash-shams': 91,
                'al-balad': 90,
                'al-fajr': 89,
                'al-ghashiyah': 88,
                'al-ala': 87,
                'at-tariq': 86,
                'al-buruj': 85,
                'al-inshiqaq': 84,
                'al-mutaffifin': 83,
                'al-infitar': 82,
                'at-takwir': 81,
                'abasa': 80,
                'an-naziat': 79,
                'an-naba': 78
            };

            // If the lesson has an ID and it's in our list of surah numbers
            if (lesson && lesson.id && surahNumbers[lesson.id]) {
                // Return a link to the surah on quran.com
                return `https://quran.com/${surahNumbers[lesson.id]}`;
            }

            // Default link to quran.com homepage if surah ID is not found
            return 'https://quran.com';
        },

        // Get additional information about a word
        getWordAdditionalInfo(arabic) {
            // This function would ideally fetch data from a comprehensive Arabic dictionary
            // For now, we'll provide some sample data for common words

            // Default information structure
            const defaultInfo = {
                pronunciation: '[Arabic pronunciation]',
                additionalMeanings: [],
                additionalMeaningsMy: [],
                context: 'various Islamic contexts',
                contextMy: 'pelbagai konteks Islam',
                examples: ['Example sentence 1', 'Example sentence 2'],
                examplesMy: ['Contoh ayat 1', 'Contoh ayat 2'],
                root: '[root letters]',
                relatedWords: []
            };

            // Word-specific information
            const wordDatabase = {
                // Allah
                'الله': {
                    pronunciation: 'Allah',
                    additionalMeanings: ['The One True God', 'The Creator', 'The Sustainer'],
                    additionalMeaningsMy: ['Tuhan Yang Maha Esa', 'Pencipta', 'Pemelihara'],
                    context: 'divinity, worship, and the attributes of God',
                    contextMy: 'ketuhanan, ibadah, dan sifat-sifat Allah',
                    examples: ['Allah is the Creator of all things', 'There is no god but Allah'],
                    examplesMy: ['Allah adalah Pencipta segala sesuatu', 'Tiada tuhan melainkan Allah'],
                    root: 'This is a unique name that does not derive from a trilateral root',
                    relatedWords: [
                        {arabic: 'اللهم', meaning: 'O Allah', meaningMy: 'Ya Allah'},
                        {arabic: 'تالله', meaning: 'By Allah (in oaths)', meaningMy: 'Demi Allah (dalam sumpah)'}
                    ]
                },
                // Rahman (Merciful)
                'الرحمن': {
                    pronunciation: 'ar-Rahman',
                    additionalMeanings: ['The Most Compassionate', 'The Beneficent', 'The Most Gracious'],
                    additionalMeaningsMy: ['Yang Maha Penyayang', 'Yang Maha Pemurah', 'Yang Maha Pengasih'],
                    context: 'divine mercy and compassion',
                    contextMy: 'rahmat dan belas kasihan ilahi',
                    examples: ['Ar-Rahman taught the Quran', 'In the name of Allah, Ar-Rahman, Ar-Raheem'],
                    examplesMy: ['Ar-Rahman yang mengajarkan Al-Quran', 'Dengan nama Allah, Yang Maha Pemurah, lagi Maha Mengasihani'],
                    root: 'ر-ح-م (r-h-m)',
                    relatedWords: [
                        {arabic: 'الرحيم', meaning: 'The Most Merciful', meaningMy: 'Yang Maha Mengasihani'},
                        {arabic: 'رحمة', meaning: 'Mercy', meaningMy: 'Rahmat'},
                        {arabic: 'رحم', meaning: 'To have mercy', meaningMy: 'Mengasihani'}
                    ]
                },
                // Qul (Say)
                'قُلْ': {
                    pronunciation: 'qul',
                    additionalMeanings: ['Command to speak', 'Proclaim', 'Declare'],
                    additionalMeaningsMy: ['Perintah untuk berkata', 'Isytiharkan', 'Nyatakan'],
                    context: 'divine commands to the Prophet Muhammad',
                    contextMy: 'perintah ilahi kepada Nabi Muhammad',
                    examples: ['Qul huwa Allahu ahad (Say: He is Allah, the One)', 'Qul a\'udhu bi rabbil-falaq (Say: I seek refuge with the Lord of the Daybreak)'],
                    examplesMy: ['Qul huwa Allahu ahad (Katakanlah: Dialah Allah, Yang Maha Esa)', 'Qul a\'udhu bi rabbil-falaq (Katakanlah: Aku berlindung dengan Tuhan yang membelah cahaya subuh)'],
                    root: 'ق-و-ل (q-w-l)',
                    relatedWords: [
                        {arabic: 'قال', meaning: 'He said', meaningMy: 'Dia berkata'},
                        {arabic: 'يقول', meaning: 'He says', meaningMy: 'Dia berkata'},
                        {arabic: 'قول', meaning: 'Speech', meaningMy: 'Perkataan'}
                    ]
                },
                // Ahad (One)
                'أَحَدٌ': {
                    pronunciation: 'ahad',
                    additionalMeanings: ['One', 'Unique', 'Singular', 'Indivisible'],
                    additionalMeaningsMy: ['Satu', 'Unik', 'Tunggal', 'Tidak Terbahagi'],
                    context: 'the oneness and uniqueness of Allah',
                    contextMy: 'keesaan dan keunikan Allah',
                    examples: ['Qul huwa Allahu ahad (Say: He is Allah, the One)', 'There is no one like Him'],
                    examplesMy: ['Qul huwa Allahu ahad (Katakanlah: Dialah Allah, Yang Maha Esa)', 'Tiada sesiapa seperti-Nya'],
                    root: 'أ-ح-د (a-h-d)',
                    relatedWords: [
                        {arabic: 'واحد', meaning: 'One (cardinal number)', meaningMy: 'Satu (nombor kardinal)'},
                        {arabic: 'أحدية', meaning: 'Oneness', meaningMy: 'Keesaan'},
                        {arabic: 'توحيد', meaning: 'Monotheism', meaningMy: 'Tauhid'}
                    ]
                },
                // Bismillah (In the name of Allah)
                'بِسْمِ': {
                    pronunciation: 'bismillah',
                    additionalMeanings: ['In the name of', 'By the name of', 'With the name of'],
                    additionalMeaningsMy: ['Dengan nama', 'Atas nama', 'Melalui nama'],
                    context: 'beginning prayers and actions with Allah\'s name',
                    contextMy: 'memulakan doa dan tindakan dengan nama Allah',
                    examples: ['Bismillah ar-Rahman ar-Raheem (In the name of Allah, the Most Compassionate, the Most Merciful)', 'Muslims start their actions by saying Bismillah'],
                    examplesMy: ['Bismillah ar-Rahman ar-Raheem (Dengan nama Allah, Yang Maha Pemurah, lagi Maha Mengasihani)', 'Umat Islam memulakan tindakan mereka dengan mengucapkan Bismillah'],
                    root: 'ب-س-م (b-s-m)',
                    relatedWords: [
                        {arabic: 'اسم', meaning: 'Name', meaningMy: 'Nama'},
                        {arabic: 'أسماء', meaning: 'Names', meaningMy: 'Nama-nama'},
                        {arabic: 'مسمى', meaning: 'Named', meaningMy: 'Dinamakan'}
                    ]
                },
                // Al-Falaq (The Daybreak)
                'الْفَلَقِ': {
                    pronunciation: 'al-falaq',
                    additionalMeanings: ['The Daybreak', 'The Dawn', 'The Splitting', 'The Cleaving'],
                    additionalMeaningsMy: ['Waktu Subuh', 'Fajar', 'Pembelahan', 'Pemisahan'],
                    context: 'the breaking of dawn and seeking refuge in Allah',
                    contextMy: 'terbitnya fajar dan mencari perlindungan pada Allah',
                    examples: ['Qul a\'udhu bi rabbil-falaq (Say: I seek refuge with the Lord of the Daybreak)', 'The falaq is the time when light emerges from darkness'],
                    examplesMy: ['Qul a\'udhu bi rabbil-falaq (Katakanlah: Aku berlindung dengan Tuhan yang membelah cahaya subuh)', 'Falaq adalah masa ketika cahaya muncul dari kegelapan'],
                    root: 'ف-ل-ق (f-l-q)',
                    relatedWords: [
                        {arabic: 'فلق', meaning: 'To split', meaningMy: 'Membelah'},
                        {arabic: 'فالق', meaning: 'Splitter', meaningMy: 'Pembelah'},
                        {arabic: 'مفلوق', meaning: 'Split', meaningMy: 'Terbelah'}
                    ]
                },
                // An-Nas (Mankind)
                'النَّاسِ': {
                    pronunciation: 'an-nas',
                    additionalMeanings: ['Mankind', 'Humanity', 'People', 'Humankind'],
                    additionalMeaningsMy: ['Manusia', 'Umat manusia', 'Orang ramai', 'Manusia sejagat'],
                    context: 'humanity and seeking protection from evil whispers',
                    contextMy: 'kemanusiaan dan mencari perlindungan dari bisikan jahat',
                    examples: ['Qul a\'udhu bi rabbin-nas (Say: I seek refuge with the Lord of mankind)', 'The Quran was revealed as guidance for an-nas (mankind)'],
                    examplesMy: ['Qul a\'udhu bi rabbin-nas (Katakanlah: Aku berlindung dengan Tuhan manusia)', 'Al-Quran diturunkan sebagai panduan untuk an-nas (manusia)'],
                    root: 'ن-و-س (n-w-s)',
                    relatedWords: [
                        {arabic: 'إنسان', meaning: 'Human being', meaningMy: 'Manusia'},
                        {arabic: 'إنس', meaning: 'Mankind', meaningMy: 'Manusia'},
                        {arabic: 'ناس', meaning: 'People', meaningMy: 'Orang ramai'}
                    ]
                },
                // Al-Fajr (The Dawn)
                'الْفَجْرِ': {
                    pronunciation: 'al-fajr',
                    additionalMeanings: ['The Dawn', 'Daybreak', 'Morning Light', 'Early Morning'],
                    additionalMeaningsMy: ['Fajar', 'Subuh', 'Cahaya Pagi', 'Awal Pagi'],
                    context: 'the time of dawn prayer and the breaking of day',
                    contextMy: 'waktu solat subuh dan permulaan hari',
                    examples: ['Wal-fajr (By the dawn)', 'The fajr prayer is performed before sunrise'],
                    examplesMy: ['Wal-fajr (Demi fajar)', 'Solat fajr dilakukan sebelum matahari terbit'],
                    root: 'ف-ج-ر (f-j-r)',
                    relatedWords: [
                        {arabic: 'فجر', meaning: 'To break forth', meaningMy: 'Menyingsing'},
                        {arabic: 'انفجار', meaning: 'Explosion', meaningMy: 'Letupan'},
                        {arabic: 'تفجر', meaning: 'Eruption', meaningMy: 'Letusan'}
                    ]
                },
                // Al-Asr (Time)
                'الْعَصْرِ': {
                    pronunciation: 'al-asr',
                    additionalMeanings: ['Time', 'The Afternoon', 'The Age', 'The Era'],
                    additionalMeaningsMy: ['Masa', 'Waktu Petang', 'Zaman', 'Era'],
                    context: 'the passage of time and its importance in human life',
                    contextMy: 'perjalanan masa dan kepentingannya dalam kehidupan manusia',
                    examples: ['Wal-asr (By time)', 'The asr prayer is performed in the afternoon'],
                    examplesMy: ['Wal-asr (Demi masa)', 'Solat asr dilakukan pada waktu petang'],
                    root: 'ع-ص-ر (a-s-r)',
                    relatedWords: [
                        {arabic: 'عصر', meaning: 'To press', meaningMy: 'Menekan'},
                        {arabic: 'عصير', meaning: 'Juice', meaningMy: 'Jus'},
                        {arabic: 'معاصر', meaning: 'Contemporary', meaningMy: 'Kontemporari'}
                    ]
                },
                // Default for other words
                'default': defaultInfo
            };

            // Return word-specific info if available, otherwise return default info
            return wordDatabase[arabic] || wordDatabase['default'];
        },

        startQuiz() {
            this.switchMode('quiz');

            // Randomize the questions order
            if (this.currentLesson.questions && this.currentLesson.questions.length > 0) {
                // Create a copy of the questions array to avoid modifying the original
                const randomizedQuestions = [...this.currentLesson.questions];
                this.shuffleArray(randomizedQuestions);

                // Store the randomized questions in a temporary array
                this.randomizedQuestions = randomizedQuestions;
            }
        },

        selectArrangementOption(option) {
            console.log('Selecting option:', option);

            // Check if this option is already selected
            const isAlreadySelected = this.selectedOptions.some(selected =>
                selected && selected.meaning === option.meaning);

            if (isAlreadySelected) {
                console.log('Option already selected, ignoring');
                return;
            }

            // Find the first empty slot
            const emptyIndex = this.selectedOptions.findIndex(slot => slot === null);
            console.log('Empty slot index:', emptyIndex);

            if (emptyIndex !== -1) {
                // Create a copy of the selectedOptions array and update it
                const updatedOptions = [...this.selectedOptions];
                updatedOptions[emptyIndex] = {
                    arabic: option.arabic,
                    meaning: option.meaning
                };
                this.selectedOptions = updatedOptions;

                console.log('Updated selected options:', this.selectedOptions);

                // Check if all slots are filled
                if (this.isArrangementComplete) {
                    // Highlight the first word to indicate readiness to check
                    this.highlightedWordIndex = 0;
                }
            }
        },

        removeSelectedOption(index) {
            console.log('Removing option at index:', index);

            if (this.selectedOptions[index]) {
                // Create a copy of the selectedOptions array and update it
                const updatedOptions = [...this.selectedOptions];
                updatedOptions[index] = null;
                this.selectedOptions = updatedOptions;
                this.highlightedWordIndex = null;

                console.log('Updated selected options after removal:', this.selectedOptions);
            }
        },

        checkArrangement() {
            if (!this.isArrangementComplete) {
                alert('Please select all the words before checking.');
                return;
            }

            let isCorrect = true;

            try {
                console.log('Checking arrangement...');
                console.log('Selected options:', JSON.stringify(this.selectedOptions));
                console.log('Correct words:', JSON.stringify(this.currentAyah.words));

                // Compare selected options with the correct order
                for (let i = 0; i < this.currentAyah.words.length; i++) {
                    // Make sure both objects exist
                    if (!this.selectedOptions[i] || !this.currentAyah.words[i]) {
                        console.log(`Missing object at index ${i}`);
                        isCorrect = false;
                        break;
                    }

                    // Compare meanings, trimming whitespace to avoid minor differences
                    const selectedMeaning = this.selectedOptions[i].meaning.trim();
                    const correctMeaning = this.currentAyah.words[i].meaning.trim();

                    console.log(`Comparing: '${selectedMeaning}' with '${correctMeaning}'`);

                    if (selectedMeaning !== correctMeaning) {
                        console.log(`Mismatch at index ${i}`);
                        isCorrect = false;
                        break;
                    }
                }

                if (isCorrect) {
                    // Award XP and show success message
                    this.awardXP(10);
                    alert('Correct! You earned 10 XP.');

                    // Move to next ayah if available
                    if (this.currentAyahIndex < this.currentLesson.ayahs.length - 1) {
                        this.currentAyahIndex++;
                        this.initializeArrangementMode();
                    } else {
                        // End of ayahs, return to menu or show completion screen
                        alert('Congratulations! You have completed all ayahs in this surah.');
                        this.returnToMenu();
                    }
                } else {
                    // Reduce hearts and show error message
                    this.hearts--;
                    alert('Incorrect arrangement. Try again!');

                    // Reset the arrangement
                    this.selectedOptions = Array(this.currentAyah.words.length).fill(null);
                    this.highlightedWordIndex = null;

                    // Check if out of hearts
                    if (this.hearts <= 0) {
                        alert('You have run out of hearts. Taking you back to the menu.');
                        this.returnToMenu();
                    }
                }
            } catch (error) {
                console.error('Error in checkArrangement:', error);
                console.log('Current ayah:', this.currentAyah);
                console.log('Selected options:', this.selectedOptions);
                console.log('Shuffled options:', this.shuffledOptions);
                alert('An error occurred. Please try again.');
                this.initializeArrangementMode();
            }
        },

        returnToMenu() {
            this.currentScreen = 'menu';
        },

        // Legacy method for backward compatibility
        startWordArrangement() {
            this.switchMode('arrangement');
        },

        checkAnswer(answer) {
            this.selectedAnswer = answer;
            // Check if the answer is correct based on the current language
            this.isCorrect = this.language === 'en'
                ? answer === this.currentQuestion.correct
                : answer === (this.currentQuestion.correct_my || this.currentQuestion.correct);
            this.currentScreen = 'result';

            // Award XP points for correct answers
            if (this.isCorrect) {
                this.xpGained = 10; // Base XP for correct answer
                this.xpPoints += this.xpGained;
                localStorage.setItem('xpPoints', this.xpPoints);

                // Check for achievements
                this.checkAchievements();
            } else {
                this.xpGained = 0;
                // Reduce hearts in practice mode (if implemented)
                if (this.currentScreen === 'practice') {
                    this.hearts--;
                }
            }
        },

        nextQuestion() {
            this.selectedAnswer = null;
            this.xpGained = 0; // Reset XP gained display

            // Update progress
            this.progress = (this.completedQuestions + 1) / this.totalQuestions * 100;

            // Move to next question or lesson
            if (this.currentQuestionIndex < this.currentLesson.questions.length - 1) {
                this.currentQuestionIndex++;
                this.currentScreen = 'lesson';
            } else {
                // Bonus XP for completing a lesson
                const lessonCompletionXP = 20;
                this.xpPoints += lessonCompletionXP;
                localStorage.setItem('xpPoints', this.xpPoints);

                // Return to menu when lesson is completed
                this.currentScreen = 'menu';
                // Reset question index for next time
                this.currentQuestionIndex = 0;

                // Check for achievements after completing a lesson
                this.checkAchievements();
            }
        },

        // Dark mode methods
        toggleDarkMode() {
            this.darkMode = !this.darkMode;
            localStorage.setItem('darkMode', this.darkMode);
            this.applyTheme();
        },

        applyTheme() {
            // Apply theme to HTML element
            document.documentElement.setAttribute('data-theme', this.darkMode ? 'dark' : 'light');
        },

        checkSystemTheme(e) {
            // Only change theme automatically if user hasn't explicitly set a preference
            if (!localStorage.getItem('darkMode')) {
                this.darkMode = e.matches;
                this.applyTheme();
            }
        },

        // XP and Achievement methods
        checkAchievements() {
            const newAchievements = [];

            // Check for XP-based achievements
            if (this.xpPoints >= 100 && !this.hasAchievement('xp_100')) {
                newAchievements.push({
                    id: 'xp_100',
                    title: 'Century Learner',
                    description: 'Earned 100 XP points!'
                });
            }

            if (this.xpPoints >= 500 && !this.hasAchievement('xp_500')) {
                newAchievements.push({
                    id: 'xp_500',
                    title: 'Dedicated Scholar',
                    description: 'Earned 500 XP points!'
                });
            }

            // Check for vocabulary count achievements
            const wordsLearned = Math.floor(this.xpPoints / 10); // Approximate based on XP

            if (wordsLearned >= 10 && !this.hasAchievement('words_10')) {
                newAchievements.push({
                    id: 'words_10',
                    title: 'Vocabulary Builder',
                    description: 'Learned 10 Quranic words!'
                });
            }

            if (wordsLearned >= 50 && !this.hasAchievement('words_50')) {
                newAchievements.push({
                    id: 'words_50',
                    title: 'Word Master',
                    description: 'Learned 50 Quranic words!'
                });
            }

            // Add new achievements and save to localStorage
            if (newAchievements.length > 0) {
                this.achievements = [...this.achievements, ...newAchievements];
                localStorage.setItem('achievements', JSON.stringify(this.achievements));

                // Show the most recent achievement
                this.currentAchievement = newAchievements[newAchievements.length - 1];
                this.showAchievement = true;

                // Hide achievement notification after 3 seconds
                setTimeout(() => {
                    this.showAchievement = false;
                }, 3000);
            }
        },

        hasAchievement(id) {
            return this.achievements.some(achievement => achievement.id === id);
        },

        updateStreak() {
            const today = new Date().toDateString();

            if (this.streak.lastLogin) {
                const lastLogin = new Date(this.streak.lastLogin);
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);

                if (lastLogin.toDateString() === yesterday.toDateString()) {
                    // User logged in yesterday, increment streak
                    this.streak.current++;
                } else if (lastLogin.toDateString() !== today) {
                    // User didn't log in yesterday, reset streak
                    this.streak.current = 1;
                }
            } else {
                // First time login
                this.streak.current = 1;
            }

            // Update best streak if current is higher
            if (this.streak.current > this.streak.best) {
                this.streak.best = this.streak.current;
                localStorage.setItem('bestStreak', this.streak.best);
            }

            // Save current streak and last login
            if (this.streak.lastLogin !== today) {
                this.streak.lastLogin = today;
                localStorage.setItem('lastLogin', today);
                localStorage.setItem('currentStreak', this.streak.current);
            }
        },

        // Language switching methods
        switchLanguage() {
            // Toggle between English and Bahasa Melayu
            this.language = this.language === 'en' ? 'my' : 'en';
            localStorage.setItem('language', this.language);
        },

        // Get the appropriate text based on current language
        getLocalizedText(enText, myText) {
            return this.language === 'en' ? enText : myText;
        },

        // XP award method
        awardXP(amount) {
            // Add XP to the user's total
            this.xpPoints += amount;
            this.xpGained = amount; // Store the amount gained for display

            // Save to localStorage
            localStorage.setItem('xpPoints', this.xpPoints);

            // Check for achievements
            this.checkAchievements();
        },

        // Word arrangement feature methods
        startWordArrangement(questionIndex) {
            this.currentQuestionIndex = questionIndex;
            const question = this.currentLesson.questions[this.currentQuestionIndex];

            // Create word tiles from the correct answer
            if (question.arrangementWords) {
                this.wordTiles = [...question.arrangementWords];
                this.correctArrangement = [...question.arrangementWords];
                // Shuffle the word tiles
                this.wordTiles.sort(() => Math.random() - 0.5);
                this.userArrangement = [];
                this.currentScreen = 'wordArrangement';
            } else {
                // Fall back to regular lesson if no arrangement words
                this.currentScreen = 'lesson';
            }
        },

        selectWordTile(word, index) {
            // Add the word to user arrangement and remove from available tiles
            this.userArrangement.push(word);
            this.wordTiles.splice(index, 1);

            // Check if complete
            if (this.wordTiles.length === 0) {
                this.checkWordArrangement();
            }
        },

        removeArrangedWord(index) {
            // Return the word to available tiles
            const word = this.userArrangement[index];
            this.wordTiles.push(word);
            this.userArrangement.splice(index, 1);
        },

        checkWordArrangement() {
            // Compare user arrangement with correct arrangement
            const isCorrect = this.userArrangement.every(
                (word, index) => word === this.correctArrangement[index]
            );

            this.isCorrect = isCorrect;

            // Award XP points for correct answers
            if (this.isCorrect) {
                this.xpGained = 15; // More XP for arrangement exercises
                this.xpPoints += this.xpGained;
                localStorage.setItem('xpPoints', this.xpPoints);
                this.checkAchievements();
            }

            this.currentScreen = 'result';
        }
    }
}).mount('#app');
