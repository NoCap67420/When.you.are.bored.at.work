(function () {
  const { el } = BAW;

  // Words picked so that each scramble has only one common answer.
  const WORDS = {
    4: ["JAZZ", "FROG", "JINX", "DESK", "MILK", "BIKE", "MONK", "FUZZ", "ZERO", "HAWK", "JUMP", "KITE", "FISH", "CLAY", "DUCK", "GIFT", "YOGA", "QUIZ", "BULB", "COMB"],
    5: ["PIANO", "ROBOT", "PIZZA", "CHAIR", "JUICE", "CANDY", "GHOST", "KNIFE", "QUEEN", "ZEBRA", "TOWEL", "CAMEL", "BEACH", "MOUSE", "PLANT", "TRUCK", "WHALE", "CLOWN", "FLAME", "BRICK", "MAGIC", "VIRUS", "OLIVE", "HONEY", "TIGER"],
    6: ["BUTTER", "GUITAR", "PEPPER", "PLANET", "COFFEE", "JUNGLE", "ROCKET", "WINTER", "BRIDGE", "PENCIL", "CARROT", "DONKEY", "MAGNET", "PUZZLE", "BASKET", "ORANGE", "SUMMER", "VIOLIN", "TURKEY", "WALRUS", "GARLIC", "HELMET"],
    7: ["KITCHEN", "PENGUIN", "DOLPHIN", "BLANKET", "LIBRARY", "PYRAMID", "VOLCANO", "PICTURE", "LANTERN", "CABBAGE", "OCTOPUS", "BALLOON", "GIRAFFE", "CHICKEN", "PANCAKE", "TRUMPET", "MONSTER", "DIAMOND", "LOBSTER", "CAPTAIN"],
  };

  function scramble(word, rng) {
    let s = word;
    for (let t = 0; t < 20 && s === word; t++) s = BAW.shuffle([...word], rng).join("");
    return s;
  }

  BAW.register({
    id: "scramble",
    name: "Word Scramble",
    icon: "🔤",
    tagline: "Five jumbled words. Unscramble them.",
    howTo: "Rearrange the letters to find each word. Words get longer as you go. Get 3 or more to win. Skipping counts as a miss.",
    render(root, ctx) {
      const words = [
        ...BAW.take(WORDS[4], ctx.cycle, 1, "s4"),
        ...BAW.take(WORDS[5], ctx.cycle, 2, "s5"),
        ...BAW.take(WORDS[6], ctx.cycle, 1, "s6"),
        ...BAW.take(WORDS[7], ctx.cycle, 1, "s7"),
      ];
      let i = 0;
      let score = 0;
      const marks = [];
      const dots = el("div", { class: "dots" }, words.map(() => el("span", { class: "dot" })));
      const stage = el("div", { class: "stage" });
      root.append(dots, stage);

      function show() {
        const word = words[i];
        let letters = scramble(word, ctx.rng);
        [...dots.children].forEach((d, k) => d.classList.toggle("current", k === i));
        const tiles = el("div", { class: "letter-tiles" });
        const drawTiles = () => tiles.replaceChildren(...[...letters].map((ch) => el("span", { class: "letter" }, ch)));
        drawTiles();
        const input = el("input", { class: "text-input upper", type: "text", maxlength: word.length, autocomplete: "off", autocapitalize: "characters", spellcheck: "false", placeholder: `${word.length} letters`, "aria-label": "Your answer" });
        const feedback = el("p", { class: "feedback" });
        const form = el("form", {
          class: "answer-row",
          onsubmit(e) {
            e.preventDefault();
            const guess = input.value.trim().toUpperCase();
            if (guess.length !== word.length) return ctx.toast(`It needs ${word.length} letters`);
            if (guess === word) resolve(true);
            else {
              input.classList.remove("shake");
              void input.offsetWidth;
              input.classList.add("shake");
              feedback.textContent = "Not quite. Try again.";
            }
          },
        }, input, el("button", { class: "btn primary", type: "submit" }, "Check"));
        const extras = el("div", { class: "actions" },
          el("button", { class: "btn", type: "button", onclick() { letters = scramble(word, ctx.rng); drawTiles(); input.focus(); } }, "Shuffle"),
          el("button", { class: "btn ghost", type: "button", onclick: () => resolve(false) }, "Skip")
        );

        function resolve(ok) {
          if (ok) { score++; marks.push("🟩"); dots.children[i].classList.add("good"); }
          else { marks.push("🟥"); dots.children[i].classList.add("bad"); }
          tiles.replaceChildren(...[...word].map((ch) => el("span", { class: "letter " + (ok ? "good" : "reveal") }, ch)));
          form.remove();
          feedback.textContent = ok ? "Nice one!" : `The word was ${word}.`;
          extras.replaceChildren(el("button", { class: "btn primary", onclick: () => (++i < words.length ? show() : done()) }, i === words.length - 1 ? "See result" : "Next word"));
          extras.querySelector("button").focus();
        }

        stage.replaceChildren(el("p", { class: "muted small" }, `Word ${i + 1} of ${words.length}`), tiles, form, feedback, extras);
        input.focus({ preventScroll: true });
      }

      function done() {
        [...dots.children].forEach((d) => d.classList.remove("current"));
        stage.replaceChildren(el("p", { class: "center muted" }, "Today's words: " + words.join(", ")));
        ctx.finish({ won: score >= 3, scoreText: `${score}/5 words`, grid: marks.join("") });
      }

      show();
    },
  });
})();
