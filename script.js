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

const catchButton = document.getElementById('catchButton');
const buttonText = document.getElementById('buttonText');
const claimButton = document.getElementById('claimButton');
const pointsDisplay = document.getElementById('points');
const usernameDisplay = document.getElementById('usernameDisplay');
const loadingScreen = document.getElementById('loadingScreen');
const eyes = document.querySelectorAll('.the-fox .eyes');
const nose = document.querySelectorAll('.nose');
const toggleCheckbox = document.getElementById('toggle');
let currentPoints = 0;
var username_user ="";

// Check if userId is defined
if (!userId) {
    console.error('User ID is not defined');
} else {
    loadPoints();
    listenForUpdates();
    loadDayOrNight();
}
function updateDisplay(points,uname) {
    pointsDisplay.textContent = points;
    usernameDisplay.textContent = username_user; // Update username display

}

function loadUserData() {
    const userRef = db.ref('users/' + userId);
    console.log("Fetching user data for userId:", userId);
    
    userRef.once('value').then((snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.val();
            currentPoints = data.points || 0;
            username_user = data.username || 'Unknown User'; // Default if no username
            
            updateDisplay(currentPoints, username_user);

            console.log("Current Points:", currentPoints);
            console.log("Username:", username);

            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 1000);
        } else {
            console.error("No data found for userId:", userId);
        }
    }).catch((error) => {
        console.error("Error fetching user data:", error);
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

    db.ref('users/' + userId).update({
        userId: userId,
        catchTime: catchingTime,
        catching: true,
        points: currentPoints,
        claimed: false
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
            const hasClaimed = data.claimed;

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

// Initialize on user data load
db.ref('users/' + userId).once('value').then((snapshot) => {
    const data = snapshot.val();
    if (data && data.catching) {
        startCountdown(data.catchTime);
        catchButton.disabled = true;
        eyes.forEach(eye => eye.classList.add('blink'));
        nose.forEach(nose => nose.classList.add('nosesearch'));
    }
}).catch((error) => {
    console.error("Error fetching user data:", error);
});
