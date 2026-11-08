# Bored at Work ☕

A clean little website with **one new game every day**. Like Wordle, but the game itself changes daily: trivia one day, a word puzzle the next, then a number puzzle, a logic grid, and so on. Everyone gets the same puzzle on the same day.

## The games

| | Game | What you do |
|---|---|---|
| ❓ | Quick Fire Trivia | Answer 5 multiple-choice questions |
| 🔤 | Word Scramble | Unscramble 5 words |
| 🎯 | Hit the Number | Combine 6 numbers with + − × ÷ to hit a target |
| 🃏 | Memory Pairs | Find 8 matching pairs |
| 🧱 | Slide Puzzle | Put tiles 1–8 back in order |
| 🗂️ | Odd Groups | Sort 12 words into 3 hidden groups |
| 💡 | Lights Off | Turn every light off |
| 🔢 | Mini Sudoku | Solve a 6×6 sudoku |
| 🤔 | Emoji Decoder | Guess the saying or film from emoji |
| 🔮 | What Comes Next? | Find the next number in a pattern |

Each game shows up once every 10 days, in a shuffled order. Puzzle #1 is 8 November 2026.

## Features

- Same puzzle for everyone each day (seeded by the date)
- Share your result as emoji, Wordle-style
- Stats and win streaks, saved in the browser
- Archive of past puzzles
- Light and dark mode, works on phones

## Running it

It's plain HTML, CSS and JavaScript with no build step. Open `index.html`, or serve the folder:

```
python3 -m http.server
```

To host it for free, turn on **GitHub Pages** for this repo (Settings → Pages → deploy from branch).

Tip: add `?game=sudoku` (or any game id) to the URL to try a game without saving a result.

## Adding content or games

- Trivia questions, words, emoji clues and word groups live at the top of each file in `js/games/`. Add more to keep them fresh longer.
- To add a new game, copy any file in `js/games/`, give it a new `id`, and add a `<script>` tag for it in `index.html`. It joins the daily rotation automatically.
