const plane = document.getElementById('plane');
const planeContainer = document.getElementById('plane-container');
const multiplier = document.getElementById('multiplier');
const countdownDisplay = document.getElementById('countdown');
const stakeInput = document.getElementById('stake-input');
const quickAmountButtons = document.querySelectorAll('.quick-amount');
const betStatus = document.getElementById('bet-status');
const totalPnlDisplay = document.getElementById('total-pnl');
const autoCashoutInput = document.getElementById('auto-cashout');
const autobetToggle = document.getElementById('autobet-toggle');
const autoStakeInput = document.getElementById('auto-stake'); // Add to constants
let currentMultiplier = 1.00;
let trailInterval;
let multiplierInterval;
let countdownInterval;  // Moved to top level

const FLIGHT_DURATION = 5000; // Keep same duration for consistent speed

let balance = 1000;
let currentBet = 0;
let isBetPlaced = false;
let isGameActive = false;
let totalPnl = 0;

const betAmount = document.getElementById('bet-amount');
const placeBetBtn = document.getElementById('place-bet');
const cashOutBtn = document.getElementById('cash-out');
const balanceDisplay = document.getElementById('balance');
const resultMessage = document.getElementById('result-message');

function getRandomStopPercent() {
    // Random stop point between 20% and 100% of the path
    return Math.floor(Math.random() * 80 + 20);
}

function updateMultiplier() {
    currentMultiplier += 0.01;
    multiplier.textContent = `x${currentMultiplier.toFixed(2)}`;
    updatePotentialPnl(); // Add this line to update potential PNL
    checkAutoCashout(); // Add this line
}

function updateMultiplierPosition() {
    const rect = plane.getBoundingClientRect();
    const containerRect = planeContainer.getBoundingClientRect();
    const x = rect.left - containerRect.left + rect.width + 10; // 10px offset from plane
    const y = rect.top - containerRect.top + (rect.height / 2) - 15; // Centered vertically with plane
    
    multiplier.style.left = `${x}px`;
    multiplier.style.top = `${y}px`;
}

function updateCountdown(seconds) {
    countdownDisplay.textContent = `Next flight in: ${seconds}s`;
}

function updateCountdownPosition() {
    const rect = plane.getBoundingClientRect();
    const containerRect = planeContainer.getBoundingClientRect();
    const x = rect.left - containerRect.left + rect.width + 10; // 10px offset from plane
    const y = rect.top - containerRect.top;
    
    countdownDisplay.style.left = `${x}px`;
    countdownDisplay.style.top = `${y}px`;
}

function updateBalance(amount) {
    balance += amount;
    balanceDisplay.textContent = `Balance: $${balance}`;
}

function updatePnl(amount) {
    totalPnl += amount;
    pnlDisplay.textContent = `PNL: ${totalPnl >= 0 ? '+' : ''}$${totalPnl.toFixed(2)}`;
    pnlDisplay.className = totalPnl >= 0 ? 'positive' : 'negative';
}

function updateTotalPnl(amount) {
    totalPnl += amount;
    totalPnlDisplay.textContent = `Total PNL: ${totalPnl >= 0 ? '+' : ''}$${totalPnl.toFixed(2)}`;
    totalPnlDisplay.className = totalPnl >= 0 ? 'positive' : 'negative';
}

function placeBet() {
    const amount = Number(betAmount.value);
    if (amount >= 10 && amount <= balance && !isGameActive) {
        currentBet = amount;
        balance -= amount;
        balanceDisplay.textContent = `Balance: $${balance}`;
        isBetPlaced = true;
        placeBetBtn.disabled = true;
        betAmount.disabled = true;
        stakeInput.disabled = true;
        betStatus.textContent = `Bet Active: $${amount}`;
        betStatus.className = 'active';
        resultMessage.textContent = '';
        resultMessage.className = '';
        
        // Update max value of slider
        betAmount.max = balance;
        updatePotentialPnl();
    }
}

function cashOut() {
    if (isBetPlaced && isGameActive) {
        const winnings = currentBet * currentMultiplier;
        const profit = winnings - currentBet;
        updateBalance(winnings);
        updateTotalPnl(profit);
        cashOutBtn.disabled = true;
        resultMessage.textContent = `Won $${winnings.toFixed(2)}!`;
        resultMessage.className = 'win';
        betStatus.textContent = 'No Active Bet';
        betStatus.className = 'inactive';
        stakeInput.disabled = false;
        isBetPlaced = false;
        updatePotentialPnl();
    }
}

function resetBetting() {
    isBetPlaced = false;
    betAmount.disabled = false;
    stakeInput.disabled = false;
    placeBetBtn.disabled = false;
    cashOutBtn.disabled = true;
    betAmount.max = balance;
    betAmount.value = Math.min(10, balance);
    stakeInput.value = Math.min(10, balance); // Update stake input instead of stakeDisplay
    betStatus.textContent = 'No Active Bet';
    betStatus.className = 'inactive';
    updatePotentialPnl();
}

function flyOut() {
    isGameActive = false;
    if (isBetPlaced) {
        updateTotalPnl(-currentBet);
        resultMessage.textContent = `Lost $${currentBet}!`;
        resultMessage.className = 'lose';
        betStatus.textContent = 'No Active Bet';
        betStatus.className = 'inactive';
        stakeInput.disabled = false;
        isBetPlaced = false;
        updatePotentialPnl();
    }
    cashOutBtn.disabled = true;

    // Hide plane vertically
    plane.style.transition = 'all 0.5s ease-in-out';
    plane.style.transform = 'translateY(-200%)';
    plane.style.opacity = '0';

    // Create result container
    const resultContainer = document.createElement('div');
    resultContainer.className = 'result-container';
    planeContainer.appendChild(resultContainer);
    
    // Create and add "FLEW AWAY!" text
    const flewAway = document.createElement('div');
    flewAway.className = 'flew-away';
    flewAway.textContent = 'FLEW AWAY!';
    resultContainer.appendChild(flewAway);

    // Create and add final multiplier with correct text
    const finalMultiplier = document.createElement('div');
    finalMultiplier.className = 'final-multiplier';
    finalMultiplier.textContent = `x${currentMultiplier.toFixed(2)}`;
    resultContainer.appendChild(finalMultiplier);

    

    // Hide original multiplier
    multiplier.style.display = 'none';

    setTimeout(() => {
        countdownDisplay.style.display = 'block';
        startFlight();
    }, 2000);
}

function startFlight() {
    resetBetting();
    // Make sure cash out is disabled at start
    cashOutBtn.disabled = true;
    
    // Enable betting controls during countdown
    placeBetBtn.disabled = false;
    stakeInput.disabled = false;
    betAmount.disabled = false;

    // Reset plane position immediately
    plane.style.transition = 'none';
    plane.style.transform = 'none';
    plane.style.bottom = '10px';
    plane.style.left = '10px';
    plane.style.opacity = '1';

    // Reset multiplier for new flight
    currentMultiplier = 1.00;
    multiplier.style.display = 'block';
    multiplier.textContent = `x${currentMultiplier.toFixed(2)}`;

    // Clear any existing intervals
    if (countdownInterval) clearInterval(countdownInterval);
    
    // Move countdown to plane container and position it
    if (countdownDisplay.parentElement !== planeContainer) {
        planeContainer.appendChild(countdownDisplay);
    }
    updateCountdownPosition();
    
    // Initial positioning of multiplier
    updateMultiplierPosition();
    
    // Start countdown
    countdownDisplay.style.display = 'block';
    let countdown = 10;
    updateCountdown(countdown);

    countdownInterval = setInterval(() => {
        countdown--;
        if (countdown >= 0) {
            updateCountdown(countdown);
            updateCountdownPosition();
        }
        if (countdown === 0) {
            clearInterval(countdownInterval);
            countdownDisplay.style.display = 'none';
            const oldElements = document.querySelectorAll('.result-container');
            oldElements.forEach(el => el.remove());
            tryAutobet(); // Add this line
            setTimeout(beginFlight, 100);
        }
    }, 1000);
}

function beginFlight() {
    isGameActive = true;
    // Only enable cash out if there's an active bet
    cashOutBtn.disabled = !isBetPlaced;
    placeBetBtn.disabled = true; // Disable place bet button when flight starts
    stakeInput.disabled = true;  // Disable stake input when flight starts
    betAmount.disabled = true;   // Disable slider when flight starts

    const stopPercent = getRandomStopPercent();
    plane.style.transition = `all ${FLIGHT_DURATION}ms linear`;
    // Modify flight path to stay more in view
    plane.style.bottom = '60%';  // Reduced from 80% to keep plane more in view
    plane.style.left = '75%';    // Reduced from 100% to keep plane in frame
    
    // Update multiplier position immediately before animation
    updateMultiplierPosition();
    
    trailInterval = setInterval(updateTrail, 20);
    // Update multiplier position more frequently for smoother movement
    multiplierInterval = setInterval(() => {
        updateMultiplier();
        updateMultiplierPosition();
    }, 16); // Approximately 60fps

    setTimeout(() => {
        clearInterval(multiplierInterval);
        flyOut();
        setTimeout(startFlight, 2000);
    }, (FLIGHT_DURATION * stopPercent) / 100);
}

function createTrailSegment(x, y) {
    const trail = document.createElement('div');
    trail.className = 'trail';
    // Adjust position to start from the left side of the plane
    trail.style.left = (x - 5) + 'px';  // Slight offset to align with plane's rear
    trail.style.top = y + 'px';
    trail.style.height = '10px';  // Reduced height for better appearance
    planeContainer.appendChild(trail);
    
    setTimeout(() => trail.remove(), 1000);
}

function updateTrail() {
    const rect = plane.getBoundingClientRect();
    const containerRect = planeContainer.getBoundingClientRect();
    // Adjust x position to start from the left (rear) of the plane
    const x = rect.left - containerRect.left;
    const y = rect.top - containerRect.top + (rect.height / 2);
    
    createTrailSegment(x, y);
}

// Add new function to update potential PNL
function updatePotentialPnl() {
    const stakeAmount = Number(stakeInput.value) || 0;
    const potentialWin = (isBetPlaced ? currentBet : stakeAmount) * currentMultiplier;
    const potentialProfit = potentialWin - (isBetPlaced ? currentBet : stakeAmount);
    const profitDisplay = cashOutBtn.querySelector('.profit-amount');
    if (profitDisplay) {
        profitDisplay.textContent = `$${potentialProfit.toFixed(2)}`;
    }
    // Only enable cash out if there's an active bet
    cashOutBtn.disabled = !isBetPlaced || !isGameActive;
}

// Add new function for autobet
function checkAutoCashout() {
    if (autobetToggle.checked && isBetPlaced && isGameActive) {
        const targetMultiplier = parseFloat(autoCashoutInput.value);
        if (currentMultiplier >= targetMultiplier) {
            cashOut();
        }
    }
}

// Add function for auto betting
function tryAutobet() {
    if (autobetToggle.checked && !isBetPlaced && !isGameActive) {
        const autoStake = Number(autoStakeInput.value);
        if (autoStake >= 10 && autoStake <= balance) {
            betAmount.value = autoStake;
            stakeInput.value = autoStake;
            placeBet();
        }
    }
}

// Remove unused resetPlane function and animation event listeners
// Start the first flight immediately
startFlight();

placeBetBtn.addEventListener('click', placeBet);
cashOutBtn.addEventListener('click', cashOut);

betAmount.addEventListener('input', function() {
    const value = Math.min(this.value, balance);
    stakeInput.value = value;
});

stakeInput.addEventListener('input', function() {
    const value = Math.min(this.value, balance);
    this.value = value;
    betAmount.value = value;
    updatePotentialPnl(); // Add this line to update potential profit on stake change
});

quickAmountButtons.forEach(button => {
    button.addEventListener('click', () => {
        const value = button.dataset.value;
        const amount = value === 'MAX' ? balance : Math.min(Number(value), balance);
        betAmount.value = amount;
        stakeInput.value = amount;
    });
});

// Add event listener for auto stake input
autoStakeInput.addEventListener('input', function() {
    this.value = Math.min(this.value, balance);
});
