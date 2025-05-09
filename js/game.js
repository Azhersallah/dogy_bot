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
let userId;
try {
    const app = firebase.initializeApp(firebaseConfig);
    db = firebase.getDatabase(app);
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

// Game state variables
let isCatching = false;
let isUpgrading = false;
let userData = {
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

// Initialize toast
const toastElement = document.getElementById('toastAlert');
const toastMessage = document.getElementById('toastMessage');
const toast = new bootstrap.Toast(toastElement, { delay: 2000 });

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initGame, 500); // Small delay to ensure everything is loaded
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

    // Load game data
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
        } else {
            console.log("Creating new user data");
            const now = Math.floor(Date.now() / 1000);
            userData = {
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
                chickenArrivalTime: now + 43200, // 12 hours from now
                catchingEndTime: 0,
                upgradeEndTime: 0
            };
            await firebase.set(userRef, userData);
        }

        updateUI();
        startTimers();
    } catch (error) {
        console.error("Error loading game data:", error);
        showToast("Failed to load game data", false);
        // Initialize UI with default values
        updateUI();
    }
}

function updateUI() {
    pointElement.textContent = userData.points;
    myLevel.textContent = userData.level;
    currentEnergys_.textContent = userData.currentEnergy;
    document.getElementById('max-energy').textContent = userData.maxEnergy;
    document.getElementById('maxleg').textContent = userData.maxLeg;
    
    // Update items
    commonItemElement.textContent = userData.items.common;
    rareItemElement.textContent = userData.items.rare;
    epicItemElement.textContent = userData.items.epic;
    legendaryItemElement.textContent = userData.items.legendary;
    mythicItemElement.textContent = userData.items.mythic;
    
    // Update progress bars
    currentLegElement.textContent = Math.min(userData.points, userData.maxLeg);
    legProgress.style.width = (Math.min(userData.points, userData.maxLeg) / userData.maxLeg) * 100 + '%';
    progressBar.style.width = (userData.currentEnergy / userData.maxEnergy) * 100 + '%';
    
    // Calculate and display upgrade time
    const totalSeconds = userData.level * 2.89 * 3600;
    const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
    const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
    const seconds = Math.floor(totalSeconds % 60).toString().padStart(2, '0');
    upgrade_time.textContent = `${hours}:${minutes}:${seconds}`;
}

async function saveGameData() {
    try {
        const userRef = firebase.ref(db, 'users/' + userId);
        await firebase.update(userRef, userData);
    } catch (error) {
        console.error("Error saving game data:", error);
        showToast("Failed to save progress", false);
    }
}

function startTimers() {
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
    
    const interval = setInterval(() => {
        remainingTime--;
        
        if (remainingTime <= 0) {
            clearInterval(interval);
            Chicken_Arrive.style.display = "flex";
            newChicken.textContent = "00:00:00";
            return;
        }
        
        const hours = Math.floor(remainingTime / 3600).toString().padStart(2, '0');
        const minutes = Math.floor((remainingTime % 3600) / 60).toString().padStart(2, '0');
        const seconds = (remainingTime % 60).toString().padStart(2, '0');
        newChicken.textContent = `${hours}:${minutes}:${seconds}`;
    }, 1000);
}

function startCatchingTimer() {
    const now = Math.floor(Date.now() / 1000);
    let remainingTime = userData.catchingEndTime - now;
    
    if (remainingTime <= 0) {
        startCatchingbtn.innerText = 'Claim';
        startCatchingbtn.disabled = false;
        startCatchingbtn.style.backgroundColor = 'green';
        return;
    }
    
    isCatching = true;
    startCatchingbtn.disabled = true;
    startCatchingbtn.style.backgroundColor = 'grey';
    
    const interval = setInterval(() => {
        remainingTime--;
        
        if (remainingTime <= 0) {
            clearInterval(interval);
            startCatchingbtn.innerText = 'Claim';
            startCatchingbtn.disabled = false;
            startCatchingbtn.style.backgroundColor = 'green';
            isCatching = false;
            return;
        }
        
        const hours = Math.floor(remainingTime / 3600).toString().padStart(2, '0');
        const minutes = Math.floor((remainingTime % 3600) / 60).toString().padStart(2, '0');
        const seconds = (remainingTime % 60).toString().padStart(2, '0');
        startCatchingbtn.innerText = `Catching(${hours}:${minutes}:${seconds})`;
    }, 1000);
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
    
    const interval = setInterval(() => {
        remainingTime--;
        
        if (remainingTime <= 0) {
            clearInterval(interval);
            completeUpgrade();
            return;
        }
        
        const hours = Math.floor(remainingTime / 3600).toString().padStart(2, '0');
        const minutes = Math.floor((remainingTime % 3600) / 60).toString().padStart(2, '0');
        const seconds = (remainingTime % 60).toString().padStart(2, '0');
        upgrade_time.textContent = `${hours}:${minutes}:${seconds}`;
    }, 1000);
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

function showToast(message, status = false) {
    const toastColor = document.getElementById('toastAlert');
    const iconElement = toastColor.querySelector('.d-flex i');

    if (status) {
        toastColor.style.setProperty('background-color', '#cdfbcb', 'important');
        toastColor.style.setProperty('color', '#017909', 'important');
        iconElement.className = 'bi bi-check-circle-fill';
    } else {
        toastColor.style.setProperty('background-color', '#fbcbcb', 'important');
        toastColor.style.setProperty('color', '#9e0000', 'important');
        iconElement.className = 'bi bi-dash-circle-fill';
    }

    toastMessage.textContent = message;
    toast.show();
}

// Chicken types with probabilities
const chickens = [
    { type: "common", image: "common", probability: 0.5 },
    { type: "rare", image: "rare", probability: 0.2 },
    { type: "epic", image: "epic", probability: 0.15 },
    { type: "legendary", image: "legendary", probability: 0.1 },
    { type: "mythic", image: "mythic", probability: 0.05 },
];

function getRandomChicken() {
    const random = Math.random();
    let cumulativeProbability = 0;

    for (const chicken of chickens) {
        cumulativeProbability += chicken.probability;
        if (random < cumulativeProbability) {
            return chicken.image;
        }
    }
    return "common"; // fallback
}

// Event listeners
commonBtn.addEventListener('click', () => feedChicken('common', 5));
rareBtn.addEventListener('click', () => feedChicken('rare', 20));
epicBtn.addEventListener('click', () => feedChicken('epic', 60));
legendaryBtn.addEventListener('click', () => feedChicken('legendary', 180));
mythicBtn.addEventListener('click', () => feedChicken('mythic', 420));

async function feedChicken(type, energy) {
    if (userData.items[type] > 0) {
        const result = await showFeedConfirmation(type, energy);
        if (result) {
            userData.items[type] -= 1;
            userData.currentEnergy = Math.min(userData.currentEnergy + energy, userData.maxEnergy);
            updateUI();
            saveGameData();
            showToast(`Fed ${type} chicken!`, true);
        }
    } else {
        showToast(`No ${type} chickens available`, false);
    }
}

startCatchingbtn.addEventListener('click', () => {
    if (userData.currentEnergy > 0 && !isCatching) {
        startCatching();
    } else if (startCatchingbtn.innerText === 'Claim') {
        claimCatch();
    } else {
        showToast("Fill energy first!", false);
    }
});

function startCatching() {
    userData.catchingEndTime = Math.floor(Date.now() / 1000) + 43200; // 12 hours
    isCatching = true;
    startCatchingbtn.disabled = true;
    startCatchingbtn.style.backgroundColor = 'grey';
    saveGameData();
    startCatchingTimer();
    showToast("Started catching!", true);
}

function claimCatch() {
    const pointsEarned = Math.floor(Math.random() * (userData.currentEnergy / 2)) + userData.currentEnergy * 2;
    userData.points += pointsEarned;
    userData.currentEnergy = 0;
    userData.catchingEndTime = 0;
    isCatching = false;
    startCatchingbtn.innerText = 'Start Catching';
    startCatchingbtn.style.backgroundColor = '';
    updateUI();
    saveGameData();
    showToast(`Caught ${pointsEarned} legs!`, true);
}

upgradefox_btn.addEventListener('click', () => {
    if (userData.points >= userData.maxLeg && !isUpgrading) {
        showUpgradeConfirmation();
    }
});

function showUpgradeConfirmation() {
    const totalSeconds = userData.level * 2.89 * 3600;
    const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
    const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
    const seconds = Math.floor(totalSeconds % 60).toString().padStart(2, '0');
    
    showMessageBox2(`Requires ${userData.maxLeg} legs\nUpgrade time: ${hours}:${minutes}:${seconds}`, () => {
        userData.points -= userData.maxLeg;
        userData.upgradeEndTime = Math.floor(Date.now() / 1000) + totalSeconds;
        updateUI();
        saveGameData();
        startUpgradeTimer();
        showToast("Upgrade started!", true);
    });
}

claimChicken.addEventListener('click', () => {
    if (Chicken_Arrive.style.display !== "flex") return;
    
    spinnerTest.classList.add('spinner');
    claimChicken.style.pointerEvents = "none";

    setTimeout(() => {
        const chickenType = getRandomChicken();
        userData.items[chickenType] += 1;
        userData.chickenArrivalTime = Math.floor(Date.now() / 1000) + 43200; // 12 hours
        
        const imgElement = document.getElementById("claim-chicken");
        imgElement.src = `svg/${chickenType}.svg`;
        
        Chicken_Arrive.style.display = "none";
        spinnerTest.classList.remove('spinner');
        updateUI();
        saveGameData();
        startChickenCountdown();
        showToast(`Got ${chickenType} chicken!`, true);
    }, 2000);
});

// Message box functions (simplified versions)
async function showFeedConfirmation(type, energy) {
    return new Promise((resolve) => {
        document.getElementById('chickenType').textContent = `${type} / ${energy} Energy`;
        document.getElementById('chicken-msg-img').src = `svg/${type}.svg`;
        document.getElementById('messageText').textContent = 
            `Feed this ${type} chicken for ${energy} energy?`;
        
        const messageBox = document.getElementById('messageBox');
        messageBox.style.display = 'flex';
        document.body.classList.add('no-scroll');

        document.getElementById('yesButton').onclick = () => {
            closeMessageBox();
            resolve(true);
        };
        document.getElementById('noButton').onclick = () => {
            closeMessageBox();
            resolve(false);
        };
    });
}

function showMessageBox2(message, onConfirm) {
    document.getElementById('messageText1').textContent = message;
    const messageBox = document.getElementById('messageBox1');
    messageBox.style.display = 'flex';
    document.body.classList.add('no-scroll');

    document.getElementById('yesButton1').onclick = () => {
        closeMessageBox1();
        onConfirm();
    };
    document.getElementById('noButton1').onclick = closeMessageBox1;
}

function closeMessageBox() {
    document.getElementById('messageBox').style.display = 'none';
    document.body.classList.remove('no-scroll');
}

function closeMessageBox1() {
    document.getElementById('messageBox1').style.display = 'none';
    document.body.classList.remove('no-scroll');
}
