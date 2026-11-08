(function () {
  const { el } = BAW;
  const EMOJI = ["🍕", "🚀", "🐙", "🌵", "🎸", "🍩", "🦊", "⚽", "🌈", "🐢", "🍉", "🎈", "🦋", "🍔", "🎲", "🐝", "🌻", "🧁", "🦄", "🍒", "🐧", "🎧", "🍄", "🔥", "🥑", "🐳", "⭐", "🧩", "🍋", "🐸"];

  BAW.register({
    id: "pairs",
    name: "Memory Pairs",
    icon: "🃏",
    tagline: "Sixteen cards. Find the eight pairs.",
    howTo: "Flip two cards at a time. If they match they stay face up. Clear the board in as few moves as you can. Under 13 moves is excellent.",
    render(root, ctx) {
      const faces = BAW.shuffle(EMOJI, ctx.rng).slice(0, 8);
      const deck = BAW.shuffle([...faces, ...faces], ctx.rng);
      let open = [];
      let moves = 0;
      let matched = 0;
      let lock = false;

      const counter = el("p", { class: "center muted" }, "Moves: 0");
      const board = el("div", { class: "pairs" });
      const cards = deck.map((face, i) => {
        const card = el("button", { class: "card", "aria-label": "Hidden card", onclick: () => flip(i) },
          el("span", { class: "card-inner" }, el("span", { class: "card-back" }), el("span", { class: "card-front" }, face))
        );
        return card;
      });
      board.append(...cards);
      root.append(counter, board);

      function flip(i) {
        const card = cards[i];
        if (lock || card.classList.contains("flipped")) return;
        card.classList.add("flipped");
        card.setAttribute("aria-label", deck[i]);
        open.push(i);
        if (open.length < 2) return;
        moves++;
        counter.textContent = `Moves: ${moves}`;
        const [a, b] = open;
        open = [];
        if (deck[a] === deck[b]) {
          cards[a].classList.add("matched");
          cards[b].classList.add("matched");
          matched++;
          if (matched === faces.length) {
            const stars = moves <= 12 ? "⭐⭐⭐" : moves <= 16 ? "⭐⭐" : "⭐";
            ctx.finish({ won: true, scoreText: `Cleared in ${moves} moves`, grid: stars });
          }
        } else {
          lock = true;
          setTimeout(() => {
            for (const k of [a, b]) {
              cards[k].classList.remove("flipped");
              cards[k].setAttribute("aria-label", "Hidden card");
            }
            lock = false;
          }, 800);
        }
      }
    },
  });
})();
