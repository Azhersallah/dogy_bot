// Import Firebase modules
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

// Function to send user data to the Realtime Database
function sendUserDataToDatabase(userData) {
    // Set user data in Realtime Database
    set(ref(database, `user-info/${userData.telegramId}`), userData)
        .then(() => {
            console.log('User data saved to Realtime Database:', userData);
            document.getElementById('status').innerText = "Data sent successfully!";
        })
        .catch((error) => {
            console.error('Error saving user data to Realtime Database:', error);
            document.getElementById('status').innerText = `Error: ${error.message}`;
        });
}

// Function to initialize and run when the script is loaded
function init() {
    const initData = tg.initData;

    if (initData) {
        const user = tg.initDataUnsafe.user;

        if (user) {
            // Create user data object from the h1 elements
            const userData = {
                username: document.getElementById('username').innerText,
                telegramId: user.id,  // Use the Telegram user ID
                user_level: parseInt(document.getElementById('user_level').innerText),
                points: parseInt(document.getElementById('points').innerText),
                booster: parseInt(document.getElementById('booster').innerText),
                slider: parseInt(document.getElementById('slider').innerText),
                booster_is_on: document.getElementById('booster_is_on').innerText === 'true',
                booster_start: document.getElementById('booster_start').innerText,
                booster_end: document.getElementById('booster_end').innerText
            };

            // Automatically send user data to Firebase
            sendUserDataToDatabase(userData);
        } else {
            console.error('Failed to get user data');
        }
    } else {
        console.error('No init data found');
    }
}

// Run the initialization function
init();
