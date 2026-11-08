(function () {
  const { el, shuffle } = BAW;
  const S = 6;

  function canPlace(p, i, v) {
    const r = Math.floor(i / S), c = i % S;
    for (let k = 0; k < S; k++) {
      if (p[r * S + k] === v || p[k * S + c] === v) return false;
    }
    const br = Math.floor(r / 2) * 2, bc = Math.floor(c / 3) * 3;
    for (let y = br; y < br + 2; y++) for (let x = bc; x < bc + 3; x++) if (p[y * S + x] === v) return false;
    return true;
  }

  function countSolutions(p, limit) {
    const i = p.indexOf(0);
    if (i === -1) return 1;
    let n = 0;
    for (let v = 1; v <= S && n < limit; v++) {
      if (canPlace(p, i, v)) {
        p[i] = v;
        n += countSolutions(p, limit - n);
        p[i] = 0;
      }
    }
    return n;
  }

  function generate(rng) {
    // A valid 6x6 grid (boxes are 2 rows x 3 columns), then shuffled.
    const base = (r, c) => (3 * (r % 2) + Math.floor(r / 2) + c) % S;
    const digits = shuffle([1, 2, 3, 4, 5, 6], rng);
    const rows = shuffle([0, 1, 2], rng).flatMap((b) => shuffle([0, 1], rng).map((x) => b * 2 + x));
    const cols = shuffle([0, 1], rng).flatMap((s) => shuffle([0, 1, 2], rng).map((x) => s * 3 + x));
    const solution = [];
    for (let r = 0; r < S; r++) for (let c = 0; c < S; c++) solution.push(digits[base(rows[r], cols[c])]);

    const puzzle = solution.slice();
    let givens = S * S;
    for (const i of shuffle([...Array(S * S).keys()], rng)) {
      if (givens <= 13) break;
      const keep = puzzle[i];
      puzzle[i] = 0;
      if (countSolutions(puzzle.slice(), 2) !== 1) puzzle[i] = keep;
      else givens--;
    }
    return { puzzle, solution };
  }

  BAW.register({
    id: "sudoku",
    name: "Mini Sudoku",
    icon: "🔢",
    tagline: "A bite-sized 6×6 sudoku.",
    howTo: "Fill the grid so every row, every column and every 2×3 box has the numbers 1 to 6 exactly once. Tap a square, then tap a number.",
    render(root, ctx) {
      const { puzzle, solution } = generate(ctx.rng);
      const board = puzzle.slice();
      let sel = puzzle.indexOf(0);
      let over = false;
      const started = Date.now();

      const timer = el("p", { class: "center muted" }, "0:00");
      const tick = setInterval(() => {
        if (!document.body.contains(timer)) return clearInterval(tick);
        if (!over) timer.textContent = BAW.formatTime(Math.floor((Date.now() - started) / 1000));
      }, 1000);

      const grid = el("div", { class: "sudoku" });
      const cells = board.map((_, i) => el("button", {
        class: "cell" + (puzzle[i] ? " given" : "") + (i % S === 2 ? " box-right" : "") + (Math.floor(i / S) % 2 === 1 && i < 30 ? " box-bottom" : ""),
        onclick() { if (!over) { sel = i; draw(); } },
      }));
      grid.append(...cells);

      const pad = el("div", { class: "numpad" },
        [1, 2, 3, 4, 5, 6].map((v) => el("button", { class: "key", onclick: () => enter(v) }, String(v))),
        el("button", { class: "key", "aria-label": "Erase", onclick: () => enter(0) }, "⌫")
      );
      const controls = el("div", { class: "actions" }, el("button", { class: "btn ghost", onclick: giveUp }, "Give up"));
      root.append(timer, grid, pad, controls);

      function onKey(e) {
        if (over || !document.body.contains(grid)) return document.removeEventListener("keydown", onKey);
        if (/^[1-6]$/.test(e.key)) enter(Number(e.key));
        else if (e.key === "Backspace" || e.key === "Delete" || e.key === "0") enter(0);
        else if (e.key.startsWith("Arrow")) {
          const d = { ArrowUp: -S, ArrowDown: S, ArrowLeft: -1, ArrowRight: 1 }[e.key];
          sel = (sel + d + S * S) % (S * S);
          e.preventDefault();
          draw();
        }
      }
      document.addEventListener("keydown", onKey);

      function conflicts(i) {
        const v = board[i];
        if (!v) return false;
        board[i] = 0;
        const bad = !canPlace(board, i, v);
        board[i] = v;
        return bad;
      }

      function draw() {
        const r = Math.floor(sel / S), c = sel % S;
        cells.forEach((cell, i) => {
          cell.textContent = board[i] || "";
          cell.classList.toggle("selected", i === sel && !over);
          cell.classList.toggle("peer", !over && (Math.floor(i / S) === r || i % S === c));
          cell.classList.toggle("bad", conflicts(i));
        });
      }

      function enter(v) {
        if (over || sel < 0 || puzzle[sel]) return;
        board[sel] = v;
        draw();
        if (!board.includes(0) && board.every((_, i) => !conflicts(i))) {
          over = true;
          const secs = Math.floor((Date.now() - started) / 1000);
          controls.remove();
          pad.remove();
          draw();
          ctx.finish({ won: true, scoreText: `Solved in ${BAW.formatTime(secs)}`, grid: "🔢⏱️ " + BAW.formatTime(secs) });
        }
      }

      function giveUp() {
        if (over) return;
        over = true;
        solution.forEach((v, i) => (board[i] = v));
        controls.remove();
        pad.remove();
        draw();
        ctx.finish({ won: false, scoreText: "Gave up", grid: "🔢❌" });
      }

      draw();
    },
  });
})();
