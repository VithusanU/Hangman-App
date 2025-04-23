// === DOM ELEMENT REFERENCES ===
const startGameButton = document.getElementById('start-game-button');
const modeButtons = document.querySelectorAll('.begin-button');
const mainGame = document.getElementById('main-game');
const gameScreen = document.getElementById('game-screen');
const wordMode = document.getElementById('word-mode');
const sloganMode = document.getElementById('slogan-mode');
const wordWindow = document.getElementById('word-selection-window');
const sloganWindow = document.getElementById('slogan-selection-window');
const gameArea = document.getElementById('game');

const playWordButton = document.getElementById('play-word-button');
const playSloganButton = document.getElementById('play-slogan-button');

const wordValue = document.getElementById('word');
const sloganValue = document.getElementById('slogan');
const livesValue = document.getElementById('lives');
const sloganLives = document.getElementById('slogan-lives');

// === GAME START BUTTON ===
startGameButton.addEventListener('click', () => {
    startGameButton.style.display = 'none';
    modeButtons.forEach(button => {
        button.style.display = 'block';
    });
});

// === MODE SELECTION ===
wordMode.addEventListener('click', () => {
    mainGame.style.display = 'none';
    gameScreen.style.display = 'flex';
    wordWindow.style.display = 'flex';
    sloganWindow.style.display = 'none';
    gameArea.style.display = 'none';
});

sloganMode.addEventListener('click', () => {
    mainGame.style.display = 'none';
    gameScreen.style.display = 'flex';
    wordWindow.style.display = 'none';
    sloganWindow.style.display = 'flex';
    gameArea.style.display = 'none';
});

// === PLAY BUTTONS ===
playWordButton.addEventListener('click', () => {
    const wordCount = wordValue.value;
    const lives = livesValue.value;

    console.log(`Starting Word Mode with ${wordCount} words and ${lives} lives`);

    gameScreen.style.display = 'none';
    gameArea.style.display = 'block';

    // Initialize Word Mode Game
    // initWordGame(wordCount, lives);
});

playSloganButton.addEventListener('click', () => {
    const sloganCount = sloganValue.value;
    const lives = sloganLives.value;

    console.log(`Starting Slogan Mode with ${sloganCount} slogans and ${lives} lives`);

    gameScreen.style.display = 'none';
    gameArea.style.display = 'block';

    // Initialize Slogan Mode Game
    // initSloganGame(sloganCount, lives);
});
