# Word Ladder

A Wordle-style word guessing game built with vanilla HTML, CSS, and JavaScript — no build tools or dependencies required.

## How to play

Guess the hidden 5-letter word in 6 tries. After each guess, each tile is colored to show how close you were:

- 🟩 **Green** — the letter is correct and in the right spot
- 🟨 **Yellow** — the letter is in the word but in the wrong spot
- ⬛ **Gray** — the letter isn't in the word

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
