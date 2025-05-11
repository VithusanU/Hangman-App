globalThis.currentWord = '';
globalThis.guessedLetters = [];
globalThis.currentHint = '';
let wordsToGuess = []; //The list of words
let currentWordIndex = 0;
let wordRounds = 0;
let totalLives = 7; // default
let livesLeft = totalLives;
globalThis.currentMode = ''; // Default to an empty string
const letterBtnSound = document.getElementById('letter-sound');


// Fetch a random word
async function getRandomWord() {
    try {
        let word = '';
        do {
            const response = await fetch('https://random-word-api.herokuapp.com/word?number=1');
            const data = await response.json();
            word = data[0];
        } while (word.length < 3 || word.length > 7); // Keep fetching until we get a word of the correct length
        console.log('Random Word:', word);
        return word.toLowerCase();
    } catch (error) {
        console.error('Failed to get word:', error);
        return 'fallback'; // Provide a fallback word in case of an error
    }
}

// Initialize the game board with underscores
async function initializeGameWithWord(word) {
    currentWord = word;
    guessedLetters = [];

    const currentHint = await fetchDefinition(currentWord);

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

    const word = await getRandomWord();
    initializeGameWithWord(word);
    generateLetterButtons(); // recreate all buttons fresh every new round
    // Reduce remaining rounds
    wordRounds--;
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

    // Play the sound
    letterBtnSound.currentTime = 0; // Reset to the beginning
    letterBtnSound.play();

    // Stop the sound after a short period (e.g., 200 milliseconds)
    setTimeout(() => {
        letterBtnSound.pause();
    }, 400);  // Adjust 200 to the length you want (in milliseconds)

    if (guessedLetters.includes(lowerLetter)) return;
    guessedLetters.push(lowerLetter);

    if (currentWord.includes(lowerLetter)) {
        console.log(`Correct guess: ${letter}`);
        button.style.backgroundColor = 'green';
        button.style.color = 'white';
        const wordDisplay = document.getElementById('chosen-word');
        const spans = wordDisplay.querySelectorAll('span');

        for (let i = 0; i < currentWord.length; i++) {
            if (currentWord[i] === lowerLetter) {
                spans[i].textContent = currentWord[i];
            }
        }

        checkWinCondition(); // If this is defined
    } else {
        console.log(`Wrong guess: ${letter}`);
        button.style.backgroundColor = 'red';
        button.style.color = 'white';

        handleWrongGuess(); // Optional function
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
        if (wordRounds > 0) {
            alert('You guessed the word! Moving on to the next word...');
            startHangoverGame();
        } else {
            endGame(true);
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
    startHangoverGame(); // Assuming this starts the game again with a new word
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
    countries : [
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

    let definition;
    if (category === 'companies') {
        definition = companyHints[word] || 'No hint available for this company!'
    } else if (category === 'games') {
        definition = gameHints[word] || 'No hint available for this game!'
    }
    else {
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


async function startCategoryGame(category) {
    const { word, definition } = await getWordAndDefinitionFromCategory(category);

    console.log("🎯 Chosen Word:", word);
    console.log("💡 Hint (Definition):", definition);

}

async function typeHintText(element, text, delay = 50) {
    element.textContent = ''; // Clear existing content
    for (let i = 0; i < text.length; i++) {
        element.textContent += text[i];
        await new Promise(resolve => setTimeout(resolve, delay));
    }
}

startCategoryGame('sports');

// Hint Logic for category

async function showHint(word) {
    const data = await fetchDefinition(word);

}




const categories = Object.keys(wordBanks);

function categoryDisplay() {
    const categoriesWindow= document.getElementById('categories');
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






// Auto-run only if browser
if (typeof window !== 'undefined') {
    generateLetterButtons();
}
