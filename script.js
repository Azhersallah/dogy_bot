// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCNGOAnTyQ-z91is5nku_vKQMIXMsjH3sg",
    authDomain: "ttaskk-a50e4.firebaseapp.com",
    databaseURL: "https://ttaskk-a50e4-default-rtdb.firebaseio.com",
    projectId: "ttaskk-a50e4",
    storageBucket: "ttaskk-a50e4.appspot.com",
    messagingSenderId: "213200371465",
    appId: "1:213200371465:web:2cee76953abdc5d8049dd8"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

const tg = window.Telegram.WebApp;
const userId = tg.initDataUnsafe.user.id; // Using Telegram ID directly
const catchButton = document.getElementById('catchButton');
const buttonText = document.getElementById('buttonText');
const claimButton = document.getElementById('claimButton');
const pointsDisplay = document.getElementById('points');
const loadingScreen = document.getElementById('loadingScreen');
const eyes = document.querySelectorAll('.the-fox .eyes'); // Select eyes elements
const nose = document.querySelectorAll('.nose'); // Select nose elements
const toggleCheckbox = document.getElementById('toggle'); // Select the checkbox
let currentPoints = 0; // Hold current points globally

function updatePointsDisplay(points) {
    pointsDisplay.textContent = points; // Update points on the page
}

function loadPoints() {
    const userPointsRef = db.ref('users/' + userId + '/points');
    userPointsRef.once('value').then((snapshot) => {
        currentPoints = snapshot.val() || 0; // Load points or default to 0
        updatePointsDisplay(currentPoints); // Update the display with the current points
        
        // Delay hiding the loading screen by 2 seconds (2000 milliseconds)
        setTimeout(() => {
            loadingScreen.style.display = 'none'; // Hide loading screen after 2 seconds
        }, 1000);
    });
}

// Function to update the checkbox state in Firebase
function updateDayOrNight(isChecked) {
    db.ref('users/' + userId + '/dayOrNight').set(isChecked);
}

// Function to load the checkbox state from Firebase
function loadDayOrNight() {
    const dayOrNightRef = db.ref('users/' + userId + '/dayOrNight');
    dayOrNightRef.once('value').then((snapshot) => {
        const isChecked = snapshot.val() || false; // Default to false if not set
        toggleCheckbox.checked = isChecked; // Set the checkbox state
    });
}

function sendCatchingData() {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 1); // Add 1 minute to current time
    const catchingTime = now.toISOString();

    // Send data to Firebase Realtime Database
    db.ref('users/' + userId).set({
        userId: userId,
        catchTime: catchingTime, // Store the future catching time
        catching: true,
        points: currentPoints // Store the current points in the database
    });

    // Disable the catching button during countdown
    catchButton.disabled = true;
}

function startCountdown(targetTime) {
    const countdownInterval = setInterval(() => {
        const currentTime = new Date();
        const remainingTime = new Date(targetTime) - currentTime; // Remaining time in milliseconds

        if (remainingTime <= 0) {
            clearInterval(countdownInterval);
            buttonText.textContent = 'Catching is complete';
            claimButton.style.display = 'flex'; // Show Claim button
            catchButton.style.display = 'none'; // Hide Start Catching button
            catchButton.disabled = false; // Re-enable button after countdown is done

            // Mark catching as done in Firebase
            db.ref('users/' + userId).update({ catching: false });

            // Remove blinking effect when catching is done
            eyes.forEach(eye => eye.classList.remove('blink'));
            nose.forEach(nose => nose.classList.remove('nosesearch'));
        } else {
            const minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);
            buttonText.textContent = `Catching... ${minutes}m ${seconds}s`;
        }
    }, 1000);
}

function listenForUpdates() {
    db.ref('users/' + userId).on('value', (snapshot) => {
        const data = snapshot.val();
        if (data) {
            const targetTime = data.catchTime;
            const isCatching = data.catching;

            // Check if catching is active
            if (isCatching) {
                startCountdown(targetTime);
                catchButton.disabled = true; // Keep the button disabled if catching is active

                // Add blinking effect while catching is active
                eyes.forEach(eye => eye.classList.add('blink'));
                nose.forEach(nose => nose.classList.add('nosesearch'));
            }

            // Check if catching is complete and show claim button
            if (new Date() >= new Date(targetTime)) {
                buttonText.textContent = 'Catching is complete';
                claimButton.style.display = 'flex'; // Show Claim button
                catchButton.style.display = 'none'; // Hide Start Catching button
            }

            // Update the points display
            if (data.points !== undefined) {
                currentPoints = data.points;
                updatePointsDisplay(currentPoints);
            }
        }
    });
}

// Function to add 100 points to the user when claim button is clicked
function addPointsToUser(points) {
    currentPoints += points; // Increment the global points variable
    const userPointsRef = db.ref('users/' + userId + '/points');
    userPointsRef.set(currentPoints); // Update points in the database
    updatePointsDisplay(currentPoints); // Update the display on the page
}

function claimPoints() {
    // Add 100 points to the user
    addPointsToUser(100);
    
    // Reset the button text and states
    buttonText.textContent = 'Start Catching';
    claimButton.style.display = 'none'; // Hide Claim button again
    catchButton.style.display = 'flex'; // Show Start Catching button again
}

// Event listener for the toggle checkbox
toggleCheckbox.addEventListener('change', () => {
    const isChecked = toggleCheckbox.checked; // Get the checkbox state
    updateDayOrNight(isChecked); // Update the database with the checkbox state
});

// Event listener for the catch button
catchButton.addEventListener('click', () => {
    buttonText.textContent = `Catching...`;

    // Send catching data (date + 1 minute) immediately when clicked
    sendCatchingData();

    // Listen for updates after sending data to Firebase
    listenForUpdates();
});

// Event listener for the claim button
claimButton.addEventListener('click', claimPoints);

// Automatically load points and start listening for updates when the page loads
loadPoints();
listenForUpdates();
loadDayOrNight(); // Load checkbox state from Firebase

// Immediately check if catching is active when the page loads
db.ref('users/' + userId).once('value').then((snapshot) => {
    const data = snapshot.val();
    if (data && data.catching) {
        startCountdown(data.catchTime); // Start countdown if catching is active
        catchButton.disabled = true; // Disable catch button during active catching
        eyes.forEach(eye => eye.classList.add('blink'));
        nose.forEach(nose => nose.classList.add('nosesearch'));
    }
});
