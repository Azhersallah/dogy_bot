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

const fox_time_level_up = upgrade_time.textContent; // Get the time in the format "02:53:24"

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
let isUpgrading = false; // State variable to track if an upgrade is in progress

function foxUpgrade() {
   const currentLeg = Number(currentLegElement.textContent);
   const maxLeg = Number(document.getElementById('maxleg').textContent);

   if (currentLeg >= maxLeg && !isUpgrading) {
      document.getElementById('foxUpgrade').style.display = 'flex';
   } else {
      document.getElementById('foxUpgrade').style.display = 'none';
   }
   setTimeout(foxUpgrade, 1000); // Keep checking every second

}

// Run the function initially
foxUpgrade();



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
      let countdown = 10;
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
   let fox_time_level_up = upgrade_time.textContent; // Get the time in the format "02:53:24"

   showMessageBox2("It requires " + upgrade_fee + " Legs\nUpgrade time: " + fox_time_level_up)

});

function foxnextlevel() {

   if (currentLeg >= maxLeg) {
      showToast('Fox upgrading has started!', true)
      points = Math.max(points - maxLeg);
      pointElement.textContent = points;
      let fox_time_level_up = upgrade_time.textContent; // Get the time in the format "02:53:24"
      let countdownTime = parseTimeToSeconds(fox_time_level_up); // Convert to seconds

      isUpgrading = true; // Set upgrading status to true

      // Start the countdown timer
      startCountdown(countdownTime);
   } else {
      showToast("You need to reach the maximum leg to upgrade.");
   }

   // Function to parse the "HH:MM:SS" format to seconds
   function parseTimeToSeconds(timeString) {
      const [hours, minutes, seconds] = timeString.split(':').map(Number);
      return hours * 3600 + minutes * 60 + seconds;
   }

   // Countdown timer function
   function startCountdown(duration) {
      let timeLeft = duration;

      const countdownInterval = setInterval(() => {
         timeLeft--;

         // Update the `upgrade_time` element's text content with the new time
         const hours = Math.floor(timeLeft / 3600).toString().padStart(2, '0');
         const minutes = Math.floor((timeLeft % 3600) / 60).toString().padStart(2, '0');
         const seconds = (timeLeft % 60).toString().padStart(2, '0');
         upgrade_time.textContent = `${hours}:${minutes}:${seconds}`;

         // When countdown ends, clear interval and trigger the next action
         if (timeLeft <= 0) {
            clearInterval(countdownInterval);
            upgrade_time.textContent = "00:00:00"; // Optional: reset to zero
            performNextAction(); // Call the function for the next action
         }
      }, 1000);
   }

   // Function for the next action after countdown ends
   function performNextAction() {
      isUpgrading = false; // Reset upgrading status to false


      g_level += 1;
      myLevel.textContent = g_level;

      maxEnergy = g_level * 5;
      document.getElementById('max-energy').textContent = maxEnergy;

      maxLeg = (g_level + 5) * 10;
      document.getElementById('maxleg').textContent = maxLeg;

      currentLeg = Math.min(points, maxLeg);
      currentLegElement.textContent = currentLeg;
      legProgress.style.width = (currentLeg / maxLeg) * 100 + '%';
      progress = (currentEnergy / maxEnergy) * 100;
      progressBar.style.width = progress + '%';

      showToast("Upgrade successful to level " + g_level, true);


   }

}

// Define the chicken types with their images and probabilities
const chickens = [
   { type: "common", image: "common", probability: 0.5 },
   { type: "rare", image: "rare", probability: 0.2 },
   { type: "epic", image: "epic", probability: 0.15 },
   { type: "legendary", image: "legendary", probability: 0.1 },
   { type: "mythic", image: "mythic", probability: 0.05 },
];

// Function to randomly select a chicken image based on defined probabilities
function getRandomChicken() {
   const random = Math.random(); // Generate a random number between 0 and 1
   let cumulativeProbability = 0;

   for (const chicken of chickens) {
      cumulativeProbability += chicken.probability; // Accumulate the probability
      if (random < cumulativeProbability) {
         return chicken.image; // Return the image of the selected chicken type
      }
   }
}

// New chicken arrived function
function startChickenCountdown() {
   const imgElement = document.getElementById("claim-chicken");
   imgElement.style.pointerEvents = "auto";
   // Get the initial time value in the format "HH:MM:SS"
   let timeValue = "00:01:00";
   let countdownTime = parseTimeToSeconds(timeValue); // Convert to seconds

   // Start the countdown
   const countdownInterval = setInterval(() => {
      if (countdownTime <= 0) {
         clearInterval(countdownInterval);
         newChicken.textContent = "00:00:00"; // Reset to zero

         // Show toast message when complete
         showToast("New chicken is arrived!", true);
         Chicken_Arrive.style.display = "flex";


         // Set the new chicken image
         const newChickenImage = getRandomChicken(); // Get a random chicken image
         const chickenImageElement = document.getElementById('claim-chicken'); // Select your image element
         chickenImageElement.src = "svg/" + newChickenImage + ".svg"; // Update the image source



      } else {
         countdownTime--;

         // Update the `newChicken` element's text content with the new time
         const hours = Math.floor(countdownTime / 3600).toString().padStart(2, '0');
         const minutes = Math.floor((countdownTime % 3600) / 60).toString().padStart(2, '0');
         const seconds = (countdownTime % 60).toString().padStart(2, '0');
         newChicken.textContent = `${hours}:${minutes}:${seconds}`;
      }
   }, 1000);
}

// Function to parse the "HH:MM:SS" format to seconds
function parseTimeToSeconds(timeString) {
   const [hours, minutes, seconds] = timeString.split(':').map(Number);
   return hours * 3600 + minutes * 60 + seconds;
}

const claimChicken = document.getElementById('claim-chicken');
const spinnerTest = document.querySelector('.spinnerTest'); // Select the spinnerTest element

claimChicken.addEventListener('click', () => {
   // Add the spinner class to the spinnerTest element
   spinnerTest.classList.add('spinner'); // Ensure you have the appropriate CSS for the spinner
   const imgElement = document.getElementById("claim-chicken");
   imgElement.style.pointerEvents = "none";


   // Use setTimeout to delay the chicken claiming logic
   setTimeout(() => {
      startChickenCountdown();
      showToast("Chicken is Claimed", true); 
      Chicken_Arrive.style.display = "none";
      const imgSrc = imgElement.src;
      const imgName = imgSrc.substring(imgSrc.lastIndexOf("/") + 1);
      spinnerTest.classList.remove('spinner');

     if (imgName === "common.svg") {
        let commonItemCounts = Number(commonItemElement.textContent);
        commonItemElement.textContent = commonItemCounts+ 1;
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

   }, 2000); // Delay for 2 seconds
});
startChickenCountdown();
