(function () {
  const { el, randInt, pick } = BAW;
  const PRIMES = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61];

  // Each generator returns 6 numbers (5 shown, 1 to guess) and the rule.
  const TIERS = [
    [
      (r) => { const a = randInt(r, 2, 20), d = randInt(r, 3, 12); return { s: seq((i) => a + i * d), rule: `Add ${d} each time.` }; },
      (r) => { const a = randInt(r, 80, 150), d = randInt(r, 4, 13); return { s: seq((i) => a - i * d), rule: `Subtract ${d} each time.` }; },
    ],
    [
      (r) => { const a = randInt(r, 1, 5), k = randInt(r, 2, 3); return { s: seq((i) => a * k ** i), rule: `Multiply by ${k} each time.` }; },
      (r) => { const o = randInt(r, 1, 6); return { s: seq((i) => (i + o) ** 2), rule: "Square numbers." }; },
      (r) => { const a = randInt(r, 2, 5); const s = [a]; while (s.length < 6) s.push(s.at(-1) * 2 - 1); return { s, rule: "Double it, then subtract 1." }; },
    ],
    [
      (r) => { const a = randInt(r, 1, 10), d = randInt(r, 1, 4), e = randInt(r, 1, 3); const s = [a]; for (let i = 0; i < 5; i++) s.push(s.at(-1) + d + i * e); return { s, rule: `The gap grows by ${e} each time (+${d}, +${d + e}, +${d + 2 * e}…).` }; },
      (r) => { const s = [randInt(r, 1, 4), randInt(r, 2, 6)]; while (s.length < 6) s.push(s.at(-1) + s.at(-2)); return { s, rule: "Each number is the sum of the two before it." }; },
      (r) => { const o = randInt(r, 1, 6); return { s: seq((i) => ((i + o) * (i + o + 1)) / 2), rule: "Triangular numbers (add 1 more each time)." }; },
      (r) => { const o = randInt(r, 1, 3); return { s: seq((i) => (i + o) ** 3), rule: "Cube numbers." }; },
    ],
    [
      (r) => { const p = randInt(r, 2, 6); const s = [randInt(r, 1, 5)]; for (let i = 1; i < 6; i++) s.push(i % 2 ? s.at(-1) * 2 : s.at(-1) + p); return { s, rule: `Alternate: ×2, then +${p}.` }; },
      (r) => { const a = randInt(r, 1, 9), b = randInt(r, 20, 40), d1 = randInt(r, 2, 5), d2 = randInt(r, 2, 4); return { s: seq((i) => (i % 2 ? b - Math.floor(i / 2) * d2 : a + (i / 2) * d1)), rule: `Two sequences take turns: one goes up by ${d1}, the other down by ${d2}.` }; },
      (r) => { const o = randInt(r, 0, 10); return { s: PRIMES.slice(o, o + 6), rule: "Prime numbers." }; },
      (r) => { const a = randInt(r, 2, 6); const s = [a]; for (let i = 1; i < 6; i++) s.push(s.at(-1) + i * i); return { s, rule: "Add 1, 4, 9, 16, 25… (square numbers)." }; },
    ],
  ];

  function seq(f) {
    return Array.from({ length: 6 }, (_, i) => f(i));
  }

  BAW.register({
    id: "sequence",
    name: "What Comes Next?",
    icon: "🔮",
    tagline: "Four number patterns. Crack the rule.",
    howTo: "Work out the pattern and type the next number. Puzzles get harder as you go. You get two tries each. Solve 3 out of 4 to win.",
    render(root, ctx) {
      const puzzles = TIERS.map((tier) => pick(tier, ctx.rng)(ctx.rng));
      let i = 0;
      let score = 0;
      const marks = [];
      const dots = el("div", { class: "dots" }, puzzles.map(() => el("span", { class: "dot" })));
      const stage = el("div", { class: "stage" });
      root.append(dots, stage);

      function show() {
        const p = puzzles[i];
        const answer = p.s[5];
        let tries = 2;
        [...dots.children].forEach((d, k) => d.classList.toggle("current", k === i));
        const row = el("div", { class: "seq" }, p.s.slice(0, 5).map((n) => el("span", { class: "seq-num" }, String(n))), el("span", { class: "seq-num mystery" }, "?"));
        const input = el("input", { class: "text-input", type: "text", inputmode: "numeric", autocomplete: "off", placeholder: "Next number", "aria-label": "Next number" });
        const feedback = el("p", { class: "feedback" });
        const form = el("form", {
          class: "answer-row",
          onsubmit(e) {
            e.preventDefault();
            const guess = Number(input.value.replace(/[, ]/g, ""));
            if (!input.value.trim() || Number.isNaN(guess)) return ctx.toast("Type a number");
            if (guess === answer) return resolve(true);
            tries--;
            input.value = "";
            input.classList.remove("shake");
            void input.offsetWidth;
            input.classList.add("shake");
            if (tries === 0) return resolve(false);
            feedback.textContent = "Not that one. One more try.";
          },
        }, input, el("button", { class: "btn primary", type: "submit" }, "Check"));

        function resolve(ok) {
          if (ok) { score++; marks.push(tries === 2 ? "🟩" : "🟨"); dots.children[i].classList.add("good"); }
          else { marks.push("🟥"); dots.children[i].classList.add("bad"); }
          row.lastChild.textContent = String(answer);
          row.lastChild.classList.add(ok ? "good" : "reveal");
          form.remove();
          feedback.replaceChildren(el("strong", null, ok ? "Correct. " : `It was ${answer}. `), p.rule);
          const next = el("button", { class: "btn primary", onclick: () => (++i < puzzles.length ? show() : done()) }, i === puzzles.length - 1 ? "See result" : "Next pattern");
          stage.append(el("div", { class: "actions" }, next));
          next.focus();
        }

        stage.replaceChildren(el("p", { class: "muted small" }, `Pattern ${i + 1} of ${puzzles.length}`), row, form, feedback);
        input.focus({ preventScroll: true });
      }

      function done() {
        [...dots.children].forEach((d) => d.classList.remove("current"));
        stage.replaceChildren(el("ul", { class: "recap" }, puzzles.map((p, k) => el("li", null, el("span", null, marks[k]), el("span", null, p.s.join(", ") + " · " + p.rule)))));
        ctx.finish({ won: score >= 3, scoreText: `${score}/4 patterns`, grid: marks.join("") });
      }

      show();
    },
  });
})();
