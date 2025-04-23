// Wait for the page to fully load
window.addEventListener('load', () => {
    // Element references
    const leftCurtain = document.querySelector('.left-curtain');
    const rightCurtain = document.querySelector('.right-curtain');
    const loadingScreen = document.getElementById('loading-screen');
    const mainGame = document.getElementById('main-game');
    const fireflyContainer = document.getElementById('firefly-container');
    const numFireflies = 25;

    // === Curtain and Loading Animation ===
    leftCurtain.classList.add('open');
    rightCurtain.classList.add('open');
    loadingScreen.classList.add('fade-out');

    // After animation, hide loading screen and show main game
    setTimeout(() => {
        loadingScreen.style.display = 'none';
        mainGame.style.display = 'flex';
        mainGame.classList.add('show');
    }, 4000); // Match this to your CSS transition duration

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
    music.volume = 0.10;
}
