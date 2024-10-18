import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";

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
const database = getDatabase(app);

// Initialize the Telegram Web App
const tg = window.Telegram.WebApp;

// Function to send user data to Realtime Database
function sendUserDataToDatabase(userInfo) {
    const { username, telegramId, userLevel, points, booster, slider, boosterIsOn } = userInfo;

    const userData = {
        username: username,
        telegramId: telegramId,
        user_level: userLevel,
        points: points,
        booster: booster,
        slider: slider,
        booster_is_on: boosterIsOn,
        booster_start: "",
        booster_end: ""
    };

    // Set user data in Realtime Database
    set(ref(database, `user-info/${telegramId}`), userData)
        .then(() => {
            console.log('User data saved to Realtime Database:', userData);
            document.getElementById('status').innerHTML = `<div class="status">User data sent to Realtime Database successfully!</div>`;
        })
        .catch((error) => {
            console.error('Error saving user data to Realtime Database:', error);
            document.getElementById('status').innerHTML = `<div class="error-status">Error: ${error.message}</div>`;
        });
}

// Retrieve user data from HTML
function getUserDataFromHTML() {
    const username = document.getElementById('username').innerText;
    const telegramId = document.getElementById('telegramId').innerText;
    const userLevel = parseInt(document.getElementById('user_level').innerText);
    const points = parseInt(document.getElementById('points').innerText);
    const booster = parseInt(document.getElementById('booster').innerText);
    const slider = parseInt(document.getElementById('slider').innerText);
    const boosterIsOn = document.getElementById('booster_is_on').innerText === 'true';

    return {
        username,
        telegramId,
        userLevel,
        points,
        booster,
        slider,
        boosterIsOn
    };
}

// Execute on page load
window.onload = () => {
    const userInfo = getUserDataFromHTML();
    sendUserDataToDatabase(userInfo);
};
