const modeButtons = document.querySelectorAll(".begin-button");
const startGameButton = document.getElementById('start-game-button');
const mainGame = document.getElementById('main-game');
const gameScreen = document.getElementById('game-screen');
const wordMode = document.getElementById('word-mode');
const wordWindow = document.getElementById('word-selection-window');
const sloganMode = document.getElementById('slogan-mode');
const sloganWindow = document.getElementById('slogan-selection-window');
const gameArea = document.getElementById('game');

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

















