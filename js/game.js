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


// message box

function showMessageBox(message) {
   return new Promise((resolve) => {
      const messageBox = document.getElementById('messageBox');
      const messageText = document.getElementById('messageText');

      messageText.innerText = message; 
      messageBox.style.display = 'block';

      // Attach event listeners for Yes and No buttons
      document.getElementById('yesButton').onclick = function() {
         resolve(true);
         closeMessageBox();
      };

      document.getElementById('noButton').onclick = function() {
         resolve(false);
         closeMessageBox();
      };
   });
}

function closeMessageBox() {
   document.getElementById('messageBox').style.display = 'none';
}

// end of message box




// Initialize the toast element
const toastColor = document.getElementById('toastAlert');
const toastElement = document.getElementById('toastAlert');
const toastMessage = document.getElementById('toastMessage');
const toast = new bootstrap.Toast(toastElement, { delay: 2000 }); // 2-second delay

// Function to show toast with custom message
function showToast(message, status = false) {
   const toastColor = document.getElementById('toastAlert');
   const toastMessage = document.getElementById('toastMessage'); // Get the toast message element
   const iconElement = toastColor.querySelector('.d-flex i'); // Select the icon element within the toast

   if (status) {
      // If status is true, set the success styles
      toastColor.style.setProperty('background-color', '#cdfbcb', 'important'); // Change background to light green
      toastColor.style.setProperty('color', '#017909', 'important'); // Change text color to dark green
      iconElement.className = 'bi bi-check-circle-fill'; // Change icon to check circle
   } else {
      // If status is false, set the error styles
      toastColor.style.setProperty('background-color', '#fbcbcb', 'important'); // Change background to light red
      toastColor.style.setProperty('color', '#9e0000', 'important'); // Change text color to dark red
      iconElement.className = 'bi bi-dash-circle-fill'; // Change icon to dash circle
   }
    
   toastMessage.textContent = message; // Set the toast message
   toast.show(); // Show the toast
}

// Example usage:
// showToast("This is a custom alert message!");





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

function updateProgress(maxEnergyForType) {
   let sendEnergy = maxEnergyForType + currentEnergy;
   if (sendEnergy > maxEnergy && currentEnergy < maxEnergy) {
      let excessEnergy = sendEnergy - maxEnergy;

      showMessageBox("You waste " + excessEnergy + " energy").then((response) => {
         if (response) {
               feedEnergy(maxEnergyForType);
               return true;
         } else {
            return false;         }
      });
      
      
   } else if (currentEnergy < maxEnergy) {
      feedEnergy(maxEnergyForType);
      return true;
   } else {
      showToast('Energy is full');
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
      showToast('You have no common chicken');
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
      showToast('You have no rare chicken');
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
      showToast('You have no epic chicken');
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
      showToast('You have no legendary chicken');
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
      showToast('You have no mythic chicken');
   }
});

startCatchingbtn.addEventListener('click', () => {
   if (currentEnergy > 0 && !isCatching) {
      showToast("Start catching successfuly!",true)
      isCatching = true;
      startCatchingbtn.disabled = true;
      startCatchingbtn.style.backgroundColor = 'grey';
      let countdown = 60;
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
      }, 1);
   } else if (startCatchingbtn.innerText === 'Claim') {
      const energyValue = Number(currentEnergys_.textContent);
      const pointsEarned = Math.floor(Math.random() * (energyValue / 2)) + energyValue * 2;
      points = points + pointsEarned;
      pointElement.textContent = points
      console.log(points);
   
      currentLeg = Math.min(points , maxLeg)
      currentLegElement.textContent = currentLeg;
      legProgress.style.width = (currentLeg / maxLeg) * 100 + '%';

      startCatchingbtn.innerText = 'Start Catching';
      startCatchingbtn.style.backgroundColor = '';
      isCatching = false;
      currentEnergys_.textContent = 0;
      progressBar.style.width = 0 + '%';
      currentEnergy = 0;
      showToast("You claimed "+pointsEarned+" Legs",true)

   } else {
      
      showToast(" Please fill the energy first!");
   }
});
const upgradefox_btn = document.getElementById('upgrade-btn');

upgradefox_btn.addEventListener('click', () => {
   console.log("Before upgrade - Points: " + points + " / CurrentLeg: " + currentLeg + " / MaxLeg: " + maxLeg);

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

      console.log("After upgrade - Points: " + points + " / CurrentLeg: " + currentLeg + " / MaxLeg: " + maxLeg);

      alert("Upgrade successful! You are now at level " + g_level);
   } else {
      alert("You need to reach the maximum leg to upgrade.");
   }
});
