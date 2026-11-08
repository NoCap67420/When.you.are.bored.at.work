(function () {
  const { el } = BAW;
  const N = 3;
  const SOLVED = [1, 2, 3, 4, 5, 6, 7, 8, 0];

  function neighbours(i) {
    const r = Math.floor(i / N), c = i % N;
    const out = [];
    if (r > 0) out.push(i - N);
    if (r < N - 1) out.push(i + N);
    if (c > 0) out.push(i - 1);
    if (c < N - 1) out.push(i + 1);
    return out;
  }

  BAW.register({
    id: "slider",
    name: "Slide Puzzle",
    icon: "🧱",
    tagline: "Put the tiles back in order.",
    howTo: "Tap a tile next to the empty space to slide it. Get the numbers in order from 1 to 8, with the gap in the bottom-right corner.",
    render(root, ctx) {
      let grid;
      do {
        grid = SOLVED.slice();
        let blank = 8, prev = -1;
        for (let k = 0; k < 90; k++) {
          const options = neighbours(blank).filter((n) => n !== prev);
          const n = BAW.pick(options, ctx.rng);
          [grid[blank], grid[n]] = [grid[n], grid[blank]];
          prev = blank;
          blank = n;
        }
      } while (grid.join() === SOLVED.join());

      let moves = 0;
      let over = false;
      const counter = el("p", { class: "center muted" }, "Moves: 0");
      const board = el("div", { class: "slider" });
      const tiles = {};
      for (let v = 1; v <= 8; v++) {
        tiles[v] = el("button", { class: "slide-tile", onclick: () => tap(v) }, String(v));
        board.append(tiles[v]);
      }
      const controls = el("div", { class: "actions" }, el("button", { class: "btn ghost", onclick: giveUp }, "Give up"));
      root.append(counter, board, controls);

      function place() {
        grid.forEach((v, i) => {
          if (!v) return;
          const t = tiles[v];
          t.style.transform = `translate(${(i % N) * 100}%, ${Math.floor(i / N) * 100}%)`;
          t.classList.toggle("home", v === i + 1);
        });
      }

      function tap(v) {
        if (over) return;
        const i = grid.indexOf(v);
        const blank = grid.indexOf(0);
        if (!neighbours(i).includes(blank)) return;
        [grid[i], grid[blank]] = [grid[blank], grid[i]];
        moves++;
        counter.textContent = `Moves: ${moves}`;
        place();
        if (grid.join() === SOLVED.join()) {
          over = true;
          controls.remove();
          board.classList.add("solved");
          ctx.finish({ won: true, scoreText: `Solved in ${moves} moves`, grid: moves <= 40 ? "🧱⭐⭐⭐" : moves <= 80 ? "🧱⭐⭐" : "🧱⭐" });
        }
      }

      function giveUp() {
        if (over) return;
        over = true;
        controls.remove();
        board.classList.add("given-up");
        ctx.finish({ won: false, scoreText: `Gave up after ${moves} moves`, grid: "🧱❌" });
      }

      place();
    },
  });
})();
