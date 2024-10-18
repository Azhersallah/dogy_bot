// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

// Your Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCNGOAnTyQ-z91is5nku_vKQMIXMsjH3sg",
    authDomain: "ttaskk-a50e4.firebaseapp.com",
    projectId: "ttaskk-a50e4",
    storageBucket: "ttaskk-a50e4.appspot.com",
    messagingSenderId: "213200371465",
    appId: "1:213200371465:web:2cee76953abdc5d8049dd8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Initialize the Telegram Web App
const tg = window.Telegram.WebApp;

// Get the initData from Telegram
const initData = tg.initData;

if (initData) {
    const user = tg.initDataUnsafe.user;

    if (user) {
        const telegramId = user.id;
        const username = user.username || "No Username"; // Handle cases where username might be undefined

        // Display user information in the HTML
        document.getElementById('username').innerText = username;
        document.getElementById('telegramId').innerText = telegramId;

        // Prepare user data from HTML elements
        const userData = {
            username: username,
            telegramId: telegramId,
            user_level: parseInt(document.getElementById('user_level').innerText),
            points: parseInt(document.getElementById('points').innerText),
            booster: parseInt(document.getElementById('booster').innerText),
            slider: parseInt(document.getElementById('slider').innerText),
            booster_is_on: document.getElementById('booster_is_on').innerText === 'true',
            booster_start: document.getElementById('booster_start').innerText,
            booster_end: document.getElementById('booster_end').innerText
        };

        // Send user data to Firestore
        sendUserDataToFirestore(userData);
    } else {
        document.getElementById('status').innerText = 'Failed to get user data';
    }
} else {
    document.getElementById('status').innerText = 'No init data found';
}

function sendUserDataToFirestore(userData) {
    const userDocRef = doc(db, "user-info", userData.telegramId.toString());

    setDoc(userDocRef, userData)
        .then(() => {
            console.log('User data saved to Firestore:', userData);
            document.getElementById('status').innerText = 'User data sent to Firestore successfully!';
        })
        .catch((error) => {
            console.error('Error saving user data to Firestore:', error);
            document.getElementById('status').innerText = 'Error: ' + error.message;
        });
}
