window.addEventListener('load', () => {
    const leftCurtain = document.querySelector('.left-curtain');
    const rightCurtain = document.querySelector('.right-curtain');
    const loadingScreen = document.getElementById('loading-screen');
    const mainGame = document.getElementById('main-game');

    // Trigger the curtain open animation
    leftCurtain.classList.add('open');
    rightCurtain.classList.add('open');

    // Wait for animation to finish (1s), then show main content
    setTimeout(() => {
        loadingScreen.style.display = 'none';
        mainGame.style.display = 'block';
    }, 8000); // match transition time

});



const music = document.getElementById('bg-music');
music.volume = 0.2; // Set volume to 10%