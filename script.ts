// --- DOM Element References ---
// Use type assertion to specify the element type for TS
const gameBoard = document.getElementById('game-board') as HTMLDivElement;
const progressBar = document.getElementById('progress-bar') as HTMLDivElement;
const resetButton = document.getElementById('reset-button') as HTMLButtonElement;

// --- Audio Element References ---
const bgMusic = document.getElementById('bg-music') as HTMLAudioElement;
const flipSound = document.getElementById('flip-sound') as HTMLAudioElement;
const matchSound = document.getElementById('match-sound') as HTMLAudioElement;
const failSound = document.getElementById('fail-sound') as HTMLAudioElement;
const winSound = document.getElementById('win-sound') as HTMLAudioElement;

// --- Game Configuration ---
// Image sources
const imageSources: string[] = [
    'assets/images/1.jpg', 'assets/images/2.jpg', 'assets/images/3.jpg', 'assets/images/4.jpg',
    'assets/images/5.jpg', 'assets/images/6.jpg', 'assets/images/7.jpg', 'assets/images/8.jpg',
    'assets/images/9.jpg', 'assets/images/10.jpg'
];
const totalPairs = imageSources.length;
let cardDeck: string[] = [...imageSources, ...imageSources]; // Create 20 cards (10 pairs)

// --- Game State Variables ---
let flippedCards: HTMLElement[] = [];
let score: number = 0;
let canFlip: boolean = true;
let gameStarted: boolean = false;

/**
 * Shuffles an array using the Fisher-Yates algorithm.
 * @param array The array to be shuffled.
 */
function shuffle(array: any[]): void {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

/**
 * Creates and displays the game cards on the board.
 */
function createBoard(): void {
    // Reset board and game state
    gameBoard.innerHTML = '';
    flippedCards = [];
    score = 0;
    canFlip = true;
    updateProgressBar();
    shuffle(cardDeck);

    cardDeck.forEach((imageSrc, index) => {
        const cardContainer = document.createElement('div');
        cardContainer.className = 'card-container';

        const cardFlipper = document.createElement('div');
        cardFlipper.className = 'card-flipper';
        cardFlipper.dataset.image = imageSrc;

        // Front of card (Number)
        const cardFront = document.createElement('div');
        cardFront.className = 'card-face card-front';
        cardFront.textContent = (index + 1).toString();

        // Back of card (Image)
        const cardBack = document.createElement('div');
        cardBack.className = 'card-face card-back';
        const img = document.createElement('img');
        img.src = imageSrc;
        cardBack.appendChild(img);

        cardFlipper.appendChild(cardFront);
        cardFlipper.appendChild(cardBack);
        cardContainer.appendChild(cardFlipper);
        gameBoard.appendChild(cardContainer);

        cardFlipper.addEventListener('click', () => handleCardFlip(cardFlipper));
    });
}

/**
 * Handles the logic when a card is clicked.
 * @param card The card element that was flipped.
 */
function handleCardFlip(card: HTMLElement): void {
    // Start background music on the first flip
    if (!gameStarted) {
        gameStarted = true;
        bgMusic.play().catch(e => console.error("Autoplay was prevented:", e));
    }

    if (!canFlip || card.classList.contains('flipped') || card.classList.contains('matched')) {
        return;
    }

    flipSound.play();
    card.classList.add('flipped');
    flippedCards.push(card);

    if (flippedCards.length === 2) {
        checkForMatch();
    }
}

/**
 * Checks if the two flipped cards are a match.
 */
function checkForMatch(): void {
    canFlip = false;
    const [card1, card2] = flippedCards;

    if (card1.dataset.image === card2.dataset.image) {
        // It's a match
        setTimeout(() => {
            matchSound.play();
            score++;
            card1.classList.add('matched');
            card2.classList.add('matched');
            flippedCards = [];
            canFlip = true;
            updateProgressBar();

            // Check for win condition
            if (score === totalPairs) {
                winSound.play();
                bgMusic.pause();
                // Optionally show a win message
                setTimeout(() => alert("You won!"), 500);
            }
        }, 500);
    } else {
        // Not a match
        setTimeout(() => {
            failSound.play();
            card1.classList.remove('flipped');
            card2.classList.remove('flipped');
            flippedCards = [];
            canFlip = true;
        }, 1200);
    }
}

/**
 * Updates the score progress bar.
 */
function updateProgressBar(): void {
    const percentage = totalPairs > 0 ? (score / totalPairs) * 100 : 0;
    progressBar.style.width = `${percentage}%`;
    progressBar.textContent = `${Math.round(percentage)}%`;
    progressBar.setAttribute('aria-valuenow', percentage.toString());
}

// --- Event Listeners ---
resetButton.addEventListener('click', () => {
    // Reset and restart
    gameStarted = false;
    bgMusic.pause();
    bgMusic.currentTime = 0;
    createBoard();
});

// --- Initial Game Setup ---
createBoard();

