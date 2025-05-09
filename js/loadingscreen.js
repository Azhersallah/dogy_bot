// loadingscreen.js
document.addEventListener("DOMContentLoaded", () => {
  const loadingScreen = document.getElementById("loading");
  const userNameElement = document.getElementById("user-name");
  const userPhotoElement = document.getElementById("user-photo");
  loadingScreen.style.display = 'flex';

  // Initialize Firebase first
  const firebaseConfig = {
    apiKey: "AIzaSyC6-AK8Xf6Wpf3fAIgEzP9htfb38RpmfZQ",
    authDomain: "test33-f1333.firebaseapp.com",
    projectId: "test33-f1333",
    storageBucket: "test33-f1333.appspot.com",document.addEventListener("DOMContentLoaded", () => {
  const loadingScreen = document.getElementById("loading");
  const userNameElement = document.getElementById("user-name");
  const userPhotoElement = document.getElementById("user-photo");
  loadingScreen.style.display = 'flex';

  // Check if Telegram WebApp is available
  if (window.Telegram && Telegram.WebApp) {
    // Expand the WebApp to full view
    Telegram.WebApp.expand();
    
    // Get user data
    const user = Telegram.WebApp.initDataUnsafe.user;
    
    if (user) {
      // Display user's first name or username
      const displayName = user.first_name || user.username || 'Telegram User';
      userNameElement.textContent = displayName;
      
      // Set user photo if available
      if (user.photo_url) {
        userPhotoElement.src = user.photo_url;
        userPhotoElement.onerror = function() {
          // Fallback if photo fails to load
          userPhotoElement.src = "img/profile.jpg";
        };
      }
      
      // You can also access other user data:
      // console.log("Telegram User ID:", user.id);
      // console.log("Last Name:", user.last_name);
      // console.log("Username:", user.username);
    }
  }

  window.addEventListener("load", () => {
     setTimeout(() => {
        loadingScreen.style.display = 'none';
        
        loadingScreen.addEventListener("transitionend", () => {
           loadingScreen.style.display = 'none';
        }, { once: true });
     }, 2000); 
  });
});
    messagingSenderId: "1063398052714",
    appId: "1:1063398052714:web:df7f29879f24f459670b13",
    measurementId: "G-ZQM7V8XS88"
  };

  // Initialize Firebase
  if (typeof firebase === 'undefined') {
    console.error("Firebase SDK not loaded");
    // Fallback: Load Firebase manually
    const firebaseScript = document.createElement('script');
    firebaseScript.src = "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
    firebaseScript.onload = () => {
      const firebaseDBScript = document.createElement('script');
      firebaseDBScript.src = "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
      firebaseDBScript.onload = initializeApp;
      document.head.appendChild(firebaseDBScript);
    };
    document.head.appendChild(firebaseScript);
  } else {
    initializeApp();
  }

  function initializeApp() {
    try {
      const app = firebase.initializeApp(firebaseConfig);
      window.db = firebase.getDatabase(app);
      console.log("Firebase initialized successfully");
      
      // Now check Telegram WebApp
      checkTelegramUser();
    } catch (error) {
      console.error("Firebase initialization error:", error);
      loadingScreen.style.display = 'none';
    }
  }

  function checkTelegramUser() {
    // Check if Telegram WebApp is available
    if (window.Telegram && Telegram.WebApp) {
      Telegram.WebApp.expand();
      const user = Telegram.WebApp.initDataUnsafe.user;
      
      if (user) {
        const displayName = user.first_name || user.username || 'Telegram User';
        userNameElement.textContent = displayName;
        
        if (user.photo_url) {
          userPhotoElement.src = user.photo_url;
          userPhotoElement.onerror = function() {
            userPhotoElement.src = "img/profile.jpg";
          };
        }
        
        // Store user ID for game.js to use
        window.userId = user.id.toString();
        console.log("Telegram user ID:", window.userId);
      } else {
        console.log("No Telegram user data, using test mode");
        window.userId = "test_user_" + Math.floor(Math.random() * 10000);
      }
    } else {
      console.log("Telegram WebApp not available, using test mode");
      window.userId = "test_user_" + Math.floor(Math.random() * 10000);
    }

    // Hide loading screen after everything is ready
    setTimeout(() => {
      loadingScreen.style.display = 'none';
    }, 2000); 
  }
});
