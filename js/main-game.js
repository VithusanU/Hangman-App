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
const categoryWindow = document.getElementById('category-selection-window');

const playWordButton = document.getElementById('play-word-button');
const playSloganButton = document.getElementById('play-slogan-button');

const wordValue = document.getElementById('word');
const sloganValue = document.getElementById('slogan');
const livesValue = document.getElementById('lives');
const sloganLives = document.getElementById('slogan-lives');
const head = document.getElementById('headGame');
const body = document.getElementById('bodyGame');
const leftArm = document.getElementById('leftArmGame');
const rightArm = document.getElementById('rightArmGame');
const leftLeg = document.getElementById('leftLegGame');
const rightLeg = document.getElementById('rightLegGame');
const sound = document.getElementById('button-audio');


const bodyParts = [
    document.getElementById('headGame'),
    document.getElementById('bodyGame'),
    document.getElementById('leftArmGame'),
    document.getElementById('rightArmGame'),
    document.getElementById('leftLegGame'),
    document.getElementById('rightLegGame')
  ];

globalThis.maxLives = 0;
globalThis.livesLeft = 0;


// === GAME START BUTTON ===
startGameButton.addEventListener('click', () => {
    startGameButton.style.display = 'none';
    sound.play();
    
    modeButtons.forEach(button => {
        button.style.display = 'block';
    });
});

// === MODE SELECTION ===
wordMode.addEventListener('click', () => {
    sound.play();
    currentMode = 'word';
    mainGame.style.display = 'none';
    gameScreen.style.display = 'flex';
    wordWindow.style.display = 'flex';
    sloganWindow.style.display = 'none';
    gameArea.style.display = 'none';
});

sloganMode.addEventListener('click', () => {
    sound.play();
    currentMode = 'slogan';
    categoryWindow.style.display = 'flex';
    mainGame.style.display = 'none';
    gameScreen.style.display = 'flex';
    wordWindow.style.display = 'none';
    sloganWindow.style.display = 'none';
    gameArea.style.display = 'none';
});

// === PLAY BUTTONS ===
playWordButton.addEventListener('click', () => {
    sound.play();
    const wordCount = wordValue.value;
    const lives = livesValue.value;


    console.log(`Starting Word Mode with ${wordCount} words and ${lives} lives`);
    head.style.display = 'none';
    body.style.display = 'none';
    leftArm.style.display = 'none';
    rightArm.style.display = 'none';
    leftLeg.style.display = 'none';
    rightLeg.style.display = 'none';
    gameScreen.style.display = 'none';
    gameArea.style.display = 'block';

    // Initialize Word Mode Game
    initWordGame(wordCount, parseInt(lives));
});

playSloganButton.addEventListener('click', () => {
    const sloganCount = sloganValue.value;
    const lives = sloganLives.value;
    

    console.log(`Starting Slogan Mode with ${sloganCount} slogans and ${lives} lives`);

    gameScreen.style.display = 'none';
    gameArea.style.display = 'flex';


    // Initialize Slogan Mode Game
    initSloganGame(sloganCount, parseInt(lives));

});

function initWordGame(wordCount, selectedLives) {
    maxLives = selectedLives;
    livesLeft = maxLives;
    wordRounds = parseInt(wordCount);  // Set the number of rounds based on user selection
    const livesSelect = document.getElementById('lives');
    totalLives = parseInt(livesSelect.value, 10);
    bodyParts.forEach(part => part.style.display = 'none');
    livesLeft = totalLives;
    renderLives();
    startHangoverGame();  // Start the game with the selected number of rounds
}

function initSloganGame(sloganCount, selectedLives) {
    maxLives = selectedLives;
    livesLeft = maxLives;
    wordRounds = parseInt(sloganCount);  // Set the number of rounds based on user selection
    renderLives();
    startHangoverGame();  // Start the game with the selected number of rounds
}

function renderLives() {
    const container = document.getElementById('lives-container');
    if (!container) return;

    container.innerHTML = '';
    for (let i = 0; i < maxLives; i++) {
        const heart = document.createElement('span');
        heart.textContent = i < livesLeft ? '❤️' : '🤍';
        heart.classList.add('heart');
        container.appendChild(heart);
    }
}

