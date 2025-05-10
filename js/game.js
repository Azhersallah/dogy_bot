// Firebase initialization
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-app.js";
import { getDatabase, ref, set, get, child, update } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-database.js";

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
const user = tg.initDataUnsafe.user;
const userId = user?.id;

// Game elements
const pointElement = document.getElementById('points');
let points = Number(pointElement.textContent);
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
const upgrade_time = document.getElementById('upgradeTime');
const myLevel = document.getElementById('level-nubmer');
let g_level = Number(myLevel.textContent);
let maxEnergy = g_level * 5;
document.getElementById('max-energy').textContent = maxEnergy;

let maxLeg = (g_level + 5) * 10;
document.getElementById('maxleg').textContent = maxLeg;

let currentEnergys_ = document.getElementById('current-energy');
let currentEnergy = Number(currentEnergys_.textContent);
let currentLeg = Math.min(points, maxLeg);
currentLegElement.textContent = currentLeg;
legProgress.style.width = (currentLeg / maxLeg) * 100 + '%';

let isCatching = false;
let isUpgrading = false;
let chickenArrivalActive = false;

// Initialize timers
let catchingEndTime = 0;
let upgradeEndTime = 0;
let chickenArrivalEndTime = 0;

// Toast notification
const toastColor = document.getElementById('toastAlert');
const toastElement = document.getElementById('toastAlert');
const toastMessage = document.getElementById('toastMessage');
const toast = new bootstrap.Toast(toastElement, { delay: 2000 });

function showToast(message, status = false) {
  const toastColor = document.getElementById('toastAlert');
  const toastMessage = document.getElementById('toastMessage');
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

// Function to save game data to Firebase
async function saveGameData() {
  if (!userId) return;

  const gameData = {
    points: points,
    level: g_level,
    commonItems: Number(commonItemElement.textContent),
    rareItems: Number(rareItemElement.textContent),
    epicItems: Number(epicItemElement.textContent),
    legendaryItems: Number(legendaryItemElement.textContent),
    mythicItems: Number(mythicItemElement.textContent),
    currentEnergy: currentEnergy,
    maxEnergy: maxEnergy,
    currentLeg: currentLeg,
    maxLeg: maxLeg,
    catchingEndTime: catchingEndTime,
    upgradeEndTime: upgradeEndTime,
    chickenArrivalEndTime: chickenArrivalEndTime,
    lastUpdated: new Date().toISOString()
  };

  try {
    await set(ref(database, `users/${userId}`), gameData);
    console.log("Game data saved successfully");
  } catch (error) {
    console.error("Error saving game data:", error);
  }
}

// Load game data from Firebase
async function loadGameData() {
  if (!userId) return;

  try {
    const snapshot = await get(ref(database, `users/${userId}`));
    if (snapshot.exists()) {
      const data = snapshot.val();
      
      // Update game state
      points = data.points || 0;
      pointElement.textContent = points;
      g_level = data.level || 1;
      myLevel.textContent = g_level;
      commonItemElement.textContent = data.commonItems || 1;
      rareItemElement.textContent = data.rareItems || 1;
      epicItemElement.textContent = data.epicItems || 1;
      legendaryItemElement.textContent = data.legendaryItems || 1;
      mythicItemElement.textContent = data.mythicItems || 0;
      currentEnergy = data.currentEnergy || 0;
      currentEnergys_.textContent = currentEnergy;
      maxEnergy = g_level * 5;
      document.getElementById('max-energy').textContent = maxEnergy;
      progressBar.style.width = (currentEnergy / maxEnergy) * 100 + '%';
      maxLeg = (g_level + 5) * 10;
      document.getElementById('maxleg').textContent = maxLeg;
      currentLeg = Math.min(points, maxLeg);
      currentLegElement.textContent = currentLeg;
      legProgress.style.width = (currentLeg / maxLeg) * 100 + '%';

      // Check active timers
      const now = Date.now();
      catchingEndTime = data.catchingEndTime || 0;
      upgradeEndTime = data.upgradeEndTime || 0;
      chickenArrivalEndTime = data.chickenArrivalEndTime || 0;

      if (catchingEndTime > now) {
        startCatchingTimer(catchingEndTime - now);
      }

      if (upgradeEndTime > now) {
        startUpgradeTimer(upgradeEndTime - now);
      }

      if (chickenArrivalEndTime > now) {
        startChickenArrivalTimer(chickenArrivalEndTime - now);
      } else {
        startChickenCountdown();
      }
    }
  } catch (error) {
    console.error("Error loading game data:", error);
  }
}

// Message Box functions
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

// Game mechanics
function foxUpgrade() {
  if (currentLeg >= maxLeg && !isUpgrading) {
    document.getElementById('foxUpgrade').style.display = 'flex';
  } else {
    document.getElementById('foxUpgrade').style.display = 'none';
  }
  setTimeout(foxUpgrade, 1000);
}

function feedEnergy(maxEnergyForType) {
  currentEnergy = Math.min(currentEnergy + maxEnergyForType, maxEnergy);
  let progress = (currentEnergy / maxEnergy) * 100;
  progressBar.style.width = progress + '%';
  currentEnergys_.textContent = `${currentEnergy}`;
}

async function updateProgress(maxEnergyForType, chicken_type) {
  let sendEnergy = maxEnergyForType + currentEnergy;
  if (sendEnergy > maxEnergy && currentEnergy < maxEnergy) {
    let excessEnergy = sendEnergy - maxEnergy;

    const resultmsb = await showMessageBox("If you feed it this Chicken\nyou'll waste " + excessEnergy + " energy.\nAre you sure?", chicken_type, maxEnergyForType);
    if (resultmsb) {
      feedEnergy(maxEnergyForType);
      await saveGameData();
      return true;
    } else {
      return false;
    }
  } else if (currentEnergy < maxEnergy) {
    const resultmsb = await showMessageBox("Do you want to use Chicken\nto feed Fox?", chicken_type, maxEnergyForType);
    if (resultmsb) {
      feedEnergy(maxEnergyForType);
      await saveGameData();
      return true;
    } else {
      return false;
    }
  } else {
    showToast('Energy is full');
    return false;
  }
}

// Chicken types
const chickens = [
  { type: "common", image: "common", probability: 0.65 },
  { type: "rare", image: "rare", probability: 0.1791 },
  { type: "epic", image: "epic", probability: 0.1140 },
  { type: "legendary", image: "legendary", probability: 0.0408 },
  { type: "mythic", image: "mythic", probability: 0.0161 },
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
}

// Timer functions
function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function startCatchingTimer(durationMs) {
  isCatching = true;
  startCatchingbtn.disabled = true;
  startCatchingbtn.style.backgroundColor = 'grey';
  
  const endTime = Date.now() + durationMs;
  catchingEndTime = endTime;
  saveGameData();

  const interval = setInterval(() => {
    const remaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
    
    if (remaining <= 0) {
      clearInterval(interval);
      startCatchingbtn.disabled = false;
      startCatchingbtn.style.backgroundColor = 'green';
      startCatchingbtn.innerText = 'Claim';
      isCatching = false;
      catchingEndTime = 0;
      saveGameData();
    } else {
      startCatchingbtn.innerText = `Catching(${formatTime(remaining)})`;
    }
  }, 1000);
}

function startUpgradeTimer(durationMs) {
  isUpgrading = true;
  document.getElementById('foxUpgrade').style.display = 'none';
  
  const endTime = Date.now() + durationMs;
  upgradeEndTime = endTime;
  saveGameData();

  const interval = setInterval(() => {
    const remaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
    
    if (remaining <= 0) {
      clearInterval(interval);
      upgrade_time.textContent = "00:00:00";
      isUpgrading = false;
      upgradeEndTime = 0;
      completeUpgrade();
      saveGameData();
    } else {
      upgrade_time.textContent = formatTime(remaining);
    }
  }, 1000);
}

function startChickenArrivalTimer(durationMs) {
  chickenArrivalActive = true;
  
  const endTime = Date.now() + durationMs;
  chickenArrivalEndTime = endTime;
  saveGameData();

  const interval = setInterval(() => {
    const remaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
    
    if (remaining <= 0) {
      clearInterval(interval);
      newChicken.textContent = "00:00:00";
      chickenArrivalActive = false;
      chickenArrivalEndTime = 0;
      showToast("New chicken is arrived!", true);
      Chicken_Arrive.style.display = "flex";
      
      const newChickenImage = getRandomChicken();
      const chickenImageElement = document.getElementById('claim-chicken');
      chickenImageElement.src = "svg/" + newChickenImage + ".svg";
      saveGameData();
    } else {
      newChicken.textContent = formatTime(remaining);
    }
  }, 1000);
}

function startChickenCountdown() {
  const durationMs = 20 * 1000; // 20 seconds
  startChickenArrivalTimer(durationMs);
}

function completeUpgrade() {
  g_level += 1;
  myLevel.textContent = g_level;

  maxEnergy = g_level * 5;
  document.getElementById('max-energy').textContent = maxEnergy;

  maxLeg = (g_level + 5) * 10;
  document.getElementById('maxleg').textContent = maxLeg;

  currentLeg = Math.min(points, maxLeg);
  currentLegElement.textContent = currentLeg;
  legProgress.style.width = (currentLeg / maxLeg) * 100 + '%';
  progressBar.style.width = (currentEnergy / maxEnergy) * 100 + '%';

  showToast("Upgrade successful to level " + g_level, true);
}

// Event listeners
commonBtn.addEventListener('click', async () => {
  let commonItemCount = Number(commonItemElement.textContent);
  if (commonItemCount > 0) {
    let commonEnergy = 5;
    const commonFeed = await updateProgress(commonEnergy, 'common');
    if (commonFeed) {
      commonItemElement.textContent = commonItemCount - 1;
      showToast('Feed fox successfuly!', true);
      await saveGameData();
    }
  } else {
    showToast('You have no common chicken');
  }
});

rareBtn.addEventListener('click', async () => {
  let rareItemCount = Number(rareItemElement.textContent);
  if (rareItemCount > 0) {
    let rareEnergy = 20;
    const rareFeed = await updateProgress(rareEnergy, 'rare');
    if (rareFeed) {
      rareItemElement.textContent = rareItemCount - 1;
      showToast('Feed fox successfuly!', true);
      await saveGameData();
    }
  } else {
    showToast('You have no rare chicken');
  }
});

epicBtn.addEventListener('click', async () => {
  let epicItemCount = Number(epicItemElement.textContent);
  if (epicItemCount > 0) {
    let epicEnergy = 60;
    const epicFeed = await updateProgress(epicEnergy, 'epic');
    if (epicFeed) {
      epicItemElement.textContent = epicItemCount - 1;
      showToast('Feed fox successfuly!', true);
      await saveGameData();
    }
  } else {
    showToast('You have no epic chicken');
  }
});

legendaryBtn.addEventListener('click', async () => {
  let legendaryItemCount = Number(legendaryItemElement.textContent);
  if (legendaryItemCount > 0) {
    let legendaryEnergy = 180;
    const legendaryFeed = await updateProgress(legendaryEnergy, 'legendary');
    if (legendaryFeed) {
      legendaryItemElement.textContent = legendaryItemCount - 1;
      showToast('Feed fox successfuly!', true);
      await saveGameData();
    }
  } else {
    showToast('You have no legendary chicken');
  }
});

mythicBtn.addEventListener('click', async () => {
  let mythicItemCount = Number(mythicItemElement.textContent);
  if (mythicItemCount > 0) {
    let mythicEnergy = 420;
    const mythicFeed = await updateProgress(mythicEnergy, 'mythic');
    if (mythicFeed) {
      mythicItemElement.textContent = mythicItemCount - 1;
      showToast('Feed fox successfuly!', true);
      await saveGameData();
    }
  } else {
    showToast('You have no mythic chicken');
  }
});

startCatchingbtn.addEventListener('click', () => {
  if (currentEnergy > 0 && !isCatching && startCatchingbtn.innerText === 'Start Catching') {
    showToast("Start catching successfully!", true);
    const durationMs = 10 * 1000; // 10 seconds
    startCatchingTimer(durationMs);
  } else if (startCatchingbtn.innerText === 'Claim') {
    const energyValue = currentEnergy;
    const pointsEarned = Math.floor(Math.random() * (energyValue / 2)) + energyValue * 2;
    points = points + pointsEarned;
    pointElement.textContent = points;

    currentLeg = Math.min(points, maxLeg);
    currentLegElement.textContent = currentLeg;
    legProgress.style.width = (currentLeg / maxLeg) * 100 + '%';

    startCatchingbtn.innerText = 'Start Catching';
    startCatchingbtn.style.backgroundColor = '';
    isCatching = false;
    currentEnergys_.textContent = 0;
    progressBar.style.width = 0 + '%';
    currentEnergy = 0;
    showToast("You claimed " + pointsEarned + " Legs", true);
    saveGameData();
  } else {
    showToast("Please fill the energy first!");
  }
});

document.getElementById('upgrade-btn').addEventListener('click', () => {
  let upgrade_fee = maxLeg;
  let upgradeDuration = g_level * 2.89 * 3600 * 1000; // Convert to milliseconds
  let upgradeTimeFormatted = formatTime(Math.floor(upgradeDuration / 1000));
  
  showMessageBox2("It requires " + upgrade_fee + " Legs\nUpgrade time: " + upgradeTimeFormatted);
});

function foxnextlevel() {
  if (currentLeg >= maxLeg) {
    showToast('Fox upgrading has started!', true);
    points = points - maxLeg;
    pointElement.textContent = points;
    currentLeg = Math.min(points, maxLeg);
    currentLegElement.textContent = currentLeg;
    legProgress.style.width = (currentLeg / maxLeg) * 100 + '%';
    
    const upgradeDuration = g_level * 2.89 * 3600 * 1000; // Convert to milliseconds
    startUpgradeTimer(upgradeDuration);
    saveGameData();
  } else {
    showToast("You need to reach the maximum leg to upgrade.");
  }
}

const claimChicken = document.getElementById('claim-chicken');
const spinnerTest = document.querySelector('.spinnerTest');

claimChicken.addEventListener('click', () => {
  spinnerTest.classList.add('spinner');
  claimChicken.style.pointerEvents = "none";

  setTimeout(() => {
    spinnerTest.classList.remove('spinner');
    const imgSrc = claimChicken.src;
    const imgName = imgSrc.substring(imgSrc.lastIndexOf("/") + 1);
    
    if (imgName === "common.svg") {
      let commonItemCounts = Number(commonItemElement.textContent);
      commonItemElement.textContent = commonItemCounts + 1;
    } else if (imgName === "rare.svg") {
      let rareItemCounts = Number(rareItemElement.textContent);
      rareItemElement.textContent = rareItemCounts + 1;
    } else if (imgName === "epic.svg") {
      let epicItemCounts = Number(epicItemElement.textContent);
      epicItemElement.textContent = epicItemCounts + 1;
    } else if (imgName === "legendary.svg") {
      let legendaryItemCounts = Number(legendaryItemElement.textContent);
      legendaryItemElement.textContent = legendaryItemCounts + 1;
    } else if (imgName === "mythic.svg") {
      let mythicItemCounts = Number(mythicItemElement.textContent);
      mythicItemElement.textContent = mythicItemCounts + 1;
    }
    
    Chicken_Arrive.style.display = "none";
    showToast("Chicken is Claimed", true);
    startChickenCountdown();
    saveGameData();
  }, 2000);
});

// Initialize game
document.addEventListener('DOMContentLoaded', () => {
  loadGameData();
  foxUpgrade();
  
  // If no chicken arrival is active, start one
  if (!chickenArrivalActive && chickenArrivalEndTime <= Date.now()) {
    startChickenCountdown();
  }
});
