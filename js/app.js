(function () {
  const { el } = BAW;
  const START = Date.UTC(2026, 10, 8); // Puzzle #1 is 8 November 2026
  const STORE_KEY = "bored-at-work:v1";
  const games = BAW.games;
  const $ = (sel) => document.querySelector(sel);

  // ---------- Days and schedule ----------
  function dayNumber(date = new Date()) {
    return Math.floor((Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) - START) / 86400000) + 1;
  }

  function dateForDay(day) {
    const d = new Date(START + (day - 1) * 86400000);
    return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  }

  // Every game appears once per cycle, in a shuffled order that changes each cycle.
  function cycleOrder(cycle) {
    const order = BAW.shuffle(games.map((g) => g.id), BAW.rng(BAW.hash("cycle:" + cycle)));
    if (cycle > 0) {
      const prev = BAW.shuffle(games.map((g) => g.id), BAW.rng(BAW.hash("cycle:" + (cycle - 1))));
      if (order[0] === prev[prev.length - 1]) [order[0], order[1]] = [order[1], order[0]];
    }
    return order;
  }

  function gameForDay(day) {
    const n = games.length;
    const cycle = Math.floor((Math.max(day, 1) - 1) / n);
    const id = cycleOrder(cycle)[(Math.max(day, 1) - 1) % n];
    return { game: games.find((g) => g.id === id), cycle };
  }

  // ---------- Saved results ----------
  function load() {
    try {
      return JSON.parse(localStorage.getItem(STORE_KEY)) || { results: {} };
    } catch {
      return { results: {} };
    }
  }

  function save(data) {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(data));
    } catch {}
  }

  function stats() {
    const { results } = load();
    const days = Object.keys(results).map(Number);
    const wins = days.filter((d) => results[d].won).length;
    // Streaks only count games finished on their own day.
    const live = new Set(days.filter((d) => results[d].live && results[d].won));
    let best = 0, run = 0;
    for (let d = 1; d <= today; d++) {
      run = live.has(d) ? run + 1 : 0;
      best = Math.max(best, run);
    }
    let current = 0;
    for (let d = live.has(today) ? today : today - 1; live.has(d); d--) current++;
    return { played: days.length, winPct: days.length ? Math.round((wins / days.length) * 100) : 0, current, best };
  }

  // ---------- Page state ----------
  const params = new URLSearchParams(location.search);
  const today = dayNumber();
  const requested = parseInt(params.get("day"), 10);
  const day = requested >= 1 && requested <= today ? requested : today;
  const isToday = day === today;
  const preview = params.get("game"); // ?game=sudoku lets you try any game without saving

  function toast(msg) {
    const t = el("div", { class: "toast", role: "status" }, msg);
    $("#toasts").append(t);
    setTimeout(() => t.classList.add("out"), 1600);
    setTimeout(() => t.remove(), 2000);
  }

  function shareText(day, game, r) {
    const url = location.origin + location.pathname;
    return `Bored at Work #${day} · ${game.icon} ${game.name}\n${r.won ? "✅" : "❌"} ${r.scoreText}\n${r.grid ? r.grid + "\n" : ""}${url}`;
  }

  async function share(text) {
    if (navigator.share && matchMedia("(pointer: coarse)").matches) {
      try {
        await navigator.share({ text });
        return;
      } catch (e) {
        if (e.name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(text);
      toast("Copied to clipboard");
    } catch {
      toast("Couldn't copy. Sorry!");
    }
  }

  function countdown() {
    const span = el("strong", { class: "countdown" });
    const update = () => {
      const now = new Date();
      const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      const s = Math.max(0, Math.floor((next - now) / 1000));
      if (s === 0 && isToday && !preview) location.reload();
      span.textContent = [Math.floor(s / 3600), Math.floor((s % 3600) / 60), s % 60].map((n) => String(n).padStart(2, "0")).join(":");
    };
    update();
    setInterval(update, 1000);
    return span;
  }

  function resultCard(game, r, fresh) {
    const s = stats();
    const card = el("section", { class: "result " + (r.won ? "won" : "lost"), "aria-live": "polite" },
      el("p", { class: "result-title" }, r.won ? pick(["Nicely done!", "Nailed it!", "Look at you go!", "Big brain energy."]) : pick(["Not today.", "So close.", "Tomorrow's yours.", "Happens to the best of us."])),
      el("p", { class: "result-score" }, r.scoreText),
      r.grid ? el("pre", { class: "result-grid" }, r.grid) : null,
      preview ? el("p", { class: "muted small" }, "Preview mode: this result isn't saved.") : null,
      el("div", { class: "actions" }, el("button", { class: "btn primary", onclick: () => share(shareText(day, game, r)) }, "Share result")),
      !preview ? el("div", { class: "mini-stats" },
        stat(s.played, "Played"), stat(s.winPct + "%", "Won"), stat(s.current, "Streak"), stat(s.best, "Best")
      ) : null,
      el("p", { class: "next-up" }, "New puzzle in ", countdown()),
      el("p", { class: "muted small" }, "Still bored? ", el("button", { class: "link", onclick: () => openDialog("archive") }, "Play a past puzzle"))
    );
    if (fresh) setTimeout(() => card.scrollIntoView({ behavior: "smooth", block: "nearest" }), 150);
    return card;
  }

  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function stat(value, label) {
    return el("div", { class: "stat" }, el("strong", null, String(value)), el("span", null, label));
  }

  // ---------- Render the puzzle of the day ----------
  function render() {
    const scheduled = gameForDay(day);
    const game = (preview && games.find((g) => g.id === preview)) || scheduled.game;
    const date = dateForDay(day);
    const main = $("#main");

    const label = isToday ? "Today" : "From the archive";
    main.replaceChildren(
      el("p", { class: "eyebrow" }, `${label} · No. ${day} · ${date.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" })}`),
      el("header", { class: "game-head" },
        el("span", { class: "game-icon", "aria-hidden": "true" }, game.icon),
        el("div", null, el("h1", null, game.name), el("p", { class: "muted" }, game.tagline))
      ),
      el("details", { class: "how" }, el("summary", null, "How to play"), el("p", null, game.howTo))
    );

    const saved = !preview && load().results[day];
    const area = el("div", { class: "game-area" });
    main.append(area);

    if (saved) {
      area.append(el("p", { class: "center muted done-note" }, isToday ? "You've already played today's puzzle." : "You've already played this one."));
      main.append(resultCard(game, saved, false));
      return;
    }

    if (!isToday && !preview) {
      main.querySelector(".eyebrow").after(el("p", { class: "banner" }, "Archive games don't count towards your streak. ", el("a", { href: location.pathname }, "Back to today")));
    }

    let finished = false;
    const ctx = {
      day,
      cycle: scheduled.cycle,
      rng: BAW.rng(BAW.hash(game.id + ":" + day)),
      toast,
      finish(r) {
        if (finished) return;
        finished = true;
        const result = { game: game.id, won: !!r.won, scoreText: r.scoreText, grid: r.grid || "", live: isToday };
        if (!preview) {
          const data = load();
          data.results[day] = result;
          save(data);
        }
        main.append(resultCard(game, result, true));
        if (result.won) confetti();
      },
    };
    game.render(area, ctx);
  }

  // ---------- Dialogs ----------
  function openDialog(which) {
    const dlg = $("#dialog");
    const body = $("#dialog-body");
    if (which === "help") {
      body.replaceChildren(
        el("h2", null, "How it works"),
        el("p", null, "There's one new game every day. It might be trivia, a word puzzle, a number puzzle or a logic game. Everyone gets the same puzzle on the same day."),
        el("p", null, "Each game takes about 2 to 5 minutes. Finish it, share your score, and come back tomorrow for something different."),
        el("h3", null, "The games"),
        el("ul", { class: "game-list" }, games.map((g) => el("li", null, el("span", { "aria-hidden": "true" }, g.icon), el("span", null, el("strong", null, g.name), " ", g.tagline))))
      );
    } else if (which === "stats") {
      const s = stats();
      body.replaceChildren(
        el("h2", null, "Your stats"),
        el("div", { class: "mini-stats big" }, stat(s.played, "Played"), stat(s.winPct + "%", "Won"), stat(s.current, "Streak"), stat(s.best, "Best streak")),
        el("p", { class: "muted small" }, "Stats are saved in this browser only. Your streak counts games you win on the day.")
      );
    } else if (which === "archive") {
      const { results } = load();
      const items = [];
      for (let d = today; d >= Math.max(1, today - 59); d--) {
        const g = gameForDay(d).game;
        const r = results[d];
        items.push(el("li", null, el("a", { href: `${location.pathname}?day=${d}`, class: d === day ? "current" : "" },
          el("span", { class: "arch-icon", "aria-hidden": "true" }, g.icon),
          el("span", { class: "arch-name" }, el("strong", null, d === today ? "Today" : `No. ${d}`), el("span", { class: "muted small" }, `${g.name} · ${dateForDay(d).toLocaleDateString(undefined, { day: "numeric", month: "short" })}`)),
          el("span", { class: "arch-status" }, r ? (r.won ? "✅" : "❌") : "")
        )));
      }
      body.replaceChildren(
        el("h2", null, "Past puzzles"),
        today > 1 ? null : el("p", { class: "muted" }, "This is day one, so there's nothing in the archive yet. Check back tomorrow!"),
        el("ul", { class: "archive" }, items)
      );
    }
    if (!dlg.open) dlg.showModal();
  }

  // ---------- Little celebration ----------
  function confetti() {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const layer = el("div", { class: "confetti", "aria-hidden": "true" });
    const colours = ["#f6c343", "#4fb286", "#5b8def", "#e8697b", "#9b7bea"];
    for (let i = 0; i < 60; i++) {
      const p = el("span");
      p.style.left = Math.random() * 100 + "%";
      p.style.background = colours[i % colours.length];
      p.style.animationDelay = Math.random() * 0.4 + "s";
      p.style.animationDuration = 1.6 + Math.random() * 1.2 + "s";
      p.style.setProperty("--drift", (Math.random() * 200 - 100).toFixed(0) + "px");
      layer.append(p);
    }
    document.body.append(layer);
    setTimeout(() => layer.remove(), 3500);
  }

  // ---------- Wire up ----------
  document.querySelectorAll("[data-open]").forEach((b) => b.addEventListener("click", () => openDialog(b.dataset.open)));
  $("#dialog").addEventListener("click", (e) => {
    if (e.target === e.currentTarget || e.target.closest("[data-close]")) $("#dialog").close();
  });

  if (today < 1) {
    $("#main").replaceChildren(el("p", { class: "center" }, "The first puzzle arrives on 8 November 2026. See you then!"));
  } else {
    render();
    try {
      if (!localStorage.getItem("bored-at-work:seen-help")) {
        localStorage.setItem("bored-at-work:seen-help", "1");
        openDialog("help");
      }
    } catch {}
  }
})();
