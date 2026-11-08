(function () {
  const { el } = BAW;
  const N = 5;

  function press(board, i) {
    const r = Math.floor(i / N), c = i % N;
    board[i] = !board[i];
    if (r > 0) board[i - N] = !board[i - N];
    if (r < N - 1) board[i + N] = !board[i + N];
    if (c > 0) board[i - 1] = !board[i - 1];
    if (c < N - 1) board[i + 1] = !board[i + 1];
  }

  BAW.register({
    id: "lights",
    name: "Lights Off",
    icon: "💡",
    tagline: "Switch off every light on the board.",
    howTo: "Tapping a square flips it and the squares directly above, below, left and right of it. Turn every light off. Try to match par, the fewest taps needed.",
    render(root, ctx) {
      let start, par;
      do {
        start = Array(N * N).fill(false);
        par = BAW.randInt(ctx.rng, 4, 7);
        const cells = BAW.shuffle([...Array(N * N).keys()], ctx.rng).slice(0, par);
        cells.forEach((i) => press(start, i));
      } while (!start.some(Boolean));

      let board = start.slice();
      let moves = 0;
      let over = false;
      const counter = el("p", { class: "center muted" });
      const grid = el("div", { class: "lights" });
      const cells = board.map((_, i) => el("button", { class: "light", "aria-label": `Square ${i + 1}`, onclick: () => tap(i) }));
      grid.append(...cells);
      const controls = el("div", { class: "actions" },
        el("button", { class: "btn", onclick() { if (over) return; board = start.slice(); moves = 0; draw(); } }, "Reset"),
        el("button", { class: "btn ghost", onclick: giveUp }, "Give up")
      );
      root.append(counter, grid, controls);

      function draw() {
        cells.forEach((c, i) => {
          c.classList.toggle("on", board[i]);
          c.setAttribute("aria-pressed", board[i] ? "true" : "false");
        });
        counter.textContent = `Taps: ${moves} · Par: ${par}`;
      }

      function tap(i) {
        if (over) return;
        press(board, i);
        moves++;
        draw();
        if (!board.some(Boolean)) {
          over = true;
          controls.remove();
          const stars = moves <= par ? "⭐⭐⭐" : moves <= par + 4 ? "⭐⭐" : "⭐";
          ctx.finish({ won: true, scoreText: `All off in ${moves} taps (par ${par})`, grid: "💡" + stars });
        }
      }

      function giveUp() {
        if (over) return;
        over = true;
        controls.remove();
        ctx.finish({ won: false, scoreText: "Left the lights on", grid: "💡❌" });
      }

      draw();
    },
  });
})();
