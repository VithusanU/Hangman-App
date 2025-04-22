const modeButtons = document.querySelectorAll(".begin-button");
const startGameButton = document.getElementById('start-game-button');
const mainGame = document.getElementById('main-game');
const gameScreen = document.getElementById('game-screen');
const wordMode = document.getElementById('word-mode');
const wordWindow = document.getElementById('word-selection-window');
const sloganMode = document.getElementById('slogan-mode');
const sloganWindow = document.getElementById('slogan-selection-window');
const gameArea = document.getElementById('game');
const wordBank = [];


//This works with the start button/mode buttons
startGameButton.addEventListener("click", () => {
    startGameButton.style.display = "none";

    modeButtons.forEach(button => {
        button.style.display = "block";
    });
});

// This will be my display when in word mode selection
wordMode.addEventListener('click', () => {
    mainGame.style.display = 'none';
    gameScreen.style.display = 'flex';
    sloganWindow.style.display = 'none';

    document.getElementById('word').style.display = 'block';
    document.getElementById('lives'). style.display = 'block';
});

//This will be my display when in slogan mode selection
sloganMode.addEventListener('click', () => {
    mainGame.style.display = 'none';
    gameScreen.style.display = 'flex';
    wordWindow.style.display = 'none';

    document.getElementById('slogan').style.display = 'block';
    document.getElementById('lives').style.display = 'block';
})


//This will be the game logic


async function getRandomWord() {
    try {
        const response = await fetch ('https://random-word-api.herokuapp.com/word?number=1') // fetches response
        const data = await response.json(); //This converts the raw HTTP response into a JavaScript object/array.
        const word = data[0]; // Extracts the first word
        console.log('Random Word:', word);
        return word.toLowerCase();
    } catch (error) {
        console.error('Failed to get word:', error);
        return 'fallback';
    }
}

let currentWord = '';
let guessedLetters = [];

function initializeGameWithWord(word) {
    currentWord = word;
    guessedLetters = [];

    const wordDisplay = document.getElementById('chosen-word');
    wordDisplay.innerHTML = '';


    for (let letter of currentWord){
        const letterSpan = document.createElement('span');
        letterSpan.textContent = '_'; //blank for each letter
        letterSpan.classList.add('letter');
        wordDisplay.appendChild(letterSpan);
    }

    console.log("Game Initialized with word:", word);
}








async function startHangoverGame() {
    const word = await getRandomWord();
    initializeGameWithWord(word);
}









//This line is for debugging purposes
startHangoverGame();