const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
    '#FFEEAD', '#FF9999', '#77DD77', '#AEC6CF',
    '#FDFD96', '#B19CD9', '#FF6961', '#CFCFC4',
    '#FF5733', '#C70039', '#900C3F', '#581845',
    '#DAF7A6', '#FFC300', '#1F618D', '#148F77',
    '#117A65', '#D4AC0D', '#A93226', '#76448A',
    '#1ABC9C', '#2ECC71', '#3498DB', '#9B59B6',
    '#34495E', '#16A085', '#27AE60', '#2980B9',
    '#8E44AD', '#2C3E50', '#F39C12', '#E74C3C',
    '#ECF0F1', '#95A5A6', '#F1C40F', '#E67E22',
    '#7F8C8D'
];
let score = 0;
let highScore = localStorage.getItem('highScore') || 0;
let targetColor;
let currentOptions = [];
let isGameActive = true;

let timer;
let countdown;
const easyModeTime = 7000;
const mediumModeTime = 4000;
const hardModeTime = 2000;
let currentModeTime = easyModeTime;

const elements = {
    colorBox: document.querySelector('.color-box'),
    optionsGrid: document.querySelector('.options-grid'),
    gameStatus: document.querySelector('.game-status'),
    scoreElement: document.querySelector('.score'),
    highScoreElement: document.querySelector('.high-score'),
    newGameBtn: document.querySelector('.new-game-btn'),
    modeSelector: document.getElementById('modeSelector'),
    countdown: document.getElementById('countdown')
};

document.addEventListener('DOMContentLoaded', () => {
    elements.modeSelector.addEventListener('change', changeMode);
});

function initializeGame() {
    const { target, options } = getNewColors();
    targetColor = target;
    currentOptions = options;
    renderGame();
    updateStatus('');
    isGameActive = true;
    elements.highScoreElement.textContent = `Best Streak: ${highScore}`;
}

function startNewGame() {
    score = 0;
    elements.scoreElement.textContent = 'Current Streak: 0';
    elements.newGameBtn.disabled = true; // Disable the button
    initializeGame();
    startTimer();
}

function getNewColors() {
    const shuffled = [...colors].sort(() => Math.random() - 0.5);
    return { target: shuffled[0], options: shuffled.slice(0, 6) };
}

function renderGame() {
    elements.colorBox.style.backgroundColor = targetColor;
    elements.optionsGrid.innerHTML = '';
    
    currentOptions.forEach(color => {
        const button = document.createElement('button');
        button.className = 'color-option';
        button.dataset.testid = 'colorOption';
        button.style.backgroundColor = color;
        button.addEventListener('click', () => handleGuess(color));
        elements.optionsGrid.appendChild(button);
    });
}

function handleGuess(guessedColor) {
    if (!isGameActive) return;

    if (guessedColor === targetColor) {
        handleCorrectGuess();
    } else {
        handleWrongGuess();
    }
}

function handleCorrectGuess() {
    playSound(784, 0.3);
    score++;
    elements.scoreElement.textContent = `Current Streak: ${score}`;
    updateStatus('Correct! Keep going! 🎉', 'correct-status');
    
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('highScore', highScore);
        elements.highScoreElement.textContent = `Best Streak: ${highScore}`;
    }

    elements.gameStatus.classList.add('correct-status');
    setTimeout(() => {
        elements.gameStatus.classList.remove('correct-status');
    }, 500); 

    const { target, options } = getNewColors();
    targetColor = target;
    currentOptions = options;
    renderGame();
    shuffleButtons();
    startTimer();
}

function handleWrongGuess() {
    playSound(220, 0.7);
    isGameActive = false;
    updateStatus(`Game Over! Best Streak: ${highScore}`, 'error-status');
    
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('highScore', highScore);
        elements.highScoreElement.textContent = `Best Streak: ${highScore}`;
    }

    score = 0;
    setTimeout(() => {
        elements.newGameBtn.disabled = false; // Enable the button
        initializeGame();
        shuffleButtons();
    }, 2000);
}

function shuffleButtons() {
    const buttons = Array.from(elements.optionsGrid.children);
    buttons.sort(() => Math.random() - 0.5);
    buttons.forEach(button => elements.optionsGrid.appendChild(button));
}

function playSound(frequency, duration) {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.type = 'square';
    oscillator.frequency.value = frequency;
    gainNode.gain.value = 0.1;
    
    oscillator.start();
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    setTimeout(() => oscillator.stop(), duration * 1000);
}

function updateStatus(message, statusClass = '') {
    elements.gameStatus.textContent = message;
    elements.gameStatus.className = `game-status ${statusClass}`;
}

function startTimer() {
    clearInterval(timer);
    let timeLeft = currentModeTime;
    elements.countdown.textContent = (timeLeft / 1000).toFixed(0);

    timer = setInterval(() => {
        timeLeft -= 100;
        elements.countdown.textContent = (timeLeft / 1000).toFixed(0);

        if (timeLeft <= 0) {
            clearInterval(timer);
            handleWrongGuess();
        }
    }, 100);
}

function changeMode() {
    const mode = elements.modeSelector.value;
    switch (mode) {
        case 'easy':
            currentModeTime = easyModeTime;
            break;
        case 'medium':
            currentModeTime = mediumModeTime;
            break;
        case 'hard':
            currentModeTime = hardModeTime;
            break;
    }
    initializeGame();
}

elements.newGameBtn.addEventListener('click', startNewGame);

initializeGame();