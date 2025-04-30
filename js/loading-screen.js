window.addEventListener('load', () => {
    // Element references
    const leftCurtain = document.querySelector('.left-curtain');
    const rightCurtain = document.querySelector('.right-curtain');
    const loadingScreen = document.getElementById('loading-screen');
    const mainGame = document.getElementById('main-game');
    const hangmanLoader = document.getElementById('hangman-loader');
    const fireflyContainer = document.getElementById('firefly-container');
    const numFireflies = 25;

    // === Hangman Animation Loop ===
    const hangmanParts = [
        document.getElementById('head'),
        document.getElementById('body'),
        document.getElementById('leftArm'),
        document.getElementById('rightArm'),
        document.getElementById('leftLeg'),
        document.getElementById('rightLeg')
    ];

    let currentPartIndex = 0;

    // Function to show the next part of the hangman
    const showNextPart = () => {
        if (currentPartIndex < hangmanParts.length) {
            hangmanParts[currentPartIndex].style.opacity = 1; // Show the next part
            currentPartIndex++; // Move to the next part
        } else {
            currentPartIndex = 0; // Reset to start the loop again
        }
    };

    let hangmanAnimationInterval = setInterval(() => {
        // Reset the animation by forcing a reflow
        hangmanLoader.classList.remove('show');
        
        // Force reflow by accessing the offsetWidth property
        void hangmanLoader.offsetWidth; 
        
        // Add the class back to trigger the animation
        hangmanLoader.classList.add('show');
    }, 200);

    // === Curtain and Loading Animation ===
    leftCurtain.classList.add('open');
    rightCurtain.classList.add('open');
    loadingScreen.classList.add('fade-out');

    setTimeout(() => {
        clearInterval(hangmanAnimationInterval);

        // Fully hide the loader
        hangmanLoader.style.display = 'none';

        // Hide the loading screen
        loadingScreen.style.display = 'none';

        // Show the main game
        mainGame.style.display = 'flex';
        mainGame.classList.add('show');
    }, 4000);

    // === Firefly Effect ===
    for (let i = 0; i < numFireflies; i++) {
        const firefly = document.createElement('div');
        firefly.classList.add('firefly');

        // Random start position
        let x = Math.random() * window.innerWidth;
        let y = Math.random() * window.innerHeight;

        // Initial position
        firefly.style.left = `${x}px`;
        firefly.style.top = `${y}px`;

        // Random movement vector
        let dx = (Math.random() - 0.5) * 2;
        let dy = (Math.random() - 0.5) * 2;

        // Append firefly to container
        fireflyContainer.appendChild(firefly);

        // Animate firefly movement
        function animate() {
            x += dx;
            y += dy;

            // Bounce off screen edges
            if (x <= 0 || x >= window.innerWidth) dx *= -1;
            if (y <= 0 || y >= window.innerHeight) dy *= -1;

            firefly.style.left = `${x}px`;
            firefly.style.top = `${y}px`;

            requestAnimationFrame(animate);
        }

        animate();
    }
});

// === Background Music Volume Control ===
const music = document.getElementById('bg-music');
if (music) {
    music.volume = 0.00; //muted for now
}
