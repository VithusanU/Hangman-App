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
const timer = document.getElementById('timer');
let gameTimer; // Define once globally

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

async function initializeGameWithWord(word, definition) {
    // Convert underscores to spaces if needed
    currentWord = word.replace(/_/g, ' ');
    guessedLetters = [];
    currentHint = definition;

    const hintDisplay = document.getElementById('hint');
    if (hintDisplay) {
        await typeHintText(hintDisplay, `Hint: ${currentHint}`, 40);

        // 👇 Start or resume timer here after hint is done typing
        if (!gameTimer) {
            gameTimer = new ControllableTimer(
                60,
                (timeLeft) => document.getElementById('timer-display').textContent = timeLeft,
                () => alert("⏰ Time's up!")
            );
        } else {
            gameTimer.reset(); // Reset to full time
        }
        gameTimer.start(); // Start countdown
    }

    const wordDisplay = document.getElementById('chosen-word');
    if (wordDisplay) {
        wordDisplay.innerHTML = '';

        for (let letter of currentWord) {
            const letterSpan = document.createElement('span');

            if (letter === ' ') {
                letterSpan.textContent = ' ';
                letterSpan.classList.add('letter', 'space');
            } else {
                letterSpan.textContent = '';
                letterSpan.classList.add('letter');
            }

            wordDisplay.appendChild(letterSpan);
        }
    }

    console.log("Game Initialized with word:", currentWord);
    console.log('This is the Hint:', currentHint);

    globalThis.currentWord = currentWord;
    globalThis.guessedLetters = guessedLetters;
    globalThis.currentHint = currentHint;
}




// Start game using fetched word
async function startHangoverGame() {
    // ⏸ Pause any existing timer before doing anything else
    if (gameTimer) gameTimer.pause();

    if (wordRounds <= 0) {
        alert('Game Over! You have completed all rounds.');
        wordRounds = 5; // Reset the rounds if you want to allow another playthrough
        return;
    }
    console.trace("🕹️ startHangoverGame called");
    const { word, definition } = await getRandomWord(); 
    await initializeGameWithWord(word, definition); // Timer will be resumed there
    generateLetterButtons(); 
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
    if (letter === ' ') return; // Prevent guessing spaces

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

let playAgainInitialized = false;

function initPlayAgainButton() {
    if (playAgainInitialized) return; // Prevent multiple listeners
    playAgainInitialized = true;
    console.log("🔘 Play Again listener added");
    const playAgainButton = document.getElementById('playAgain');
    playAgainButton.addEventListener('click', () => {
        sound.play();
        livesLeft = totalLives;
        bodyParts.forEach(part => part.style.display = 'none');
        renderLives();
        resetGame();
    });
}



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
        "Sea_Turtle",
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
        "Ice_Cream",
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
        "Table_Tennis",
        "Badminton",
        "Swimming",
        "Cycling",
        "Track_and_Field",
        "Boxing",
        "MMA",
        "Wrestling",
        "Gymnastics",
        "Skateboarding",
        "Surfing",
        "Skiing",
        "Snowboarding",
        "Lacrosse",
        "Field_Hockey",
        "Motorsport",
        "Archery",
        "Fencing",
        "Rowing",
        "Canoeing",
        "Kayaking",
        "Horse_Racing",
        "Equestrian",
        "Weightlifting",
        "Powerlifting",
        "Climbing",
        "Polo",
        "Ultimate_Frisbee",
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
        "Call_of_Duty",
        "Grand_Theft_Auto",
        "The_Legend_of_Zelda",
        "Super_Mario_Bros",
        "League_of_Legends",
        "Counter_Strike",
        "Valorant",
        "Elden_Ring",
    
        // Board Games
        "Monopoly",
        "Chess",
        "Scrabble",
        "Risk",
        "Settlers_of_Catan",
        "Clue",
        "Checkers",
        "Battleship",
        "Carrom",
        "Ticket_to_Ride",
    
        // Card Games
        "Poker",
        "Blackjack",
        "Uno",
        "Go_Fish",
        "Solitaire",
        "Bridge",
        "Hearts",
        "Rummy",
        "Crazy_Eights",
        "Magic_The_Gathering",
    
        // Party Games
        "Charades",
        "Pictionary",
        "Heads_Up",
        "Truth_or_Dare",
        "Mafia",
        "Twister",
        "Cards_Against_Humanity",
        "Taboo",
    
        // Classic Mini-Games
        "Tetris",
        "Pac_Man",
        "Snake",
        "Flappy_Bird",
        "Space_Invaders",
        "Doodle_Jump",
    
        // Outdoor/Playground Games
        "Tag",
        "Hide_and_Seek",
        "Hopscotch",
        "Capture_the_Flag",
        "Kickball",
        "Dodgeball",
        "Red_Rover"
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
        "Snap_Inc",
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
        "The_Godfather",
        "The_Shawshank_Redemption",
        "The_Dark_Knight",
        "Titanic",
        "Avatar",
        "The_Avengers",
        "Star_Wars_A_New_Hope",
        "Jurassic_Park",
        "Forrest_Gump",
        "Pulp_Fiction",
        "The_Lion_King",
        "Inception",
        "Gladiator",
        "The_Matrix",
        "Jaws",
        "The_Silence_of_the_Lambs",
        "Fight_Club",
        "Schindlers_List",
        "The_Lord_of_the_Rings_The_Fellowship_of_the_Ring",
        "Back_to_the_Future",
        "The_Terminator",
        "Interstellar",
        "Frozen",
        "Black_Panther",
        "The_Dark_Knight_Rises",
        "The_Wizard_of_Oz",
        "Spider_Man_No_Way_Home",
        "The_Hunger_Games",
        "The_Social_Network",
        "ET_the_Extra_Terrestrial",
        "Coco",
        "Toy_Story",
        "Pirates_of_the_Caribbean_The_Curse_of_the_Black_Pearl",
        "The_Incredibles",
        "The_Prestige",
        "La_La_Land",
        "The_Big_Lebowski",
        "The_Avengers_Endgame",
        "Mad_Max_Fury_Road",
        "Goodfellas",
        "Saving_Private_Ryan",
        "The_Great_Gatsby",
        "The_Revenant",
        "A_Clockwork_Orange",
        "Moonlight",
        "Whiplash",
        "Shutter_Island",
        "The_Big_Short",
        "The_Wolf_of_Wall_Street",
        "Blade_Runner",
        "Jumanji_Welcome_to_the_Jungle",
        "Deadpool",
        "The_Matrix_Reloaded",
        "Guardians_of_the_Galaxy",
        "Wonder_Woman",
        "King_Kong",
        "Jurassic_World",
        "The_Kings_Speech",
        "Zootopia",
        "The_Truman_Show",
        "Her",
        "The_Secret_Life_of_Walter_Mitty",
        "Django_Unchained",
        "Inglourious_Basterds",
        "The_Grand_Budapest_Hotel",
        "The_Hobbit_An_Unexpected_Journey",
        "Iron_Man",
        "Shrek",
        "The_Conjuring",
        "Avengers_Age_of_Ultron",
        "Logan",
        "Star_Wars_The_Last_Jedi",
        "Jurassic_Park_The_Lost_World",
        "The_Lord_of_the_Rings_The_Return_of_the_King"
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
        "United_States",
        "United_Kingdom",
        "South_Korea",
        "Russia",
        "China",
        "South_Africa",
        "Argentina",
        "Spain",
        "Egypt",
        "Thailand",
        "New_Zealand",
        "Sweden",
        "Norway",
        "Chile",
        "Switzerland",
        "Netherlands",
        "Greece",
        "Turkey",
        "Saudi_Arabia",
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
        "Czech_Republic",
        "Hungary",
        "Romania",
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
        "Belarus",
        "Cuba",
        "Bolivia",
        "Paraguay",
        "Costa_Rica",
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
        "Sri_Lanka",
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
        "Bosnia_and_Herzegovina"
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
    "Call_of_Duty": "Military first-person shooter franchise.",
    "Grand_Theft_Auto": "Open-world crime and driving adventure.",
    "The_Legend_of_Zelda": "Adventure game with Link and puzzles.",
    "Super_Mario_Bros": "Classic platformer featuring a plumber.",
    "League_of_Legends": "Team-based MOBA with champions and lanes.",
    "Counter_Strike": "Terrorists vs. Counter-Terrorists shooter.",
    "Valorant": "Tactical FPS with character abilities.",
    "Elden_Ring": "Open-world fantasy RPG by FromSoftware.",

    // Board Games
    "Monopoly": "Buy properties and bankrupt opponents.",
    "Chess": "Strategic game with kings and pawns.",
    "Scrabble": "Build words with letter tiles.",
    "Risk": "Conquer the world through dice and armies.",
    "Settlers_of_Catan": "Trade and build settlements for victory.",
    "Clue": "Solve the mystery of who did it.",
    "Checkers": "Jump and capture your opponent’s pieces.",
    "Battleship": "Guess grid coordinates to sink ships.",
    "Carrom": "Flick coins into pockets on a square board.",
    "Ticket_to_Ride": "Collect train cards and connect cities.",

    // Card Games
    "Poker": "Bet and bluff with ranked card hands.",
    "Blackjack": "Get 21 without going over.",
    "Uno": "Match cards by color or number.",
    "Go_Fish": "Ask for cards and make pairs.",
    "Solitaire": "Classic single-player card-stacking game.",
    "Bridge": "Complex trick-taking partnership game.",
    "Hearts": "Avoid getting heart cards or the queen of spades.",
    "Rummy": "Form sets and runs to win.",
    "Crazy_Eights": "Play matching eights and skip turns.",
    "Magic_The_Gathering": "Strategic fantasy card duels.",

    // Party Games
    "Charades": "Act out words without speaking.",
    "Pictionary": "Draw clues for your team to guess.",
    "Heads_Up": "Hold a card on your head and guess.",
    "Truth_or_Dare": "Answer a question or do a task.",
    "Mafia": "Deduce who the killers are.",
    "Twister": "Place body parts on colored circles.",
    "Cards_Against_Humanity": "Fill-in-the-blank card game for adults.",
    "Taboo": "Describe a word without using certain clues.",

    // Classic Mini-Games
    "Tetris": "Fit falling blocks to make lines.",
    "Pac_Man": "Eat pellets and dodge ghosts.",
    "Snake": "Grow your snake without hitting walls.",
    "Flappy_Bird": "Tap to fly and dodge pipes.",
    "Space_Invaders": "Shoot aliens before they land.",
    "Doodle_Jump": "Bounce upwards avoiding gaps and enemies.",

    // Outdoor/Playground Games
    "Tag": "Run and touch someone to make them 'it'.",
    "Hide_and_Seek": "Hide while one player searches.",
    "Hopscotch": "Jump through numbered squares.",
    "Capture_the_Flag": "Steal the enemy’s flag and return it.",
    "Kickball": "Kick a ball and run bases.",
    "Dodgeball": "Throw balls to eliminate players.",
    "Red_Rover": "Break through linked arms in a line."
};

const movieHints = {
    "The_Godfather": "A mafia don tries to balance family loyalty and criminal empire.",
    "The_Shawshank_Redemption": "A wrongly imprisoned man uses hope and cleverness to survive.",
    "The_Dark_Knight": "A masked vigilante faces chaos brought by a criminal mastermind.",
    "Titanic": "A tragic love story set aboard a doomed ocean liner.",
    "Avatar": "A soldier on an alien world becomes part of a native tribe.",
    "The_Avengers": "Earth's mightiest heroes unite to stop an alien invasion.",
    "Star_Wars_A_New_Hope": "A farm boy joins a rebellion to battle a galactic empire.",
    "Jurassic_Park": "Dinosaurs roam again in a theme park gone wrong.",
    "Forrest_Gump": "A man with a simple mind recounts an extraordinary life.",
    "Pulp_Fiction": "Interwoven stories of crime, hitmen, and redemption.",
    "The_Lion_King": "A lion cub’s journey from exile to king of the savannah.",
    "Inception": "Thieves enter dreams to plant an idea in someone's mind.",
    "Gladiator": "A betrayed general seeks revenge in ancient Rome.",
    "The_Matrix": "A hacker learns reality is a computer simulation.",
    "Jaws": "A shark terrorizes a beach town in a summer of fear.",
    "The_Silence_of_the_Lambs": "An FBI trainee consults a killer to catch another.",
    "Fight_Club": "An insomniac forms a secret society to escape his dull life.",
    "Schindlers_List": "A businessman rescues Jews during the Holocaust.",
    "The_Lord_of_the_Rings_The_Fellowship_of_the_Ring": "A hobbit begins a journey to destroy a powerful ring.",
    "Back_to_the_Future": "A teen travels through time in a DeLorean.",
    "The_Terminator": "A cyborg assassin travels from the future to kill.",
    "Interstellar": "Astronauts search for a new home among the stars.",
    "Frozen": "A princess seeks her sister who has magical ice powers.",
    "Black_Panther": "A king defends his advanced African nation and legacy.",
    "The_Dark_Knight_Rises": "A reclusive hero returns to save a besieged city.",
    "The_Wizard_of_Oz": "A girl journeys through a magical land to return home.",
    "Spider_Man_No_Way_Home": "Multiverse mayhem brings together different Spider-Men.",
    "The_Hunger_Games": "A girl fights for survival in a deadly televised competition.",
    "The_Social_Network": "The rise of Facebook and its controversial founder.",
    "ET_the_Extra_Terrestrial": "A boy helps a stranded alien return home.",
    "Coco": "A boy enters the Land of the Dead to learn his family’s secrets.",
    "Toy_Story": "Toys come to life when humans aren’t around.",
    "Pirates_of_the_Caribbean_The_Curse_of_the_Black_Pearl": "A pirate seeks a cursed treasure and his ship.",
    "The_Incredibles": "A superhero family comes out of hiding to save the world.",
    "The_Prestige": "Rival magicians battle through illusions and obsession.",
    "La_La_Land": "A musician and actress fall in love while chasing dreams.",
    "The_Big_Lebowski": "A laid-back man is mistaken for someone else, causing chaos.",
    "Mad_Max_Fury_Road": "A post-apocalyptic chase for freedom and redemption.",
    "Goodfellas": "A rise and fall tale of life in the mob.",
    "Saving_Private_Ryan": "Soldiers search for a missing brother in WWII.",
    "The_Great_Gatsby": "A mysterious millionaire hosts lavish parties hiding deep secrets.",
    "The_Revenant": "A frontiersman fights for survival and revenge after betrayal.",
    "A_Clockwork_Orange": "A violent youth undergoes radical psychological conditioning.",
    "Moonlight": "A young man's journey of identity, love, and struggle.",
    "Whiplash": "An ambitious drummer clashes with a ruthless music teacher.",
    "Shutter_Island": "A U.S. Marshal investigates a mysterious psychiatric facility.",
    "The_Wolf_of_Wall_Street": "A stockbroker’s rise and excesses lead to a wild downfall.",
    "Blade_Runner": "A detective hunts synthetic humans in a dystopian future.",
    "Jumanji_Welcome_to_the_Jungle": "Teens are pulled into a jungle video game world.",
    "Deadpool": "A wise-cracking antihero seeks revenge and love.",
    "Guardians_of_the_Galaxy": "Misfits unite to protect a powerful cosmic relic.",
    "Wonder_Woman": "An Amazon warrior leaves her island to end a great war.",
    "King_Kong": "A giant ape is taken from his island and brought to New York.",
    "Jurassic_World": "A new dinosaur attraction spirals out of control.",
    "The_Kings_Speech": "A reluctant king overcomes a speech impediment.",
    "Zootopia": "A rabbit cop and a fox con artist uncover a citywide conspiracy.",
    "The_Truman_Show": "A man slowly discovers his life is a TV show.",
    "Her": "A lonely man falls in love with an AI operating system.",
    "The_Secret_Life_of_Walter_Mitty": "A daydreamer embarks on a real global adventure.",
    "Django_Unchained": "A freed slave seeks to rescue his wife from a brutal plantation.",
    "Inglourious_Basterds": "A group of soldiers plot to end WWII through assassination.",
    "The_Grand_Budapest_Hotel": "A concierge and his protégé get caught in a murder plot.",
    "The_Hobbit_An_Unexpected_Journey": "A hobbit joins dwarves on a quest to reclaim their homeland.",
    "Iron_Man": "A billionaire builds a high-tech suit to escape captivity and fight crime.",
    "Shrek": "An ogre must rescue a princess and ends up on an unexpected journey.",
    "The_Conjuring": "Paranormal investigators face a dark presence in a haunted house.",
    "Logan": "An aging mutant protects a young girl with familiar powers."
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

const sportHints = {
    Soccer: "A game played with a round ball where players aim to score goals by kicking it into a net.",
    Basketball: "Players shoot a ball through a hoop to score points in this fast-paced court game.",
    Baseball: "A bat-and-ball game where players hit a ball and run bases to score.",
    Football: "Known for touchdowns and tackles, played with an oval ball mostly in the US.",
    Tennis: "Played on a court with rackets and a bouncing ball, either singles or doubles.",
    Golf: "A precision sport where players aim to hit balls into holes on a course with the fewest strokes.",
    Cricket: "A bat-and-ball game popular in many countries, featuring wickets and overs.",
    Rugby: "A contact sport similar to football but with continuous play and no forward passes.",
    Hockey: "Played on ice or field, where players use sticks to hit a puck or ball into a goal.",
    Volleyball: "Players use hands to hit a ball over a net to land it on the opponents side.",
    Table_Tennis: "A fast-paced racket game played on a small table with a lightweight ball.",
    Badminton: "A racket sport played with a shuttlecock that must not touch the ground.",
    Swimming: "A water-based sport involving strokes like freestyle, backstroke, and butterfly.",
    Cycling: "Competitive or recreational racing using bicycles on roads or tracks.",
    Track_and_Field: "Includes running, jumping, and throwing events usually held in stadiums.",
    Boxing: "A combat sport where two opponents fight using their fists and protective gloves.",
    MMA: "A full-contact sport combining techniques from boxing, wrestling, jiu-jitsu, and more.",
    Wrestling: "A grappling sport where opponents aim to pin or throw each other to win.",
    Gymnastics: "Features routines on bars, beams, and floors involving flips and strength.",
    Skateboarding: "A sport involving tricks and stunts performed on a wheeled board.",
    Surfing: "Riders use boards to glide on waves in the ocean.",
    Skiing: "Sliding down snowy slopes on two long narrow pieces of equipment.",
    Snowboarding: "Like skiing, but using a single board to ride snowy mountains.",
    Lacrosse: "A team sport where players use a stick with a net to catch and shoot a ball.",
    Field_Hockey: "Played on grass or turf, players use sticks to move a ball toward the goal.",
    Formula_1: "High-speed racing sport involving single-seat cars on international circuits.",
    Motorsport: "Broad term for competitive auto or motorcycle racing.",
    Archery: "Competitors shoot arrows at a target using a bow for accuracy points.",
    Fencing: "A duel sport involving swords and quick footwork to land valid strikes.",
    Rowing: "Athletes race boats using oars on rivers or lakes.",
    Canoeing: "Paddling a lightweight boat using a single-bladed paddle.",
    Kayaking: "A water sport using a small boat and double-bladed paddle.",
    Horse_Racing: "Jockeys ride horses in races to be the fastest to the finish line.",
    Equestrian: "Includes horse-related events like dressage, jumping, and eventing.",
    Weightlifting: "Lifting heavy barbells in two styles: snatch and clean & jerk.",
    Powerlifting: "Tests max strength in squat, bench press, and deadlift.",
    Climbing: "Athletes scale vertical surfaces using strength, technique, and gear.",
    Polo: "Teams on horseback use mallets to hit a ball into the opposing goal.",
    Ultimate_Frisbee: "A team sport using a flying disc, aiming to pass it into the end zone.",
    Bowling: "Players roll a ball down a lane to knock down pins.",
    Snooker: "A cue sport played on a large table with red and colored balls.",
    Pool: "A cue sport where players sink balls into pockets on a billiards table.",
    Poker: "A card game combining luck, strategy, and betting.",
    Esports: "Competitive video gaming across genres like FPS, MOBA, and fighting games."
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
    } else if (category === 'sports') {
        definition = sportHints[word] || 'No hint available for this country!'
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


function typeHint(text, elementId, onComplete) {
    const element = document.getElementById(elementId);
    element.textContent = "";
    let i = 0;

    const interval = setInterval(() => {
        if (i < text.length) {
            element.textContent += text[i];
            i++;
        } else {
            clearInterval(interval);
            onComplete(); // Resume or start timer
        }
    }, 50);
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
    // ⏸ Pause any existing timer before fetching or typing
    if (gameTimer) gameTimer.pause();

    console.log("📛 Category Received:", category);

    const { word, definition } = await getWordAndDefinitionFromCategory(category);

    if (wordRounds <= 0) {
        alert('Game Over! You have completed all rounds.');
        wordRounds = 5; // Reset if needed
        return;
    }

    console.log("🎯 Word:", word);
    console.log("💡 Hint:", definition);

    await initializeGameWithWord(word, definition);  // Wait for hint to finish typing
    generateLetterButtons();                         // Reset letter buttons
    wordRounds--;                                    // Decrease round count
}




// Auto-run only if browser
if (typeof window !== 'undefined') {
    generateLetterButtons();
}

// Controllable Timer Class
class ControllableTimer {
    constructor(seconds, onTick, onComplete) {
        this.total = seconds;
        this.remaining = seconds;
        this.interval = null;
        this.onTick = onTick;
        this.onComplete = onComplete;
    }

    start() {
        if (this.interval) return;
        this.interval = setInterval(() => {
            if (this.remaining > 0) {
                this.remaining--;
                this.onTick(this.remaining);
            } else {
                this.pause();
                this.onComplete();
            }
        }, 1000);
    }

    pause() {
        clearInterval(this.interval);
        this.interval = null;
    }

    reset(seconds = this.total) {
        this.pause();
        this.remaining = seconds;
        this.onTick(this.remaining);
    }

    resume() {
        this.start();
    }
}

