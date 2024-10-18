import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";
import { getDatabase, ref, set, get } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";

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
            // User exists in Firestore, proceed to send data to Realtime Database
            sendUserDataToDatabase(username, telegramId);
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
            // Send data to Realtime Database after creating the user
            sendUserDataToDatabase(username, telegramId);
        })
        .catch((error) => {
            console.error('Error creating user in Firestore:', error);
            document.getElementById('status').innerHTML = `<div class="error-status">Error: ${error.message}</div>`;
        });
}

function sendUserDataToDatabase(username, telegramId) {
    const userData = {
        username: username,
        telegramId: telegramId,
        user_level: 1,
        points: 0,
        booster: 3,
        slider: 1000,
        booster_is_on: false,
        booster_start: "",
        booster_end: ""
    };

    // Set user data in Realtime Database
    set(ref(database, `user-info/${telegramId}`), userData)
        .then(() => {
            console.log('User data saved to Realtime Database:', userData);
            showSuccessMessage('User data sent to Realtime Database successfully!');
            displayUserData(telegramId);
        })
        .catch((error) => {
            console.error('Error saving user data to Realtime Database:', error);
            document.getElementById('status').innerHTML = `<div class="error-status">Error: ${error.message}</div>`;
        });
}

function displayUserData(telegramId) {
    const userRef = ref(database, `user-info/${telegramId}`);
    
    get(userRef).then((snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.val();
            const userDataDiv = document.getElementById('user-data');
            userDataDiv.innerHTML = `
                <h3>User Data:</h3>
                <pre>${JSON.stringify(data, null, 2)}</pre>
            `;
        } else {
            console.log('No data available');
        }
    }).catch((error) => {
        console.error('Error getting user data:', error);
    });
}

// Button to send updated data to Realtime Database
document.getElementById('sendDataBtn').addEventListener('click', () => {
    const telegramId = tg.initDataUnsafe.user.id;
    const newPoints = prompt("Enter new points value:", "0");
    
    const userRef = ref(database, `user-info/${telegramId}`);
    
    set(userRef, { points: newPoints })
        .then(() => {
            showSuccessMessage('User points updated successfully!');
            displayUserData(telegramId);
        })
        .catch((error) => {
            console.error('Error updating user points:', error);
        });
});

function showSuccessMessage(message) {
    const successMessage = document.createElement('div');
    successMessage.textContent = message;
    successMessage.style.color = 'green';
    document.body.appendChild(successMessage);
}
