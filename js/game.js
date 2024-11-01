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
let isCatching = false;
let currentEnergys_ = document.getElementById('current-energy');
let currentEnergy = Number(currentEnergys_.textContent);
const myLevel = document.getElementById('level-nubmer');
let g_level = Number(myLevel.textContent);
let maxEnergy = g_level * 5;
document.getElementById('max-energy').textContent = maxEnergy;

let maxLeg = (g_level + 5) * 10;
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

// end of message box

// message box 2
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

// end of messageBox 2



// Initialize the toast element
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



let currentLeg = Math.min(points, maxLeg);
currentLegElement.textContent = currentLeg;
legProgress.style.width = (currentLeg / maxLeg) * 100 + '%';

function foxUpgrade() {
   const currentLeg = Number(currentLegElement.textContent);
   const maxLeg = Number(document.getElementById('maxleg').textContent);

   if (currentLeg >= maxLeg) {
      document.getElementById('foxUpgrade').style.display = 'flex';
   } else {
      document.getElementById('foxUpgrade').style.display = 'none';
   }
   setTimeout(foxUpgrade, 1000); // Keep checking every second

}

// Run the function initially
foxUpgrade();



function feedEnergy(maxEnergyForType) {
   let progressIncrement = (maxEnergyForType / maxEnergy) * 100;
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
         return true;
      } else {
         return false;
      }

   } else if (currentEnergy < maxEnergy) {
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


commonBtn.addEventListener('click', async () => {
   let commonItemCount = Number(commonItemElement.textContent);
   if (commonItemCount > 0) {
      let commonEnergy = 5;
      const commonFeed = await updateProgress(commonEnergy, 'common');
      if (commonFeed) {
         commonItemElement.textContent = commonItemCount - 1;
         showToast('Feed fox successfuly!', true)
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
         showToast('Feed fox successfuly!', true)
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
         showToast('Feed fox successfuly!', true)
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
         showToast('Feed fox successfuly!', true)
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
         showToast('Feed fox successfuly!', true)
      }
   } else {
      showToast('You have no mythic chicken');
   }
});

startCatchingbtn.addEventListener('click', () => {
   if (currentEnergy > 0 && !isCatching) {
      showToast("Start catching successfully!", true);
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
            const hours = Math.floor(countdown / 3600);
            const minutes = Math.floor((countdown % 3600) / 60);
            const seconds = countdown % 60;
            startCatchingbtn.innerText = `Catching(${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')})`;
            countdown--;
         }
      }, 1000);
   } else if (startCatchingbtn.innerText === 'Claim') {
      const energyValue = Number(currentEnergys_.textContent);
      const pointsEarned = Math.floor(Math.random() * (energyValue / 2)) + energyValue * 2;
      points = points + pointsEarned;
      pointElement.textContent = points
      console.log(points);

      currentLeg = Math.min(points, maxLeg)
      currentLegElement.textContent = currentLeg;
      legProgress.style.width = (currentLeg / maxLeg) * 100 + '%';

      startCatchingbtn.innerText = 'Start Catching';
      startCatchingbtn.style.backgroundColor = '';
      isCatching = false;
      currentEnergys_.textContent = 0;
      progressBar.style.width = 0 + '%';
      currentEnergy = 0;
      showToast("You claimed " + pointsEarned + " Legs", true)

   } else {

      showToast(" Please fill the energy first!");
   }
});
const upgradefox_btn = document.getElementById('upgrade-btn');

upgradefox_btn.addEventListener('click', () => {
   let upgrade_fee = maxLeg;
   showMessageBox2("It requires "+upgrade_fee+" Legs")

});

function foxnextlevel() {

   if (currentLeg >= maxLeg) {
      points = Math.max(points - maxLeg);
      pointElement.textContent = points;

      g_level += 1;
      myLevel.textContent = g_level;

      maxEnergy = g_level * 5;
      document.getElementById('max-energy').textContent = maxEnergy;

      maxLeg = (g_level + 5) * 10;
      document.getElementById('maxleg').textContent = maxLeg;

      currentLeg = Math.min(points, maxLeg);
      currentLegElement.textContent = currentLeg;
      legProgress.style.width = (currentLeg / maxLeg) * 100 + '%';

      showToast("Upgrade successful to level " + g_level, true);
   } else {
      showToast("You need to reach the maximum leg to upgrade.");
   }

}