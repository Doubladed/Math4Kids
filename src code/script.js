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
  // 1. Check if the user already exists in the scoreboard
  const existingEntry = scoreboard.find(entry => entry.username === username);

  if (existingEntry) {
    // 2. If so, only update score if newScore is higher
    if (newScore > existingEntry.score) {
      existingEntry.score = newScore;
    }
  } else {
    // 3. If not, add a new entry
    scoreboard.push({ username, score: newScore });
  }

  // 4. Save to localStorage
  localStorage.setItem("scoreboard", JSON.stringify(scoreboard));
}

function buildLeaderboardTable() {
  // Clear existing rows
  leaderboardTableBody.innerHTML = "";

  // Sort scoreboard by highest score first
  const sorted = [...scoreboard].sort((a, b) => b.score - a.score);

  // Build rows
  sorted.forEach((entry, index) => {
    const tr = document.createElement("tr");

    // Rank (#) column
    const rankTd = document.createElement("td");
    rankTd.textContent = index + 1; // 1-based index

    // Name column
    const nameTd = document.createElement("td");
    nameTd.textContent = entry.username;

    // Score column
    const scoreTd = document.createElement("td");
    scoreTd.textContent = entry.score;

    tr.appendChild(rankTd);
    tr.appendChild(nameTd);
    tr.appendChild(scoreTd);

    leaderboardTableBody.appendChild(tr);
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

  const existingUser = users.find(
    (user) => user.username === username && user.password === password
  );

  if (existingUser) {
    alert("Login successful!");
    currentUser = username;
    loginUsername.value = "";
    loginPassword.value = "";
    showHomeScreen();
  } else {
    alert("Invalid credentials. Please try again.");
  }
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

  const userExists = users.some((user) => user.username === username);
  if (userExists) {
    alert("Username already exists. Please choose another.");
    return;
  }

  // Create & save user
  const newUser = { username, password };
  users.push(newUser);
  localStorage.setItem("users", JSON.stringify(users));

  alert("Registration successful! You can now log in.");
  registerUsername.value = "";
  registerPassword.value = "";

  showLoginScreen();
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

  // If a user is logged in, update the leaderboard with their highest score
  if (currentUser) {
    updateLeaderboard(currentUser, score);
  }
}

/************************************
 * EVENT LISTENERS: GAME SCREEN
 ************************************/
submitAnswerBtn.addEventListener("click", () => {
  checkAnswer();
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
