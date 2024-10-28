const loadingScreens = document.getElementById('loading');
const timeoutDurations = 0; 
function hideLoadingScreen() {
  loadingScreens.style.display = 'none';
}
window.onload = function () {
  setTimeout(hideLoadingScreen, timeoutDurations);
};