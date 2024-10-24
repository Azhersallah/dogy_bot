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
const loadingScreen = document.getElementById('loadingScreen');
const eyes = document.querySelectorAll('.the-fox .eyes');
const nose = document.querySelectorAll('.nose');
const toggleCheckbox = document.getElementById('toggle');
let currentPoints = 0;

// Check if userId is defined
if (!userId) {
    console.error('User ID is not defined');
} else {
    loadPoints();
    listenForUpdates();
    loadDayOrNight();
}

function updatePointsDisplay(points) {
    pointsDisplay.textContent = points;
}

function loadPoints() {
    const userPointsRef = db.ref('users/' + userId + '/points');
    userPointsRef.once('value').then((snapshot) => {
        currentPoints = snapshot.val() || 0;
        updatePointsDisplay(currentPoints);
    }).catch((error) => {
        console.error("Error loading points:", error);
    }).finally(() => {
        loadingScreen.style.display = 'none';
    });
}

function updateDayOrNight(isChecked) {
    db.ref('users/' + userId + '/dayOrNight').set(isChecked).catch((error) => {
        console.error("Error updating day or night:", error);
    });
}

function loadDayOrNight() {
    const dayOrNightRef = db.ref('users/' + userId + '/dayOrNight');
    dayOrNightRef.once('value').then((snapshot) => {
        toggleCheckbox.checked = snapshot.val() || false;
    }).catch((error) => {
        console.error("Error loading day or night:", error);
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
    }).catch((error) => {
        console.error("Error sending catching data:", error);
    });

    catchButton.disabled = true;
}

function startCountdown(targetTime) {
    const countdownInterval = setInterval(() => {
        const remainingTime = new Date(targetTime) - new Date();
        if (remainingTime <= 0) {
            clearInterval(countdownInterval);
            buttonText.textContent = 'Catching is complete';
            claimButton.style.display = 'flex';
            catchButton.style.display = 'none';
            db.ref('users/' + userId).update({ catching: false }).catch((error) => {
                console.error("Error updating catching status:", error);
            });
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
    }, (error) => {
        console.error("Error listening for updates:", error);
    });
}

function addPointsToUser(points) {
    currentPoints += points;
    const userPointsRef = db.ref('users/' + userId + '/points');
    userPointsRef.set(currentPoints).catch((error) => {
        console.error("Error adding points:", error);
    });
    updatePointsDisplay(currentPoints);
}

function claimPoints() {
    addPointsToUser(100);
    
    db.ref('users/' + userId).update({ claimed: true }).catch((error) => {
        console.error("Error claiming points:", error);
    });

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
});

claimButton.addEventListener('click', claimPoints);

// Initialize on user data load
db.ref('users/' + userId).once('value').then((snapshot) => {
    const data = snapshot.val();
    if (data && data.catching) {
        startCountdown(data.catchTime);
        catchButton.disabled = true;
    }
}).catch((error) => {
    console.error("Error fetching user data:", error);
});
