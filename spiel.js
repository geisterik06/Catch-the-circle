let score = 0;
let gameTime = 60;
let moveSpeed = 1000;
let gameInterval;
let moveInterval;
let circleClickable = true;
let selectedTime = 60;
let selectedSpeed = 1000;

PokiSDK.init().then(() => {
  console.log("Poki SDK erfolgreich geladen");
  PokiSDK.gameLoadingFinished();
});

window.onload = function () {
  const startButton = document.getElementById("startButton");
  if (startButton) {
    startButton.addEventListener("click", startGame);
  }
  showHighscores();
};

function startGame() {
  const modus = parseInt(document.getElementById("modus").value);
  selectedTime = parseInt(document.getElementById("dauer").value);
  selectedSpeed = parseInt(document.getElementById("geschwindigkeit").value);
  gameTime = selectedTime;
  moveSpeed = selectedSpeed;

  if (modus === 1) {
    startSinglePlayer();
  } else {
    startTwoPlayer();
  }
}

function startSinglePlayer() {
  score = 0;

  document.body.innerHTML = `
    <div id="hud">
      <div>Punkte: <span id="score">0</span></div>
      <div>Zeit: <span id="timer">${gameTime}</span>s</div>
    </div>
    <div id="circle"></div>
  `;

  const circle = document.getElementById("circle");
  circle.addEventListener("click", () => {
    if (!circleClickable) return;
    score++;
    document.getElementById("score").textContent = score;
    circleClickable = false;
  });

  moveInterval = setInterval(moveCircle, moveSpeed);
  gameInterval = setInterval(updateTimer, 1000);
  moveCircle();
}

function moveCircle() {
  const circle = document.getElementById("circle");
  const x = Math.random() * (window.innerWidth - 50);
  const y = Math.random() * (window.innerHeight - 50);
  circle.style.left = x + "px";
  circle.style.top = y + "px";
  circleClickable = true;
}

function updateTimer() {
  gameTime--;
  const timer = document.getElementById("timer");
  if (timer) timer.textContent = gameTime;
  if (gameTime <= 0) {
    clearInterval(gameInterval);
    clearInterval(moveInterval);
    PokiSDK.gameplayStop();
    showEndScreen();
  }
}

function showEndScreen() {
  const key = `score_${selectedTime}_${selectedSpeed}`;
  const oldScore = parseInt(localStorage.getItem(key)) || 0;
  if (score > oldScore) {
    localStorage.setItem(key, score);
  }

  document.body.innerHTML = `
    <div class="centered">
      <h1>⏱️ Spiel vorbei!</h1>
      <h2>Deine Punktzahl: ${score}</h2>
      <h3>Highscore für ${selectedTime}s / ${geschwindigkeitLabel(selectedSpeed)}: ${Math.max(score, oldScore)}</h3>
      <button onclick="location.reload()">🔁 Zurück zum Startmenü</button>
    </div>
  `;
}

function startTwoPlayer() {
  document.body.classList.add("twoPlayerActive");
  let score1 = 0;
  let score2 = 0;
  let circle1Clickable = true;
  let circle2Clickable = true;

  document.body.innerHTML = `
    <div id="hud">
      <div>Spieler 1: <span id="score1hud">0</span></div>
      <div>Zeit: <span id="timer">${gameTime}</span>s</div>
      <div>Spieler 2: <span id="score2hud">0</span></div>
    </div>
    <div id="gameWrapper">
      <div id="field1" class="field"></div>
      <div id="divider"></div>
      <div id="field2" class="field"></div>
    </div>
  `;

  const field1 = document.getElementById("field1");
  const field2 = document.getElementById("field2");

  const circle1 = document.createElement("div");
  circle1.className = "circle";
  field1.appendChild(circle1);

  const circle2 = document.createElement("div");
  circle2.className = "circle";
  field2.appendChild(circle2);

  circle1.addEventListener("click", () => {
    if (!circle1Clickable) return;
    score1++;
    document.getElementById("score1hud").textContent = score1;
    circle1Clickable = false;
  });

  circle2.addEventListener("click", () => {
    if (!circle2Clickable) return;
    score2++;
    document.getElementById("score2hud").textContent = score2;
    circle2Clickable = false;
  });

  const moveInterval1 = setInterval(() => moveCircleInField(circle1, field1, () => circle1Clickable = true), moveSpeed);
  const moveInterval2 = setInterval(() => moveCircleInField(circle2, field2, () => circle2Clickable = true), moveSpeed);

  gameInterval = setInterval(() => {
    gameTime--;
    const timer = document.getElementById("timer");
    if (timer) timer.textContent = gameTime;
    if (gameTime <= 0) {
      clearInterval(gameInterval);
      clearInterval(moveInterval1);
      clearInterval(moveInterval2);
      PokiSDK.gameplayStop();
      showTwoPlayerEnd(score1, score2);
    }
  }, 1000);
}

function moveCircleInField(circle, field, onMoved) {
  const rect = field.getBoundingClientRect();
  const x = Math.random() * (rect.width - 50);
  const y = Math.random() * (rect.height - 50);
  circle.style.left = x + "px";
  circle.style.top = y + "px";
  onMoved();
}

function showTwoPlayerEnd(score1, score2) {
  document.body.classList.remove("twoPlayerActive");
  let result = "";
  if (score1 > score2) result = "🎉 Spieler 1 gewinnt!";
  else if (score2 > score1) result = "🎉 Spieler 2 gewinnt!";
  else result = "🤝 Unentschieden!";

  document.body.innerHTML = `
    <div class="centered">
      <h1>⏱️ Spiel vorbei!</h1>
      <h2>Spieler 1: ${score1} Punkte</h2>
      <h2>Spieler 2: ${score2} Punkte</h2>
      <h3>${result}</h3>
      <button onclick="location.reload()">🔁 Zurück zum Startmenü</button>
    </div>
  `;
}

function geschwindigkeitLabel(ms) {
  if (ms === 2000) return "Langsam";
  if (ms === 1000) return "Mittel";
  if (ms === 500) return "Schnell";
  return ms + "ms";
}

function showHighscores() {
  const highscoreDiv = document.getElementById("highscoreList");
  const zeiten = [30, 60, 90];
  const geschwindigkeiten = [2000, 1000, 500];

  let html = "<table><tr><th>Dauer</th><th>Geschwindigkeit</th><th>Highscore</th></tr>";

  zeiten.forEach(time => {
    geschwindigkeiten.forEach(speed => {
      const key = `score_${time}_${speed}`;
      const score = localStorage.getItem(key) || 0;
      html += `<tr><td>${time}s</td><td>${geschwindigkeitLabel(speed)}</td><td>${score}</td></tr>`;
    });
  });

  html += "</table>";
  highscoreDiv.innerHTML = html;
}