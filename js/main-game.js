const modeButtons = document.querySelectorAll(".begin-button");
const startGameButton = document.getElementById('start-game-button');
const fireflyContainer = document.getElementById('firefly-container');
const numFireflies = 25;


//This works with the start button/mode buttons
startGameButton.addEventListener("click", () => {
    startGameButton.style.display = "none";

    modeButtons.forEach(button => {
        button.style.display = "block";
    });
});


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

    function animate()  {
        x+= dx;
        y+= dy;

        
        // Reverse direction if hitting window bounds
        if (x <= 0 || x >= window.innerWidth) dx *= -1;
        if (y <= 0 || y >= window.innerHeight) dy *= -1;

        firefly.style.left = x + "px";
        firefly.style.top = y + "px";

        requestAnimationFrame(animate);
    }
    animate();
}