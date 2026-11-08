(function () {
  const { el } = BAW;

  // Each day uses three groups with different tags, so themes don't overlap.
  const GROUPS = [
    { tag: "animals", name: "Baby animals", words: ["KID", "CUB", "FOAL", "JOEY"] },
    { tag: "colours", name: "Shades of blue", words: ["NAVY", "TEAL", "COBALT", "AZURE"] },
    { tag: "food", name: "Pasta shapes", words: ["PENNE", "FUSILLI", "ORZO", "RIGATONI"] },
    { tag: "space", name: "Planets", words: ["MARS", "VENUS", "SATURN", "NEPTUNE"] },
    { tag: "music", name: "String instruments", words: ["HARP", "CELLO", "BANJO", "UKULELE"] },
    { tag: "office", name: "Office supplies", words: ["STAPLER", "BINDER", "MARKER", "ENVELOPE"] },
    { tag: "body", name: "Bones", words: ["FEMUR", "TIBIA", "PELVIS", "SKULL"] },
    { tag: "weather", name: "Types of cloud", words: ["CIRRUS", "CUMULUS", "STRATUS", "NIMBUS"] },
    { tag: "games", name: "Chess pieces", words: ["ROOK", "BISHOP", "KNIGHT", "PAWN"] },
    { tag: "drinks", name: "Coffee drinks", words: ["LATTE", "MOCHA", "ESPRESSO", "MACCHIATO"] },
    { tag: "food", name: "Cheeses", words: ["BRIE", "GOUDA", "CHEDDAR", "FETA"] },
    { tag: "animals", name: "Dog breeds", words: ["POODLE", "BEAGLE", "BOXER", "CORGI"] },
    { tag: "letters", name: "Greek letters", words: ["ALPHA", "DELTA", "SIGMA", "OMEGA"] },
    { tag: "nature", name: "Trees", words: ["OAK", "MAPLE", "BIRCH", "WILLOW"] },
    { tag: "dance", name: "Dances", words: ["TANGO", "SALSA", "WALTZ", "FOXTROT"] },
    { tag: "fruit", name: "Citrus fruits", words: ["LEMON", "LIME", "GRAPEFRUIT", "KUMQUAT"] },
    { tag: "gems", name: "Gemstones", words: ["RUBY", "EMERALD", "SAPPHIRE", "OPAL"] },
    { tag: "places", name: "European capitals", words: ["PARIS", "MADRID", "OSLO", "VIENNA"] },
    { tag: "sport", name: "Racket sports", words: ["TENNIS", "SQUASH", "BADMINTON", "PADEL"] },
    { tag: "kitchen", name: "Kitchen utensils", words: ["WHISK", "LADLE", "SPATULA", "TONGS"] },
    { tag: "maths", name: "Shapes", words: ["CIRCLE", "TRIANGLE", "OCTAGON", "RHOMBUS"] },
    { tag: "games", name: "Card games", words: ["POKER", "BRIDGE", "SNAP", "RUMMY"] },
    { tag: "weather", name: "Storms", words: ["BLIZZARD", "TORNADO", "HURRICANE", "MONSOON"] },
    { tag: "wordplay", name: "___BALL", words: ["BASKET", "FOOT", "SNOW", "MEAT"] },
    { tag: "wordplay", name: "FIRE___", words: ["TRUCK", "WORK", "PLACE", "ALARM"] },
    { tag: "wordplay", name: "___CAKE", words: ["CUP", "PAN", "CHEESE", "SPONGE"] },
    { tag: "wordplay", name: "___BOX", words: ["JUKE", "LUNCH", "SAND", "MAIL"] },
    { tag: "tech", name: "Keyboard keys", words: ["SHIFT", "ENTER", "ESCAPE", "DELETE"] },
    { tag: "money", name: "Currencies", words: ["EURO", "PESO", "RUPEE", "KRONA"] },
    { tag: "birds", name: "Birds", words: ["ROBIN", "FALCON", "HERON", "PELICAN"] },
    { tag: "bugs", name: "Insects", words: ["BEETLE", "CRICKET", "MOTH", "ANT"] },
    { tag: "transport", name: "Ways to get around", words: ["TRAM", "FERRY", "SCOOTER", "VAN"] },
    { tag: "clothes", name: "Footwear", words: ["SANDAL", "LOAFER", "BOOT", "SLIPPER"] },
    { tag: "food", name: "Herbs", words: ["BASIL", "THYME", "SAGE", "OREGANO"] },
    { tag: "body", name: "Parts of the eye", words: ["IRIS", "PUPIL", "LENS", "RETINA"] },
    { tag: "music", name: "Music genres", words: ["JAZZ", "BLUES", "REGGAE", "FUNK"] },
    { tag: "nature", name: "Flowers", words: ["TULIP", "DAISY", "ORCHID", "LILY"] },
    { tag: "space", name: "Things in space", words: ["COMET", "NEBULA", "QUASAR", "METEOR"] },
  ];

  const COLOURS = ["g1", "g2", "g3"];
  const SHARE = ["🟨", "🟩", "🟦"];

  function choose(rng) {
    const out = [];
    const tags = new Set();
    for (const g of BAW.shuffle(GROUPS, rng)) {
      if (tags.has(g.tag)) continue;
      out.push(g);
      tags.add(g.tag);
      if (out.length === 3) break;
    }
    return out;
  }

  BAW.register({
    id: "groups",
    name: "Odd Groups",
    icon: "🗂️",
    tagline: "Twelve words. Three hidden groups.",
    howTo: "Find three groups of four words that share something in common. Select four words and tap Submit. You can make 3 mistakes.",
    render(root, ctx) {
      const groups = choose(ctx.rng);
      const owner = {};
      groups.forEach((g, gi) => g.words.forEach((w) => (owner[w] = gi)));
      let remaining = BAW.shuffle(groups.flatMap((g) => g.words), ctx.rng);
      const selected = new Set();
      const solved = [];
      const tried = new Set();
      const rows = [];
      let lives = 3;
      let over = false;

      const solvedEl = el("div", { class: "solved-groups" });
      const board = el("div", { class: "word-grid" });
      const livesEl = el("p", { class: "center muted lives" });
      const submit = el("button", { class: "btn primary", onclick: check }, "Submit");
      const controls = el("div", { class: "actions" },
        el("button", { class: "btn", onclick() { remaining = BAW.shuffle(remaining, Math.random); draw(); } }, "Shuffle"),
        el("button", { class: "btn", onclick() { selected.clear(); draw(); } }, "Clear"),
        submit
      );
      root.append(solvedEl, board, livesEl, controls);

      function draw() {
        solvedEl.replaceChildren(...solved.map((gi) =>
          el("div", { class: "solved-group " + COLOURS[gi] }, el("strong", null, groups[gi].name), el("span", null, groups[gi].words.join(", ")))
        ));
        board.replaceChildren(...remaining.map((w) =>
          el("button", { class: "word" + (selected.has(w) ? " selected" : "") + (w.length > 8 ? " long" : ""), disabled: over, onclick() {
            if (selected.has(w)) selected.delete(w);
            else if (selected.size < 4) selected.add(w);
            draw();
          } }, w)
        ));
        livesEl.replaceChildren("Mistakes left: ", ...Array.from({ length: 3 }, (_, k) => el("span", { class: "life" + (k < lives ? "" : " lost") })));
        submit.disabled = selected.size !== 4 || over;
      }

      function check() {
        const pick = [...selected];
        const key = pick.slice().sort().join();
        if (tried.has(key)) return ctx.toast("You already tried that");
        tried.add(key);
        rows.push(pick.map((w) => SHARE[owner[w]]).join(""));
        const counts = [0, 0, 0];
        pick.forEach((w) => counts[owner[w]]++);
        const best = Math.max(...counts);
        if (best === 4) {
          const gi = counts.indexOf(4);
          solved.push(gi);
          remaining = remaining.filter((w) => owner[w] !== gi);
          selected.clear();
          if (solved.length === 2) {
            // Last group is a given once the other two are found.
            const last = [0, 1, 2].find((g) => !solved.includes(g));
            solved.push(last);
            remaining = [];
          }
          if (solved.length === 3) return finish(true);
          return draw();
        }
        lives--;
        board.classList.remove("shake");
        void board.offsetWidth;
        board.classList.add("shake");
        if (best === 3) ctx.toast("One away!");
        if (lives === 0) {
          for (const gi of [0, 1, 2]) if (!solved.includes(gi)) solved.push(gi);
          remaining = [];
          return finish(false);
        }
        draw();
      }

      function finish(won) {
        over = true;
        selected.clear();
        controls.remove();
        draw();
        ctx.finish({ won, scoreText: won ? `Found all groups with ${3 - lives} mistake${3 - lives === 1 ? "" : "s"}` : "Out of guesses", grid: rows.join("\n") });
      }

      draw();
    },
  });
})();
