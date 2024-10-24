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
const initData = tg.initData;

let userId = null; // Initialize userId
let tgUser = null; // Initialize tg_user
if (initData) {
    const user = tg.initDataUnsafe.user;
    userId = user ? user.id : null; // Set userId to tg_id
    tgUser = user ? user.username : null; // Set tg_user
}
// Create a script element to load the Telegram Web App library
const script = document.createElement('script');
script.src = 'https://telegram.org/js/telegram-web-app.js';
script.onload = () => {
    // Once the script is loaded, we can access the Telegram Web App API
    Telegram.WebApp.ready();

    // Function to extract user ID
    const getUserId = () => {
        const user = Telegram.WebApp.initDataUnsafe.user;
        const userId = user ? user.id : null;
        console.log('User ID:', userId);
    };

    // Get the user ID
    getUserId();
};

// Append the script to the document head
document.head.appendChild(script);
// Set up DOM elements
const catchButton = document.getElementById('catchButton');
const buttonText = document.getElementById('buttonText');
const claimButton = document.getElementById('claimButton');
const pointsDisplay = document.getElementById('points');
const loadingScreen = document.getElementById('loadingScreen');
const eyes = document.querySelectorAll('.the-fox .eyes');
const nose = document.querySelectorAll('.nose');
const toggleCheckbox = document.getElementById('toggle');
const tgUserDisplay = document.getElementById('tg_user'); // Element to display tgUser
let currentPoints = 0;

function updatePointsDisplay(points) {
    pointsDisplay.textContent = points;
}

function loadPoints() {
    const userPointsRef = db.ref('users/' + userId + '/points');
    userPointsRef.once('value').then((snapshot) => {
        currentPoints = snapshot.val() || 0;
        updatePointsDisplay(currentPoints);

        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 1000);
    });
}

function loadTgUser() {
    const userRef = db.ref('users/' + userId);
    userRef.once('value').then((snapshot) => {
        const data = snapshot.val();
        if (data && data.tgUser) {
            tgUserDisplay.textContent = data.tgUser; // Display tgUser
        } else {
            tgUserDisplay.textContent = tgUser || "Not available"; // Fallback if not in DB
        }
    });
}

function updateDayOrNight(isChecked) {
    db.ref('users/' + userId + '/dayOrNight').set(isChecked);
}

function loadDayOrNight() {
    const dayOrNightRef = db.ref('users/' + userId + '/dayOrNight');
    dayOrNightRef.once('value').then((snapshot) => {
        const isChecked = snapshot.val() || false;
        toggleCheckbox.checked = isChecked;
    });
}

function sendCatchingData() {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 5);
    const catchingTime = now.toISOString();

    db.ref('users/' + userId).set({
        userId: userId,
        tgUser: tgUser, // Store tg_user in Firebase
        catchTime: catchingTime,
        catching: true,
        points: currentPoints,
        claimed: false // Set claimed to false initially
    });

    catchButton.disabled = true;
}

function startCountdown(targetTime) {
    const countdownInterval = setInterval(() => {
        const currentTime = new Date();
        const remainingTime = new Date(targetTime) - currentTime;

        if (remainingTime <= 0) {
            clearInterval(countdownInterval);
            buttonText.textContent = 'Catching is complete';
            claimButton.style.display = 'flex';
            catchButton.style.display = 'none';
            catchButton.disabled = false;

            db.ref('users/' + userId).update({ catching: false });
            eyes.forEach(eye => eye.classList.remove('blink'));
            nose.forEach(nose => nose.classList.remove('nosesearch'));
        } else {
            const minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);
            buttonText.textContent = `Catching... ${minutes}m ${seconds}s`;
        }
    });
}

function listenForUpdates() {
    db.ref('users/' + userId).on('value', (snapshot) => {
        const data = snapshot.val();
        if (data) {
            const targetTime = data.catchTime;
            const isCatching = data.catching;
            const hasClaimed = data.claimed; // Check claimed state

            if (isCatching) {
                startCountdown(targetTime);
                catchButton.disabled = true;
                eyes.forEach(eye => eye.classList.add('blink'));
                nose.forEach(nose => nose.classList.add('nosesearch'));
            }

            if (new Date() >= new Date(targetTime) && !hasClaimed) {
                buttonText.textContent = 'Catching is complete';
                claimButton.style.display = 'flex';
                catchButton.style.display = 'none';
            }

            if (data.points !== undefined) {
                currentPoints = data.points;
                updatePointsDisplay(currentPoints);
            }
        }
    });
}

function addPointsToUser(points) {
    currentPoints += points;
    const userPointsRef = db.ref('users/' + userId + '/points');
    userPointsRef.set(currentPoints);
    updatePointsDisplay(currentPoints);
}

function claimPoints() {
    addPointsToUser(100);

    // Update the claimed status in Firebase
    db.ref('users/' + userId).update({ claimed: true });

    buttonText.textContent = 'Start Catching';
    claimButton.style.display = 'none';
    catchButton.style.display = 'flex';
}

toggleCheckbox.addEventListener('change', () => {
    const isChecked = toggleCheckbox.checked;
    updateDayOrNight(isChecked);
});

catchButton.addEventListener('click', () => {
    buttonText.textContent = `Catching...`;
    sendCatchingData();
    listenForUpdates();
});

claimButton.addEventListener('click', claimPoints);

loadPoints();
loadTgUser(); // Load tgUser and display it
listenForUpdates();
loadDayOrNight();

db.ref('users/' + userId).once('value').then((snapshot) => {
    const data = snapshot.val();
    if (data && data.catching) {
        startCountdown(data.catchTime);
        catchButton.disabled = true;
        eyes.forEach(eye => eye.classList.add('blink'));
        nose.forEach(nose => nose.classList.add('nosesearch'));
    }
});
