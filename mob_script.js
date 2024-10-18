
document.addEventListener('contextmenu', function(event) {
    event.preventDefault(); // Disable right-click context menu
});

document.addEventListener('selectstart', function(event) {
    event.preventDefault(); // Disable text selection
});


function isLaptop() {
    return !/Mobi|Android/i.test(navigator.userAgent);
}

document.addEventListener("DOMContentLoaded", function() {
    if (isLaptop()) {
        document.body.innerHTML = '<h1 class="lap_text">This is Only Work on Mobile device!</h1><img id="qrCode" src="qr.png" alt="QR Code" /> <!-- Replace with the path to your QR code image -->'; // Clear all content
        const qrCode = document.getElementById("qrCode");
        qrCode.style.display = "block"; // Show QR code
        document.body.appendChild(qrCode); // Add QR code to body
    } else {
        // Optional: You can add mobile-specific content here
    }
});
