const fs = require('fs');
const vm = require('vm');
const { JSDOM } = require('jsdom');
const chai = require('chai');
const should = chai.should();

// Set up DOM globals
const dom = new JSDOM(`<!DOCTYPE html><div id="chosen-word"></div>`);
global.window = dom.window;
global.document = dom.window.document;

// Set up a context that shares global scope
const context = vm.createContext(global);

// Read and evaluate the game-logic.js file inside the current global scope
const path = 'js/game-logic.js';
const code = fs.readFileSync(path, 'utf-8');
vm.runInContext(code, context); // this runs it with access to the globals

// Now we can access `currentWord` and test it
describe('getRandomWord', function () {
    it('a global variable called currentWord should exist and initialize to an empty string', function () {
        should.equal(global.currentWord, '');
    });
    it('a global variable called guessedLetters should exist and initialize to an empty array', function (){
        global.guessedLetters.should.be.an('array').that.is.empty;
    });
});

describe('initializeGameWithWord', function () {
    it('should set `currentWord` to the given word', function () {
        context.initializeGameWithWord('hangman');
        should.equal(context.currentWord, 'hangman');
    });

    it('should reset `guessedLetters` to an empty array', function () {
        context.initializeGameWithWord('hangman');
        context.guessedLetters.should.be.an('array').that.is.empty;
    });

    it('should update the DOM with blanks', function () {
        context.initializeGameWithWord('dog');
        const chosenDiv = document.getElementById('chosen-word');
        chosenDiv.textContent.should.equal('_ _ _');
    });
});

describe('handleGuess()', () => {
    beforeEach(() => {
      document.getElementById('chosen-word').innerHTML = '';
      context.initializeGameWithWord('banana');
    });
  
    it('should add guessed letter to guessedLetters array', () => {
      context.handleGuess('b');
      global.guessedLetters.should.include('b');
    });
  
    it('should not add duplicate guessed letters', () => {
      context.handleGuess('a');
      context.handleGuess('a');
      global.guessedLetters.filter(l => l === 'a').length.should.equal(1);
    });
  
    it('should reveal correct letters in the DOM', () => {
      context.handleGuess('a');
      const spans = document.querySelectorAll('#chosen-word .letter');
      // 'banana' has 'a' in index 1, 3, 5
      spans[1].textContent.should.equal('a');
      spans[3].textContent.should.equal('a');
      spans[5].textContent.should.equal('a');
    });
  
    it('should leave incorrect letters as underscores', () => {
      context.handleGuess('z');
      const spans = document.querySelectorAll('#chosen-word .letter');
      spans.forEach((span, i) => {
        const isA = [1, 3, 5].includes(i);
        if (!isA) span.textContent.should.equal('_');
      });
    });
  });
  
  describe('revealLetters()', () => {
    beforeEach(() => {
      document.getElementById('chosen-word').innerHTML = '';
      context.initializeGameWithWord('banana');
    });
  
    it('should reveal all matching letters for given letter', () => {
      context.revealLetters('n');
      const spans = document.querySelectorAll('#chosen-word .letter');
      // 'banana' has 'n' at index 2 and 4
      spans[2].textContent.should.equal('n');
      spans[4].textContent.should.equal('n');
    });
  
    it('should not reveal anything if letter not in word', () => {
      context.revealLetters('x');
      const spans = document.querySelectorAll('#chosen-word .letter');
      spans.forEach(span => span.textContent.should.equal('_'));
    });
  });
  