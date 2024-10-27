const points = parseInt(document.getElementById('points').textContent);
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
const pointElement = document.getElementById('points');
let isCatching = false;
let currentEnergys_ = document.getElementById('current-energy');
let currentEnergy = Number(currentEnergys_.textContent);
const myLevel = document.getElementById('level-nubmer');
let g_level = Number(myLevel.textContent);
let maxEnergy = g_level * 5;
document.getElementById('max-energy').textContent = maxEnergy;

const maxLeg = (g_level + 5) * 10;
document.getElementById('maxleg').textContent = maxLeg;

let totalSeconds = g_level * 2.89 * 3600;
let hours = Math.floor(totalSeconds / 3600);
let minutes = Math.floor((totalSeconds % 3600) / 60);
let seconds = totalSeconds % 60;

hours = String(hours).padStart(2, '0');
minutes = String(minutes).padStart(2, '0');
seconds = String(seconds).padStart(2, '0');

const upgradeTimeFormatted = `${hours}:${minutes}:${seconds}`;

const upgrade_time = document.getElementById('upgradeTime');
upgrade_time.textContent = upgradeTimeFormatted;





let currentLeg = Math.min(points, maxLeg);
currentLegElement.textContent = currentLeg;
legProgress.style.width = (currentLeg / maxLeg) * 100 + '%';

function foxUpgrade() {
   const currentLeg = Number(currentLegElement.textContent);
   const maxLeg = Number(document.getElementById('maxleg').textContent);
   if (currentLeg === maxLeg) {
      document.getElementById('foxUpgrade').style.display = 'flex';
   } else {
      setTimeout(foxUpgrade, 1000);
   }
}

foxUpgrade();

function feedEnergy(maxEnergyForType) {
   let progressIncrement = (maxEnergyForType / maxEnergy) * 100;
   currentEnergy = Math.min(currentEnergy + maxEnergyForType, maxEnergy);
   let progress = (currentEnergy / maxEnergy) * 100;
   progressBar.style.width = progress + '%';
   currentEnergys_.textContent = `${currentEnergy}`;
}

function updateProgress(maxEnergyForType) {
   let sendEnergy = maxEnergyForType + currentEnergy;
   if (sendEnergy > maxEnergy && currentEnergy < maxEnergy) {
      let excessEnergy = sendEnergy - maxEnergy;
      const res = confirm("You waste " + excessEnergy + " energy");
      if (res) {
         feedEnergy(maxEnergyForType);
         return true;
      } else {
         return false;
      }
   } else if (currentEnergy < maxEnergy) {
      feedEnergy(maxEnergyForType);
      return true;
   } else {
      alert('Energy is full');
      return false;
   }
}

commonBtn.addEventListener('click', () => {
   let commonItemCount = Number(commonItemElement.textContent);
   if (commonItemCount > 0) {
      let commonEnergy = 5;
      if (updateProgress(commonEnergy)) {
         commonItemElement.textContent = commonItemCount - 1;
      }
   } else {
      alert('You have no common chicken');
   }
});

rareBtn.addEventListener('click', () => {
   let rareItemCount = Number(rareItemElement.textContent);
   if (rareItemCount > 0) {
      let rareEnergy = 20;
      if (updateProgress(rareEnergy)) {
         rareItemElement.textContent = rareItemCount - 1;
      }
   } else {
      alert('You have no rare chicken');
   }
});

epicBtn.addEventListener('click', () => {
   let epicItemCount = Number(epicItemElement.textContent);
   if (epicItemCount > 0) {
      let epicEnergy = 60;
      if (updateProgress(epicEnergy)) {
         epicItemElement.textContent = epicItemCount - 1;
      }
   } else {
      alert('You have no epic chicken');
   }
});

legendaryBtn.addEventListener('click', () => {
   let legendaryItemCount = Number(legendaryItemElement.textContent);
   if (legendaryItemCount > 0) {
      let legendaryEnergy = 180;
      if (updateProgress(legendaryEnergy)) {
         legendaryItemElement.textContent = legendaryItemCount - 1;
      }
   } else {
      alert('You have no legendary chicken');
   }
});

mythicBtn.addEventListener('click', () => {
   let mythicItemCount = Number(mythicItemElement.textContent);
   if (mythicItemCount > 0) {
      let mythicEnergy = 420;
      if (updateProgress(mythicEnergy)) {
         mythicItemElement.textContent = mythicItemCount - 1;
      }
   } else {
      alert('You have no mythic chicken');
   }
});

startCatchingbtn.addEventListener('click', () => {
   if (currentEnergy > 0 && !isCatching) {
      isCatching = true;
      startCatchingbtn.disabled = true;
      startCatchingbtn.style.backgroundColor = 'grey';
      let countdown = 1;
      const interval = setInterval(() => {
         if (countdown <= 0) {
            clearInterval(interval);
            startCatchingbtn.disabled = false;
            startCatchingbtn.style.backgroundColor = 'green';
            startCatchingbtn.innerText = 'Claim';
         } else {
            startCatchingbtn.innerText = `Catching(${Math.floor(countdown / 60)}:${(countdown % 60).toString().padStart(2, '0')})`;
            countdown--;
         }
      }, 1000);
   } else if (startCatchingbtn.innerText === 'Claim') {
      const energyValue = Number(currentEnergys_.textContent);
      const pointsEarned = Math.floor(Math.random() * (energyValue / 2)) + energyValue * 2;
      let currentPoints = parseInt(pointElement.innerText, 10);
      pointElement.innerText = currentPoints + pointsEarned;
      if (currentLeg > maxLeg) {
         currentLeg = maxLeg
         currentLegElement.textContent = currentLeg;
         legProgress.style.width = 100 + '%';
      } else if (currentLeg <= maxLeg) {
         currentLeg = Math.min(points + pointsEarned) + currentLeg
         currentLegElement.textContent = currentLeg;
         legProgress.style.width = (currentLeg / maxLeg) * 100 + '%';
         if (currentLeg > maxLeg) {
            currentLeg = maxLeg
            currentLegElement.textContent = currentLeg;
            legProgress.style.width = 100 + '%';
         }
      }
      startCatchingbtn.innerText = 'Start Catching';
      startCatchingbtn.style.backgroundColor = '';
      isCatching = false;
      currentEnergys_.textContent = 0;
      progressBar.style.width = 0 + '%';
      currentEnergy = 0;
   } else {
      alert("Please fill the energy");
   }
});
