globalThis.currentWord = '';
globalThis.guessedLetters = [];
let wordsToGuess = []; //The list of words
let currentWordIndex = 0;
let wordRounds = 0;

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
                letterSpan.textContent = '';
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
    if (wordRounds <= 0) {
        alert('Game Over! You have completed all rounds.');
        return;
    }

    generateLetterButtons(); // recreate all buttons fresh every new round
    const word = await getRandomWord();
    initializeGameWithWord(word);

    // Reduce remaining rounds
    wordRounds--;
}


function generateLetterButtons() {
    const lettersContainer = document.getElementById('letters');
    lettersContainer.innerHTML = ''; // Clear previous content if needed

    for (let i = 65; i <= 90; i++) {
        const letter = String.fromCharCode(i);
        const button = document.createElement('button');
        button.textContent = letter;
        button.classList.add('letter-button');
        button.setAttribute('data-letter', letter);
        button.addEventListener('click', () => {
            handleLetterClick(letter); // Replace with your own handler
        });
        lettersContainer.appendChild(button);
    }
}

function handleLetterClick(letter) {
    const lowerLetter = letter.toLowerCase();
    const button = document.querySelector(`[data-letter="${letter}"]`);

    if (guessedLetters.includes(lowerLetter)) return;
    guessedLetters.push(lowerLetter);

    if (currentWord.includes(lowerLetter)) {
        console.log(`Correct guess: ${letter}`);
        button.style.backgroundColor = 'green';
        button.style.color = 'white';

        const wordDisplay = document.getElementById('chosen-word');
        const spans = wordDisplay.querySelectorAll('span');

        for (let i = 0; i < currentWord.length; i++) {
            if (currentWord[i] === lowerLetter) {
                spans[i].textContent = currentWord[i];
            }
        }

        checkWinCondition(); // If this is defined
    } else {
        console.log(`Wrong guess: ${letter}`);
        button.style.backgroundColor = 'red';
        button.style.color = 'white';

        handleWrongGuess(); // Optional function
    }

    button.disabled = true;
}

function handleWrongGuess() {
    livesLeft--;
    renderLives?.();

    if (livesLeft <= 0) {
        endGame(false); // You'll define this function
    }
}

function endGame(win) {
    if(win) {
        alert('You guessed the Word! 🎉 New word coming up ...');
        startHangoverGame();

    } else {
        alert('Game Over 💀');
        const allButtons = document.querySelectorAll('.letter-button');
        allButtons.forEach(btn => btn.disabled = true);
    }
}

function checkWinCondition() {
    const wordDisplay = document.getElementById('chosen-word');
    const spans = wordDisplay.querySelectorAll('span');

    const allRevealed = [...spans].every(span => span.textContent !== '');
    if (allRevealed) {
        if (wordRounds > 0) {
            alert('You guessed the word! Moving on to the next word...');
            startHangoverGame();
        } else {
            endGame(true);
        }
    }
}


// Auto-run only if browser
if (typeof window !== 'undefined') {
    generateLetterButtons();
}
