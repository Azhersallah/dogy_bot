import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";
import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";

// Your Firebase configuration
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
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const database = getDatabase(app);

// Initialize the Telegram Web App
const tg = window.Telegram.WebApp;

// Get the initData from Telegram
const initData = tg.initData;

if (initData) {
    const user = tg.initDataUnsafe.user;

    if (user) {
        const telegramId = user.id;

        // Display user information
        document.getElementById('status').innerHTML = `
            <div class="auth-info">
                <p>Authenticated as: ${user.first_name} ${user.last_name || ''}</p>
                <p>Username: ${user.username}</p>
                <p>User ID: ${telegramId}</p>
            </div>
        `;

        // Check if user exists in Firestore
        checkUserInFirestore(telegramId, user.username);
    } else {
        document.getElementById('status').innerHTML = `<div class="error-status">Failed to get user data</div>`;
    }
} else {
    document.getElementById('status').innerHTML = `<div class="error-status">No init data found</div>`;
}

function checkUserInFirestore(telegramId, username) {
    const userDocRef = doc(db, "user-info", telegramId.toString());

    getDoc(userDocRef).then((docSnapshot) => {
        if (docSnapshot.exists()) {
            // User exists in Firestore, fetch existing data
            listenForLiveUpdates(telegramId);
        } else {
            // User not found, create new user in Firestore
            createUserInFirestore(telegramId, username);
        }
    }).catch((error) => {
        console.error('Error fetching user from Firestore:', error);
        document.getElementById('status').innerHTML = `<div class="error-status">Error: ${error.message}</div>`;
    });
}

function createUserInFirestore(telegramId, username) {
    const userData = {
        username: username,
        telegramId: telegramId,
        createdAt: new Date().toISOString()
    };

    // Set new user data in Firestore
    setDoc(doc(db, "user-info", telegramId.toString()), userData)
        .then(() => {
            console.log('New user created in Firestore:', userData);
            // Automatically send data to Realtime Database after creating the user
            sendUserDataToDatabase(telegramId);
        })
        .catch((error) => {
            console.error('Error creating user in Firestore:', error);
            document.getElementById('status').innerHTML = `<div class="error-status">Error: ${error.message}</div>`;
        });
}

function sendUserDataToDatabase(telegramId) {
    const userData = {
        username: document.getElementById('username').innerText,
        telegramId: telegramId,
        user_level: parseInt(document.getElementById('userLevel').innerText) || 1,
        points: parseInt(document.getElementById('points').innerText) || 0,
        booster: parseInt(document.getElementById('booster').innerText) || 3,
        slider: parseInt(document.getElementById('slider').innerText) || 1000,
        booster_is_on: document.getElementById('boosterIsOn').innerText === 'true',
        booster_start: document.getElementById('boosterStart').innerText || "",
        booster_end: document.getElementById('boosterEnd').innerText || ""
    };

    // Set user data in Realtime Database
    set(ref(database, `user-info/${telegramId}`), userData)
        .then(() => {
            console.log('User data saved to Realtime Database:', userData);
            showSuccessMessage('User data sent to Realtime Database successfully!');
            // Start listening for live updates
            listenForLiveUpdates(telegramId);
        })
        .catch((error) => {
            console.error('Error saving user data to Realtime Database:', error);
            document.getElementById('status').innerHTML = `<div class="error-status">Error: ${error.message}</div>`;
        });
}

function listenForLiveUpdates(telegramId) {
    const userRef = ref(database, `user-info/${telegramId}`);
    
    // Listen for value changes
    onValue(userRef, (snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.val();
            // Update the HTML with live data
            document.getElementById('username').innerText = data.username;
            document.getElementById('userLevel').innerText = data.user_level || 1;
            document.getElementById('points').innerText = data.points || 0;
            document.getElementById('booster').innerText = data.booster || 3;
            document.getElementById('slider').innerText = data.slider || 1000;
            document.getElementById('boosterIsOn').innerText = data.booster_is_on ? 'true' : 'false';
            document.getElementById('boosterStart').innerText = data.booster_start || "";
            document.getElementById('boosterEnd').innerText = data.booster_end || "";
        } else {
            console.log('No data available');
        }
    }, (error) => {
        console.error('Error listening for updates:', error);
    });
}

function showSuccessMessage(message) {
    const successMessage = document.createElement('div');
    successMessage.textContent = message;
    successMessage.style.color = 'green';
    document.body.appendChild(successMessage);
}
