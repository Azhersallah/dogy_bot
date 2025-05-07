document.addEventListener("DOMContentLoaded", () => {
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
