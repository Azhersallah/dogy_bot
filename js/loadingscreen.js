const loadingScreen = document.getElementById('loading');
const content = document.getElementById('content');

// Set your desired timeout (in milliseconds)
const timeoutDuration = 2000; // 3 seconds

// Function to hide the loading screen
function hideLoadingScreen() {
  loadingScreen.style.display = 'none';
  content.style.display = 'block';
}

// Wait for the page to fully load, then hide the loading screen
window.onload = function () {
  // Set a timeout to ensure the loading screen is visible for at least the specified duration
  setTimeout(hideLoadingScreen, timeoutDuration);
};