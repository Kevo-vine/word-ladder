# Word Ladder 2

A Wordle-style word guessing game built with vanilla HTML, CSS, and JavaScript — no build tools or dependencies required.

Play it live: https://kevo-vine.github.io/word-ladder/

## How to play

Guess the hidden 5-letter word in 6 tries. Guesses fill from the **bottom rung upward**, like climbing a ladder. After each guess, each tile is colored to show how close you were:

- 🟩 **Green** — the letter is correct and in the right spot
- 🟨 **Gold** — the letter is in the word but in the wrong spot
- ⬛ **Dark** — the letter isn't in the word

Guess the word before reaching the top rung and the winning row slides up to the top with a confetti celebration. Run out of rungs, and the board tumbles away, out of view.

Type letters with your keyboard (or the on-screen keys), press **Enter** to submit a guess, and **Backspace** to delete a letter. Click **↻ New** to start a new game.

## Running locally

This is a static site — just open [`index.html`](index.html) in a browser, or serve the folder with any static file server, e.g.:

```
npx serve .
```

## Files

- [`index.html`](index.html) — page structure
- [`style.css`](style.css) — styling and animations
- [`script.js`](script.js) — game logic
- [`words.js`](words.js) — word list used for answers and valid guesses
