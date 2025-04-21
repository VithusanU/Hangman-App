window.addEventListener('load', () => {
    const leftCurtain = document.querySelector('.left-curtain');
    const rightCurtain = document.querySelector('.right-curtain');
    const loadingScreen = document.getElementById('loading-screen');
    const mainGame = document.getElementById('main-game');

    // Trigger the curtain open animation
    leftCurtain.classList.add('open');
    rightCurtain.classList.add('open');

    // Wait for animation to finish, then show main game
    setTimeout(() => {
        loadingScreen.style.display = 'none';
        mainGame.style.display = 'flex'; // Make it visible and flexbox-aligned
        mainGame.classList.add('show');  // Trigger opacity + scale transition
    }, 8000); // Match curtain animation timing
});

// Music volume control
const music = document.getElementById('bg-music');
music.volume = 0.10; // Set volume to 0%

