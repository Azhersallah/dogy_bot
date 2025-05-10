// Firebase initialization
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-app.js";
import { getDatabase, ref, set, get, update } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyCv234_o3nSE2ljP5tgVP-c1MLrRA1witQ",
  authDomain: "dogybot-d985c.firebaseapp.com",
  databaseURL: "https://dogybot-d985c-default-rtdb.firebaseio.com",
  projectId: "dogybot-d985c",
  storageBucket: "dogybot-d985c.firebasestorage.app",
  messagingSenderId: "459874143073",
  appId: "1:459874143073:web:c1cfa551ef4c89e2105320",
  measurementId: "G-4YK9GNN7XS"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Telegram WebApp initialization
const tg = window.Telegram.WebApp;
tg.expand();
const user = tg.initDataUnsafe?.user;
const userId = user?.id.toString();

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
const currentEnergyElement = document.getElementById('current-energy');
const maxEnergyElement = document.getElementById('max-energy');
const startCatchingbtn = document.getElementById('start-catching');
const newChickenTimer = document.getElementById('time-value');
const chickenArriveContainer = document.getElementById('chickenArrive');
const upgradeTimeDisplay = document.getElementById('upgradeTime');
const levelNumber = document.getElementById('level-nubmer');
const maxLegDisplay = document.getElementById('maxleg');
const userPhotoElement = document.querySelector('.userPhoto img');
const userNameElement = document.querySelector('.name');

// Game state
let gameState = {
  points: 0,
  level: 1,
  commonItems: 1,
  rareItems: 1,
  epicItems: 1,
  legendaryItems: 1,
  mythicItems: 0,
  currentEnergy: 0,
  currentLeg: 0,
  catchingEndTime: 0,
  upgradeEndTime: 0,
  chickenArrivalEndTime: 0
};

// Timers
let catchingInterval;
let upgradeInterval;
let chickenArrivalInterval;

// Initialize game
async function initGame() {
  // Set up Telegram user info
  if (user) {
    userNameElement.textContent = user.first_name || 'Player';
    if (user.photo_url) {
      userPhotoElement.src = user.photo_url;
    }
  }

  // Load game data from Firebase
  if (userId) {
    try {
      const snapshot = await get(ref(database, `users/${userId}`));
      if (snapshot.exists()) {
        gameState = snapshot.val();
        updateUI();
      }
    } catch (error) {
      console.error("Error loading game data:", error);
    }
  }

  // Check active timers
  checkActiveTimers();
  startChickenCountdown();
  setInterval(foxUpgradeCheck, 1000);
}

function updateUI() {
  pointElement.textContent = gameState.points;
  levelNumber.textContent = gameState.level;
  commonItemElement.textContent = gameState.commonItems;
  rareItemElement.textContent = gameState.rareItems;
  epicItemElement.textContent = gameState.epicItems;
  legendaryItemElement.textContent = gameState.legendaryItems;
  mythicItemElement.textContent = gameState.mythicItems;
  
  const maxEnergy = gameState.level * 5;
  maxEnergyElement.textContent = maxEnergy;
  currentEnergyElement.textContent = gameState.currentEnergy;
  progressBar.style.width = `${(gameState.currentEnergy / maxEnergy) * 100}%`;
  
  const maxLeg = (gameState.level + 5) * 10;
  maxLegDisplay.textContent = maxLeg;
  gameState.currentLeg = Math.min(gameState.points, maxLeg);
  currentLegElement.textContent = gameState.currentLeg;
  legProgress.style.width = `${(gameState.currentLeg / maxLeg) * 100}%`;
}

function checkActiveTimers() {
  const now = Date.now();
  
  // Catching timer
  if (gameState.catchingEndTime > now) {
    startCatchingTimer(gameState.catchingEndTime - now);
  }
  
  // Upgrade timer
  if (gameState.upgradeEndTime > now) {
    startUpgradeTimer(gameState.upgradeEndTime - now);
  }
  
  // Chicken arrival timer
  if (gameState.chickenArrivalEndTime > now) {
    startChickenArrivalTimer(gameState.chickenArrivalEndTime - now);
  }
}

function foxUpgradeCheck() {
  const maxLeg = (gameState.level + 5) * 10;
  document.getElementById('foxUpgrade').style.display = 
    (gameState.currentLeg >= maxLeg && !gameState.upgradeEndTime) ? 'flex' : 'none';
}

// Timer functions
function formatTime(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function startCatchingTimer(duration) {
  clearInterval(catchingInterval);
  
  const endTime = Date.now() + duration;
  gameState.catchingEndTime = endTime;
  saveGameState();
  
  startCatchingbtn.disabled = true;
  startCatchingbtn.style.backgroundColor = 'grey';
  
  catchingInterval = setInterval(() => {
    const remaining = endTime - Date.now();
    
    if (remaining <= 0) {
      clearInterval(catchingInterval);
      startCatchingbtn.disabled = false;
      startCatchingbtn.style.backgroundColor = 'green';
      startCatchingbtn.textContent = 'Claim';
      gameState.catchingEndTime = 0;
      saveGameState();
    } else {
      startCatchingbtn.textContent = `Catching (${formatTime(remaining)})`;
    }
  }, 1000);
}

function startUpgradeTimer(duration) {
  clearInterval(upgradeInterval);
  
  const endTime = Date.now() + duration;
  gameState.upgradeEndTime = endTime;
  saveGameState();
  
  upgradeInterval = setInterval(() => {
    const remaining = endTime - Date.now();
    
    if (remaining <= 0) {
      clearInterval(upgradeInterval);
      upgradeTimeDisplay.textContent = "00:00:00";
      completeUpgrade();
      gameState.upgradeEndTime = 0;
      saveGameState();
    } else {
      upgradeTimeDisplay.textContent = formatTime(remaining);
    }
  }, 1000);
}

function startChickenArrivalTimer(duration) {
  clearInterval(chickenArrivalInterval);
  
  const endTime = Date.now() + duration;
  gameState.chickenArrivalEndTime = endTime;
  saveGameState();
  
  chickenArrivalInterval = setInterval(() => {
    const remaining = endTime - Date.now();
    
    if (remaining <= 0) {
      clearInterval(chickenArrivalInterval);
      newChickenTimer.textContent = "00:00:00";
      chickenArriveContainer.style.display = "flex";
      showToast("New chicken arrived!", true);
      
      const chickenImage = getRandomChicken();
      document.getElementById('claim-chicken').src = `svg/${chickenImage}.svg`;
      gameState.chickenArrivalEndTime = 0;
      saveGameState();
    } else {
      newChickenTimer.textContent = formatTime(remaining);
    }
  }, 1000);
}

function startChickenCountdown() {
  if (gameState.chickenArrivalEndTime > Date.now()) return;
  
  const duration = 20000; // 20 seconds
  startChickenArrivalTimer(duration);
}

// Game actions
async function feedFox(chickenType, energyValue) {
  if (gameState.currentEnergy >= gameState.level * 5) {
    showToast('Energy is full!', false);
    return false;
  }
  
  const itemKey = `${chickenType}Items`;
  if (gameState[itemKey] <= 0) {
    showToast(`You have no ${chickenType} chickens!`, false);
    return false;
  }
  
  const result = await showMessageBox(
    `Do you want to feed the fox with ${chickenType} chicken for ${energyValue} energy?`,
    chickenType,
    energyValue
  );
  
  if (result) {
    gameState[itemKey]--;
    gameState.currentEnergy = Math.min(gameState.currentEnergy + energyValue, gameState.level * 5);
    updateUI();
    saveGameState();
    showToast(`Fed fox with ${chickenType} chicken!`, true);
    return true;
  }
  return false;
}

function startCatching() {
  if (gameState.currentEnergy <= 0) {
    showToast('Fill energy first!', false);
    return;
  }
  
  if (gameState.catchingEndTime > Date.now()) return;
  
  const duration = 10000; // 10 seconds
  startCatchingTimer(duration);
  showToast('Started catching legs!', true);
}

function claimLegs() {
  const pointsEarned = Math.floor(Math.random() * (gameState.currentEnergy / 2)) + gameState.currentEnergy * 2;
  gameState.points += pointsEarned;
  gameState.currentEnergy = 0;
  updateUI();
  saveGameState();
  
  startCatchingbtn.textContent = 'Start Catching';
  startCatchingbtn.style.backgroundColor = '';
  showToast(`Claimed ${pointsEarned} legs!`, true);
}

function startUpgrade() {
  const maxLeg = (gameState.level + 5) * 10;
  if (gameState.currentLeg < maxLeg) {
    showToast(`Need ${maxLeg} legs to upgrade!`, false);
    return;
  }
  
  const duration = gameState.level * 2.89 * 3600 * 1000; // Hours to milliseconds
  gameState.points -= maxLeg;
  updateUI();
  startUpgradeTimer(duration);
  showToast('Started fox upgrade!', true);
}

function completeUpgrade() {
  gameState.level++;
  updateUI();
  showToast(`Fox upgraded to level ${gameState.level}!`, true);
}

function claimChicken() {
  const chickenImg = document.getElementById('claim-chicken').src;
  const chickenType = chickenImg.split('/').pop().replace('.svg', '');
  const itemKey = `${chickenType}Items`;
  
  gameState[itemKey]++;
  updateUI();
  saveGameState();
  
  chickenArriveContainer.style.display = "none";
  showToast(`Claimed ${chickenType} chicken!`, true);
  startChickenCountdown();
}

// Helper functions
function getRandomChicken() {
  const rand = Math.random();
  if (rand < 0.65) return 'common';
  if (rand < 0.8291) return 'rare';
  if (rand < 0.9431) return 'epic';
  if (rand < 0.9839) return 'legendary';
  return 'mythic';
}

async function showMessageBox(message, chickenType, energyValue) {
  return new Promise((resolve) => {
    document.getElementById('chickenType').textContent = `${chickenType} / ${energyValue} Energy`;
    document.getElementById('chicken-msg-img').src = `svg/${chickenType}.svg`;
    document.getElementById('messageText').textContent = message;
    document.getElementById('messageBox').style.display = 'flex';
    
    document.getElementById('yesButton').onclick = () => {
      document.getElementById('messageBox').style.display = 'none';
      resolve(true);
    };
    
    document.getElementById('noButton').onclick = () => {
      document.getElementById('messageBox').style.display = 'none';
      resolve(false);
    };
  });
}

function showToast(message, isSuccess) {
  const toast = document.getElementById('toastAlert');
  const toastMessage = document.getElementById('toastMessage');
  const icon = toast.querySelector('i');
  
  toast.style.backgroundColor = isSuccess ? '#cdfbcb' : '#fbcbcb';
  toast.style.color = isSuccess ? '#017909' : '#9e0000';
  icon.className = isSuccess ? 'bi bi-check-circle-fill' : 'bi bi-dash-circle-fill';
  toastMessage.textContent = message;
  
  bootstrap.Toast.getOrCreateInstance(toast).show();
}

async function saveGameState() {
  if (!userId) return;
  
  try {
    await set(ref(database, `users/${userId}`), gameState);
  } catch (error) {
    console.error("Error saving game state:", error);
  }
}

// Event listeners
document.getElementById('common-chicken').addEventListener('click', () => feedFox('common', 5));
document.getElementById('rare-chicken').addEventListener('click', () => feedFox('rare', 20));
document.getElementById('epic-chicken').addEventListener('click', () => feedFox('epic', 60));
document.getElementById('legendary-chicken').addEventListener('click', () => feedFox('legendary', 180));
document.getElementById('mythic-chicken').addEventListener('click', () => feedFox('mythic', 420));

startCatchingbtn.addEventListener('click', () => {
  if (startCatchingbtn.textContent === 'Start Catching') {
    startCatching();
  } else if (startCatchingbtn.textContent === 'Claim') {
    claimLegs();
  }
});

document.getElementById('upgrade-btn').addEventListener('click', startUpgrade);
document.getElementById('claim-chicken').addEventListener('click', claimChicken);

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', initGame);
