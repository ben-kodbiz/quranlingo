const { createApp } = Vue;

createApp({
    data() {
        return {
            currentScreen: 'menu', // 'menu', 'lesson', 'result', 'wordArrangement'
            lessonMode: 'vocabulary', // 'vocabulary', 'quiz', 'arrangement', 'pairs'
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

            // Chat mode data
            chatMode: false, // Whether chat mode is active
            chatMessages: [], // Array of chat messages
            userInput: '', // User's current input in chat
            chatBotName: 'QuranBot', // Name of the chatbot
            isTyping: false // Whether the bot is typing
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
            return this.currentLesson.questions[this.currentQuestionIndex];
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
            return this.currentLesson.ayahs[this.currentAyahIndex];
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
            return this.lessons.reduce((total, lesson) => total + lesson.questions.length, 0);
        },

        completedQuestions() {
            let completed = 0;
            for (let i = 0; i < this.currentLessonIndex; i++) {
                completed += this.lessons[i].questions.length;
            }
            completed += this.currentQuestionIndex;
            return completed;
        }
    },

    methods: {
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

            // Initialize vocabulary words from the lesson
            this.initializeVocabularyMode();
        },

        initializeVocabularyMode() {
            // Extract all words from the ayahs for vocabulary learning
            this.currentVocabWords = [];

            if (this.currentLesson.ayahs && this.currentLesson.ayahs.length > 0) {
                // Get words from ayahs
                this.currentLesson.ayahs.forEach(ayah => {
                    if (ayah.words && ayah.words.length > 0) {
                        this.currentVocabWords = this.currentVocabWords.concat(ayah.words);
                    }
                });
            } else {
                // Fallback to questions if no ayahs are available
                this.currentLesson.questions.forEach(question => {
                    this.currentVocabWords.push({
                        arabic: question.arabic,
                        meaning: question.meaning,
                        meaning_my: question.meaning_my || question.meaning
                    });
                });
            }
        },

        switchMode(mode) {
            this.lessonMode = mode;

            if (mode === 'vocabulary') {
                this.initializeVocabularyMode();
            } else if (mode === 'quiz') {
                this.currentQuestionIndex = 0;
                this.progress = 0;
                this.selectedAnswer = null;
            } else if (mode === 'arrangement') {
                this.initializeArrangementMode();
            } else if (mode === 'pairs') {
                this.initializePairsGame();
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
                // Get words from ayahs
                this.currentLesson.ayahs.forEach(ayah => {
                    if (ayah.words && ayah.words.length > 0) {
                        words = words.concat(ayah.words);
                    }
                });
            } else if (this.currentLesson.questions && this.currentLesson.questions.length > 0) {
                // Fallback to questions if no ayahs are available
                this.currentLesson.questions.forEach(question => {
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
                // Create shuffled options from the current ayah's words
                this.shuffledOptions = [...this.currentAyah.words];
                this.shuffleArray(this.shuffledOptions);

                // Initialize empty slots for selected options
                this.selectedOptions = Array(this.currentAyah.words.length).fill(null);
            } else {
                // If no ayahs data is available, create a simple arrangement from questions
                console.log('No ayahs data found, creating arrangement from questions');

                // Create a mock ayah from the first question
                const mockWords = [];
                if (this.currentLesson.questions && this.currentLesson.questions.length > 0) {
                    // Take the first 4 questions or all if less than 4
                    const questionsToUse = this.currentLesson.questions.slice(0, Math.min(4, this.currentLesson.questions.length));

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
                // Reset chat when moving to a new word
                if (this.chatMode) {
                    this.resetChat();
                }
            }
        },

        nextVocabWord() {
            if (this.currentVocabIndex < this.currentVocabWords.length - 1) {
                this.currentVocabIndex++;
                // Reset chat when moving to a new word
                if (this.chatMode) {
                    this.resetChat();
                }
            }
        },

        toggleChatMode() {
            this.chatMode = !this.chatMode;
            if (this.chatMode) {
                // Initialize chat with a welcome message
                this.resetChat();
                this.addBotMessage(this.getWelcomeMessage());
            }
        },

        resetChat() {
            this.chatMessages = [];
            this.userInput = '';
            this.isTyping = false;
        },

        getWelcomeMessage() {
            const word = this.currentVocabWord;
            const arabic = word.arabic;
            const meaning = this.language === 'en' ? word.meaning : (word.meaning_my || word.meaning);

            if (this.language === 'en') {
                return `I can help you learn more about the word "${arabic}" (${meaning}). What would you like to know about it?`;
            } else {
                return `Saya boleh membantu anda mempelajari lebih lanjut tentang kata "${arabic}" (${meaning}). Apa yang ingin anda ketahui tentangnya?`;
            }
        },

        sendMessage() {
            if (!this.userInput.trim() || this.isTyping) return;

            // Add user message
            this.addUserMessage(this.userInput);
            const userQuestion = this.userInput;
            this.userInput = '';

            // Show typing indicator
            this.isTyping = true;

            // Simulate bot response after a delay
            setTimeout(() => {
                this.isTyping = false;
                this.addBotMessage(this.generateBotResponse(userQuestion));

                // Scroll to bottom after rendering
                this.$nextTick(() => {
                    this.scrollChatToBottom();
                });
            }, 1000 + Math.random() * 1000); // Random delay between 1-2 seconds

            // Scroll to bottom immediately after user message
            this.$nextTick(() => {
                this.scrollChatToBottom();
            });
        },

        addUserMessage(text) {
            this.chatMessages.push({
                sender: 'user',
                text: text,
                time: this.getCurrentTime()
            });
        },

        addBotMessage(text) {
            this.chatMessages.push({
                sender: 'bot',
                text: text,
                time: this.getCurrentTime()
            });
        },

        getCurrentTime() {
            const now = new Date();
            return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        },

        scrollChatToBottom() {
            if (this.$refs.chatMessages) {
                this.$refs.chatMessages.scrollTop = this.$refs.chatMessages.scrollHeight;
            }
        },

        generateBotResponse(question) {
            const word = this.currentVocabWord;
            const arabic = word.arabic;
            const meaning = this.language === 'en' ? word.meaning : (word.meaning_my || word.meaning);

            // Convert question to lowercase for easier matching
            const lowerQuestion = question.toLowerCase();

            // Check for common questions and provide appropriate responses
            if (this.language === 'en') {
                // English responses
                if (lowerQuestion.includes('pronounce') || lowerQuestion.includes('pronunciation') || lowerQuestion.includes('say')) {
                    return `The word "${arabic}" is pronounced [pronunciation guide]. You can practice by repeating it several times.`;
                } else if (lowerQuestion.includes('mean') || lowerQuestion.includes('translation') || lowerQuestion.includes('definition')) {
                    return `The word "${arabic}" means "${meaning}" in English. It's used in contexts related to [context information].`;
                } else if (lowerQuestion.includes('example') || lowerQuestion.includes('sentence') || lowerQuestion.includes('usage')) {
                    return `Here's an example of how "${arabic}" is used in a sentence: [example sentence with the word]. This demonstrates how it's typically used in the Quran.`;
                } else if (lowerQuestion.includes('root') || lowerQuestion.includes('origin') || lowerQuestion.includes('etymology')) {
                    return `The word "${arabic}" comes from the root [root letters]. Many related words in Arabic are derived from this same root.`;
                } else if (lowerQuestion.includes('similar') || lowerQuestion.includes('synonym') || lowerQuestion.includes('related')) {
                    return `Some words similar to "${arabic}" include [similar words]. They have related but slightly different meanings.`;
                } else {
                    return `That's an interesting question about "${arabic}". This word appears in several places in the Quran and has significance in Islamic teachings. Would you like to know about its pronunciation, meaning, or usage?`;
                }
            } else {
                // Malay responses
                if (lowerQuestion.includes('sebut') || lowerQuestion.includes('bunyi') || lowerQuestion.includes('ucap')) {
                    return `Perkataan "${arabic}" disebut [panduan sebutan]. Anda boleh berlatih dengan mengulanginya beberapa kali.`;
                } else if (lowerQuestion.includes('makna') || lowerQuestion.includes('maksud') || lowerQuestion.includes('terjemahan')) {
                    return `Perkataan "${arabic}" bermaksud "${meaning}" dalam Bahasa Melayu. Ia digunakan dalam konteks berkaitan dengan [maklumat konteks].`;
                } else if (lowerQuestion.includes('contoh') || lowerQuestion.includes('ayat') || lowerQuestion.includes('penggunaan')) {
                    return `Berikut adalah contoh bagaimana "${arabic}" digunakan dalam ayat: [contoh ayat dengan perkataan]. Ini menunjukkan bagaimana ia biasanya digunakan dalam Al-Quran.`;
                } else if (lowerQuestion.includes('asal') || lowerQuestion.includes('akar') || lowerQuestion.includes('etimologi')) {
                    return `Perkataan "${arabic}" berasal dari akar kata [huruf akar]. Banyak perkataan berkaitan dalam bahasa Arab berasal dari akar kata yang sama.`;
                } else if (lowerQuestion.includes('sama') || lowerQuestion.includes('sinonim') || lowerQuestion.includes('berkaitan')) {
                    return `Beberapa perkataan yang serupa dengan "${arabic}" termasuk [perkataan serupa]. Mereka mempunyai makna yang berkaitan tetapi sedikit berbeza.`;
                } else {
                    return `Itu soalan yang menarik tentang "${arabic}". Perkataan ini muncul di beberapa tempat dalam Al-Quran dan mempunyai kepentingan dalam ajaran Islam. Adakah anda ingin tahu tentang sebutan, makna, atau penggunaannya?`;
                }
            }
        },

        startQuiz() {
            this.switchMode('quiz');
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
