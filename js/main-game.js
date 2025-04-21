const modeButtons = document.querySelectorAll(".begin-button");
const startGameButton = document.getElementById('start-game-button');
const mainGame = document.getElementById('main-game');
const gameScreen = document.getElementById('game-screen');
const wordMode = document.getElementById('word-mode');
const wordWindow = document.getElementById('word-selection-window');
const sloganMode = document.getElementById('slogan-mode');
const sloganWindow = document.getElementById('slogan-selection-window')
const fireflyContainer = document.getElementById('firefly-container');
const numFireflies = 25;


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



















//This function sets the background for fireflyContainer
for (let i = 0; i < numFireflies; i++) {
    const firefly = document.createElement('div');
    firefly.classList.add('firefly');

    //Random starting position
    let x = Math.random() * window.innerWidth;
    let y = Math.random() * window.innerHeight;

    //This make it be anywjere from top to bottom
    firefly.style.left = x + "px";
    firefly.style.top = y + "px";


    let dx = (Math.random() - 0.5) * 2;
    let dy = (Math.random() - 0.5) * 2;

    fireflyContainer.appendChild(firefly);

    function animate() {
        x += dx;
        y += dy;


        // Reverse direction if hitting window bounds
        if (x <= 0 || x >= window.innerWidth) dx *= -1;
        if (y <= 0 || y >= window.innerHeight) dy *= -1;

        firefly.style.left = x + "px";
        firefly.style.top = y + "px";

        requestAnimationFrame(animate);
    }
    animate();
}