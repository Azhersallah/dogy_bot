document.addEventListener("DOMContentLoaded", () => {
  const loadingScreen = document.getElementById("loading");
  loadingScreen.style.display = 'flex'; 

  window.addEventListener("load", () => {
     setTimeout(() => {
        loadingScreen.style.display = 'none';
        
        loadingScreen.addEventListener("transitionend", () => {
           loadingScreen.style.display = 'none';
        }, { once: true });
     }, 2000); 
  });
});
