(function () {
  const { el } = BAW;

  const BANK = [
    { e: "🌧️🐈🐕", a: "Raining cats and dogs", cat: "Saying" },
    { e: "🐘🛋️🚪", a: "Elephant in the room", cat: "Saying" },
    { e: "⏰💰", a: "Time is money", cat: "Saying" },
    { e: "🍎👁️", a: "Apple of my eye", cat: "Saying" },
    { e: "🦈🌊🏖️😱", a: "Jaws", cat: "Film" },
    { e: "🦁👑", a: "The Lion King", cat: "Film" },
    { e: "❄️👸⛄", a: "Frozen", cat: "Film" },
    { e: "🕷️🧑", a: "Spider-Man", cat: "Superhero" },
    { e: "👻👻🚫", a: "Ghostbusters", cat: "Film" },
    { e: "🚢🧊💔", a: "Titanic", cat: "Film" },
    { e: "🦖🏝️🎢", a: "Jurassic Park", cat: "Film" },
    { e: "🐝🦵", a: "The bee's knees", cat: "Saying" },
    { e: "🪨🐦🐦", a: "Two birds, one stone", cat: "Saying", alt: ["Two birds with one stone", "Kill two birds with one stone"] },
    { e: "🌙🚶", a: "Moonwalk", cat: "Dance move" },
    { e: "☀️🌼", a: "Sunflower", cat: "Flower" },
    { e: "🌈🐟", a: "Rainbow trout", cat: "Animal" },
    { e: "🧈🪰", a: "Butterfly", cat: "Compound word" },
    { e: "⭐🐟", a: "Starfish", cat: "Compound word" },
    { e: "🍯🌙", a: "Honeymoon", cat: "Compound word" },
    { e: "🔑🕳️", a: "Keyhole", cat: "Compound word" },
    { e: "🧠🌪️", a: "Brainstorm", cat: "Compound word" },
    { e: "☁️9️⃣", a: "On cloud nine", cat: "Saying", alt: ["Cloud nine", "Cloud 9", "On cloud 9"] },
    { e: "🐍🪜", a: "Snakes and ladders", cat: "Board game" },
    { e: "🧙💍🌋", a: "The Lord of the Rings", cat: "Film" },
    { e: "🐼🥋", a: "Kung Fu Panda", cat: "Film" },
    { e: "🔍🐠", a: "Finding Nemo", cat: "Film" },
    { e: "🍫🏭🎫", a: "Charlie and the Chocolate Factory", cat: "Film", alt: ["Willy Wonka and the Chocolate Factory"] },
    { e: "🦇🧑", a: "Batman", cat: "Superhero" },
    { e: "⭐⚔️", a: "Star Wars", cat: "Film" },
    { e: "🏠🧒🎄", a: "Home Alone", cat: "Film" },
    { e: "🐟🍟", a: "Fish and chips", cat: "Food" },
    { e: "🥜🧈", a: "Peanut butter", cat: "Food" },
    { e: "❄️🧑", a: "Snowman", cat: "Compound word" },
    { e: "🌍🌡️", a: "Global warming", cat: "Phrase" },
    { e: "🎤⬇️", a: "Mic drop", cat: "Phrase" },
    { e: "💰🚫🌳", a: "Money doesn't grow on trees", cat: "Saying", alt: ["Money does not grow on trees"] },
    { e: "🔨🧊", a: "Break the ice", cat: "Saying" },
    { e: "🥶🦃", a: "Cold turkey", cat: "Saying" },
    { e: "💭📦", a: "Think outside the box", cat: "Saying", alt: ["Outside the box"] },
    { e: "🐱👜", a: "Let the cat out of the bag", cat: "Saying", alt: ["Cat out of the bag"] },
    { e: "🍰🧩", a: "Piece of cake", cat: "Saying" },
    { e: "🦶⚽", a: "Football", cat: "Compound word" },
    { e: "🌊🐎", a: "Seahorse", cat: "Animal" },
    { e: "🔥🚒👨", a: "Firefighter", cat: "Job", alt: ["Fireman"] },
    { e: "🐻❄️", a: "Polar bear", cat: "Animal" },
  ];

  const clean = (s) => BAW.normalize(s).replace(/^the /, "").replace(/ /g, "");

  function blanks(answer) {
    return answer.split(" ").map((w) => w.replace(/[A-Za-z0-9]/g, "_")).join("   ");
  }

  BAW.register({
    id: "emoji",
    name: "Emoji Decoder",
    icon: "🤔",
    tagline: "Three emoji clues. Name the thing.",
    howTo: "Each set of emoji stands for a saying, film, word or thing. You get three tries per clue. Solve 2 out of 3 to win.",
    render(root, ctx) {
      const items = BAW.take(BANK, ctx.cycle, 3, "emoji");
      let i = 0;
      let score = 0;
      const marks = [];
      const dots = el("div", { class: "dots" }, items.map(() => el("span", { class: "dot" })));
      const stage = el("div", { class: "stage" });
      root.append(dots, stage);

      function show() {
        const item = items[i];
        const answers = [item.a, ...(item.alt || [])].map(clean);
        let tries = 3;
        [...dots.children].forEach((d, k) => d.classList.toggle("current", k === i));
        const triesEl = el("p", { class: "muted small center" }, "3 tries left");
        const input = el("input", { class: "text-input", type: "text", autocomplete: "off", spellcheck: "false", placeholder: "Your guess", "aria-label": "Your guess" });
        const feedback = el("p", { class: "feedback" });
        const form = el("form", {
          class: "answer-row",
          onsubmit(e) {
            e.preventDefault();
            if (!input.value.trim()) return;
            if (answers.includes(clean(input.value))) return resolve(true);
            tries--;
            input.value = "";
            input.classList.remove("shake");
            void input.offsetWidth;
            input.classList.add("shake");
            if (tries === 0) return resolve(false);
            triesEl.textContent = `${tries} ${tries === 1 ? "try" : "tries"} left`;
            feedback.textContent = "Nope. Have another go.";
          },
        }, input, el("button", { class: "btn primary", type: "submit" }, "Guess"));
        const extras = el("div", { class: "actions" }, el("button", { class: "btn ghost", type: "button", onclick: () => resolve(false) }, "Reveal"));

        function resolve(ok) {
          const used = 3 - tries;
          if (ok) { score++; marks.push(used === 0 ? "🟩" : "🟨"); dots.children[i].classList.add("good"); }
          else { marks.push("🟥"); dots.children[i].classList.add("bad"); }
          form.remove();
          triesEl.remove();
          feedback.replaceChildren(ok ? "Got it! " : "It was ", el("strong", null, item.a));
          extras.replaceChildren(el("button", { class: "btn primary", onclick: () => (++i < items.length ? show() : done()) }, i === items.length - 1 ? "See result" : "Next clue"));
          extras.querySelector("button").focus();
        }

        stage.replaceChildren(
          el("p", { class: "muted small" }, `Clue ${i + 1} of ${items.length} · ${item.cat}`),
          el("div", { class: "emoji-clue" }, item.e),
          el("p", { class: "blanks", "aria-label": `${item.a.split(" ").length} words` }, blanks(item.a)),
          triesEl, form, feedback, extras
        );
        input.focus({ preventScroll: true });
      }

      function done() {
        [...dots.children].forEach((d) => d.classList.remove("current"));
        stage.replaceChildren(el("ul", { class: "recap" }, items.map((it, k) => el("li", null, el("span", null, marks[k]), el("span", null, it.e + "  ", el("strong", null, it.a))))));
        ctx.finish({ won: score >= 2, scoreText: `${score}/3 decoded`, grid: marks.join("") });
      }

      show();
    },
  });
})();
