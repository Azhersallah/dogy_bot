const points = parseInt(document.getElementById('points').textContent);
const legProgress = document.getElementById('legProgress');
const maxLeg = parseInt(document.getElementById('maxleg').textContent);
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
let maxEnergy = Number(document.getElementById('max-energy').textContent);
let currentEnergys_ = document.getElementById('current-energy');
currentEnergy = Number(currentEnergys_.textContent)


let currentLeg = Math.min(points, maxLeg);

currentLegElement.textContent = currentLeg;
legProgress.style.width = (currentLeg / maxLeg) * 100 + '%';



function foxUpgrade() {
   const currentLegElement = Number(currentLeg.textContent);
   const maxLeg = Number(maxleg.textContent);
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
   document.getElementById('current-energy').textContent = `${currentEnergy}`;
}

function updateProgress(maxEnergyForType) {
   let sendEnergy = maxEnergyForType + currentEnergy;

   if (sendEnergy > maxEnergy && currentEnergy < maxEnergy) {
      let excessEnergy = sendEnergy - maxEnergy;
      const res = confirm("You waste " + excessEnergy + " energy");
      if (res) {
         feedEnergy(maxEnergyForType);
         return true;
      }else{
         return false
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
      if(updateProgress(commonEnergy)){
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
      if(updateProgress(rareEnergy)){
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
      if(updateProgress(epicEnergy)){
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
      if(updateProgress(legendaryEnergy)){
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
      if(updateProgress(mythicEnergy)){
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
      const pointsEarned = Math.floor(Math.random() * (energyValue / 2)) + energyValue; // Minimum of 1 point
      let currentPoints = parseInt(pointElement.innerText, 10);
      pointElement.innerText = currentPoints + pointsEarned;
      currentLeg = Math.min(points + pointsEarned, maxLeg);
      currentLegElement.textContent = currentLeg;
      legProgress.style.width = (currentLeg / maxLeg) * 100 + '%';
      startCatchingbtn.innerText = 'Start Catching';
      startCatchingbtn.style.backgroundColor = '';
      isCatching = false;
      currentEnergys_.textContent = 0;
      progressBar.style.width = 0 + '%';
      currentEnergy = 0
   }else{
      alert("Please fill the energy")
   }
});