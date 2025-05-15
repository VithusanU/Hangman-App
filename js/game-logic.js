globalThis.currentWord = '';
globalThis.guessedLetters = [];
globalThis.currentHint = '';
let wordsToGuess = []; //The list of words
let currentWordIndex = 0;
let wordRounds = 5;
let totalLives = 7; // default
let livesLeft = totalLives;
globalThis.currentMode = ''; // Default to an empty string
const letterBtnSound = document.getElementById('letter-sound');


// Fetch a random word
async function getRandomWord() {
    try {
        let word = '';
        let definition = '';
        let attempts = 0;
        const maxAttempts = 10;

        do {
            const response = await fetch('https://random-word-api.herokuapp.com/word?number=1');
            const data = await response.json();
            word = data[0].toLowerCase();

            // Skip if word length is not valid
            if (word.length < 3 || word.length > 7) {
                continue;
            }

            // Fetch definition
            definition = await fetchDefinition(word);

            attempts++;
        } while ((definition === 'No hint available.' || word.length < 3 || word.length > 7) && attempts < maxAttempts);

        if (definition === 'No hint available.') {
            console.warn('Fallback used — no suitable word found with a valid hint.');
            return { word: 'fallback', definition: 'No definition available.' };
        }

        console.log('Random Word:', word);
        console.log('Definition:', definition);
        return { word, definition };

    } catch (error) {
        console.error('Failed to get word:', error);
        return { word: 'fallback', definition: 'No definition available.' };
    }
}

// Initialize the game board with underscores
async function initializeGameWithWord(word, hint) {
    currentWord = word;
    guessedLetters = [];
    currentHint = hint; // directly use passed-in hint

    const hintDisplay = document.getElementById('hint');
    if (hintDisplay) {
        await typeHintText(hintDisplay, `Hint: ${currentHint}`, 40); // 40ms per char
    }

    const wordDisplay = document.getElementById('chosen-word');
    if (wordDisplay) {
        wordDisplay.innerHTML = '';

        for (let letter of currentWord) {
            const letterSpan = document.createElement('span');
            letterSpan.textContent = '';
            letterSpan.classList.add('letter');
            wordDisplay.appendChild(letterSpan);
        }
    }

    console.log("Game Initialized with word:", word);
    console.log('This is the Hint:', currentHint);

    // Sync globals (so tests can see updates)
    globalThis.currentWord = currentWord;
    globalThis.guessedLetters = guessedLetters;
    globalThis.currentHint = currentHint;
}


// Start game using fetched word
async function startHangoverGame() {
    if (wordRounds <= 0) {
        alert('Game Over! You have completed all rounds.');
        wordRounds = 5; // Reset the rounds if you want to allow another playthrough
        return;
    }

    const { word, definition } = await getRandomWord(); // ✅ FIXED
    await initializeGameWithWord(word, definition);      // ✅ Pass correct values
    generateLetterButtons();                             // Recreate buttons
    wordRounds--;                                        // Reduce remaining rounds
}


function generateLetterButtons() {
    const lettersContainer = document.getElementById('letters');
    lettersContainer.innerHTML = ''; // Clear previous content if needed


    for (let i = 65; i <= 90; i++) {
        const letter = String.fromCharCode(i);
        const button = document.createElement('button');
        button.textContent = letter;
        button.classList.add('letter-button');
        button.setAttribute('data-letter', letter);
        button.addEventListener('click', () => {
            handleLetterClick(letter); // Replace with your own handler

        });
        lettersContainer.appendChild(button);
    }
}

function handleLetterClick(letter) {
    const lowerLetter = letter.toLowerCase();
    const button = document.querySelector(`[data-letter="${letter}"]`);

    letterBtnSound.currentTime = 0;
    letterBtnSound.play();

    setTimeout(() => {
        letterBtnSound.pause();
    }, 400);

    if (guessedLetters.includes(lowerLetter)) return;
    guessedLetters.push(lowerLetter);

    if (currentWord.toLowerCase().includes(lowerLetter)) {
        console.log(`Correct guess: ${letter}`);
        button.style.backgroundColor = 'green';
        button.style.color = 'white';

        const wordDisplay = document.getElementById('chosen-word');
        const spans = wordDisplay.querySelectorAll('span');

        for (let i = 0; i < currentWord.length; i++) {
            if (currentWord[i].toLowerCase() === lowerLetter) {
                spans[i].textContent = currentWord[i]; // Keep original casing
            }
        }

        checkWinCondition();
    } else {
        console.log(`Wrong guess: ${letter}`);
        button.style.backgroundColor = 'red';
        button.style.color = 'white';
        handleWrongGuess();
    }

    button.disabled = true;
}


function handleWrongGuess() {
    livesLeft--;
    updateBodyParts();
    renderLives();

    if (livesLeft <= 0) {
        endGame(false); // You'll define this function
    }
}

function endGame(win) {
    const allButtons = document.querySelectorAll('.letter-button');
    allButtons.forEach(btn => btn.disabled = true);

    // Show the Game End screen
    showGameEnd(win);
}

function showGameEnd(win) {
    const gameEndScreen = document.getElementById('gameEnd');
    const gameOverText = document.getElementById('gameOver');

    if (win) {
        gameOverText.textContent = "Congrats! You Win 🎉";
    } else {
        gameOverText.textContent = "Game Over 💀";
    }

    gameEndScreen.style.display = 'flex';
    setTimeout(() => {
        gameEndScreen.classList.add('show');
    }, 10); // To trigger the CSS transition

    // Ensure the "Play Again" button is visible when game ends
    const playAgainButton = document.getElementById('playAgain');
    playAgainButton.style.display = 'block';  // Make sure it's visible when game ends

    // Add an event listener to the "Play Again" button to reset the game
    playAgainButton.addEventListener('click', () => {
        sound.play();  // Play sound if needed

        // Always reset the game when the button is clicked
        resetGame();
    });
}

function checkWinCondition() {
    const wordDisplay = document.getElementById('chosen-word');
    const spans = wordDisplay.querySelectorAll('span');

    const allRevealed = [...spans].every(span => span.textContent !== '');
    if (allRevealed) {
        if (currentMode === 'word') {
            if (wordRounds > 0) {
                alert('You guessed the word! Moving on to the next word...');
                startHangoverGame();
            } else {
                endGame(true);
            }
        } else if (currentMode === 'category') {
            if (wordRounds > 0) {
                alert('You guessed the word! Moving on to the next word...');
                startHangoverCategoryGame(selectedCategory);
            } else {
                endGame(true);
            }
        }

    }
}

function chooseLives(amount) {
    totalLives = amount;
    livesLeft = amount;
}


function updateBodyParts() {
    const mistakes = maxLives - livesLeft; // How many mistakes so far
    const partsToShow = Math.ceil((mistakes * bodyParts.length) / maxLives);

    for (let i = 0; i < partsToShow; i++) {
        bodyParts[i].style.display = 'block';
    }
}

function resetGame() {
    // Reset global variables (example)
    guessedLetters = [];
    currentWord = '';
    livesLeft = totalLives;

    // Clear the word display (example)
    const wordDisplay = document.getElementById('chosen-word');
    wordDisplay.innerHTML = ''; // Clear the word on the board

    // Enable all letter buttons again
    const allButtons = document.querySelectorAll('.letter-button');
    allButtons.forEach(button => {
        button.disabled = false; // Enable buttons
        button.style.backgroundColor = ''; // Reset background color
        button.style.color = ''; // Reset text color
    });

    // Hide the game over screen if it's showing
    const gameEndScreen = document.getElementById('gameEnd');
    gameEndScreen.style.display = 'none';

    // Restart the game with a new word
    if (currentMode === 'word') {
        startHangoverGame(); // Assuming this starts the game again with a new word
    } else if (currentMode === 'category') {
        startHangoverCategoryGame(currentCategory);
    }
        
}

const playAgainButton = document.getElementById('playAgain');
playAgainButton.addEventListener('click', () => {
    sound.play();
    // Reset lives and visuals
    livesLeft = totalLives;
    bodyParts.forEach(part => part.style.display = 'none');
    renderLives();

    // Restart the game
    resetGame();

});


// Categories logic

const wordBanks = {
    animals: [
        "Lion",
        "Tiger",
        "Elephant",
        "Giraffe",
        "Zebra",
        "Kangaroo",
        "Panda",
        "Koala",
        "Sloth",
        "Cheetah",
        "Leopard",
        "Wolf",
        "Fox",
        "Bear",
        "Rabbit",
        "Squirrel",
        "Horse",
        "Donkey",
        "Cow",
        "Sheep",
        "Goat",
        "Pig",
        "Chicken",
        "Duck",
        "Turkey",
        "Peacock",
        "Ostrich",
        "Penguin",
        "Eagle",
        "Owl",
        "Parrot",
        "Dolphin",
        "Whale",
        "Shark",
        "Octopus",
        "Sea Turtle",
        "Clownfish",
        "Jellyfish",
        "Crocodile",
        "Alligator",
        "Lizard",
        "Snake",
        "Frog",
        "Tortoise",
        "Bat",
        "Horsefly",
        "Bee",
        "Ant",
        "Dragonfly",
        "Ladybug",
        "Caterpillar",
        "Spider"
    ],
    foods: [
        "Apple",
        "Banana",
        "Orange",
        "Strawberry",
        "Blueberry",
        "Mango",
        "Pineapple",
        "Watermelon",
        "Grapes",
        "Avocado",
        "Tomato",
        "Carrot",
        "Potato",
        "Broccoli",
        "Spinach",
        "Cucumber",
        "Lettuce",
        "Corn",
        "Peas",
        "Onion",
        "Garlic",
        "Chicken",
        "Beef",
        "Pork",
        "Fish",
        "Shrimp",
        "Eggs",
        "Tofu",
        "Rice",
        "Pasta",
        "Bread",
        "Cheese",
        "Yogurt",
        "Milk",
        "Butter",
        "Pizza",
        "Burger",
        "Hot Dog",
        "Fries",
        "Tacos",
        "Sandwich",
        "Soup",
        "Salad",
        "Ice Cream",
        "Chocolate",
        "Cookies",
        "Cake",
        "Chips",
        "Popcorn",
        "Noodles"
    ],
    sports: [
        "Soccer",
        "Basketball",
        "Baseball",
        "Football",
        "Tennis",
        "Golf",
        "Cricket",
        "Rugby",
        "Hockey",
        "Volleyball",
        "Table Tennis",
        "Badminton",
        "Swimming",
        "Cycling",
        "Track and Field",
        "Boxing",
        "MMA",
        "Wrestling",
        "Gymnastics",
        "Skateboarding",
        "Surfing",
        "Skiing",
        "Snowboarding",
        "Lacrosse",
        "Field Hockey",
        "Formula 1",
        "Motorsport",
        "Archery",
        "Fencing",
        "Rowing",
        "Canoeing",
        "Kayaking",
        "Horse Racing",
        "Equestrian",
        "Weightlifting",
        "Powerlifting",
        "Climbing",
        "Polo",
        "Ultimate Frisbee",
        "Bowling",
        "Snooker",
        "Pool",
        "Poker",
        "Esports"
    ],
    games: [
        // Video Games
        "Fortnite",
        "Minecraft",
        "Call of Duty",
        "Grand Theft Auto",
        "The Legend of Zelda",
        "Super Mario Bros.",
        "League of Legends",
        "Counter-Strike",
        "Valorant",
        "Elden Ring",

        // Board Games
        "Monopoly",
        "Chess",
        "Scrabble",
        "Risk",
        "Settlers of Catan",
        "Clue",
        "Checkers",
        "Battleship",
        "Carrom",
        "Ticket to Ride",

        // Card Games
        "Poker",
        "Blackjack",
        "Uno",
        "Go Fish",
        "Solitaire",
        "Bridge",
        "Hearts",
        "Rummy",
        "Crazy Eights",
        "Magic: The Gathering",

        // Party Games
        "Charades",
        "Pictionary",
        "Heads Up!",
        "Truth or Dare",
        "Mafia",
        "Twister",
        "Cards Against Humanity",
        "Taboo",

        // Classic Mini-Games
        "Tetris",
        "Pac-Man",
        "Snake",
        "Flappy Bird",
        "Space Invaders",
        "Doodle Jump",

        // Outdoor/Playground Games
        "Tag",
        "Hide and Seek",
        "Hopscotch",
        "Capture the Flag",
        "Kickball",
        "Dodgeball",
        "Red Rover"
    ],
    companies: [
        "Google",
        "Apple",
        "Microsoft",
        "Amazon",
        "Meta",
        "Tesla",
        "Netflix",
        "Nvidia",
        "IBM",
        "Adobe",
        "Salesforce",
        "Intel",
        "Oracle",
        "Spotify",
        "Airbnb",
        "Uber",
        "Shopify",
        "Snap Inc.",
        "Zoom",
        "Dropbox",
        "Reddit",
        "Twitter",
        "Square",
        "Stripe",
        "Coinbase",
        "Palantir",
        "Slack",
        "Asana",
        "GitHub",
        "Atlassian",
        "Pinterest",
        "TikTok",
        "DoorDash",
        "Instacart",
        "Twitch",
        "Robinhood",
        "WeWork",
        "LinkedIn",
        "Bitbucket",
        "Hulu",
        "DigitalOcean",
        "Cloudflare",
        "Databricks",
        "OpenAI",
        "Anthropic",
        "DeepMind",
        "Grammarly",
        "Canva",
        "Figma",
        "Replit"
    ],
    movies: [
        "The Godfather",
        "The Shawshank Redemption",
        "The Dark Knight",
        "Titanic",
        "Avatar",
        "The Avengers",
        "Star Wars: A New Hope",
        "Jurassic Park",
        "Forrest Gump",
        "Pulp Fiction",
        "The Lion King",
        "Inception",
        "Gladiator",
        "The Matrix",
        "Jaws",
        "The Silence of the Lambs",
        "Fight Club",
        "Schindler's List",
        "The Lord of the Rings: The Fellowship of the Ring",
        "Back to the Future",
        "The Terminator",
        "The Godfather Part II",
        "Interstellar",
        "Frozen",
        "Black Panther",
        "The Dark Knight Rises",
        "The Wizard of Oz",
        "Spider-Man: No Way Home",
        "The Hunger Games",
        "The Social Network",
        "E.T. the Extra-Terrestrial",
        "Coco",
        "Toy Story",
        "Pirates of the Caribbean: The Curse of the Black Pearl",
        "The Incredibles",
        "The Prestige",
        "La La Land",
        "The Big Lebowski",
        "The Godfather Part III",
        "The Avengers: Endgame",
        "Mad Max: Fury Road",
        "Goodfellas",
        "Saving Private Ryan",
        "The Great Gatsby",
        "The Revenant",
        "12 Angry Men",
        "A Clockwork Orange",
        "Moonlight",
        "Whiplash",
        "Shutter Island",
        "The Big Short",
        "The Wolf of Wall Street",
        "Blade Runner 2049",
        "Jumanji: Welcome to the Jungle",
        "Deadpool",
        "The Matrix Reloaded",
        "Guardians of the Galaxy",
        "Wonder Woman",
        "King Kong",
        "Jurassic World",
        "The King's Speech",
        "Zootopia",
        "The Truman Show",
        "Her",
        "The Secret Life of Walter Mitty",
        "Django Unchained",
        "Inglourious Basterds",
        "Pulp Fiction",
        "The Grand Budapest Hotel",
        "The Hobbit: An Unexpected Journey",
        "Iron Man",
        "Shrek",
        "The Wolf of Wall Street",
        "The Conjuring",
        "Blade Runner",
        "Avengers: Age of Ultron",
        "Deadpool 2",
        "Logan",
        "Star Wars: The Last Jedi",
        "Jurassic Park: The Lost World",
        "The Lord of the Rings: The Return of the King"
    ],
    countries: [
        "Canada",
        "Brazil",
        "Germany",
        "Japan",
        "Australia",
        "India",
        "Nigeria",
        "France",
        "Mexico",
        "Italy",
        "United States",
        "United Kingdom",
        "South Korea",
        "Russia",
        "China",
        "South Africa",
        "Argentina",
        "Spain",
        "Egypt",
        "Thailand",
        "New Zealand",
        "Sweden",
        "Norway",
        "Chile",
        "Switzerland",
        "Netherlands",
        "Greece",
        "Turkey",
        "Saudi Arabia",
        "Malaysia",
        "Israel",
        "Poland",
        "Vietnam",
        "Indonesia",
        "Colombia",
        "Ukraine",
        "Peru",
        "Portugal",
        "Belgium",
        "Finland",
        "Denmark",
        "Czech Republic",
        "Hungary",
        "Romania",
        "Switzerland",
        "Pakistan",
        "Bangladesh",
        "Philippines",
        "Iraq",
        "Afghanistan",
        "Kenya",
        "Uganda",
        "Tanzania",
        "Singapore",
        "Qatar",
        "Kuwait",
        "Oman",
        "Bahrain",
        "Egypt",
        "Belarus",
        "Cuba",
        "Bolivia",
        "Paraguay",
        "Costa Rica",
        "Honduras",
        "Panama",
        "Guatemala",
        "Ecuador",
        "Suriname",
        "Armenia",
        "Azerbaijan",
        "Georgia",
        "Uzbekistan",
        "Kazakhstan",
        "Kyrgyzstan",
        "Turkmenistan",
        "Mongolia",
        "Sri Lanka",
        "Laos",
        "Cambodia",
        "Nepal",
        "Mauritius",
        "Seychelles",
        "Maldives",
        "Iceland",
        "Malta",
        "Cyprus",
        "Estonia",
        "Latvia",
        "Lithuania",
        "Slovenia",
        "Bulgaria",
        "Albania",
        "Macedonia",
        "Kosovo",
        "Montenegro",
        "Bosnia and Herzegovina"
    ]
};

const companyHints = {
    "Google": "Search engine giant and Android creator.",
    "Apple": "iPhone and MacBook maker.",
    "Microsoft": "Windows OS and Office Suite company.",
    "Amazon": "E-commerce and cloud computing leader.",
    "Meta": "Owns Facebook, Instagram, and WhatsApp.",
    "Tesla": "Electric vehicles and SpaceX sibling company.",
    "Netflix": "Streaming platform known for originals.",
    "Nvidia": "Graphics cards and AI hardware leader.",
    "IBM": "Oldest tech firm, known for enterprise services.",
    "Adobe": "Creative software like Photoshop and Illustrator.",
    "Salesforce": "CRM and cloud business software provider.",
    "Intel": "Chipmaker famous for powering PCs.",
    "Oracle": "Enterprise databases and cloud services.",
    "Spotify": "Music streaming app with playlists and podcasts.",
    "Airbnb": "Short-term home and apartment rentals.",
    "Uber": "Ridesharing and food delivery company.",
    "Shopify": "E-commerce platform for online stores.",
    "Snap Inc.": "Company behind Snapchat.",
    "Zoom": "Popular video conferencing tool.",
    "Dropbox": "Cloud file storage and sharing.",
    "Reddit": "Forum-style website with subreddits.",
    "Twitter": "Short-form social media platform, now called X.",
    "Square": "Payment processing company from Block Inc.",
    "Stripe": "Online payment and checkout APIs.",
    "Coinbase": "Cryptocurrency exchange for BTC, ETH, etc.",
    "Palantir": "Data analytics firm used by governments.",
    "Slack": "Work messaging and collaboration app.",
    "Asana": "Task and project management software.",
    "GitHub": "Code hosting platform using Git.",
    "Atlassian": "Makes Jira, Confluence, and Bitbucket.",
    "Pinterest": "Visual discovery and pinboard platform.",
    "TikTok": "Short-form video app from China.",
    "DoorDash": "Food delivery from restaurants.",
    "Instacart": "Grocery delivery app.",
    "Twitch": "Live-streaming platform, popular for gaming.",
    "Robinhood": "Commission-free stock trading app.",
    "WeWork": "Shared coworking space provider.",
    "LinkedIn": "Professional networking platform.",
    "Bitbucket": "Git-based code hosting like GitHub.",
    "Hulu": "Streaming platform for TV shows and movies.",
    "DigitalOcean": "Cloud hosting for developers.",
    "Cloudflare": "Web performance and DDoS protection.",
    "Databricks": "AI and big data platform built on Apache Spark.",
    "OpenAI": "Creator of ChatGPT and other AI tools.",
    "Anthropic": "AI safety research company (Claude AI).",
    "DeepMind": "Google's AI research lab (AlphaGo, AlphaFold).",
    "Grammarly": "AI writing assistant for grammar and tone.",
    "Canva": "Design tool for non-designers.",
    "Figma": "Collaborative UI/UX design software.",
    "Replit": "Browser-based code editor and dev platform."
};

const gameHints = {
    // Video Games
    "Fortnite": "Battle royale with building mechanics.",
    "Minecraft": "Blocky sandbox game of survival and creativity.",
    "Call of Duty": "Military first-person shooter franchise.",
    "Grand Theft Auto": "Open-world crime and driving adventure.",
    "The Legend of Zelda": "Adventure game with Link and puzzles.",
    "Super Mario Bros.": "Classic platformer featuring a plumber.",
    "League of Legends": "Team-based MOBA with champions and lanes.",
    "Counter-Strike": "Terrorists vs. Counter-Terrorists shooter.",
    "Valorant": "Tactical FPS with character abilities.",
    "Elden Ring": "Open-world fantasy RPG by FromSoftware.",

    // Board Games
    "Monopoly": "Buy properties and bankrupt opponents.",
    "Chess": "Strategic game with kings and pawns.",
    "Scrabble": "Build words with letter tiles.",
    "Risk": "Conquer the world through dice and armies.",
    "Settlers of Catan": "Trade and build settlements for victory.",
    "Clue": "Solve the mystery of who did it.",
    "Checkers": "Jump and capture your opponent’s pieces.",
    "Battleship": "Guess grid coordinates to sink ships.",
    "Carrom": "Flick coins into pockets on a square board.",
    "Ticket to Ride": "Collect train cards and connect cities.",

    // Card Games
    "Poker": "Bet and bluff with ranked card hands.",
    "Blackjack": "Get 21 without going over.",
    "Uno": "Match cards by color or number.",
    "Go Fish": "Ask for cards and make pairs.",
    "Solitaire": "Classic single-player card-stacking game.",
    "Bridge": "Complex trick-taking partnership game.",
    "Hearts": "Avoid getting heart cards or the queen of spades.",
    "Rummy": "Form sets and runs to win.",
    "Crazy Eights": "Play matching eights and skip turns.",
    "Magic: The Gathering": "Strategic fantasy card duels.",

    // Party Games
    "Charades": "Act out words without speaking.",
    "Pictionary": "Draw clues for your team to guess.",
    "Heads Up!": "Hold a card on your head and guess.",
    "Truth or Dare": "Answer a question or do a task.",
    "Mafia": "Deduce who the killers are.",
    "Twister": "Place body parts on colored circles.",
    "Cards Against Humanity": "Fill-in-the-blank card game for adults.",
    "Taboo": "Describe a word without using certain clues.",

    // Classic Mini-Games
    "Tetris": "Fit falling blocks to make lines.",
    "Pac-Man": "Eat pellets and dodge ghosts.",
    "Snake": "Grow your snake without hitting walls.",
    "Flappy Bird": "Tap to fly and dodge pipes.",
    "Space Invaders": "Shoot aliens before they land.",
    "Doodle Jump": "Bounce upwards avoiding gaps and enemies.",

    // Outdoor/Playground Games
    "Tag": "Run and touch someone to make them 'it'.",
    "Hide and Seek": "Hide while one player searches.",
    "Hopscotch": "Jump through numbered squares.",
    "Capture the Flag": "Steal the enemy’s flag and return it.",
    "Kickball": "Kick a ball and run bases.",
    "Dodgeball": "Throw balls to eliminate players.",
    "Red Rover": "Break through linked arms in a line."
};

const movieHints = {
    "The Godfather": "A mafia don tries to balance family loyalty and criminal empire.",
    "The Shawshank Redemption": "A wrongly imprisoned man uses hope and cleverness to survive.",
    "The Dark Knight": "A masked vigilante faces chaos brought by a criminal mastermind.",
    "Titanic": "A tragic love story set aboard a doomed ocean liner.",
    "Avatar": "A soldier on an alien world becomes part of a native tribe.",
    "The Avengers": "Earth's mightiest heroes unite to stop an alien invasion.",
    "Star Wars: A New Hope": "A farm boy joins a rebellion to battle a galactic empire.",
    "Jurassic Park": "Dinosaurs roam again in a theme park gone wrong.",
    "Forrest Gump": "A man with a simple mind recounts an extraordinary life.",
    "Pulp Fiction": "Interwoven stories of crime, hitmen, and redemption.",
    "The Lion King": "A lion cub’s journey from exile to king of the savannah.",
    "Inception": "Thieves enter dreams to plant an idea in someone's mind.",
    "Gladiator": "A betrayed general seeks revenge in ancient Rome.",
    "The Matrix": "A hacker learns reality is a computer simulation.",
    "Jaws": "A shark terrorizes a beach town in a summer of fear.",
    "The Silence of the Lambs": "An FBI trainee consults a killer to catch another.",
    "Fight Club": "An insomniac forms a secret society to escape his dull life.",
    "Schindler's List": "A businessman rescues Jews during the Holocaust.",
    "The Lord of the Rings: The Fellowship of the Ring": "A hobbit begins a journey to destroy a powerful ring.",
    "Back to the Future": "A teen travels through time in a DeLorean.",
    "The Terminator": "A cyborg assassin travels from the future to kill.",
    "The Godfather Part II": "Parallel tales of a mafia don's rise and his son’s descent.",
    "Interstellar": "Astronauts search for a new home among the stars.",
    "Frozen": "A princess seeks her sister who has magical ice powers.",
    "Black Panther": "A king defends his advanced African nation and legacy.",
    "The Dark Knight Rises": "A reclusive hero returns to save a besieged city.",
    "The Wizard of Oz": "A girl journeys through a magical land to return home.",
    "Spider-Man: No Way Home": "Multiverse mayhem brings together different Spider-Men.",
    "The Hunger Games": "A girl fights for survival in a deadly televised competition.",
    "The Social Network": "The rise of Facebook and its controversial founder.",
    "E.T. the Extra-Terrestrial": "A boy helps a stranded alien return home.",
    "Coco": "A boy enters the Land of the Dead to learn his family’s secrets.",
    "Toy Story": "Toys come to life when humans aren’t around.",
    "Pirates of the Caribbean: The Curse of the Black Pearl": "A pirate seeks a cursed treasure and his ship.",
    "The Incredibles": "A superhero family comes out of hiding to save the world.",
    "The Prestige": "Rival magicians battle through illusions and obsession.",
    "La La Land": "A musician and actress fall in love while chasing dreams.",
    "The Big Lebowski": "A laid-back man is mistaken for someone else, causing chaos.",
    "The Godfather Part III": "The aging don tries to legitimize the family business.",
    "The Avengers: Endgame": "Heroes fight to undo a universe-altering catastrophe.",
    "Mad Max: Fury Road": "A post-apocalyptic chase for freedom and redemption.",
    "Goodfellas": "A rise and fall tale of life in the mob.",
    "Saving Private Ryan": "Soldiers search for a missing brother in WWII.",
    "The Great Gatsby": "A mysterious millionaire hosts lavish parties hiding deep secrets.",
    "The Revenant": "A frontiersman fights for survival and revenge after betrayal.",
    "12 Angry Men": "One juror challenges others in a tense murder trial debate.",
    "A Clockwork Orange": "A violent youth undergoes radical psychological conditioning.",
    "Moonlight": "A young man's journey of identity, love, and struggle.",
    "Whiplash": "An ambitious drummer clashes with a ruthless music teacher.",
    "Shutter Island": "A U.S. Marshal investigates a mysterious psychiatric facility.",
    "The Big Short": "A group of outsiders bet against the 2008 financial system.",
    "The Wolf of Wall Street": "A stockbroker’s rise and excesses lead to a wild downfall.",
    "Blade Runner 2049": "A replicant-hunting officer uncovers a life-altering secret.",
    "Jumanji: Welcome to the Jungle": "Teens are pulled into a jungle video game world.",
    "Deadpool": "A wise-cracking antihero seeks revenge and love.",
    "The Matrix Reloaded": "Rebels fight to fulfill a prophecy in a virtual world.",
    "Guardians of the Galaxy": "Misfits unite to protect a powerful cosmic relic.",
    "Wonder Woman": "An Amazon warrior leaves her island to end a great war.",
    "King Kong": "A giant ape is taken from his island and brought to New York.",
    "Jurassic World": "A new dinosaur attraction spirals out of control.",
    "The King's Speech": "A reluctant king overcomes a speech impediment.",
    "Zootopia": "A rabbit cop and a fox con artist uncover a citywide conspiracy.",
    "The Truman Show": "A man slowly discovers his life is a TV show.",
    "Her": "A lonely man falls in love with an AI operating system.",
    "The Secret Life of Walter Mitty": "A daydreamer embarks on a real global adventure.",
    "Django Unchained": "A freed slave seeks to rescue his wife from a brutal plantation.",
    "Inglourious Basterds": "A group of soldiers plot to end WWII through assassination.",
    "The Grand Budapest Hotel": "A concierge and his protégé get caught in a murder plot.",
    "The Hobbit: An Unexpected Journey": "A hobbit joins dwarves on a quest to reclaim their homeland.",
    "Iron Man": "A billionaire builds a high-tech suit to escape captivity and fight crime.",
    "Shrek": "An ogre must rescue a princess and ends up on an unexpected journey.",
    "The Conjuring": "Paranormal investigators face a dark presence in a haunted house.",
    "Blade Runner": "A detective hunts synthetic humans in a dystopian future.",
    "Avengers: Age of Ultron": "A rogue AI threatens the world, forcing heroes to unite again.",
    "Deadpool 2": "The antihero builds a team to save a mutant boy from a time-traveling soldier.",
    "Logan": "An aging mutant protects a young girl with familiar powers.",
    "Star Wars: The Last Jedi": "The Resistance fights the First Order amid Jedi legacies.",
    "Jurassic Park: The Lost World": "Dinosaurs roam a second island and are brought to the mainland.",
    "The Lord of the Rings: The Return of the King": "The final battle for Middle-earth unfolds."
};

const countryHints = {
    "Canada": "Known for its vast landscapes, maple syrup, and being the second-largest country by area.",
    "Brazil": "Home to the Amazon Rainforest and famous for Carnival and football.",
    "Germany": "Renowned for its engineering, Oktoberfest, and historical castles.",
    "Japan": "An island nation known for anime, sushi, and advanced technology.",
    "Australia": "Famous for its wildlife, the Outback, and the Great Barrier Reef.",
    "India": "The world's largest democracy and birthplace of yoga and spicy cuisine.",
    "Nigeria": "Africa’s most populous country, known for Nollywood and oil exports.",
    "France": "Celebrated for its cuisine, fashion, and the Eiffel Tower.",
    "Mexico": "Rich in ancient civilizations like the Aztecs and famous for tacos.",
    "Italy": "Home of the Roman Empire, pizza, and Renaissance art.",
    "United States": "A global superpower known for innovation, Hollywood, and diversity.",
    "United Kingdom": "A historic monarchy and the birthplace of the English language.",
    "South Korea": "A tech-savvy nation known for K-pop and high-speed internet.",
    "Russia": "The largest country in the world, known for cold winters and rich history.",
    "China": "Home to the Great Wall, it has the largest population on Earth.",
    "South Africa": "Known for its wildlife, Nelson Mandela, and diverse cultures.",
    "Argentina": "Land of tango, beef, and breathtaking Patagonia landscapes.",
    "Spain": "Famous for flamenco, paella, and historic architecture.",
    "Egypt": "Home to ancient pyramids and one of the world's oldest civilizations.",
    "Thailand": "Known for its beaches, temples, and delicious street food.",
    "New Zealand": "Scenic landscapes and the filming location of 'The Lord of the Rings'.",
    "Sweden": "Known for IKEA, ABBA, and innovative social systems.",
    "Norway": "Famous for fjords, northern lights, and high quality of life.",
    "Chile": "A long, narrow country known for the Andes and Easter Island.",
    "Switzerland": "Neutral in wars, famous for chocolate, mountains, and banking.",
    "Netherlands": "Known for windmills, tulips, canals, and cycling culture.",
    "Greece": "The birthplace of democracy and Western philosophy.",
    "Turkey": "A transcontinental country rich in history, bridging Europe and Asia.",
    "Saudi Arabia": "Home to Mecca and rich in oil resources.",
    "Malaysia": "Diverse cultures and rainforests meet modern skyscrapers.",
    "Israel": "Historic land important to three major religions.",
    "Poland": "Known for its history, hearty cuisine, and medieval towns.",
    "Vietnam": "Rich in history, known for its cuisine and scenic landscapes.",
    "Indonesia": "An archipelago with thousands of islands and active volcanoes.",
    "Colombia": "Known for coffee, music, and vibrant culture.",
    "Ukraine": "A country with deep cultural roots and fertile farmland.",
    "Peru": "Home to Machu Picchu and ancient Incan heritage.",
    "Portugal": "Famous for explorers, fado music, and custard tarts.",
    "Belgium": "Known for chocolate, waffles, and the EU headquarters.",
    "Finland": "Land of saunas, Santa Claus, and top-tier education.",
    "Denmark": "A Scandinavian nation known for happiness and design.",
    "Czech Republic": "Home to Prague and a rich medieval history.",
    "Hungary": "Known for thermal baths, paprika, and its capital Budapest.",
    "Romania": "Land of castles, Carpathian mountains, and Dracula legends.",
    "Pakistan": "Rich in culture and home to part of the Himalayas.",
    "Bangladesh": "Densely populated, known for textiles and river deltas.",
    "Philippines": "An island nation famous for beaches and friendly people.",
    "Iraq": "The cradle of civilization with ancient Mesopotamian roots.",
    "Afghanistan": "Mountainous and historic, often at the crossroads of empires.",
    "Kenya": "Famous for safaris and the Great Rift Valley.",
    "Uganda": "Known for its biodiversity and the source of the Nile.",
    "Tanzania": "Home to Mount Kilimanjaro and Serengeti National Park.",
    "Singapore": "A city-state with a thriving economy and strict laws.",
    "Qatar": "A wealthy Gulf country known for gas exports and modern architecture.",
    "Kuwait": "Oil-rich and located on the Arabian Peninsula.",
    "Oman": "A peaceful Gulf state known for deserts and forts.",
    "Bahrain": "An island nation in the Persian Gulf with a modern economy.",
    "Belarus": "Landlocked and rich in Soviet-era history.",
    "Cuba": "A Caribbean island known for cigars, salsa, and revolution.",
    "Bolivia": "High-altitude nation with salt flats and indigenous cultures.",
    "Paraguay": "A landlocked South American country with a bilingual culture.",
    "Costa Rica": "Famous for ecotourism, rainforests, and no military.",
    "Honduras": "Central American country known for Mayan ruins and jungles.",
    "Panama": "Home to a key canal connecting the Atlantic and Pacific Oceans.",
    "Guatemala": "Rich in Mayan history and volcanic landscapes.",
    "Ecuador": "Straddles the equator and includes the Galápagos Islands.",
    "Suriname": "South America's smallest country, culturally diverse.",
    "Armenia": "An ancient Christian nation in the Caucasus.",
    "Azerbaijan": "Rich in oil and a blend of East and West cultures.",
    "Georgia": "Known for wine, mountains, and a distinct alphabet.",
    "Uzbekistan": "Home to Silk Road cities like Samarkand and Bukhara.",
    "Kazakhstan": "Vast steppes and the largest landlocked country.",
    "Kyrgyzstan": "A mountainous Central Asian country with nomadic culture.",
    "Turkmenistan": "Known for its desert landscapes and gas reserves.",
    "Mongolia": "Land of Genghis Khan and vast grasslands.",
    "Sri Lanka": "An island with ancient temples and tea plantations.",
    "Laos": "A landlocked Southeast Asian nation with Buddhist traditions.",
    "Cambodia": "Home to the Angkor Wat temple complex.",
    "Nepal": "Home to Mount Everest and sacred Hindu temples.",
    "Mauritius": "An Indian Ocean island known for beaches and biodiversity.",
    "Seychelles": "A luxury island paradise in the Indian Ocean.",
    "Maldives": "Tropical nation of atolls, famous for clear waters and resorts.",
    "Iceland": "Land of volcanoes, geysers, and northern lights.",
    "Malta": "A Mediterranean island with ancient history and fortresses.",
    "Cyprus": "An island nation with Greek and Turkish heritage.",
    "Estonia": "A digital society with medieval towns and Baltic charm.",
    "Latvia": "A Baltic state known for forests and Art Nouveau architecture.",
    "Lithuania": "A Baltic country with rich traditions and history.",
    "Slovenia": "Alpine scenery, lakes, and a blend of Slavic and Western cultures.",
    "Bulgaria": "Rich in folklore, Orthodox churches, and Black Sea resorts.",
    "Albania": "Balkan country with Adriatic beaches and mountain villages.",
    "Macedonia": "Now officially North Macedonia; rich in ancient history.",
    "Kosovo": "Europe's newest country with a youthful energy.",
    "Montenegro": "Adriatic coastline and dramatic mountain landscapes.",
    "Bosnia and Herzegovina": "Known for its cultural mix and post-war recovery."
};


const categoryEmojis = {
    companies: "🏢",
    games: "🎮",
    animals: "🐾",
    sports: "🏀",
    foods: "🥡",
    movies: "🎞️",
    countries: "🌍"
};

async function getWordAndDefinitionFromCategory(category) {
    const wordList = wordBanks[category];
    const randomIndex = Math.floor(Math.random() * wordList.length);
    const word = wordList[randomIndex];

    if (!wordList || !Array.isArray(wordList) || wordList.length === 0) {
        console.error(`❌ Invalid or empty word bank for category: "${category}"`);
        throw new Error(`No words found for category: "${category}"`);
    }



    let definition;
    if (category === 'companies') {
        definition = companyHints[word] || 'No hint available for this company!'
    } else if (category === 'games') {
        definition = gameHints[word] || 'No hint available for this game!'
    } else if (category === 'movies') {
        definition = movieHints[word] || 'No hint available for this movie!'
    } else if (category === 'countries') {
        definition = countryHints[word] || 'No hint available for this country!'
    } else {
        definition = await fetchDefinition(word);
    }


    return { word, definition };
}

async function fetchDefinition(word) {
    const url = `https://wordsapiv1.p.rapidapi.com/words/${word}`;

    const options = {
        method: 'GET',
        headers: {
            'X-RapidAPI-Key': '7700b1b3bcmsh51f46aef18cf6d9p1d34d0jsn7a42964924fc',
            'X-RapidAPI-Host': 'wordsapiv1.p.rapidapi.com'
        }
    };

    try {
        const response = await fetch(url, options);
        const data = await response.json();
        return data.results?.[0]?.definition || 'No hint available.';
    } catch (error) {
        console.error('Error fetching definition:', error);
        return 'No hint available.';
    }
}

let currentCategory = '';
function selectCategory(category) {
    // Set the selected category in a global variable or pass it to the game initialization function
    currentCategory = category;  // Store the selected category
    console.log(`Category selected: ${category}`);
}


async function typeHintText(element, text, delay = 50) {
    element.textContent = ''; // Clear existing content
    for (let i = 0; i < text.length; i++) {
        element.textContent += text[i];
        await new Promise(resolve => setTimeout(resolve, delay));
    }
}




// Hint Logic for category

async function showHint(word) {
    const data = await fetchDefinition(word);

}




const categories = Object.keys(wordBanks);

function categoryDisplay() {
    const categoriesWindow = document.getElementById('categories');
    categoriesWindow.innerHTML = '';

    categories.forEach(category => {
        const button = document.createElement('button');
        const emoji = categoryEmojis[category] || ""; // fallback in case no emoji is defined
        button.textContent = `${emoji} ${category.charAt(0).toUpperCase() + category.slice(1)}`;
        button.classList.add('category-button');
        button.setAttribute('data-category', category);
        button.addEventListener('click', () => {
            selectCategory(category);
        });
        categoriesWindow.appendChild(button);
    });
}



categoryDisplay();



async function startHangoverCategoryGame(category) {
    console.log("📛 Category Received:", category);


    const { word, definition } = await getWordAndDefinitionFromCategory(category);


    if (wordRounds <= 0) {
        alert('Game Over! You have completed all rounds.');
        wordRounds = 5; // Reset the rounds if you want to allow another playthrough
        return;
    }


    console.log("🎯 Word:", word);
    console.log("💡 Hint:", definition);

    initializeGameWithWord(word);      // Initialize the game board
    generateLetterButtons();           // Reset letters
    wordRounds--;                      // Decrease round count
}
// Auto-run only if browser
if (typeof window !== 'undefined') {
    generateLetterButtons();
}
