globalThis.currentWord = '';
globalThis.guessedLetters = [];
let wordsToGuess = []; //The list of words
let currentWordIndex = 0;
let wordRounds = 0;
let totalLives = 7; // default
let livesLeft = totalLives;
globalThis.currentMode = ''; // Default to an empty string
const letterBtnSound = document.getElementById('letter-sound');


// Fetch a random word
async function getRandomWord() {
    try {
        let word = '';
        do {
            const response = await fetch('https://random-word-api.herokuapp.com/word?number=1');
            const data = await response.json();
            word = data[0];
        } while (word.length < 3 || word.length > 7); // Keep fetching until we get a word of the correct length
        console.log('Random Word:', word);
        return word.toLowerCase();
    } catch (error) {
        console.error('Failed to get word:', error);
        return 'fallback'; // Provide a fallback word in case of an error
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

    // Play the sound
    letterBtnSound.currentTime = 0; // Reset to the beginning
    letterBtnSound.play();

    // Stop the sound after a short period (e.g., 200 milliseconds)
    setTimeout(() => {
        letterBtnSound.pause();
    }, 400);  // Adjust 200 to the length you want (in milliseconds)

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
    updateBodyParts();
    renderLives();

    if (livesLeft <= 0) {
        endGame(false); // You'll define this function
    }
}

function endGame(win) {
    const allButtons = document.querySelectorAll('.letter-button');
    allButtons.forEach(btn => btn.disabled = true);

    // Show the Game End screen
    showGameEnd(win);
}

function showGameEnd(win) {
    const gameEndScreen = document.getElementById('gameEnd');
    const gameOverText = document.getElementById('gameOver');

    if (win) {
        gameOverText.textContent = "Congrats! You Win 🎉";
    } else {
        gameOverText.textContent = "Game Over 💀";
    }

    gameEndScreen.style.display = 'flex';
    setTimeout(() => {
        gameEndScreen.classList.add('show');
    }, 10); // Tiny delay so CSS transition triggers
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

function chooseLives(amount) {
    totalLives = amount;
    livesLeft = amount;
}


function updateBodyParts() {
    const mistakes = maxLives - livesLeft; // How many mistakes so far
    const partsToShow = Math.ceil((mistakes * bodyParts.length) / maxLives);

    for (let i = 0; i < partsToShow; i++) {
        bodyParts[i].style.display = 'block';
    }
}

function resetGame() {
    // Hide the game over screen
    const gameEndScreen = document.getElementById('gameEnd-screen');
    gameEndScreen.style.display = 'none';

    // Reset global variables (guessed letters, current word, lives, etc.)
    guessedLetters = [];
    currentWord = '';
    livesLeft = totalLives;

    // Reset word display if in word mode
    if (currentMode === 'word') {
        const wordDisplay = document.getElementById('chosen-word');
        if (wordDisplay) {
            wordDisplay.innerHTML = ''; // Clear the word
        }
    }

    // Reset the hangman drawing if needed
    if (typeof resetBodyParts === 'function') {
        resetBodyParts();
    }

    // Hide the active game screen
    const gameScreen = document.getElementById('game');
    gameScreen.style.display = 'none';

    // Hide any other settings windows (e.g., slogan selection window)
    const sloganSelectionWindow = document.getElementById('slogan-selection-window');
    if (sloganSelectionWindow) {
        sloganSelectionWindow.style.display = 'none';
    }

    // Show the game screen with word selection window
    const gameScreenContainer = document.getElementById('game-screen');
    gameScreenContainer.style.display = 'flex';

    const wordSelectionWindow = document.getElementById('word-selection-window');
    if (wordSelectionWindow) {
        wordSelectionWindow.style.display = 'flex';  // Show the word selection window
    }

    // Hide the word and slogan modes (if needed)
    const sloganWindow = document.getElementById('slogan-selection-window');
    if (sloganWindow) {
        sloganWindow.style.display = 'none';
    }

    // Reset letter buttons if necessary
    generateLetterButtons();
}

const playAgainButton = document.getElementById('playAgain');
playAgainButton.addEventListener('click', function() {
    sound.play();
    resetGame();  // This will reset and show the word-selection window
});


// Auto-run only if browser
if (typeof window !== 'undefined') {
    generateLetterButtons();
}
 