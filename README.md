# 🎮 Hangman Game
An interactive Hangman game built with HTML, CSS, and JavaScript. This game lets players guess a hidden word one letter at a time, with hints and lives limiting the number of wrong guesses allowed.

## 📌 Features
- 🔤 **Letter Guessing** – Players guess the word one letter at a time.  
- 🧠 **Category-based Hints** – Hints are based on categories: Animals, Foods, Sports, Games, and Companies.  
- 💔 **Limited Lives** – 7 chances before the game ends.  
- 🖼️ **Dynamic Display** – Correct letters are revealed; incorrect guesses are tracked visually.  
- 🕹️ **Game Over / Play Again** – UI updates based on win or loss with a restart button. 

## 🚀 Getting Started
✅ Prerequisites
A modern web browser (Chrome, Firefox, Edge, Safari, etc.)

## 📂 Installation
```git
git clone https://github.com/your-username/hangman-game.git
cd hangman-game
```
 Then open index.html in your browser.

## 🧾 How to Play
1) Start Game: A word is randomly selected from a category.

2) Guess Letters: Click on letters to guess the hidden word.

3) Correct Guess: The letter is revealed in the word.

4) Incorrect Guess: A life is lost; max 7 lives.

5) Win: Guess the full word before losing all lives.

6) Lose: Game ends if all lives are lost.

7) Play Again: Click the "Play Again" button to start a new game.

## 📁 Project Structure
bash
Copy
Edit
/hangman-game
│
├── index.html        # Main HTML structure
├── styles.css        # Styling and visual layout
├── game-logic.js     # Core game functionality
├── /audio
│   └── sound.mp3     # (Optional) Sound effects for interactions
└── README.md         # Game overview and documentation
### ⚙️ Game Logic Overview
The game starts by choosing a random word from a predefined list.

The word is hidden using underscores (_ _ _), updated as correct letters are guessed.

Lives counter tracks incorrect guesses.

After 7 incorrect guesses, the game ends with a loss message.

The player can click "Play Again" to restart the game.

## 🛠️ Planned Improvements
🌐 Use a word API to fetch more dynamic and diverse word sets.

🎨 Improve UI/UX with smoother animations and transitions.

🧮 Add score tracking and round-based play.

🛡️ Allow game mode customization: number of lives, category filters, etc.

📱 Make mobile-responsive design adjustments.

## 📝 License
This project is licensed under the MIT License.
See the LICENSE file for details.

