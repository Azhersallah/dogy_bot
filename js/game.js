// Initialize Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, set, get, update, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyC6-AK8Xf6Wpf3fAIgEzP9htfb38RpmfZQ",
    authDomain: "test33-f1333.firebaseapp.com",
    projectId: "test33-f1333",
    storageBucket: "test33-f1333.appspot.com",
    messagingSenderId: "1063398052714",
    appId: "1:1063398052714:web:df7f29879f24f459670b13",
    measurementId: "G-ZQM7V8XS88"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

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
let userId = null;
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

// Initialize the toast element
const toastElement = document.getElementById('toastAlert');
const toastMessage = document.getElementById('toastMessage');
const toast = new bootstrap.Toast(toastElement, { delay: 2000 });

// Initialize the game when Telegram WebApp is ready
function initGame() {
    if (window.Telegram && Telegram.WebApp) {
        const user = Telegram.WebApp.initDataUnsafe.user;
        if (user) {
            userId = user.id.toString();
            loadGameData();
        } else {
            console.error("No user data available");
            // Fallback for testing outside Telegram
            userId = "test_user";
            loadGameData();
        }
    } else {
        console.error("Telegram WebApp not available");
        // Fallback for testing outside Telegram
        userId = "test_user";
        loadGameData();
    }
}

// Load game data from Firebase
async function loadGameData() {
    const userRef = ref(db, 'users/' + userId);
    const snapshot = await get(userRef);
    
    if (snapshot.exists()) {
        userData = snapshot.val();
        updateUI();
        startTimers();
    } else {
        // Initialize new user
        const now = Math.floor(Date.now() / 1000);
        userData.chickenArrivalTime = now + 43200; // 12 hours from now
        await set(userRef, userData);
        updateUI();
        startTimers();
    }
}

// Update UI with current game state
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
    legProgress.style.width = (Math.min(userData.points, userData.maxLeg) / userData.maxLeg * 100 + '%';
    progressBar.style.width = (userData.currentEnergy / userData.maxEnergy) * 100 + '%';
    
    // Calculate and display upgrade time
    const totalSeconds = userData.level * 2.89 * 3600;
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    upgrade_time.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// Save game data to Firebase
async function saveGameData() {
    const userRef = ref(db, 'users/' + userId);
    await update(userRef, userData);
}

// Start all active timers
function startTimers() {
    // Chicken arrival timer
    if (userData.chickenArrivalTime) {
        startChickenCountdown();
    }
    
    // Catching timer if in progress
    if (userData.catchingEndTime && userData.catchingEndTime > Math.floor(Date.now() / 1000)) {
        startCatchingTimer();
    }
    
    // Upgrade timer if in progress
    if (userData.upgradeEndTime && userData.upgradeEndTime > Math.floor(Date.now() / 1000)) {
        startUpgradeTimer();
    }
}

// Chicken arrival countdown
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
        
        const hours = Math.floor(remainingTime / 3600);
        const minutes = Math.floor((remainingTime % 3600) / 60);
        const seconds = remainingTime % 60;
        newChicken.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }, 1000);
}

// Catching timer
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
        
        const hours = Math.floor(remainingTime / 3600);
        const minutes = Math.floor((remainingTime % 3600) / 60);
        const seconds = remainingTime % 60;
        startCatchingbtn.innerText = `Catching(${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')})`;
    }, 1000);
}

// Upgrade timer
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
        
        const hours = Math.floor(remainingTime / 3600);
        const minutes = Math.floor((remainingTime % 3600) / 60);
        const seconds = remainingTime % 60;
        upgrade_time.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }, 1000);
}

// Complete the upgrade process
function completeUpgrade() {
    isUpgrading = false;
    userData.level += 1;
    userData.maxEnergy = userData.level * 5;
    userData.maxLeg = (userData.level + 5) * 10;
    userData.upgradeEndTime = 0;
    
    // Update UI
    myLevel.textContent = userData.level;
    document.getElementById('max-energy').textContent = userData.maxEnergy;
    document.getElementById('maxleg').textContent = userData.maxLeg;
    
    // Recalculate upgrade time for next level
    const totalSeconds = userData.level * 2.89 * 3600;
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    upgrade_time.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    
    saveGameData();
    showToast("Upgrade successful to level " + userData.level, true);
}

// Show toast message
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

// Message box functions
async function showMessageBox(message, chicken_type, energyAmount) {
    return new Promise((resolve) => {
        document.getElementById('chickenType').textContent = `${chicken_type} / ${energyAmount} Energy`;
        document.getElementById('chicken-msg-img').src = `svg/${chicken_type}.svg`;
        const messageBox = document.getElementById('messageBox');
        const messageText = document.getElementById('messageText');

        messageText.innerText = message;
        messageBox.style.display = 'flex';
        document.body.classList.add('no-scroll');

        const yesButton = document.getElementById('yesButton');

        yesButton.onclick = async function () {
            const spinner = document.createElement('div');
            spinner.classList.add('button-spinner');
            yesButton.appendChild(spinner);

            yesButton.disabled = true;
            yesButton.style.opacity = '0.5';
            yesButton.style.pointerEvents = 'none';

            await new Promise(r => setTimeout(r, 2000));

            yesButton.removeChild(spinner);
            yesButton.disabled = false;
            yesButton.style.opacity = '1';
            yesButton.style.pointerEvents = 'auto';

            resolve(true);
            closeMessageBox();
        };

        document.getElementById('noButton').onclick = function () {
            resolve(false);
            closeMessageBox();
        };
    });
}

function closeMessageBox() {
    document.getElementById('messageBox').style.display = 'none';
    document.body.classList.remove('no-scroll');
}

function showMessageBox2(message) {
    const messageText1 = document.getElementById('messageText1');
    const messageBox1 = document.getElementById('messageBox1');

    messageText1.innerText = message;
    messageBox1.style.display = 'flex';
    document.body.classList.add('no-scroll');

    const yesButton1 = document.getElementById('yesButton1');
    yesButton1.onclick = async function () {
        const spinner = document.createElement('div');
        spinner.classList.add('button-spinner');
        yesButton1.appendChild(spinner);

        yesButton1.disabled = true;
        yesButton1.style.opacity = '0.5';
        yesButton1.style.pointerEvents = 'none';

        await new Promise((r) => setTimeout(r, 2000));

        foxnextlevel();
        closeMessageBox1();

        yesButton1.removeChild(spinner);
        yesButton1.disabled = false;
        yesButton1.style.opacity = '1';
        yesButton1.style.pointerEvents = 'auto';
    };

    document.getElementById('noButton1').onclick = function () {
        closeMessageBox1();
    };
}

function closeMessageBox1() {
    document.getElementById('messageBox1').style.display = 'none';
    document.body.classList.remove('no-scroll');
}

// Chicken types with probabilities
const chickens = [
    { type: "common", image: "common", probability: 0.5 },
    { type: "rare", image: "rare", probability: 0.2 },
    { type: "epic", image: "epic", probability: 0.15 },
    { type: "legendary", image: "legendary", probability: 0.1 },
    { type: "mythic", image: "mythic", probability: 0.05 },
];

// Get random chicken based on probabilities
function getRandomChicken() {
    const random = Math.random();
    let cumulativeProbability = 0;

    for (const chicken of chickens) {
        cumulativeProbability += chicken.probability;
        if (random < cumulativeProbability) {
            return chicken.image;
        }
    }
}

// Feed energy to fox
function feedEnergy(maxEnergyForType) {
    userData.currentEnergy = Math.min(userData.currentEnergy + maxEnergyForType, userData.maxEnergy);
    progressBar.style.width = (userData.currentEnergy / userData.maxEnergy) * 100 + '%';
    currentEnergys_.textContent = userData.currentEnergy;
    saveGameData();
}

// Update progress when feeding chicken
async function updateProgress(maxEnergyForType, chicken_type) {
    let sendEnergy = maxEnergyForType + userData.currentEnergy;
    
    if (sendEnergy > userData.maxEnergy && userData.currentEnergy < userData.maxEnergy) {
        let excessEnergy = sendEnergy - userData.maxEnergy;
        const resultmsb = await showMessageBox("If you feed it this Chicken\nyou'll waste " + excessEnergy + " energy.\nAre you sure?", chicken_type, maxEnergyForType);
        if (resultmsb) {
            feedEnergy(maxEnergyForType);
            return true;
        } else {
            return false;
        }
    } else if (userData.currentEnergy < userData.maxEnergy) {
        const resultmsb = await showMessageBox("Do you want to use Chicken\nto feed Fox?", chicken_type, maxEnergyForType);
        if (resultmsb) {
            feedEnergy(maxEnergyForType);
            return true;
        } else {
            return false;
        }
    } else {
        showToast('Energy is full');
        return false;
    }
}

// Event listeners for chicken buttons
commonBtn.addEventListener('click', async () => {
    if (userData.items.common > 0) {
        const commonFeed = await updateProgress(5, 'common');
        if (commonFeed) {
            userData.items.common -= 1;
            commonItemElement.textContent = userData.items.common;
            saveGameData();
            showToast('Feed fox successfuly!', true);
        }
    } else {
        showToast('You have no common chicken');
    }
});

rareBtn.addEventListener('click', async () => {
    if (userData.items.rare > 0) {
        const rareFeed = await updateProgress(20, 'rare');
        if (rareFeed) {
            userData.items.rare -= 1;
            rareItemElement.textContent = userData.items.rare;
            saveGameData();
            showToast('Feed fox successfuly!', true);
        }
    } else {
        showToast('You have no rare chicken');
    }
});

epicBtn.addEventListener('click', async () => {
    if (userData.items.epic > 0) {
        const epicFeed = await updateProgress(60, 'epic');
        if (epicFeed) {
            userData.items.epic -= 1;
            epicItemElement.textContent = userData.items.epic;
            saveGameData();
            showToast('Feed fox successfuly!', true);
        }
    } else {
        showToast('You have no epic chicken');
    }
});

legendaryBtn.addEventListener('click', async () => {
    if (userData.items.legendary > 0) {
        const legendaryFeed = await updateProgress(180, 'legendary');
        if (legendaryFeed) {
            userData.items.legendary -= 1;
            legendaryItemElement.textContent = userData.items.legendary;
            saveGameData();
            showToast('Feed fox successfuly!', true);
        }
    } else {
        showToast('You have no legendary chicken');
    }
});

mythicBtn.addEventListener('click', async () => {
    if (userData.items.mythic > 0) {
        const mythicFeed = await updateProgress(420, 'mythic');
        if (mythicFeed) {
            userData.items.mythic -= 1;
            mythicItemElement.textContent = userData.items.mythic;
            saveGameData();
            showToast('Feed fox successfuly!', true);
        }
    } else {
        showToast('You have no mythic chicken');
    }
});

// Start catching process
startCatchingbtn.addEventListener('click', () => {
    if (userData.currentEnergy > 0 && !isCatching) {
        showToast("Start catching successfully!", true);
        isCatching = true;
        startCatchingbtn.disabled = true;
        startCatchingbtn.style.backgroundColor = 'grey';
        
        // Set catching end time (12 hours from now)
        userData.catchingEndTime = Math.floor(Date.now() / 1000) + 43200;
        saveGameData();
        
        startCatchingTimer();
    } else if (startCatchingbtn.innerText === 'Claim') {
        // Calculate points earned
        const pointsEarned = Math.floor(Math.random() * (userData.currentEnergy / 2)) + userData.currentEnergy * 2;
        userData.points += pointsEarned;
        userData.currentEnergy = 0;
        userData.catchingEndTime = 0;
        progressBar.style.width = '0%';
        
        // Update UI and save
        pointElement.textContent = userData.points;
        currentLegElement.textContent = Math.min(userData.points, userData.maxLeg);
        legProgress.style.width = (Math.min(userData.points, userData.maxLeg) / userData.maxLeg) * 100 + '%';
        currentEnergys_.textContent = '0';
        
        startCatchingbtn.innerText = 'Start Catching';
        startCatchingbtn.style.backgroundColor = '';
        isCatching = false;
        
        saveGameData();
        showToast("You claimed " + pointsEarned + " Legs", true);
    } else {
        showToast("Please fill the energy first!");
    }
});

// Upgrade fox
upgradefox_btn.addEventListener('click', () => {
    if (userData.points >= userData.maxLeg && !isUpgrading) {
        const totalSeconds = userData.level * 2.89 * 3600;
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        const fox_time_level_up = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        
        showMessageBox2("It requires " + userData.maxLeg + " Legs\nUpgrade time: " + fox_time_level_up);
    }
});

// Process fox upgrade
function foxnextlevel() {
    if (userData.points >= userData.maxLeg && !isUpgrading) {
        showToast('Fox upgrading has started!', true);
        userData.points -= userData.maxLeg;
        pointElement.textContent = userData.points;
        
        // Set upgrade end time
        userData.upgradeEndTime = Math.floor(Date.now() / 1000) + (userData.level * 2.89 * 3600);
        saveGameData();
        
        startUpgradeTimer();
    } else {
        showToast("You need to reach the maximum leg to upgrade.");
    }
}

// Claim chicken
claimChicken.addEventListener('click', () => {
    spinnerTest.classList.add('spinner');
    const imgElement = document.getElementById("claim-chicken");
    imgElement.style.pointerEvents = "none";

    setTimeout(() => {
        // Set next chicken arrival time (12 hours from now)
        userData.chickenArrivalTime = Math.floor(Date.now() / 1000) + 43200;
        
        // Get random chicken type
        const newChickenImage = getRandomChicken();
        imgElement.src = "svg/" + newChickenImage + ".svg";
        
        // Add chicken to inventory
        if (newChickenImage === "common") {
            userData.items.common += 1;
            commonItemElement.textContent = userData.items.common;
        } else if (newChickenImage === "rare") {
            userData.items.rare += 1;
            rareItemElement.textContent = userData.items.rare;
        } else if (newChickenImage === "epic") {
            userData.items.epic += 1;
            epicItemElement.textContent = userData.items.epic;
        } else if (newChickenImage === "legendary") {
            userData.items.legendary += 1;
            legendaryItemElement.textContent = userData.items.legendary;
        } else if (newChickenImage === "mythic") {
            userData.items.mythic += 1;
            mythicItemElement.textContent = userData.items.mythic;
        }
        
        saveGameData();
        startChickenCountdown();
        showToast("Chicken is Claimed", true);
        Chicken_Arrive.style.display = "none";
        spinnerTest.classList.remove('spinner');
    }, 2000);
});

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', initGame);
