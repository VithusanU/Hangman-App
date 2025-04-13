# 🕹️ Hangman Game MVP

## 📋 Project Overview

This is a JavaScript-based Hangman game built as a minimum viable product (MVP). The game features two modes:
1. **Word Mode** – The player guesses a single word.
2. **Sentence Mode** – The player guesses a short phrase or slogan, including spaces and punctuation.

The game tracks guesses, handles correct/incorrect inputs, and ends when the player either guesses all letters or runs out of guesses.

---

## 🚀 Features

- 🔤 Letter-by-letter guessing
- 🧠 Word or sentence selection from predefined banks
- ⏱ Limited number of guesses (default: 6)
- 👀 Real-time word display with blanks for unguessed letters
- ❌ Repeated and invalid guesses are ignored
- ✅ Win/loss detection
- 🧪 Fully tested using Mocha & Chai

---

## 🧱 MVP Functionality

- `setGameWord(mode)` – sets a random word or sentence based on selected mode
- `guessLetter(letter)` – registers a guess and updates game state
- `getDisplayedWord()` – returns the current word with blanks and guessed letters
- `checkWin()` – returns true if all letters are guessed
- `checkLoss()` – returns true if remaining guesses are 0
- `resetGame()` – resets all game state to default

---

## 📂 File Structure

