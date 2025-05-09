// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyC6-AK8Xf6Wpf3fAIgEzP9htfb38RpmfZQ",
    authDomain: "test33-f1333.firebaseapp.com",
    projectId: "test33-f1333",
    storageBucket: "test33-f1333.appspot.com",
    messagingSenderId: "1063398052714",
    appId: "1:1063398052714:web:df7f29879f24f459670b13",
    measurementId: "G-ZQM7V8XS88"
};

// Initialize Firebase
let db;
try {
    const app = firebase.initializeApp(firebaseConfig);
    db = firebase.getDatabase(app);
    console.log("Firebase initialized successfully");
} catch (error) {
    console.error("Firebase initialization error:", error);
}

// Game elements
const pointElement = document.getElementById('points');
const legProgress = document.getElementById('legProgress');
const currentLegElement = document.getElementById('currentLeg');
const commonItemElement = document.getElementById('common_item');
const rareItemElement = document.getElementById('rare_item');
const epicItemElement = document.getElementById('epic_item');
const legendaryItemElement = document.getElementById('legendary_item');
const mythicItemElement = document.getElementById('mythic_item');
const progressBar = document.getElementById('fillEnergy');
const commonBtn = document.getElementById('common-chicken');
const rareBtn = document.getElementById('rare-chicken');
const epicBtn = document.getElementById('epic-chicken');
const legendaryBtn = document.getElementById('legendary-chicken');
const mythicBtn = document.getElementById('mythic-chicken');
const startCatchingbtn = document.getElementById('start-catching');
const newChicken = document.getElementById('time-value');
const Chicken_Arrive = document.getElementById('chickenArrive');
const currentEnergys_ = document.getElementById('current-energy');
const myLevel = document.getElementById('level-nubmer');
const upgrade_time = document.getElementById('upgradeTime');
const upgradefox_btn = document.getElementById('upgrade-btn');
const claimChicken = document.getElementById('claim-chicken');
const spinnerTest = document.querySelector('.spinnerTest');

// Default game state for new users
const DEFAULT_GAME_STATE = {
    points: 0,
    level: 1,
    currentEnergy: 0,
    maxEnergy: 5,
    currentLeg: 0,
    maxLeg: 60,
    items: {
        common: 1,
        rare: 1,
        epic: 1,
        legendary: 1,
        mythic: 0
    },
    chickenArrivalTime: 0,
    catchingEndTime: 0,
    upgradeEndTime: 0
};

let userId;
let userData = {...DEFAULT_GAME_STATE};
let isCatching = false;
let isUpgrading = false;
let chickenInterval;
let catchingInterval;
let upgradeInterval;

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initGame, 500);
});

function initGame() {
    // Get user ID from Telegram or use test ID
    if (window.Telegram && Telegram.WebApp && Telegram.WebApp.initDataUnsafe && Telegram.WebApp.initDataUnsafe.user) {
        userId = Telegram.WebApp.initDataUnsafe.user.id.toString();
        Telegram.WebApp.expand();
        console.log("Telegram user ID:", userId);
    } else {
        userId = "test_user_" + Math.floor(Math.random() * 10000);
        console.log("Using test user ID:", userId);
    }

    // Load game data (will create new user if doesn't exist)
    loadGameData();
}

async function loadGameData() {
    try {
        if (!db) {
            throw new Error("Firebase not initialized");
        }

        const userRef = firebase.ref(db, 'users/' + userId);
        const snapshot = await firebase.get(userRef);

        if (snapshot.exists()) {
            console.log("Loaded existing user data");
            userData = snapshot.val();
            showToast("Game loaded successfully", true);
        } else {
            console.log("Creating new user data");
            // Initialize with current timestamps
            const now = Math.floor(Date.now() / 1000);
            userData = {
                ...DEFAULT_GAME_STATE,
                chickenArrivalTime: now + 43200 // 12 hours from now
            };
            await firebase.set(userRef, userData);
            showToast("New game started!", true);
        }

        updateUI();
        startTimers();
    } catch (error) {
        console.error("Error loading game data:", error);
        showToast("Failed to connect to server. Using offline mode.", false);
        
        // Fallback to localStorage
        const savedData = localStorage.getItem('foxGameData');
        if (savedData) {
            try {
                userData = JSON.parse(savedData);
                showToast("Loaded from local storage", true);
            } catch (parseError) {
                console.error("Error parsing local storage data:", parseError);
                // Initialize with default data
                const now = Math.floor(Date.now() / 1000);
                userData = {
                    ...DEFAULT_GAME_STATE,
                    chickenArrivalTime: now + 43200
                };
                showToast("Starting new game offline", true);
            }
        } else {
            // Initialize with default data
            const now = Math.floor(Date.now() / 1000);
            userData = {
                ...DEFAULT_GAME_STATE,
                chickenArrivalTime: now + 43200
            };
            showToast("Starting new game offline", true);
        }
        
        updateUI();
        startTimers();
    }
}

async function saveGameData() {
    try {
        if (db) {
            const userRef = firebase.ref(db, 'users/' + userId);
            await firebase.update(userRef, userData);
            console.log("Game data saved to Firebase");
        } else {
            throw new Error("Firebase not available");
        }
    } catch (error) {
        console.error("Error saving to Firebase:", error);
        // Fallback to localStorage
        localStorage.setItem('foxGameData', JSON.stringify(userData));
        console.log("Game data saved to local storage");
    }
}

function updateUI() {
    // Update points and level
    pointElement.textContent = userData.points;
    myLevel.textContent = userData.level;
    
    // Update energy display
    currentEnergys_.textContent = userData.currentEnergy;
    document.getElementById('max-energy').textContent = userData.maxEnergy;
    progressBar.style.width = (userData.currentEnergy / userData.maxEnergy) * 100 + '%';
    
    // Update legs progress
    currentLegElement.textContent = Math.min(userData.points, userData.maxLeg);
    document.getElementById('maxleg').textContent = userData.maxLeg;
    legProgress.style.width = (Math.min(userData.points, userData.maxLeg) / userData.maxLeg) * 100 + '%';
    
    // Update item counts
    commonItemElement.textContent = userData.items.common;
    rareItemElement.textContent = userData.items.rare;
    epicItemElement.textContent = userData.items.epic;
    legendaryItemElement.textContent = userData.items.legendary;
    mythicItemElement.textContent = userData.items.mythic;
    
    // Calculate and display upgrade time
    const totalSeconds = userData.level * 2.89 * 3600;
    const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
    const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
    const seconds = Math.floor(totalSeconds % 60).toString().padStart(2, '0');
    upgrade_time.textContent = `${hours}:${minutes}:${seconds}`;
    
    // Show upgrade button if ready
    if (userData.points >= userData.maxLeg && !isUpgrading) {
        document.getElementById('foxUpgrade').style.display = 'flex';
    } else {
        document.getElementById('foxUpgrade').style.display = 'none';
    }
}

function showToast(message, isSuccess) {
    const toastElement = document.getElementById('toastAlert');
    const toastMessage = document.getElementById('toastMessage');
    const iconElement = toastElement.querySelector('.d-flex i');
    
    // Set color and icon based on success/failure
    if (isSuccess) {
        toastElement.style.setProperty('background-color', '#cdfbcb', 'important');
        toastElement.style.setProperty('color', '#017909', 'important');
        iconElement.className = 'bi bi-check-circle-fill';
    } else {
        toastElement.style.setProperty('background-color', '#fbcbcb', 'important');
        toastElement.style.setProperty('color', '#9e0000', 'important');
        iconElement.className = 'bi bi-exclamation-triangle-fill';
    }
    
    toastMessage.textContent = message;
    const toast = new bootstrap.Toast(toastElement, { delay: 3000 });
    toast.show();
}

function startTimers() {
    // Clear any existing intervals
    if (chickenInterval) clearInterval(chickenInterval);
    if (catchingInterval) clearInterval(catchingInterval);
    if (upgradeInterval) clearInterval(upgradeInterval);

    // Chicken arrival timer
    if (userData.chickenArrivalTime) {
        startChickenCountdown();
    }
    
    // Catching timer
    if (userData.catchingEndTime && userData.catchingEndTime > Math.floor(Date.now() / 1000)) {
        startCatchingTimer();
    }
    
    // Upgrade timer
    if (userData.upgradeEndTime && userData.upgradeEndTime > Math.floor(Date.now() / 1000)) {
        startUpgradeTimer();
    }
}

function startChickenCountdown() {
    const now = Math.floor(Date.now() / 1000);
    let remainingTime = userData.chickenArrivalTime - now;
    
    if (remainingTime <= 0) {
        Chicken_Arrive.style.display = "flex";
        newChicken.textContent = "00:00:00";
        return;
    }
    
    updateChickenTimer(remainingTime);
    
    chickenInterval = setInterval(() => {
        remainingTime--;
        
        if (remainingTime <= 0) {
            clearInterval(chickenInterval);
            Chicken_Arrive.style.display = "flex";
            newChicken.textContent = "00:00:00";
            return;
        }
        
        updateChickenTimer(remainingTime);
    }, 1000);
}

function updateChickenTimer(seconds) {
    const hours = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const minutes = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    newChicken.textContent = `${hours}:${minutes}:${secs}`;
}

function startCatchingTimer() {
    const now = Math.floor(Date.now() / 1000);
    let remainingTime = userData.catchingEndTime - now;
    
    if (remainingTime <= 0) {
        completeCatching();
        return;
    }
    
    isCatching = true;
    startCatchingbtn.disabled = true;
    startCatchingbtn.style.backgroundColor = 'grey';
    updateCatchingTimer(remainingTime);
    
    catchingInterval = setInterval(() => {
        remainingTime--;
        
        if (remainingTime <= 0) {
            clearInterval(catchingInterval);
            completeCatching();
            return;
        }
        
        updateCatchingTimer(remainingTime);
    }, 1000);
}

function updateCatchingTimer(seconds) {
    const hours = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const minutes = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    startCatchingbtn.innerText = `Catching(${hours}:${minutes}:${secs})`;
}

function completeCatching() {
    isCatching = false;
    startCatchingbtn.innerText = 'Claim';
    startCatchingbtn.disabled = false;
    startCatchingbtn.style.backgroundColor = 'green';
}

function startUpgradeTimer() {
    const now = Math.floor(Date.now() / 1000);
    let remainingTime = userData.upgradeEndTime - now;
    
    if (remainingTime <= 0) {
        completeUpgrade();
        return;
    }
    
    isUpgrading = true;
    document.getElementById('foxUpgrade').style.display = 'none';
    updateUpgradeTimer(remainingTime);
    
    upgradeInterval = setInterval(() => {
        remainingTime--;
        
        if (remainingTime <= 0) {
            clearInterval(upgradeInterval);
            completeUpgrade();
            return;
        }
        
        updateUpgradeTimer(remainingTime);
    }, 1000);
}

function updateUpgradeTimer(seconds) {
    const hours = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const minutes = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    upgrade_time.textContent = `${hours}:${minutes}:${secs}`;
}

function completeUpgrade() {
    isUpgrading = false;
    userData.level += 1;
    userData.maxEnergy = userData.level * 5;
    userData.maxLeg = (userData.level + 5) * 10;
    userData.upgradeEndTime = 0;
    
    updateUI();
    saveGameData();
    showToast("Upgrade successful to level " + userData.level, true);
}

// Chicken types with probabilities
const CHICKEN_TYPES = [
    { type: "common", image: "common", probability: 0.5, energy: 5 },
    { type: "rare", image: "rare", probability: 0.3, energy: 20 },
    { type: "epic", image: "epic", probability: 0.12, energy: 60 },
    { type: "legendary", image: "legendary", probability: 0.06, energy: 180 },
    { type: "mythic", image: "mythic", probability: 0.02, energy: 420 }
];

function getRandomChicken() {
    const random = Math.random();
    let cumulativeProbability = 0;

    for (const chicken of CHICKEN_TYPES) {
        cumulativeProbability += chicken.probability;
        if (random < cumulativeProbability) {
            return chicken;
        }
    }
    return CHICKEN_TYPES[0]; // fallback to common
}

// Chicken feeding functionality
commonBtn.addEventListener('click', () => feedChicken('common'));
rareBtn.addEventListener('click', () => feedChicken('rare'));
epicBtn.addEventListener('click', () => feedChicken('epic'));
legendaryBtn.addEventListener('click', () => feedChicken('legendary'));
mythicBtn.addEventListener('click', () => feedChicken('mythic'));

async function feedChicken(type) {
    const chicken = CHICKEN_TYPES.find(c => c.type === type);
    if (!chicken) return;

    if (userData.items[type] <= 0) {
        showToast(`No ${type} chickens available`, false);
        return;
    }

    if (userData.currentEnergy >= userData.maxEnergy) {
        showToast("Energy is already full!", false);
        return;
    }

    userData.items[type]--;
    userData.currentEnergy = Math.min(userData.currentEnergy + chicken.energy, userData.maxEnergy);
    
    updateUI();
    await saveGameData();
    showToast(`Fed ${type} chicken! +${chicken.energy} energy`, true);
}

// Start catching functionality
startCatchingbtn.addEventListener('click', async () => {
    if (isCatching) return;

    if (startCatchingbtn.innerText === 'Claim') {
        await claimCatching();
        return;
    }

    if (userData.currentEnergy <= 0) {
        showToast("Fill energy first!", false);
        return;
    }

    startCatching();
});

function startCatching() {
    userData.catchingEndTime = Math.floor(Date.now() / 1000) + 43200; // 12 hours
    isCatching = true;
    startCatchingbtn.disabled = true;
    startCatchingbtn.style.backgroundColor = 'grey';
    
    saveGameData();
    startCatchingTimer();
    showToast("Started catching! Come back in 12 hours", true);
}

async function claimCatching() {
    const pointsEarned = Math.floor(Math.random() * (userData.currentEnergy / 2)) + userData.currentEnergy * 2;
    userData.points += pointsEarned;
    userData.currentEnergy = 0;
    userData.catchingEndTime = 0;
    isCatching = false;
    
    startCatchingbtn.innerText = 'Start Catching';
    startCatchingbtn.style.backgroundColor = '';
    
    updateUI();
    await saveGameData();
    showToast(`Caught ${pointsEarned} legs!`, true);
}

// Upgrade functionality
upgradefox_btn.addEventListener('click', () => {
    if (isUpgrading) return;
    
    if (userData.points < userData.maxLeg) {
        showToast(`Need ${userData.maxLeg} legs to upgrade`, false);
        return;
    }

    showUpgradeConfirmation();
});

function showUpgradeConfirmation() {
    const totalSeconds = userData.level * 2.89 * 3600;
    const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
    const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
    const seconds = Math.floor(totalSeconds % 60).toString().padStart(2, '0');
    
    const messageBox = document.getElementById('messageBox1');
    document.getElementById('messageText1').textContent = 
        `Upgrade for ${userData.maxLeg} legs?\nUpgrade time: ${hours}:${minutes}:${seconds}`;
    messageBox.style.display = 'flex';
    document.body.classList.add('no-scroll');

    document.getElementById('yesButton1').onclick = () => {
        closeMessageBox1();
        startUpgrade();
    };
    document.getElementById('noButton1').onclick = closeMessageBox1;
}

function closeMessageBox1() {
    document.getElementById('messageBox1').style.display = 'none';
    document.body.classList.remove('no-scroll');
}

function startUpgrade() {
    userData.points -= userData.maxLeg;
    const totalSeconds = userData.level * 2.89 * 3600;
    userData.upgradeEndTime = Math.floor(Date.now() / 1000) + totalSeconds;
    isUpgrading = true;
    
    updateUI();
    saveGameData();
    startUpgradeTimer();
    showToast("Upgrade started!", true);
}

// Claim chicken functionality
claimChicken.addEventListener('click', async () => {
    if (Chicken_Arrive.style.display !== "flex") return;
    
    spinnerTest.classList.add('spinner');
    claimChicken.style.pointerEvents = "none";

    setTimeout(async () => {
        const chicken = getRandomChicken();
        userData.items[chicken.type]++;
        userData.chickenArrivalTime = Math.floor(Date.now() / 1000) + 43200; // 12 hours
        
        const imgElement = document.getElementById("claim-chicken");
        imgElement.src = `svg/${chicken.image}.svg`;
        
        Chicken_Arrive.style.display = "none";
        spinnerTest.classList.remove('spinner');
        
        updateUI();
        await saveGameData();
        startChickenCountdown();
        showToast(`Got ${chicken.type} chicken!`, true);
    }, 2000);
});

// Initialize the game
initGame();
