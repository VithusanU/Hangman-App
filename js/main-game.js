const modeButtons = document.querySelectorAll(".begin-button");
const startGameButton = document.getElementById('start-game-button');
const fireflyContainer = document.getElementById('.firefly-container');
numOfFirflies = 25;

startGameButton.addEventListener("click", () => {
    startGameButton.style.display = "none";

    modeButtons.forEach(button => {
        button.style.display = "block";
    });
});


//This function sets the background for fireflyContainer
