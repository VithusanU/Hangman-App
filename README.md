# Hangman

A browser-based Hangman game built with vanilla HTML, CSS, and JavaScript. Players guess a hidden word one letter at a time across five categories, with seven lives and audio feedback throughout.

> **Live:** [vithusanu.github.io/Hangman-App](https://vithusanu.github.io/Hangman-App)

---

## Features

- **Category-based word selection** — Animals, Foods, Sports, Games, and Companies
- **Seven lives** — incorrect guesses are tracked and displayed visually
- **Audio feedback** — distinct sounds for correct guesses, incorrect guesses, win, and loss
- **Dynamic letter reveal** — correct letters appear in position; incorrect guesses are tracked on screen
- **Win / lose states** — clear end-game UI with a Play Again option
- **Tested** — game logic covered with a Mocha/JSDOM test suite

---

## Tech

- HTML, CSS, JavaScript (no frameworks)
- Mocha + JSDOM for unit tests

---

## Getting Started

```bash
git clone https://github.com/VithusanU/Hangman-App.git
cd Hangman-App
```

Open `index.html` in a browser, or run a local server:

```bash
npx serve .
```

### Running Tests

```bash
npm install
npm test
```

---

## Project Structure

```
Hangman-App/
├── css/
│   ├── reset.css
│   └── style.css
├── js/
│   ├── game-logic.js       # Core game state and word selection
│   ├── main-game.js        # DOM interactions and UI updates
│   └── loading-screen.js
├── audio/                  # Sound effects
├── image/                  # Background and UI images
├── test/
│   └── test.js             # Mocha unit tests
└── index.html
```

---

## What I Learned

This was my first project applying test-driven thinking to a frontend app — writing tests for game logic before building the UI. It also reinforced clean separation between game state (logic) and presentation (DOM manipulation).

---

## License

MIT

---

*Built by [Vithusan Uruthirakumaran](https://github.com/VithusanU)*
