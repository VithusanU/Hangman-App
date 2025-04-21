window.addEventListener('load', () => {
    const leftCurtain = document.querySelector('.left-curtain');
    const rightCurtain = document.querySelector('.right-curtain');
    const loadingScreen = document.getElementById('loading-screen');
    const mainGame = document.getElementById('main-game');
    const fireflyContainer = document.getElementById('firefly-container');
    const numFireflies = 25;

    // Trigger the curtain open animation
    leftCurtain.classList.add('open');
    rightCurtain.classList.add('open');
    loadingScreen.classList.add("fade-out");

    // Wait for animation to finish, then show main game
    setTimeout(() => {
        loadingScreen.style.display = 'none';
        mainGame.style.display = 'flex'; // Make it visible and flexbox-aligned
        mainGame.classList.add('show');  // Trigger opacity + scale transition
    }, 4000); // Match curtain animation timing

    // Firefly creation logic goes HERE:
    for (let i = 0; i < numFireflies; i++) {
        const firefly = document.createElement('div');
        firefly.classList.add('firefly');

        let x = Math.random() * window.innerWidth;
        let y = Math.random() * window.innerHeight;

        firefly.style.left = x + "px";
        firefly.style.top = y + "px";

        let dx = (Math.random() - 0.5) * 2;
        let dy = (Math.random() - 0.5) * 2;

        fireflyContainer.appendChild(firefly);

        function animate() {
            x += dx;
            y += dy;

            if (x <= 0 || x >= window.innerWidth) dx *= -1;
            if (y <= 0 || y >= window.innerHeight) dy *= -1;

            firefly.style.left = x + "px";
            firefly.style.top = y + "px";

            requestAnimationFrame(animate);
        }
        animate();
    }
});

// Music volume control
const music = document.getElementById('bg-music');
music.volume = 0.00;
