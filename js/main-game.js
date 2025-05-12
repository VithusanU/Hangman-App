// === DOM ELEMENT REFERENCES ===
const startGameButton = document.getElementById('start-game-button');
const modeButtons = document.querySelectorAll('.begin-button');
const mainGame = document.getElementById('main-game');
const gameScreen = document.getElementById('game-screen');
const wordMode = document.getElementById('word-mode');
const categoryMode = document.getElementById('category-mode');
const wordWindow = document.getElementById('word-selection-window');
const categoryWindow2 = document.getElementById('category-selection-window2');
const gameArea = document.getElementById('game');
const categoryWindow = document.getElementById('category-selection-window');

const playWordButton = document.getElementById('play-word-button');
const playCategoryButton = document.getElementById('play-category-button');

const wordValue = document.getElementById('word');
const categoryValue = document.getElementById('category');
const livesValue = document.getElementById('lives');
const categoryLives = document.getElementById('category-lives');
const head = document.getElementById('headGame');
const body = document.getElementById('bodyGame');
const leftArm = document.getElementById('leftArmGame');
const rightArm = document.getElementById('rightArmGame');
const leftLeg = document.getElementById('leftLegGame');
const rightLeg = document.getElementById('rightLegGame');
const sound = document.getElementById('button-audio');


const categorySelection = document.getElementById('categories');


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
    categoryWindow2.style.display = 'none';
    gameArea.style.display = 'none';
});

categoryMode.addEventListener('click', () => {
    sound.play();
    currentMode = 'category';
    categoryWindow.style.display = 'flex';
    mainGame.style.display = 'none';
    gameScreen.style.display = 'flex';
    wordWindow.style.display = 'none';
    categoryWindow2.style.display = 'none';
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


categorySelection.addEventListener('click', () => {
    sound.play();
    currentMode = 'category';
    categoryWindow2.style.display = 'flex';
    mainGame.style.display = 'none';
    gameScreen.style.display = 'flex';
    wordWindow.style.display = 'none';
    categoryWindow.style.display = 'none';
    gameArea.style.display = 'none';
});




playCategoryButton.addEventListener('click', () => {
    const categoryCount = categoryValue.value;
    const lives = categoryLives.value;
    

    console.log(`Starting Slogan Mode with ${categoryCount} slogans and ${lives} lives`);

    gameScreen.style.display = 'none';
    gameArea.style.display = 'flex';


    // Initialize Slogan Mode Game
    initCategoryGame(categoryCount, parseInt(lives));

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

function initCategoryGame(categoryCount, selectedLives) {
    maxLives = selectedLives;
    livesLeft = maxLives;
    wordRounds = parseInt(categoryCount); 
    const livesSelect = document.getElementById('lives');
    totalLives = parseInt(livesSelect.value, 10);
    bodyParts.forEach(part => part.style.display = 'none');
    livesLeft = totalLives; // Set the number of rounds based on user selection
    renderLives();
    startHangoverCategoryGame();  // Start the game with the selected number of rounds
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

