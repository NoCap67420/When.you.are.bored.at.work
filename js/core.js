// Shared helpers used by the app and every game.
(function () {
  const BAW = (window.BAW = { games: [] });

  BAW.register = (game) => BAW.games.push(game);

  // Small seeded random number generator so everyone gets the same puzzle each day.
  BAW.rng = function (seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };

  BAW.hash = function (str) {
    let h = 2166136261;
    for (const ch of String(str)) {
      h ^= ch.charCodeAt(0);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  };

  BAW.shuffle = function (arr, rng) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  BAW.randInt = (rng, min, max) => min + Math.floor(rng() * (max - min + 1));
  BAW.pick = (arr, rng) => arr[Math.floor(rng() * arr.length)];

  // Take `count` items from a content bank for a given cycle. Items don't
  // repeat until the whole bank has been used.
  BAW.take = function (bank, cycle, count, salt) {
    const order = BAW.shuffle(bank, BAW.rng(BAW.hash(salt)));
    const out = [];
    for (let i = 0; i < count; i++) out.push(order[(cycle * count + i) % order.length]);
    return out;
  };

  BAW.normalize = (s) =>
    String(s)
      .toLowerCase()
      .replace(/&/g, " and ")
      .replace(/[^a-z0-9 ]/g, "")
      .replace(/\s+/g, " ")
      .trim();

  // Tiny DOM builder: el('button', {class: 'btn', onclick() {}}, 'Text')
  BAW.el = function (tag, props, ...kids) {
    const node = document.createElement(tag);
    if (props) {
      for (const [k, v] of Object.entries(props)) {
        if (v == null || v === false) continue;
        if (k === "class") node.className = v;
        else if (k.startsWith("on")) node.addEventListener(k.slice(2), v);
        else node.setAttribute(k, v === true ? "" : v);
      }
    }
    for (const c of kids.flat(Infinity)) {
      if (c == null || c === false) continue;
      node.append(c instanceof Node ? c : String(c));
    }
    return node;
  };

  BAW.formatTime = (secs) => `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, "0")}`;
})();
