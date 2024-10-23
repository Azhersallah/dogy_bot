<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Telegram Web App</title>
    <link rel="stylesheet" href="fox_style.css">
    <link rel="stylesheet" href="bottom_nav.css">
    <script src="https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js"></script>
    <script src="https://www.gstatic.com/firebasejs/8.10.1/firebase-database.js"></script>

    <style>
        body {
            user-select: none; /* Prevent text selection */
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
        }

        .userinfo {
            position: absolute;
            top: 0;
            background-color: #34A87C;
            width: 100%;
            display: flex;
            justify-content: space-around;
            align-items: center;
            height: 8vh;
            color: white;
        }
    </style>
</head>
<body>
    <div id="loadingScreen">
        <img src="SVG/Loading.svg" alt="">
    </div>

    <div class="userinfo">
        <div class="username">
            <p>Fox: <span id="username">Loading...</span></p>
        </div>
        <div class="userlevel">
            <span>Level: 1</span>
        </div>
    </div>

    <div class="legs">
        <img src="SVG/legs.svg">
        <h1 id="points">0</h1>
    </div>

    <div class="the-container">
        <input type="checkbox" id="toggle" />
        <label for="toggle"></label>
        
        <div class="day-night-cont">
            <span class="the-sun"></span>
            <div class="the-moon"><span class="moon-inside"></span></div>
        </div>
        
        <div class="switch">
            <div class="button">
                <div class="b-inside"></div>
            </div>
        </div>
        
        <div class="c-window">
            <span class="the-sun"></span>
            <span class="the-moon"></span>
            
            <div class="the-fox">
                <div class="fox-face">
                    <section class="eyes left"></section>
                    <section class="eyes right"></section> 
                    <span class="nose"></span>
                    <div class="white-part"><span class="mouth"></span></div>
                </div>  
            </div>
        </div>
    </div>

    <button class="button farming bs" id="catchButton">
        <h4 id="buttonText">Start Catching</h4>
    </button>
    <button class="button claim bs" id="claimButton" style="display: none;">
        <h4>Claim</h4>
    </button>

    <footer class="fixed-bottom">
        <a href="index.html" class="nav-item active">
            <img src="https://img.icons8.com/material-outlined/24/34A87C/home--v1.png" alt="Home">
            <span>Home</span>
        </a>
        <a href="task.html" class="nav-item">
            <img src="https://img.icons8.com/material-outlined/24/34A87C/task.png" alt="Task">
            <span>Task</span>
        </a>
        <a href="leaderboard.html" class="nav-item">
            <img src="https://img.icons8.com/?size=100&id=9828&format=png&color=34A87C" alt="Leaderboard">
            <span>Leaderboard</span>
        </a>
        <a href="friends.html" class="nav-item">
            <img src="https://img.icons8.com/?size=100&id=22118&format=png&color=34A87C" alt="Friends">
            <span>Friends</span>
        </a>
    </footer>

    <script>
        document.addEventListener('contextmenu', function(event) {
            event.preventDefault(); // Disable right-click context menu
        });

        document.addEventListener('selectstart', function(event) {
            event.preventDefault(); // Disable text selection
        });
    </script>

    <script src="https://telegram.org/js/telegram-web-app.js"></script>
    <script>
        const tg = window.Telegram.WebApp;
        const initData = tg.initData;

        if (initData) {
            const user = tg.initDataUnsafe.user;

            // Set user info or N/A if not available
            document.getElementById('username').innerText = user ? `${user.first_name} ${user.last_name || 'N/A'}` : 'N/A';
            document.getElementById('tg_user').innerText = user ? (user.username || 'N/A') : 'N/A';
            document.getElementById('tg_id').innerText = user ? (user.id || 'N/A') : 'N/A';
        } else {
            document.getElementById('username').innerText = 'N/A';
            document.getElementById('tg_user').innerText = 'N/A';
            document.getElementById('tg_id').innerText = 'N/A';
        }
    </script>
    <script src="script.js"></script>
</body>
</html>
