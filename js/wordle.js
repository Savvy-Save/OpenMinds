let wordleTimerDisplayElement; // Declare at module scope

document.addEventListener('DOMContentLoaded', () => {
    const wordleContainer = document.getElementById('daily-wordle-challenge');
    wordleTimerDisplayElement = document.getElementById('wordle-timer-display'); // Assign in DOMContentLoaded

    if (!wordleContainer) {
        console.error("Wordle container element not found!");
        return;
    }
    
    // Set a max-width to constrain the Wordle UI and make it smaller
    wordleContainer.style.maxWidth = '450px';
    wordleContainer.style.margin = '0 auto';
    wordleContainer.style.fontSize = '14px'; // Base font size reduction

    // The wordList is now expected to be globally available from words.js
    // If words.js is not loaded before this script, window.wordList might be undefined.
    // Ensure words.js is included in the HTML before wordle.js
    // const commonWordList = window.wordList || []; // Fallback to empty if not loaded

    const wordsToGuessCount = 3;
    const maxAttempts = 6;
    let currentWords = [];
    let currentWordDetails = []; // To store fetched details { meaning, examples }
    let currentAttempts = []; // Array to store attempts for each word, derived from progress
    let activeWordIndex = 0; // Which of the 3 words is currently being guessed, derived from progress

    // --- localStorage Keys ---
    let dailyWordStorageKey; // For words and details
    let dailyProgressKey;    // For game state (guesses, statuses)
    const recentWordsLogKey = 'wordleRecentWordsLog'; // For tracking recently used words

    // --- Game State Variables ---
    // This will hold the live game progress and be saved to localStorage
    let gameProgress = {
        date: "",
        attemptsMade: [], // [wordIdx][attemptIdx] = { guessString: "HELLO", tileStates: ["correct", "present", ...] }
        wordStatus: [],   // [wordIdx] = { solved: false, failed: false, attempts: 0 }
        activeWordIndex: 0,
        allChallengesCompleted: false
    };

    async function fetchWordDetails(word) {
        try {
            const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
            if (!response.ok) {
                console.error(`Error fetching details for ${word}: ${response.status}`);
                if (response.status === 404) {
                    return { meaning: "Definition not found for this word.", examples: [] };
                }
                return { meaning: "Not found.", examples: [] };
            }
            const data = await response.json();
            if (data && data.length > 0) {
                const entry = data[0];
                let meaning = "No definition found.";
                let examples = [];
                
                if (entry.meanings && entry.meanings.length > 0 && entry.meanings[0].definitions && entry.meanings[0].definitions.length > 0) {
                    meaning = entry.meanings[0].definitions[0].definition;
                    if (entry.meanings[0].definitions[0].example) {
                        examples.push(entry.meanings[0].definitions[0].example);
                    }
                }
                // Collect more examples if available from other definitions/meanings
                entry.meanings.forEach(m => {
                    m.definitions.forEach(d => {
                        if (d.example && examples.length < 2 && !examples.includes(d.example)) {
                            examples.push(d.example);
                        }
                    });
                });

                return {
                    meaning: meaning,
                    examples: examples
                };
            }
            return { meaning: "Details not found.", examples: [] };
        } catch (error) {
            console.error(`Error fetching details for ${word}:`, error);
            return { meaning: "Error fetching details.", examples: [] };
        }
    }

    // --- Helper functions for managing recently used words ---
    function getRecentWords() {
        const storedRecent = localStorage.getItem(recentWordsLogKey);
        let recentEntries = [];
        if (storedRecent) {
            try {
                recentEntries = JSON.parse(storedRecent);
            } catch (e) {
                console.error("Error parsing recent words log:", e);
                localStorage.removeItem(recentWordsLogKey); // Clear corrupted data
                return [];
            }
        }

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        sevenDaysAgo.setHours(0, 0, 0, 0); // Start of 7 days ago

        const validRecentEntries = recentEntries.filter(entry => {
            const entryDate = new Date(entry.dateUsed);
            return entryDate >= sevenDaysAgo;
        });

        if (validRecentEntries.length < recentEntries.length) {
            // If some entries were filtered out, update localStorage with the cleaned list
            try {
                localStorage.setItem(recentWordsLogKey, JSON.stringify(validRecentEntries));
            } catch (e) {
                console.error("Failed to save cleaned recent words log:", e);
            }
        }
        return validRecentEntries; // Returns array of { word: "...", dateUsed: "YYYY-MM-DD" }
    }

    function addWordsToRecentLog(wordsToAdd, dateString) {
        if (!wordsToAdd || wordsToAdd.length === 0) return;

        let recentEntries = getRecentWords(); // This already filters old ones
        const newEntries = wordsToAdd.map(word => ({ word: word, dateUsed: dateString }));
        
        // Add new entries, could add a check to prevent duplicates for the same day if necessary,
        // but given daily selection, it's less critical.
        recentEntries.push(...newEntries);

        // Optional: Deduplicate if somehow the same word is added multiple times (shouldn't happen with current logic)
        // This is a more robust deduplication based on word and date.
        const uniqueRecentEntries = recentEntries.reduce((acc, current) => {
            const x = acc.find(item => item.word === current.word && item.dateUsed === current.dateUsed);
            if (!x) {
                return acc.concat([current]);
            } else {
                return acc;
            }
        }, []);

        try {
            localStorage.setItem(recentWordsLogKey, JSON.stringify(uniqueRecentEntries));
            // console.log("Updated recent words log:", uniqueRecentEntries);
        } catch (e) {
            console.error("Failed to save updated recent words log:", e);
        }
    }
    // --- End of helper functions for recently used words ---


    // Selects words deterministically based on the date, avoiding recent words
    function selectDailyWordsFromList(dateString) {
        const today = new Date(dateString);
        const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
        
        if (!window.wordList || window.wordList.length === 0) {
            console.error("Main word list (window.wordList) is not available or empty.");
            wordleContainer.innerHTML = '<p style="color: red; text-align: center; margin-top: 50px;">Error: Word list could not be loaded.</p>';
            return [];
        }

        const recentWordEntries = getRecentWords();
        const recentlyUsedWordStrings = recentWordEntries.map(entry => entry.word);

        let availableWords = window.wordList.filter(w => !recentlyUsedWordStrings.includes(w) && w.length === 5);

        function shuffleArray(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
        }

        shuffleArray(availableWords);

        if (availableWords.length < wordsToGuessCount) {
            console.warn(`Not enough unique 5-letter words available that haven't been used in the last 7 days. Available: ${availableWords.length}. Needed: ${wordsToGuessCount}. Allowing repeats for today.`);
            availableWords = window.wordList.filter(w => w.length === 5); // Fallback to the full 5-letter list, allowing repeats
        }

        if (availableWords.length === 0) { // Should not happen if window.wordList is populated
            console.error("Fallback word list is also empty. Cannot select words.");
            wordleContainer.innerHTML = '<p style="color: red; text-align: center; margin-top: 50px;">Error: No words available for selection.</p>';
            return [];
        }


        const selectedWords = [];
        for (let i = 0; i < wordsToGuessCount; i++) {
            let wordIndex;
            do {
                wordIndex = Math.floor(Math.random() * availableWords.length);
            } while (selectedWords.includes(availableWords[wordIndex])); // Ensure uniqueness
            selectedWords.push(availableWords[wordIndex]);
        }
        
        console.log(`Selected words for ${dateString} (considering recent usage):`, selectedWords);
        return selectedWords;
    }

    // Function to save the current game progress to localStorage
    async function saveCurrentProgress() {
        if (!dailyProgressKey) {
            console.error("Progress key not set. Cannot save progress.");
            return;
        }
        try {
            // Ensure gameProgress.date is current
            const today = new Date();
            gameProgress.date = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
            gameProgress.activeWordIndex = activeWordIndex; // Ensure this is up-to-date

            // Update wordStatus based on currentAttempts and messages
            for (let i = 0; i < wordsToGuessCount; i++) {
                if (!gameProgress.wordStatus[i]) { // Initialize if not present
                     gameProgress.wordStatus[i] = { solved: false, failed: false, attempts: 0 };
                }
                gameProgress.wordStatus[i].attempts = currentAttempts[i];
                const messageArea = document.getElementById(`wordle-message-${i}`);
                if (messageArea) {
                    if (messageArea.textContent.includes('Correct!')) {
                        gameProgress.wordStatus[i].solved = true;
                        gameProgress.wordStatus[i].failed = false;
                    } else if (messageArea.textContent.includes('Out of attempts!')) {
                        gameProgress.wordStatus[i].failed = true;
                        gameProgress.wordStatus[i].solved = false;
                    }
                }
            }
            
            // Check if all challenges are completed
            gameProgress.allChallengesCompleted = gameProgress.wordStatus.every(status => status.solved || status.failed) && gameProgress.wordStatus.length === wordsToGuessCount;

            localStorage.setItem(dailyProgressKey, JSON.stringify(gameProgress));
            // console.log("Game progress saved:", gameProgress);
        } catch (e) {
            console.error("Failed to save game progress to localStorage:", e);
        }
    }


    async function initializeGame() {
        const today = new Date();
        const todayDateString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        dailyWordStorageKey = `dailyWordleData_${todayDateString}`; // For words and details
        dailyProgressKey = `wordleProgress_${todayDateString}`;   // For game state
        let dailyData; // For words/details

        // --- One-time localStorage cleanup for old keys (optional, but good for transition) ---
        // This helps ensure old data from different word generation methods is cleared.
        if (!localStorage.getItem('wordleStorageCleaned_v2')) { // Updated cleaner version
            console.log("Performing one-time cleanup of old Wordle localStorage keys...");
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith("dailyWordleData_") && key !== dailyWordStorageKey) {
                    console.log(`Removing old/stale word data key: ${key}`);
                    localStorage.removeItem(key);
                }
                // Add cleanup for potentially old progress keys if their naming pattern was different
                // For now, assuming `wordleProgress_` is new, so less likely to have old conflicting keys.
            });
            localStorage.setItem('wordleStorageCleaned_v2', 'true');
        }
        // --- End of one-time cleanup ---

        // 1. Load or Initialize Word Data (dailyData)
        try {
            const storedDataString = localStorage.getItem(dailyWordStorageKey);
            if (storedDataString) {
                const storedData = JSON.parse(storedDataString);
                if (storedData.date === todayDateString &&
                    Array.isArray(storedData.words) && storedData.words.length === wordsToGuessCount &&
                    Array.isArray(storedData.details) && storedData.details.length === wordsToGuessCount &&
                    storedData.words.every(word => typeof word === 'string' && window.wordList && window.wordList.includes(word))) { // Check against window.wordList
                    dailyData = storedData;
                    console.log("Loaded valid words from localStorage for today:", dailyData.words);
                } else {
                    console.log("Stored word data is invalid or for a previous date. Clearing and fetching new words.");
                    localStorage.removeItem(dailyWordStorageKey);
                }
            }
        } catch (e) {
            console.error("Error reading or parsing word data from localStorage:", e);
            localStorage.removeItem(dailyWordStorageKey);
        }

        if (!dailyData) {
            console.log(`No valid stored word data for ${todayDateString}. Selecting words and fetching details.`);
            const selectedWords = selectDailyWordsFromList(todayDateString);
            const detailPromises = selectedWords.map(word => fetchWordDetails(word));
            const fetchedDetails = await Promise.all(detailPromises);

            dailyData = {
                date: todayDateString,
                words: selectedWords,
                details: fetchedDetails
            };
            try {
                localStorage.setItem(dailyWordStorageKey, JSON.stringify(dailyData));
                console.log("New daily words and details stored in localStorage.");
            } catch (e) {
                console.error("Failed to store daily words/details in localStorage:", e);
            }
        }

        currentWords = dailyData.words;
        currentWordDetails = dailyData.details;

        if (!currentWords || currentWords.length === 0 || currentWords.length !== wordsToGuessCount || 
            !currentWordDetails || currentWordDetails.length !== wordsToGuessCount) {
            console.error("Critical error: Word data is invalid or empty after selection. Game cannot start.");
            // Avoid overwriting a potential "word list not loaded" message from selectDailyWordsFromList
            if (!wordleContainer.innerHTML.includes('Error: Word list could not be loaded')) {
                 wordleContainer.innerHTML = '<p style="color: red; text-align: center; margin-top: 50px;">Could not load word data for the game. Please try refreshing.</p>';
            }
            return;
        }
        
        // After successfully setting currentWords for the day (either loaded or newly selected)
        // add them to the recent words log.
        addWordsToRecentLog(currentWords, todayDateString);


        // 2. Load or Initialize Game Progress (gameProgress)
        let loadedProgress = false;
        try {
            const storedProgressString = localStorage.getItem(dailyProgressKey);
            if (storedProgressString) {
                const parsedProgress = JSON.parse(storedProgressString);
                if (parsedProgress.date === todayDateString &&
                    Array.isArray(parsedProgress.attemptsMade) && parsedProgress.attemptsMade.length === wordsToGuessCount &&
                    Array.isArray(parsedProgress.wordStatus) && parsedProgress.wordStatus.length === wordsToGuessCount) {
                    gameProgress = parsedProgress;
                    activeWordIndex = gameProgress.activeWordIndex;
                    currentAttempts = gameProgress.wordStatus.map(status => status.attempts);
                    loadedProgress = true;
                    console.log("Loaded game progress from localStorage:", gameProgress);
                } else {
                    console.log("Stored progress data is invalid or for a previous date. Initializing new progress.");
                    localStorage.removeItem(dailyProgressKey); // Clear invalid/old progress
                }
            }
        } catch (e) {
            console.error("Error reading or parsing progress data from localStorage:", e);
            localStorage.removeItem(dailyProgressKey); // Clear potentially corrupted data
        }

        if (!loadedProgress) {
            // Initialize fresh progress for the day
            gameProgress.date = todayDateString;
            gameProgress.attemptsMade = Array(wordsToGuessCount).fill(null).map(() => []);
            gameProgress.wordStatus = Array(wordsToGuessCount).fill(null).map(() => ({ solved: false, failed: false, attempts: 0 }));
            gameProgress.activeWordIndex = 0;
            gameProgress.allChallengesCompleted = false;
            activeWordIndex = 0;
            currentAttempts = Array(wordsToGuessCount).fill(0);
            // Save this initial fresh progress
            await saveCurrentProgress(); 
            console.log("Initialized and saved new game progress.");
        }
        
        // 3. Build UI based on loaded/initialized words and progress
        wordleContainer.innerHTML = '';
        currentWords.forEach((word, index) => {
            const wordSection = document.createElement('div');
            wordSection.classList.add('wordle-word-section');
            wordSection.id = `wordle-word-${index}`;
            // Visibility will be handled later based on activeWordIndex and completion status
            // if (index > 0) wordSection.style.display = 'none'; 

            const title = document.createElement('h3');
            title.textContent = `Word ${index + 1} of ${wordsToGuessCount}`;
            wordSection.appendChild(title);

            const grid = document.createElement('div');
            grid.classList.add('wordle-grid');
            grid.id = `wordle-grid-${index}`;
            for (let i = 0; i < maxAttempts; i++) {
                for (let j = 0; j < word.length; j++) {
                    const tile = document.createElement('div');
                    tile.classList.add('wordle-tile');
                    tile.id = `word-${index}-tile-${i}-${j}`;
                    grid.appendChild(tile);
                }
            }
            wordSection.appendChild(grid);

            const inputArea = document.createElement('div');
            inputArea.classList.add('wordle-input-area');
            const inputField = document.createElement('input');
            inputField.type = 'text';
            inputField.maxLength = word.length;
            inputField.id = `wordle-input-${index}`;
            inputField.placeholder = `Enter ${word.length}-letter guess`;
            const submitButton = document.createElement('button');
            submitButton.textContent = 'Guess';
            submitButton.id = `wordle-submit-${index}`;
            
            inputArea.appendChild(inputField);
            inputArea.appendChild(submitButton);
            wordSection.appendChild(inputArea);

            const messageArea = document.createElement('p');
            messageArea.id = `wordle-message-${index}`;
            messageArea.classList.add('wordle-message');
            wordSection.appendChild(messageArea);

            const detailsDiv = document.createElement('div');
            detailsDiv.classList.add('word-details');
            detailsDiv.id = `word-details-${index}`;
            detailsDiv.style.display = 'none';
            detailsDiv.innerHTML = `
                <h4>Details for <span class="word-highlight">${word.toUpperCase()}</span>:</h4>
                <p><strong>Meaning:</strong> <span id="word-meaning-${index}">Loading...</span></p>
                <p><strong>Examples:</strong></p>
                <ul id="word-examples-${index}"><li>Loading...</li></ul>
            `;
            wordSection.appendChild(detailsDiv);
            wordleContainer.appendChild(wordSection);

            // Restore saved state for this word
            const wordState = gameProgress.wordStatus[index];
            const savedAttemptsForWord = gameProgress.attemptsMade[index];

            if (savedAttemptsForWord) {
                savedAttemptsForWord.forEach((attemptEntry, attemptIdx) => {
                    updateGrid(index, attemptIdx, attemptEntry.guessString, currentWords[index], attemptEntry.tileStates);
                });
            }

            if (wordState.solved) {
                messageArea.textContent = 'Correct!';
                inputField.disabled = true;
                submitButton.disabled = true;
                displayWordDetails(index);
                addNavigationButtons(index); // Add nav buttons if word is complete
            } else if (wordState.failed) {
                messageArea.textContent = `Out of attempts! The word was: ${currentWords[index].toUpperCase()}`;
                inputField.disabled = true;
                submitButton.disabled = true;
                displayWordDetails(index);
                addNavigationButtons(index); // Add nav buttons if word is complete
            } else {
                 // Word is in progress or not started
                submitButton.addEventListener('click', () => handleGuess(index));
                inputField.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') handleGuess(index);
                });
            }
        });
        
        // 4. Handle overall game state (all completed or active play)
        if (gameProgress.allChallengesCompleted) {
            displayCompletionMessage(); // This will create and append the completion section
            // Hide all individual word sections and show only the completion summary
            for (let i = 0; i < wordsToGuessCount; i++) {
                const section = document.getElementById(`wordle-word-${i}`);
                if (section) section.style.display = 'none';
            }
            const completionSect = document.getElementById('wordle-completion-section');
            if (completionSect) completionSect.style.display = 'block';
        } else {
            // Set the active word section to be visible and others hidden
            for (let i = 0; i < wordsToGuessCount; i++) {
                const section = document.getElementById(`wordle-word-${i}`);
                if (section) {
                    section.style.display = (i === activeWordIndex) ? 'block' : 'none';
                }
            }
            setActiveInput(); // Focus on the current active input
        }
    }

    function displayWordDetails(wordIndex) {
        const details = currentWordDetails[wordIndex];
        if (!details) return;

        const meaningEl = document.getElementById(`word-meaning-${wordIndex}`);
        const examplesListEl = document.getElementById(`word-examples-${wordIndex}`);
        const detailsDiv = document.getElementById(`word-details-${wordIndex}`);

        if (meaningEl) meaningEl.textContent = details.meaning;
        if (examplesListEl) {
            examplesListEl.innerHTML = ''; 
            if (details.examples && details.examples.length > 0) {
                details.examples.forEach(ex => {
                    const li = document.createElement('li');
                    li.textContent = ex;
                    examplesListEl.appendChild(li);
                });
            } else {
                const li = document.createElement('li');
                li.textContent = "Examples not provided by the dictionary source.";
                examplesListEl.appendChild(li);
            }
        }
        if (detailsDiv) detailsDiv.style.display = 'block';
    }

    function setActiveInput() {
        document.querySelectorAll('.wordle-input-area input').forEach(input => input.disabled = true);
        document.querySelectorAll('.wordle-input-area button').forEach(button => button.disabled = true);

        const activeInput = document.getElementById(`wordle-input-${activeWordIndex}`);
        const activeButton = document.getElementById(`wordle-submit-${activeWordIndex}`);
        if (activeInput && activeButton) {
            activeInput.disabled = false;
            activeButton.disabled = false;
            activeInput.focus();
        }
    }

    function handleGuess(wordIndex) {
        if (wordIndex !== activeWordIndex) return; 

        const inputField = document.getElementById(`wordle-input-${wordIndex}`);
        const messageArea = document.getElementById(`wordle-message-${wordIndex}`);
        const guess = inputField.value.toLowerCase().trim();
        const targetWord = currentWords[wordIndex];
        
        // currentAttempt is now derived from gameProgress.wordStatus[wordIndex].attempts
        // or currentAttempts[wordIndex] which should be in sync
        const currentAttemptNumber = currentAttempts[wordIndex];

        messageArea.textContent = '';

        if (guess.length !== targetWord.length) {
            messageArea.textContent = `Guess must be ${targetWord.length} letters long.`;
            return;
        }

        if (currentAttemptNumber >= maxAttempts) { // Changed currentAttempt to currentAttemptNumber
            messageArea.textContent = 'No more attempts left for this word.';
            return;
        }

        // updateGrid will now return the tileStates if not precomputed
        const tileStates = updateGrid(wordIndex, currentAttemptNumber, guess, targetWord);
        
        // Store this attempt in gameProgress
        if (!gameProgress.attemptsMade[wordIndex]) gameProgress.attemptsMade[wordIndex] = [];
        gameProgress.attemptsMade[wordIndex].push({ guessString: guess, tileStates: tileStates });
        
        currentAttempts[wordIndex]++; // Increment local counter
        gameProgress.wordStatus[wordIndex].attempts = currentAttempts[wordIndex];


        if (guess === targetWord) {
            messageArea.textContent = 'Correct!';
            inputField.disabled = true;
            document.getElementById(`wordle-submit-${wordIndex}`).disabled = true;
            gameProgress.wordStatus[wordIndex].solved = true;
            displayWordDetails(wordIndex);
            saveCurrentProgress().then(() => moveToNextWord()); // Save before moving
        } else {
            if (currentAttempts[wordIndex] >= maxAttempts) {
                messageArea.textContent = `Out of attempts! The word was: ${targetWord.toUpperCase()}`;
                inputField.disabled = true;
                document.getElementById(`wordle-submit-${wordIndex}`).disabled = true;
                gameProgress.wordStatus[wordIndex].failed = true;
                displayWordDetails(wordIndex);
                saveCurrentProgress().then(() => moveToNextWord()); // Save before moving
            } else {
                inputField.value = '';
                inputField.focus();
                saveCurrentProgress(); // Save after each attempt
            }
        }
    }

    function updateGrid(wordIndex, attemptIndex, guess, targetWord, precomputedTileStates = null) {
        let tileStatesToApply = precomputedTileStates;

        if (!tileStatesToApply) {
            const targetLetterCounts = {};
            for (const letter of targetWord) {
                targetLetterCounts[letter] = (targetLetterCounts[letter] || 0) + 1;
            }
            tileStatesToApply = Array(targetWord.length).fill('absent');

            // First pass for 'correct' letters
            for (let i = 0; i < targetWord.length; i++) {
                if (guess[i] === targetWord[i]) {
                    tileStatesToApply[i] = 'correct';
                    targetLetterCounts[guess[i]]--;
                }
            }
            // Second pass for 'present' letters
            for (let i = 0; i < targetWord.length; i++) {
                if (tileStatesToApply[i] === 'correct') continue;
                if (targetWord.includes(guess[i]) && targetLetterCounts[guess[i]] > 0) {
                    tileStatesToApply[i] = 'present';
                    targetLetterCounts[guess[i]]--;
                }
            }
        }

        // Apply states to tiles and reveal animation
        for (let i = 0; i < targetWord.length; i++) {
            const tile = document.getElementById(`word-${wordIndex}-tile-${attemptIndex}-${i}`);
            if (tile) {
                tile.textContent = guess[i];
                tile.classList.remove('correct', 'present', 'absent', 'reveal'); // Clear previous states for re-render
                void tile.offsetWidth; // Trigger reflow for animation restart
                tile.classList.add(tileStatesToApply[i]);
                tile.style.animationDelay = `${i * 100}ms`;
                tile.classList.add('reveal');
            }
        }
        return tileStatesToApply; // Return the states for saving
    }

    function addNavigationButtons(wordIndex) {
        const wordSection = document.getElementById(`wordle-word-${wordIndex}`);
        if (!wordSection) return;

        // Remove existing navigation to rebuild
        const existingNav = wordSection.querySelector('.wordle-navigation');
        if (existingNav) {
            existingNav.remove();
        }
        
        const messageArea = document.getElementById(`wordle-message-${wordIndex}`);
        const isWordFinished = (gameProgress.wordStatus[wordIndex] && (gameProgress.wordStatus[wordIndex].solved || gameProgress.wordStatus[wordIndex].failed)) || 
                               (messageArea && (messageArea.textContent.includes('Correct!') || messageArea.textContent.includes('Out of attempts!')));

        if (!isWordFinished && activeWordIndex !== wordIndex) { // Don't add nav buttons to words not yet completed, unless it's the active one being reviewed
             // Or, always add if finished, regardless of activeWordIndex for review purposes.
             // Let's stick to adding only if finished for now.
        }
        if (!isWordFinished) return; // Only add nav buttons to finished words or for active review.
                                     // This might need adjustment if we want to navigate to unfinished words.
                                     // For now, assuming navigation is primarily for *reviewing* completed words or *proceeding*.

        const navigationDiv = document.createElement('div');
        navigationDiv.classList.add('wordle-navigation');
        navigationDiv.style.marginTop = '20px';
        navigationDiv.style.display = 'flex';
        navigationDiv.style.justifyContent = 'space-between';
        
        // Common button styles
        const buttonStyle = {
            padding: '8px 12px',
            fontSize: '14px',
            fontWeight: '500',
            border: 'none',
            borderRadius: '25px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
            backgroundColor: '#f8f9fa',
            color: '#495057'
        };
        
        // Previous button (left side)
        const prevButton = document.createElement('button');
        prevButton.textContent = '← Previous Word';
        prevButton.classList.add('wordle-nav-button', 'prev-button');
        prevButton.disabled = wordIndex === 0; // Disable if it's the first word
        prevButton.addEventListener('click', () => navigateToWord(wordIndex - 1));
        
        // Apply styles to previous button
        Object.assign(prevButton.style, buttonStyle);
        if (prevButton.disabled) {
            prevButton.style.opacity = '0.5';
            prevButton.style.cursor = 'not-allowed';
        } else {
            prevButton.addEventListener('mouseover', () => {
                prevButton.style.backgroundColor = '#e9ecef';
                prevButton.style.transform = 'translateY(-2px)';
                prevButton.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
            });
            prevButton.addEventListener('mouseout', () => {
                prevButton.style.backgroundColor = '#f8f9fa';
                prevButton.style.transform = 'translateY(0)';
                prevButton.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';
            });
        }
        navigationDiv.appendChild(prevButton);
        
        // Next button OR View Summary button
        if (wordIndex === wordsToGuessCount - 1) { // It's the last word
            const summaryButton = document.createElement('button');
            summaryButton.textContent = 'View Challenge Summary';
            Object.assign(summaryButton.style, buttonStyle); // Base style
            summaryButton.style.backgroundColor = '#007bff'; // Different color for summary
            summaryButton.style.color = 'white';
            summaryButton.classList.add('wordle-summary-nav-button');

            summaryButton.addEventListener('click', () => {
                for (let i = 0; i < wordsToGuessCount; i++) {
                    const section = document.getElementById(`wordle-word-${i}`);
                    if (section) section.style.display = 'none';
                }
                const completionSect = document.getElementById('wordle-completion-section');
                if (completionSect) {
                    completionSect.style.display = 'block';
                } else {
                    displayCompletionMessage(); // Create and show if not existing
                    document.getElementById('wordle-completion-section').style.display = 'block';
                }
            });
            summaryButton.addEventListener('mouseover', () => {
                summaryButton.style.backgroundColor = '#0056b3';
                summaryButton.style.transform = 'translateY(-2px)';
            });
            summaryButton.addEventListener('mouseout', () => {
                summaryButton.style.backgroundColor = '#007bff';
                summaryButton.style.transform = 'translateY(0)';
            });
            navigationDiv.appendChild(summaryButton);
        } else { // Not the last word, add "Continue ->"
            const nextButton = document.createElement('button');
            nextButton.textContent = 'Continue →';
            nextButton.classList.add('wordle-nav-button', 'next-button');
            // nextButton.disabled = wordIndex === wordsToGuessCount - 1; // This condition is now handled above
            nextButton.addEventListener('click', () => navigateToWord(wordIndex + 1));
            
            Object.assign(nextButton.style, buttonStyle);
            nextButton.style.backgroundColor = '#4CAF50';
            nextButton.style.color = 'white';
            
            // Hover effects for nextButton
            nextButton.addEventListener('mouseover', () => {
                nextButton.style.backgroundColor = '#43a047';
                nextButton.style.transform = 'translateY(-2px)';
                nextButton.style.boxShadow = '0 4px 8px rgba(76,175,80,0.3)';
            });
            nextButton.addEventListener('mouseout', () => {
                nextButton.style.backgroundColor = '#4CAF50';
                nextButton.style.transform = 'translateY(0)';
                nextButton.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';
            });
            navigationDiv.appendChild(nextButton);
        }
        
        wordSection.appendChild(navigationDiv);
    }
    
    function navigateToWord(targetIndex) {
        if (targetIndex < 0 || targetIndex >= wordsToGuessCount) {
            // If trying to navigate beyond the last word, perhaps show summary?
            if (targetIndex === wordsToGuessCount && gameProgress.allChallengesCompleted) {
                for (let i = 0; i < wordsToGuessCount; i++) {
                    const section = document.getElementById(`wordle-word-${i}`);
                    if (section) section.style.display = 'none';
                }
                const completionSect = document.getElementById('wordle-completion-section');
                if (completionSect) completionSect.style.display = 'block';
                else { displayCompletionMessage(); document.getElementById('wordle-completion-section').style.display = 'block';}
            }
            return;
        }
        
        // Hide all word sections and the completion section
        for (let i = 0; i < wordsToGuessCount; i++) {
            const section = document.getElementById(`wordle-word-${i}`);
            if (section) section.style.display = 'none';
        }
        
        const completionSection = document.getElementById('wordle-completion-section');
        if (completionSection) completionSection.style.display = 'none';
        
        const targetSection = document.getElementById(`wordle-word-${targetIndex}`);
        if (targetSection) targetSection.style.display = 'block';
        
        // Only set active input if the target word is the current game's activeWordIndex
        // and that word is not yet completed.
        if (targetIndex === gameProgress.activeWordIndex && 
            gameProgress.wordStatus[targetIndex] && 
            !gameProgress.wordStatus[targetIndex].solved && 
            !gameProgress.wordStatus[targetIndex].failed) {
            setActiveInput();
        } else if (targetIndex === activeWordIndex && // Fallback for module-scope activeWordIndex if needed
                   gameProgress.wordStatus[targetIndex] &&
                   !gameProgress.wordStatus[targetIndex].solved && 
                   !gameProgress.wordStatus[targetIndex].failed) {
            setActiveInput();
        }
    }
    
    function moveToNextWord() {
        const completedWordIndex = activeWordIndex; // This is the word that was just finished
        const currentSection = document.getElementById(`wordle-word-${completedWordIndex}`);
        
        if(currentSection) { // Ensure section exists
            currentSection.classList.add('completed');
            currentSection.style.position = 'relative'; // Keep styling

            // Update its navigation buttons now that it's complete
            addNavigationButtons(completedWordIndex); 

            // Style its details div
            const detailsDiv = currentSection.querySelector('.word-details');
            if (detailsDiv) {
                detailsDiv.style.backgroundColor = 'white';
                detailsDiv.style.borderRadius = '8px';
                detailsDiv.style.padding = '15px';
                detailsDiv.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
                detailsDiv.style.margin = '15px 0';
            }
        }

        activeWordIndex++; 
        gameProgress.activeWordIndex = activeWordIndex;

        if (activeWordIndex < wordsToGuessCount) {
            // The next word will be shown when the user clicks "Continue"
            // which calls navigateToWord(completedWordIndex + 1).
            // navigateToWord will then call setActiveInput if appropriate.
        } else { 
            gameProgress.allChallengesCompleted = true; 
            displayCompletionMessage(); 
            // The last word's section (completedWordIndex) has its buttons updated by addNavigationButtons.
            // It should now have "View Summary".
            // Optionally, auto-navigate to summary:
            // navigateToWord(wordsToGuessCount); // This will trigger summary view via navigateToWord's new logic
        }
        saveCurrentProgress();
    }

function displayCompletionMessage() {
    // Check if completion section already exists to prevent duplicates
    if (document.getElementById('wordle-completion-section')) {
        // If it exists, ensure it's visible and other word sections are hidden
        for (let i = 0; i < wordsToGuessCount; i++) {
            const section = document.getElementById(`wordle-word-${i}`);
            if (section) section.style.display = 'none';
        }
        document.getElementById('wordle-completion-section').style.display = 'block';
        return;
    }

    let correctCount = 0;
    gameProgress.wordStatus.forEach(status => {
        if (status.solved) correctCount++;
    });
    const allGuessedCorrectly = correctCount === wordsToGuessCount;

    const completionSection = document.createElement('div');
    completionSection.classList.add('wordle-word-section'); // Re-use styling
        completionSection.id = 'wordle-completion-section';
        completionSection.style.display = 'none'; // Initially hidden
        completionSection.style.backgroundColor = '#f8f9fa';
        completionSection.style.borderRadius = '12px';
        completionSection.style.padding = '18px';
        completionSection.style.boxShadow = '0 5px 15px rgba(0,0,0,0.1)';
        completionSection.style.maxWidth = '450px';
        completionSection.style.margin = '0 auto';
        
        // Create a decorative header with a trophy icon
        const completionHeader = document.createElement('div');
        completionHeader.style.textAlign = 'center';
        completionHeader.style.marginBottom = '20px';
        
        // Add a trophy emoji or icon
        const trophyIcon = document.createElement('div');
        trophyIcon.innerHTML = '🏆';
        trophyIcon.style.fontSize = '36px';
        trophyIcon.style.marginBottom = '8px';
        completionHeader.appendChild(trophyIcon);
        
        const headerText = document.createElement('h3');
        headerText.textContent = 'Daily Challenge Complete';
        headerText.style.fontSize = '20px';
        headerText.style.color = '#2c3e50';
        headerText.style.margin = '0';
        completionHeader.appendChild(headerText);
        
        completionSection.appendChild(completionHeader);
        
        // Add a decorative line
        const divider = document.createElement('div');
        divider.style.height = '2px';
        divider.style.background = 'linear-gradient(to right, transparent, #4CAF50, transparent)';
        divider.style.margin = '20px 0';
        completionSection.appendChild(divider);
        
        // Create the completion message with more styling
        const completionDiv = document.createElement('div');
        completionDiv.id = 'wordle-completion-message';
        completionDiv.style.textAlign = 'center';
        completionDiv.style.fontWeight = 'bold';
        completionDiv.style.fontSize = '18px';
        completionDiv.style.color = '#2c3e50';
        completionDiv.style.padding = '15px';
        completionDiv.style.borderRadius = '8px';
        completionDiv.style.backgroundColor = allGuessedCorrectly ? 'rgba(76,175,80,0.1)' : 'rgba(33,150,243,0.1)';
        
        if (allGuessedCorrectly) {
            completionDiv.innerHTML = '🎉 <span style="color:#4CAF50">Congratulations!</span> You guessed all words! 🎉';
        } else {
            completionDiv.innerHTML = `<span style="color:#2196F3">Well done!</span> You correctly guessed ${correctCount} out of ${wordsToGuessCount} words.<br>Come back tomorrow for new words!`;
        }
        
        completionSection.appendChild(completionDiv);
        
        // Add a summary of the words with better styling
        const wordSummary = document.createElement('div');
        wordSummary.classList.add('word-summary');
        wordSummary.style.marginTop = '25px';
        wordSummary.style.backgroundColor = 'white';
        wordSummary.style.borderRadius = '8px';
        wordSummary.style.padding = '15px';
        wordSummary.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
        
        const summaryTitle = document.createElement('p');
        summaryTitle.innerHTML = '<strong>Today\'s words were:</strong>';
        summaryTitle.style.fontSize = '16px';
        summaryTitle.style.color = '#2c3e50';
        summaryTitle.style.marginBottom = '15px';
        wordSummary.appendChild(summaryTitle);
        
        const wordList = document.createElement('ul');
        wordList.style.listStyleType = 'none';
        wordList.style.padding = '0';
        
        currentWords.forEach((word, index) => {
            const wordItem = document.createElement('li');
            wordItem.style.padding = '8px';
            wordItem.style.marginBottom = '10px';
            wordItem.style.borderRadius = '6px';
            wordItem.style.backgroundColor = '#f8f9fa';
            wordItem.style.display = 'flex';
            wordItem.style.justifyContent = 'space-between';
            wordItem.style.alignItems = 'center';
            wordItem.style.flexWrap = 'wrap';
            
            // Create word container
            const wordContainer = document.createElement('div');
            wordContainer.style.flex = '1';
            
            // Word with badge
            const wordBadge = document.createElement('span');
            wordBadge.textContent = word.toUpperCase();
            wordBadge.style.fontWeight = 'bold';
            wordBadge.style.backgroundColor = '#4CAF50';
            wordBadge.style.color = 'white';
            wordBadge.style.padding = '3px 8px';
            wordBadge.style.borderRadius = '4px';
            wordBadge.style.marginRight = '8px';
            wordBadge.style.display = 'inline-block';
            
            // Meaning
            const meaningSpan = document.createElement('span');
            meaningSpan.textContent = currentWordDetails[index].meaning;
            meaningSpan.style.color = '#495057';
            meaningSpan.style.fontSize = '14px';
            
            wordContainer.appendChild(wordBadge);
            wordContainer.appendChild(meaningSpan);
            wordItem.appendChild(wordContainer);
            
            // Add a button to view this specific word again
            const viewWordButton = document.createElement('button');
            viewWordButton.textContent = 'View Word Details';
            viewWordButton.style.marginLeft = '10px';
            viewWordButton.style.marginTop = '8px';
            viewWordButton.style.padding = '8px 12px';
            viewWordButton.style.fontSize = '13px';
            viewWordButton.style.fontWeight = '500';
            viewWordButton.style.backgroundColor = '#4CAF50';
            viewWordButton.style.color = 'white';
            viewWordButton.style.border = 'none';
            viewWordButton.style.borderRadius = '20px';
            viewWordButton.style.cursor = 'pointer';
            viewWordButton.style.transition = 'all 0.2s ease';
            viewWordButton.style.boxShadow = '0 2px 5px rgba(76,175,80,0.3)';
            
            viewWordButton.addEventListener('mouseover', () => {
                viewWordButton.style.backgroundColor = '#43a047';
                viewWordButton.style.transform = 'translateY(-2px)';
                viewWordButton.style.boxShadow = '0 4px 8px rgba(76,175,80,0.4)';
            });
            
            viewWordButton.addEventListener('mouseout', () => {
                viewWordButton.style.backgroundColor = '#4CAF50';
                viewWordButton.style.transform = 'translateY(0)';
                viewWordButton.style.boxShadow = '0 2px 5px rgba(76,175,80,0.3)';
            });
            viewWordButton.addEventListener('click', () => navigateToWord(index));
            
            wordItem.appendChild(viewWordButton);
            wordList.appendChild(wordItem);
        });
        
        wordSummary.appendChild(wordList);
        completionSection.appendChild(wordSummary);
        
        // Add navigation buttons to return to individual words
        const navigationDiv = document.createElement('div');
        navigationDiv.classList.add('wordle-navigation');
        navigationDiv.style.marginTop = '20px';
        
        // Add another decorative line
        const divider2 = document.createElement('div');
        divider2.style.height = '2px';
        divider2.style.background = 'linear-gradient(to right, transparent, #4CAF50, transparent)';
        divider2.style.margin = '25px 0';
        completionSection.appendChild(divider2);
        
        // Back to last word button with enhanced styling
        const backButton = document.createElement('button');
        backButton.textContent = '← Back to Words';
        backButton.style.padding = '8px 16px';
        backButton.style.fontSize = '14px';
        backButton.style.fontWeight = '600';
        backButton.style.backgroundColor = '#4CAF50';
        backButton.style.color = 'white';
        backButton.style.border = 'none';
        backButton.style.borderRadius = '25px';
        backButton.style.cursor = 'pointer';
        backButton.style.transition = 'all 0.2s ease';
        backButton.style.boxShadow = '0 4px 8px rgba(76,175,80,0.3)';
        backButton.style.display = 'block';
        backButton.style.margin = '0 auto';
        
        backButton.addEventListener('click', () => navigateToWord(wordsToGuessCount - 1));
        backButton.addEventListener('mouseover', () => {
            backButton.style.backgroundColor = '#43a047';
            backButton.style.transform = 'translateY(-2px)';
            backButton.style.boxShadow = '0 6px 12px rgba(76,175,80,0.4)';
        });
        
        backButton.addEventListener('mouseout', () => {
            backButton.style.backgroundColor = '#4CAF50';
            backButton.style.transform = 'translateY(0)';
            backButton.style.boxShadow = '0 4px 8px rgba(76,175,80,0.3)';
        });
        
        navigationDiv.appendChild(backButton);
        
        completionSection.appendChild(navigationDiv);
        
        wordleContainer.appendChild(completionSection);
    }

    function resetGameData() {
        localStorage.removeItem(dailyWordStorageKey);
        localStorage.removeItem(dailyProgressKey);
        localStorage.removeItem(recentWordsLogKey);
        console.log("Wordle game data reset.");
    }

    initializeGame();
    if (!gameProgress.allChallengesCompleted) {
        resetGameData();
    }
    startWordleCountdown();
});

function startWordleCountdown() {
    if (!wordleTimerDisplayElement) {
        console.error("Wordle timer display element not found!");
        return;
    }

    let countdownInterval;

    function updateTimerDisplay() {
        const now = new Date();
        const nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
        const timeLeft = nextMidnight - now;

        if (timeLeft <= 0) {
            wordleTimerDisplayElement.textContent = "New words available! Please refresh.";
            if (countdownInterval) {
                clearInterval(countdownInterval);
            }
            return;
        }

        const hours = Math.floor((timeLeft / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((timeLeft / 1000 / 60) % 60);
        const seconds = Math.floor((timeLeft / 1000) % 60);

        wordleTimerDisplayElement.textContent = 
            `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    updateTimerDisplay();
    countdownInterval = setInterval(updateTimerDisplay, 1000);
}
