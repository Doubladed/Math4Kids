
// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js"; // Add this for Realtime Database
import { ref, set, get } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCoU583cyoYVWczJ_mSjLieFL_umb_ZvWU",
  authDomain: "math4kids-69dc3.firebaseapp.com",
  databaseURL: "https://math4kids-69dc3-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "math4kids-69dc3",
  storageBucket: "math4kids-69dc3.firebasestorage.app",
  messagingSenderId: "723352978340",
  appId: "1:723352978340:web:4c5770ded1f58fc4c73731"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Initialize the Realtime Database
const database = getDatabase(app);

// Test Firebase connection (optional)
console.log("Firebase App Name:", app.name);  // Should log "[DEFAULT]" if Firebase is connected


/************************************
 * DOM ELEMENTS
 ************************************/
const homeScreen        = document.getElementById("homeScreen");
const loginScreen       = document.getElementById("loginScreen");
const registerScreen    = document.getElementById("registerScreen");
const gameScreen        = document.getElementById("gameScreen");
const leaderboardScreen = document.getElementById("leaderboardScreen");

// Home Screen
const startGameBtn      = document.getElementById("startGameBtn");
const loginBtn          = document.getElementById("loginBtn");
const leaderboardBtn    = document.getElementById("leaderboardBtn");
const greetingMsg       = document.getElementById("greetingMsg");
const usernameDisplay   = document.getElementById("usernameDisplay");

// Login Screen
const loginForm         = document.getElementById("loginForm");
const loginUsername     = document.getElementById("loginUsername");
const loginPassword     = document.getElementById("loginPassword");
const loginBackBtn      = document.getElementById("loginBackBtn");

// Register Screen
const registerForm      = document.getElementById("registerForm");
const registerUsername  = document.getElementById("registerUsername");
const registerPassword  = document.getElementById("registerPassword");
const showRegisterLink  = document.getElementById("showRegisterScreen");
const showLoginLink     = document.getElementById("showLoginScreen");

// Game Screen
const timerDisplay      = document.getElementById("timeLeft");
const questionText      = document.getElementById("questionText");
const answerInput       = document.getElementById("answerInput");
const submitAnswerBtn   = document.getElementById("submitAnswerBtn");
const feedback          = document.getElementById("feedback");
const backToMenuBtn     = document.getElementById("backToMenuBtn");
const scoreValue        = document.getElementById("scoreValue");

// Leaderboard Screen
const leaderboardTableBody = document.getElementById("leaderboardTableBody");
const leaderboardBackBtn   = document.getElementById("leaderboardBackBtn");

/************************************
 * LOCAL STORAGE: USERS & SCOREBOARD
 ************************************/
// scoreboard is an array of objects: [{ username: "Alice", score: 20 }, ... ]
let users = JSON.parse(localStorage.getItem("users")) || [];
let scoreboard = JSON.parse(localStorage.getItem("scoreboard")) || [];

/************************************
 * GAME & USER VARIABLES
 ************************************/
let timeRemaining;
let timerInterval;
let score = 0;
let currentUser = null; // Logged-in username

/************************************
 * SHOW/HIDE SCREENS
 ************************************/
function showHomeScreen() {
  homeScreen.style.display        = "block";
  loginScreen.style.display       = "none";
  registerScreen.style.display    = "none";
  gameScreen.style.display        = "none";
  leaderboardScreen.style.display = "none";

  if (currentUser) {
    greetingMsg.style.display = "block";
    usernameDisplay.textContent = currentUser;
  } else {
    greetingMsg.style.display = "none";
    usernameDisplay.textContent = "";
  }
}

function showLoginScreen() {
  homeScreen.style.display        = "none";
  loginScreen.style.display       = "block";
  registerScreen.style.display    = "none";
  gameScreen.style.display        = "none";
  leaderboardScreen.style.display = "none";
}

function showRegisterScreen() {
  homeScreen.style.display        = "none";
  loginScreen.style.display       = "none";
  registerScreen.style.display    = "block";
  gameScreen.style.display        = "none";
  leaderboardScreen.style.display = "none";
}

function showGameScreen() {
  homeScreen.style.display        = "none";
  loginScreen.style.display       = "none";
  registerScreen.style.display    = "none";
  gameScreen.style.display        = "block";
  leaderboardScreen.style.display = "none";
}

function showLeaderboardScreen() {
  homeScreen.style.display        = "none";
  loginScreen.style.display       = "none";
  registerScreen.style.display    = "none";
  gameScreen.style.display        = "none";
  leaderboardScreen.style.display = "block";

  buildLeaderboardTable();
}

/************************************
 * LEADERBOARD: ensure one entry per user
 ************************************/
// This function updates scoreboard with the user's new high score
function updateLeaderboard(username, newScore) {
  const leaderboardRef = ref(database, `leaderboard/${username}`);

  get(leaderboardRef).then((snapshot) => {
    if (snapshot.exists()) {
      const existingScore = snapshot.val().score;
      if (newScore > existingScore) {
        set(leaderboardRef, { username: username, score: newScore })
          .then(() => console.log("New high score saved!"))
          .catch((error) => console.error("Error updating score:", error));
      } else {
        console.log("No update needed; existing score is higher or the same.");
      }
    } else {
      set(leaderboardRef, { username: username, score: newScore })
        .then(() => console.log("Score saved for new user!"))
        .catch((error) => console.error("Error saving score:", error));
    }
  }).catch((error) => {
    console.error("Error reading leaderboard:", error);
  });
}


function buildLeaderboardTable() {
  // Reference to the leaderboard in Firebase
  const leaderboardRef = ref(database, "leaderboard");

  get(leaderboardRef).then((snapshot) => {
    if (snapshot.exists()) {
      // Clear the leaderboard table
      leaderboardTableBody.innerHTML = "";

      const data = snapshot.val();
      const entries = Object.values(data).sort((a, b) => b.score - a.score);  // Sort by highest score

      // Create table rows for each entry
      entries.forEach((entry, index) => {
        const tr = document.createElement("tr");

        const rankTd = document.createElement("td");
        rankTd.textContent = index + 1;

        const nameTd = document.createElement("td");
        nameTd.textContent = entry.username;

        const scoreTd = document.createElement("td");
        scoreTd.textContent = entry.score;

        tr.appendChild(rankTd);
        tr.appendChild(nameTd);
        tr.appendChild(scoreTd);

        leaderboardTableBody.appendChild(tr);
      });
    } else {
      console.log("No leaderboard data found.");
    }
  }).catch((error) => {
    console.error("Error fetching leaderboard data:", error);
  });
}


/************************************
 * EVENT LISTENERS: HOME SCREEN
 ************************************/
startGameBtn.addEventListener("click", () => {
  if (currentUser) {
    showGameScreen();
    startGame();
  } else {
    alert("You must log in to start the game.");
    showLoginScreen();
  }
});

loginBtn.addEventListener("click", () => {
  showLoginScreen();
});

leaderboardBtn.addEventListener("click", () => {
  showLeaderboardScreen();
});

/************************************
 * EVENT LISTENERS: LOGIN SCREEN
 ************************************/
loginForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const username = loginUsername.value.trim();
  const password = loginPassword.value.trim();

  if (!username || !password) {
    alert("Please enter both username and password.");
    return;
  }

  const dbRef = ref(database, `users/${username}`);

  get(dbRef).then((snapshot) => {
    if (snapshot.exists()) {
      const userData = snapshot.val();
      if (userData.password === password) {
        alert("Login successful!");
        currentUser = username;
        loginUsername.value = "";
        loginPassword.value = "";
        showHomeScreen();
      } else {
        alert("Invalid password. Please try again.");
      }
    } else {
      alert("User not found. Please register.");
    }
  }).catch((error) => {
    alert("Error logging in: " + error.message);
  });
});

loginBackBtn.addEventListener("click", () => {
  showHomeScreen();
});

/************************************
 * EVENT LISTENERS: REGISTER SCREEN
 ************************************/
registerForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const username = registerUsername.value.trim();
  const password = registerPassword.value.trim();

  if (!username || !password) {
    alert("Please enter a username and password.");
    return;
  }

  const dbRef = ref(database, `users/${username}`);

  get(dbRef).then((snapshot) => {
    if (snapshot.exists()) {
      alert("Username already exists. Please choose another.");
    } else {
      set(dbRef, { username, password })
        .then(() => {
          alert("Registration successful! You can now log in.");
          registerUsername.value = "";
          registerPassword.value = "";
          showLoginScreen();
        })
        .catch((error) => {
          alert("Error registering: " + error.message);
        });
    }
  }).catch((error) => {
    alert("Error checking username: " + error.message);
  });
});

showRegisterLink.addEventListener("click", (e) => {
  e.preventDefault();
  showRegisterScreen();
});

showLoginLink.addEventListener("click", (e) => {
  e.preventDefault();
  showLoginScreen();
});

/************************************
 * MATH GAME LOGIC
 ************************************/
function startGame() {
  timeRemaining = 30;
  score = 0;
  timerDisplay.textContent = timeRemaining;
  scoreValue.textContent = score;

  generateQuestion();

  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    timeRemaining--;
    if (timeRemaining < 0) timeRemaining = 0;
    timerDisplay.textContent = timeRemaining;

    if (timeRemaining <= 0) {
      endGame();
    }
  }, 1000);
}

function generateQuestion() {
  const operations = ["+", "-"];
  const operation = operations[Math.floor(Math.random() * operations.length)];

  const num1 = Math.floor(Math.random() * 10) + 1;
  const num2 = Math.floor(Math.random() * 10) + 1;

  const correctAnswer = (operation === "+") ? num1 + num2 : num1 - num2;
  questionText.dataset.answer = correctAnswer.toString();

  questionText.textContent = `What is ${num1} ${operation} ${num2}?`;
  answerInput.value = "";
  feedback.textContent = "";
}

function checkAnswer() {
  if (timeRemaining <= 0) return;

  const userAnswer = parseInt(answerInput.value, 10);
  const correctAnswer = parseInt(questionText.dataset.answer, 10);

  if (userAnswer === correctAnswer) {
    feedback.textContent = "Correct!";
    score++;
    scoreValue.textContent = score;
    timeRemaining += 5;
    timerDisplay.textContent = timeRemaining;
  } else {
    feedback.textContent = `Wrong! The correct answer was ${correctAnswer}.`;
    timeRemaining -= 5;
    if (timeRemaining < 0) timeRemaining = 0;
    timerDisplay.textContent = timeRemaining;
  }

  setTimeout(() => {
    if (timeRemaining > 0) {
      generateQuestion();
    }
  }, 800);
}

function endGame() {
  clearInterval(timerInterval);
  timeRemaining = 0;
  timerDisplay.textContent = timeRemaining;
  feedback.textContent = `Time's up! Game over. Final Score: ${score}`;

  // If the user is logged in, update their score in Firebase
  if (currentUser) {
    updateLeaderboard(currentUser, score);  // This updates the score in Firebase
  }
}

/************************************
 * EVENT LISTENERS: GAME SCREEN
 ************************************/
submitAnswerBtn.addEventListener("click", () => {
  const userAnswer = answerInput.value.trim();

  // Allow only numbers, letters, and specific symbols
  if (!/^[0-9a-zA-Z+-]+$/.test(userAnswer)) {
    alert("Please enter a valid answer.");
    return;
  }

  // Proceed with checking the answer
  checkAnswer(parseInt(userAnswer, 10)); // Adjust this based on your requirements
});


backToMenuBtn.addEventListener("click", () => {
  clearInterval(timerInterval);
  showHomeScreen();
});

/************************************
 * EVENT LISTENERS: LEADERBOARD
 ************************************/
leaderboardBackBtn.addEventListener("click", () => {
  showHomeScreen();
});

/************************************
 * INITIAL SCREEN
 ************************************/
showHomeScreen();
