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

const KEY_ROWS = [
  ["q","w","e","r","t","y","u","i","o","p"],
  ["a","s","d","f","g","h","j","k","l"],
  ["enter","z","x","c","v","b","n","m","back"]
];

function pickAnswer() {
  return ANSWER_LIST[Math.floor(Math.random() * ANSWER_LIST.length)];
}

function buildBoard() {
  boardEl.innerHTML = "";
  for (let r = 0; r < MAX_GUESSES; r++) {
    const row = document.createElement("div");
    row.className = "row";
    row.id = `row-${r}`;
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
  messageEl.className = `message ${type}`;
}

function startNewGame() {
  answer = pickAnswer();
  currentGuess = "";
  guesses = [];
  gameOver = false;
  buildBoard();
  buildKeyboard();
  setMessage("");
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

function renderCurrentRow() {
  const r = guesses.length;
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
  setTimeout(() => row.classList.remove("shake"), 300);
}

function submitGuess() {
  if (currentGuess.length !== WORD_LENGTH) {
    setMessage("Not enough letters", "info");
    shakeRow(guesses.length);
    return;
  }

  if (!validWords.has(currentGuess)) {
    setMessage("Not in word list", "info");
    shakeRow(guesses.length);
    return;
  }

  const result = scoreGuess(currentGuess, answer);
  const r = guesses.length;

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
    setTimeout(() => setMessage("You got it! 🎉", "win"), WORD_LENGTH * 100 + 100);
  } else if (doneGuessing) {
    gameOver = true;
    setTimeout(() => setMessage(`Out of guesses! The word was ${answer.toUpperCase()}`, "lose"), WORD_LENGTH * 100 + 100);
  }
}

function scoreGuess(guess, target) {
  const result = new Array(WORD_LENGTH).fill("absent");
  const targetLetters = target.split("");
  const guessLetters = guess.split("");
  const used = new Array(WORD_LENGTH).fill(false);

  for (let i = 0; i < WORD_LENGTH; i++) {
    if (guessLetters[i] === targetLetters[i]) {
      result[i] = "correct";
      used[i] = true;
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

startNewGame();
