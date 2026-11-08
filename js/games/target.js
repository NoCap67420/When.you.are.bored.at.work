(function () {
  const { el, randInt, pick, shuffle } = BAW;

  const OPS = {
    "+": (a, b) => a + b,
    "−": (a, b) => a - b,
    "×": (a, b) => a * b,
    "÷": (a, b) => a / b,
  };

  // Build a puzzle by actually doing the sums, so there is always a solution.
  function generate(rng) {
    for (let tries = 0; tries < 1000; tries++) {
      const big = shuffle([25, 50, 75, 100], rng).slice(0, 2);
      const small = Array.from({ length: 4 }, () => randInt(rng, 1, 10));
      const nums = [...big, ...small];
      const order = shuffle(nums, rng);
      let val = order[0];
      const steps = [];
      const k = randInt(rng, 3, 5);
      let ok = true;
      for (let i = 1; i <= k; i++) {
        const n = order[i];
        const ops = [];
        if (val + n <= 999) ops.push("+");
        if (val - n > 0) ops.push("−");
        if (val > 1 && n > 1 && val * n <= 999) ops.push("×", "×");
        if (n > 1 && val % n === 0) ops.push("÷");
        if (!ops.length) { ok = false; break; }
        const op = pick(ops, rng);
        const next = OPS[op](val, n);
        steps.push(`${val} ${op} ${n} = ${next}`);
        val = next;
      }
      if (ok && val >= 101 && val <= 999 && !nums.includes(val)) return { nums: shuffle(nums, rng), target: val, steps };
    }
  }

  BAW.register({
    id: "target",
    name: "Hit the Number",
    icon: "🎯",
    tagline: "Six numbers. One target. Do the maths.",
    howTo: "Combine the numbers with + − × ÷ to reach the target. Tap a number, an operation, then another number. You don't have to use every number. Results must be whole and positive.",
    render(root, ctx) {
      const puzzle = generate(ctx.rng);
      let tiles = puzzle.nums.map((v, id) => ({ v, id }));
      let nextId = tiles.length;
      let history = [];
      let log = [];
      let sel = null;
      let op = null;
      let over = false;

      const targetEl = el("div", { class: "target" }, el("span", { class: "muted small" }, "Target"), el("strong", null, String(puzzle.target)));
      const tileRow = el("div", { class: "num-tiles" });
      const opRow = el("div", { class: "op-row" });
      const logEl = el("ol", { class: "steps" });
      const controls = el("div", { class: "actions" },
        el("button", { class: "btn", onclick: undo }, "Undo"),
        el("button", { class: "btn", onclick: reset }, "Reset"),
        el("button", { class: "btn ghost", onclick: giveUp }, "Give up")
      );
      root.append(targetEl, tileRow, opRow, logEl, controls);

      function draw() {
        tileRow.replaceChildren(...tiles.map((t) =>
          el("button", { class: "num-tile" + (sel === t.id ? " selected" : "") + (t.v === puzzle.target ? " hit" : ""), disabled: over, onclick: () => tapTile(t) }, String(t.v))
        ));
        opRow.replaceChildren(...Object.keys(OPS).map((o) =>
          el("button", { class: "op" + (op === o ? " selected" : ""), disabled: over || sel === null, "aria-label": o, onclick: () => { op = op === o ? null : o; draw(); } }, o)
        ));
        logEl.replaceChildren(...log.map((s) => el("li", null, s)));
      }

      function tapTile(t) {
        if (sel === null || op === null) {
          sel = sel === t.id ? null : t.id;
          op = null;
          return draw();
        }
        if (sel === t.id) return;
        const a = tiles.find((x) => x.id === sel);
        const result = OPS[op](a.v, t.v);
        if (!Number.isInteger(result)) return ctx.toast("That doesn't divide evenly");
        if (result <= 0) return ctx.toast("Results must be positive");
        history.push({ tiles, log });
        const made = { v: result, id: nextId++ };
        tiles = tiles.filter((x) => x.id !== a.id).map((x) => (x.id === t.id ? made : x));
        log = [...log, `${a.v} ${op} ${t.v} = ${result}`];
        sel = made.id;
        op = null;
        if (result === puzzle.target) {
          over = true;
          draw();
          return ctx.finish({ won: true, scoreText: `Hit ${puzzle.target} in ${log.length} step${log.length > 1 ? "s" : ""}`, grid: "🎯" + "🟩".repeat(log.length) });
        }
        draw();
      }

      function undo() {
        if (over || !history.length) return;
        ({ tiles, log } = history.pop());
        sel = op = null;
        draw();
      }

      function reset() {
        if (over || !history.length) return;
        ({ tiles, log } = history[0]);
        history = [];
        sel = op = null;
        draw();
      }

      function giveUp() {
        if (over) return;
        over = true;
        draw();
        controls.replaceChildren(el("div", { class: "solution" }, el("p", { class: "muted small" }, "One way to do it:"), el("ol", { class: "steps" }, puzzle.steps.map((s) => el("li", null, s)))));
        ctx.finish({ won: false, scoreText: `Missed ${puzzle.target}`, grid: "🎯❌" });
      }

      draw();
    },
  });
})();
