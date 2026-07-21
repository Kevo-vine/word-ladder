const WORD_LENGTH = 5;
const MAX_GUESSES = 6;
const validWords = new Set(WORD_LIST);

let answer = "";
let currentGuess = "";
let guesses = [];
let gameOver = false;

const boardEl = document.getElementById("board");
const keyboardEl = document.getElementById("keyboard");
const messageEl = document.getElementById("message");
const newGameBtn = document.getElementById("newGameBtn");
const playAgainBtn = document.getElementById("playAgainBtn");
const fallenScene = document.getElementById("fallenScene");
const confettiCanvas = document.getElementById("confettiCanvas");
const confettiCtx = confettiCanvas.getContext("2d");

const KEY_ROWS = [
  ["q","w","e","r","t","y","u","i","o","p"],
  ["a","s","d","f","g","h","j","k","l"],
  ["enter","z","x","c","v","b","n","m","back"]
];

function pickAnswer() {
  return ANSWER_LIST[Math.floor(Math.random() * ANSWER_LIST.length)];
}

const CONFETTI_COLORS = ["#d9a441", "#4c7a52", "#ece6d9", "#9c7a3a", "#e6c06a"];
let confettiParticles = [];
let confettiRunning = false;

function resizeConfettiCanvas() {
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeConfettiCanvas);
resizeConfettiCanvas();

function launchConfetti() {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) return;

  const count = 140;
  const w = confettiCanvas.width;
  confettiParticles = Array.from({ length: count }, () => ({
    x: w / 2 + (Math.random() - 0.5) * w * 0.3,
    y: -20 - Math.random() * 200,
    vx: (Math.random() - 0.5) * 6,
    vy: 2 + Math.random() * 3,
    size: 6 + Math.random() * 6,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    rotation: Math.random() * Math.PI * 2,
    spin: (Math.random() - 0.5) * 0.3,
    shape: Math.random() < 0.5 ? "rect" : "circle",
    life: 0,
  }));

  if (!confettiRunning) {
    confettiRunning = true;
    requestAnimationFrame(animateConfetti);
  }
}

function animateConfetti() {
  confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

  confettiParticles.forEach(p => {
    p.vy += 0.05;
    p.x += p.vx;
    p.y += p.vy;
    p.rotation += p.spin;
    p.life += 1;

    const fade = Math.max(0, 1 - p.life / 220);
    confettiCtx.save();
    confettiCtx.globalAlpha = fade;
    confettiCtx.translate(p.x, p.y);
    confettiCtx.rotate(p.rotation);
    confettiCtx.fillStyle = p.color;
    if (p.shape === "rect") {
      confettiCtx.fillRect(-p.size / 2, -p.size / 3, p.size, p.size * 0.6);
    } else {
      confettiCtx.beginPath();
      confettiCtx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
      confettiCtx.fill();
    }
    confettiCtx.restore();
  });

  confettiParticles = confettiParticles.filter(p => p.life < 220 && p.y < confettiCanvas.height + 40);

  if (confettiParticles.length > 0) {
    requestAnimationFrame(animateConfetti);
  } else {
    confettiRunning = false;
    confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
  }
}

function buildBoard() {
  boardEl.innerHTML = "";
  for (let r = 0; r < MAX_GUESSES; r++) {
    const row = document.createElement("div");
    row.className = "row";
    row.id = `row-${r}`;
    row.style.gridRow = String(r + 1);
    for (let c = 0; c < WORD_LENGTH; c++) {
      const tile = document.createElement("div");
      tile.className = "tile";
      tile.id = `tile-${r}-${c}`;
      row.appendChild(tile);
    }
    boardEl.appendChild(row);
  }
}

function buildKeyboard() {
  keyboardEl.innerHTML = "";
  KEY_ROWS.forEach(rowKeys => {
    const row = document.createElement("div");
    row.className = "kb-row";
    rowKeys.forEach(k => {
      const btn = document.createElement("button");
      btn.className = "key";
      btn.id = `key-${k}`;
      if (k === "enter" || k === "back") btn.classList.add("wide");
      btn.textContent = k === "back" ? "⌫" : (k === "enter" ? "Enter" : k);
      btn.addEventListener("click", () => handleKey(k));
      row.appendChild(btn);
    });
    keyboardEl.appendChild(row);
  });
}

function setMessage(text, type = "info") {
  messageEl.textContent = text;
  messageEl.className = `plaque ${type}`;
}

function startNewGame() {
  answer = pickAnswer();
  currentGuess = "";
  guesses = [];
  gameOver = false;
  buildBoard();
  buildKeyboard();
  setMessage("");
  playAgainBtn.style.visibility = "hidden";
  fallenScene.classList.remove("show");
}

function handleKey(key) {
  if (gameOver) return;

  if (key === "back") {
    currentGuess = currentGuess.slice(0, -1);
    renderCurrentRow();
    return;
  }

  if (key === "enter") {
    submitGuess();
    return;
  }

  if (/^[a-z]$/.test(key) && currentGuess.length < WORD_LENGTH) {
    currentGuess += key;
    renderCurrentRow();
  }
}

function activeRow() {
  // Guesses fill from the bottom rung upward, like climbing the ladder.
  return MAX_GUESSES - 1 - guesses.length;
}

function renderCurrentRow() {
  const r = activeRow();
  for (let c = 0; c < WORD_LENGTH; c++) {
    const tile = document.getElementById(`tile-${r}-${c}`);
    const letter = currentGuess[c] || "";
    tile.textContent = letter;
    tile.classList.toggle("filled", letter !== "");
  }
}

function shakeRow(r) {
  const row = document.getElementById(`row-${r}`);
  row.classList.add("shake");
  setTimeout(() => row.classList.remove("shake"), 320);
}

function slideRowToTop(rowIndex, onComplete) {
  if (rowIndex === 0) {
    onComplete();
    return;
  }

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // The winning row moves to the top rung; the empty rows that were
  // above it shift down by one to close the gap it leaves behind.
  const affected = [];
  for (let i = 0; i < rowIndex; i++) affected.push(i);
  affected.push(rowIndex);

  const els = affected.map(i => document.getElementById(`row-${i}`));

  if (reduceMotion) {
    document.getElementById(`row-${rowIndex}`).style.gridRow = "1";
    for (let i = 0; i < rowIndex; i++) {
      document.getElementById(`row-${i}`).style.gridRow = String(i + 2);
    }
    onComplete();
    return;
  }

  const firstRects = els.map(el => el.getBoundingClientRect());

  document.getElementById(`row-${rowIndex}`).style.gridRow = "1";
  document.getElementById(`row-${rowIndex}`).style.zIndex = "5";
  document.getElementById(`row-${rowIndex}`).style.position = "relative";
  for (let i = 0; i < rowIndex; i++) {
    document.getElementById(`row-${i}`).style.gridRow = String(i + 2);
  }

  const lastRects = els.map(el => el.getBoundingClientRect());

  els.forEach((el, idx) => {
    const dy = firstRects[idx].top - lastRects[idx].top;
    el.style.transition = "none";
    el.style.transform = dy ? `translateY(${dy}px)` : "none";
  });

  void boardEl.offsetHeight;

  requestAnimationFrame(() => {
    els.forEach(el => {
      el.style.transition = "transform 1000ms cubic-bezier(0.22, 1, 0.36, 1)";
      el.style.transform = "";
    });
  });

  setTimeout(() => {
    els.forEach(el => {
      el.style.transition = "";
    });
    document.getElementById(`row-${rowIndex}`).style.zIndex = "";
    document.getElementById(`row-${rowIndex}`).style.position = "";
    onComplete();
  }, 1020);
}

function tumbleBoardDown(onComplete) {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const rows = [];
  for (let i = 0; i < MAX_GUESSES; i++) rows.push(document.getElementById(`row-${i}`));

  if (reduceMotion) {
    onComplete();
    return;
  }

  const perRowDelay = 70;
  const fallDuration = 650;

  rows.forEach((row, i) => {
    const rect = row.getBoundingClientRect();
    const drop = window.innerHeight - rect.top + 120;
    const drift = (Math.random() - 0.5) * 70;
    const rotation = (Math.random() - 0.5) * 50;
    const delay = i * perRowDelay;

    row.style.transition =
      `transform ${fallDuration}ms cubic-bezier(0.55, 0, 0.85, 0.35) ${delay}ms, ` +
      `opacity ${fallDuration}ms ease ${delay}ms`;
    row.style.transform = `translate(${drift}px, ${drop}px) rotate(${rotation}deg)`;
    row.style.opacity = "0";
  });

  const totalTime = (MAX_GUESSES - 1) * perRowDelay + fallDuration + 60;
  setTimeout(onComplete, totalTime);
}

function submitGuess() {
  if (currentGuess.length !== WORD_LENGTH) {
    setMessage("Not enough letters", "info");
    shakeRow(activeRow());
    return;
  }

  if (!validWords.has(currentGuess)) {
    setMessage("Not in word list", "info");
    shakeRow(activeRow());
    return;
  }

  const result = scoreGuess(currentGuess, answer);
  const r = activeRow();

  result.forEach((status, c) => {
    const tile = document.getElementById(`tile-${r}-${c}`);
    setTimeout(() => {
      tile.classList.add(status);
      tile.classList.add("pop");
    }, c * 100);
    updateKeyStatus(currentGuess[c], status);
  });

  guesses.push(currentGuess);
  setMessage("");

  const won = currentGuess === answer;
  const doneGuessing = guesses.length === MAX_GUESSES;

  currentGuess = "";

  if (won) {
    gameOver = true;
    setTimeout(() => {
      slideRowToTop(r, () => {
        setMessage("You reached the top!", "win");
        launchConfetti();
      });
    }, WORD_LENGTH * 100 + 100);
  } else if (doneGuessing) {
    gameOver = true;
    setTimeout(() => {
      tumbleBoardDown(() => {
        setMessage("Oh no, you fell!", "lose");
        playAgainBtn.style.visibility = "visible";
        fallenScene.classList.add("show");
      });
    }, WORD_LENGTH * 100 + 100);
  }
}

function scoreGuess(guess, target) {
  const result = new Array(WORD_LENGTH).fill("absent");
  const targetLetters = target.split("");
  const guessLetters = guess.split("");

  for (let i = 0; i < WORD_LENGTH; i++) {
    if (guessLetters[i] === targetLetters[i]) {
      result[i] = "correct";
      targetLetters[i] = null;
    }
  }

  for (let i = 0; i < WORD_LENGTH; i++) {
    if (result[i] === "correct") continue;
    const idx = targetLetters.indexOf(guessLetters[i]);
    if (idx !== -1) {
      result[i] = "present";
      targetLetters[idx] = null;
    }
  }

  return result;
}

function updateKeyStatus(letter, status) {
  const keyEl = document.getElementById(`key-${letter}`);
  if (!keyEl) return;
  const priority = { absent: 0, present: 1, correct: 2 };
  const current = keyEl.dataset.status;
  if (!current || priority[status] >= priority[current]) {
    keyEl.classList.remove("absent", "present", "correct");
    keyEl.classList.add(status);
    keyEl.dataset.status = status;
  }
}

document.addEventListener("keydown", (e) => {
  const key = e.key.toLowerCase();
  if (key === "enter") handleKey("enter");
  else if (key === "backspace") handleKey("back");
  else if (/^[a-z]$/.test(key)) handleKey(key);
});

newGameBtn.addEventListener("click", startNewGame);
playAgainBtn.addEventListener("click", startNewGame);

startNewGame();
