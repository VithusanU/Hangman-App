globalThis.currentWord = '';
globalThis.guessedLetters = [];

// Fetch a random word
async function getRandomWord() {
    try {
        const response = await fetch('https://random-word-api.herokuapp.com/word?number=1');
        const data = await response.json();
        const word = data[0];
        console.log('Random Word:', word);
        return word.toLowerCase();
    } catch (error) {
        console.error('Failed to get word:', error);
        return 'fallback';
    }
}

// Initialize the game board with underscores
function initializeGameWithWord(word) {
    currentWord = word;
    guessedLetters = [];

    if (typeof document !== 'undefined') {
        const wordDisplay = document.getElementById('chosen-word');
        if (wordDisplay) {
            wordDisplay.innerHTML = '';

            for (let letter of currentWord) {
                const letterSpan = document.createElement('span');
                letterSpan.textContent = '_';
                letterSpan.classList.add('letter');
                wordDisplay.appendChild(letterSpan);
            }
        }
    }

    console.log("Game Initialized with word:", word);

    // Sync globals (so tests can see updates)
    globalThis.currentWord = currentWord;
    globalThis.guessedLetters = guessedLetters;
}

// Start game using fetched word
async function startHangoverGame() {
    const word = await getRandomWord();
    initializeGameWithWord(word);
}

// Auto-run only if browser
if (typeof window !== 'undefined') {
    startHangoverGame();
}
