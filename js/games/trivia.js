(function () {
  const { el } = BAW;

  // The first choice is always the correct one. Choices are shuffled on screen.
  const BANK = [
    { q: "Which planet has the most known moons?", c: ["Saturn", "Jupiter", "Uranus", "Neptune"] },
    { q: "What is the capital of Australia?", c: ["Canberra", "Sydney", "Melbourne", "Perth"] },
    { q: "How many hearts does an octopus have?", c: ["3", "1", "2", "8"] },
    { q: "What is the hardest natural substance?", c: ["Diamond", "Quartz", "Titanium", "Granite"] },
    { q: "Which element has the chemical symbol Fe?", c: ["Iron", "Fluorine", "Lead", "Francium"] },
    { q: "In what year did people first walk on the Moon?", c: ["1969", "1965", "1972", "1959"] },
    { q: "What is the largest ocean on Earth?", c: ["Pacific", "Atlantic", "Indian", "Arctic"] },
    { q: "Who painted the Mona Lisa?", c: ["Leonardo da Vinci", "Michelangelo", "Raphael", "Botticelli"] },
    { q: "What is the smallest prime number?", c: ["2", "1", "3", "0"] },
    { q: "Counting overseas territories, which country has the most time zones?", c: ["France", "Russia", "USA", "China"] },
    { q: "How many sides does a hexagon have?", c: ["6", "5", "7", "8"] },
    { q: "Which gas do plants take in for photosynthesis?", c: ["Carbon dioxide", "Oxygen", "Nitrogen", "Helium"] },
    { q: "What is the longest river in South America?", c: ["Amazon", "Paraná", "Orinoco", "Magdalena"] },
    { q: "Which language has the most native speakers?", c: ["Mandarin Chinese", "English", "Spanish", "Hindi"] },
    { q: "What is the tallest mountain above sea level?", c: ["Mount Everest", "K2", "Kilimanjaro", "Denali"] },
    { q: "What is the largest organ of the human body?", c: ["Skin", "Liver", "Brain", "Lungs"] },
    { q: "Who wrote Romeo and Juliet?", c: ["William Shakespeare", "Christopher Marlowe", "Charles Dickens", "Geoffrey Chaucer"] },
    { q: "At what temperature does water freeze in Fahrenheit?", c: ["32°F", "0°F", "100°F", "212°F"] },
    { q: "Which planet is known as the Red Planet?", c: ["Mars", "Venus", "Jupiter", "Mercury"] },
    { q: "What currency is used in Japan?", c: ["Yen", "Won", "Yuan", "Ringgit"] },
    { q: "How many bones are in the adult human body?", c: ["206", "186", "226", "256"] },
    { q: "What is the largest desert in the world?", c: ["Antarctic", "Sahara", "Gobi", "Arabian"] },
    { q: "How many keys does a standard piano have?", c: ["88", "76", "92", "64"] },
    { q: "What is the capital of Canada?", c: ["Ottawa", "Toronto", "Vancouver", "Montreal"] },
    { q: "What is the fastest land animal?", c: ["Cheetah", "Pronghorn", "Lion", "Greyhound"] },
    { q: "Which blood type is known as the universal donor?", c: ["O negative", "AB positive", "A negative", "B positive"] },
    { q: "Which country gave the Statue of Liberty to the USA?", c: ["France", "United Kingdom", "Spain", "Italy"] },
    { q: "How many players does a soccer team have on the field?", c: ["11", "9", "10", "12"] },
    { q: "What is the square root of 144?", c: ["12", "14", "11", "16"] },
    { q: "In which city is the Colosseum?", c: ["Rome", "Athens", "Naples", "Florence"] },
    { q: "What is the chemical symbol for gold?", c: ["Au", "Ag", "Gd", "Go"] },
    { q: "Which planet is closest to the Sun?", c: ["Mercury", "Venus", "Earth", "Mars"] },
    { q: "Which ocean lies between Africa and Australia?", c: ["Indian", "Pacific", "Atlantic", "Southern"] },
    { q: "Who came up with the theory of general relativity?", c: ["Albert Einstein", "Isaac Newton", "Niels Bohr", "Stephen Hawking"] },
    { q: "What is the most common letter in English text?", c: ["E", "A", "T", "S"] },
    { q: "What is a group of crows called?", c: ["A murder", "A parliament", "A pride", "A gaggle"] },
    { q: "Which country has the largest population?", c: ["India", "China", "USA", "Indonesia"] },
    { q: "What is the longest bone in the human body?", c: ["Femur", "Tibia", "Humerus", "Fibula"] },
    { q: "How many minutes are in a day?", c: ["1,440", "1,240", "1,600", "2,400"] },
    { q: "What is the capital of Turkey?", c: ["Ankara", "Istanbul", "Izmir", "Antalya"] },
    { q: "Which metal is liquid at room temperature?", c: ["Mercury", "Lead", "Tin", "Sodium"] },
    { q: "In what year did the Titanic sink?", c: ["1912", "1905", "1915", "1921"] },
    { q: "Which fruit has its seeds on the outside?", c: ["Strawberry", "Raspberry", "Kiwi", "Fig"] },
    { q: "In computing, what does CPU stand for?", c: ["Central Processing Unit", "Computer Personal Unit", "Central Program Utility", "Core Processing Unit"] },
    { q: "What is the national animal of Scotland?", c: ["Unicorn", "Lion", "Red deer", "Golden eagle"] },
    { q: "What is the smallest country in the world by area?", c: ["Vatican City", "Monaco", "San Marino", "Liechtenstein"] },
    { q: "Which bird can fly backwards?", c: ["Hummingbird", "Swift", "Kingfisher", "Sparrow"] },
    { q: "Which planet has the longest day?", c: ["Venus", "Mercury", "Jupiter", "Neptune"] },
    { q: "How many strings does a standard violin have?", c: ["4", "5", "6", "3"] },
    { q: "Where was papermaking first developed?", c: ["China", "Egypt", "Greece", "India"] },
    { q: "What is the only mammal capable of true flight?", c: ["Bat", "Flying squirrel", "Sugar glider", "Colugo"] },
    { q: "Which programming language is named after a comedy group?", c: ["Python", "Ruby", "Java", "Perl"] },
    { q: "What is the capital of New Zealand?", c: ["Wellington", "Auckland", "Christchurch", "Queenstown"] },
    { q: "What is the largest planet in our solar system?", c: ["Jupiter", "Saturn", "Neptune", "Earth"] },
    { q: "Which vitamin does your skin make in sunlight?", c: ["Vitamin D", "Vitamin C", "Vitamin A", "Vitamin B12"] },
    { q: "How many degrees are in a right angle?", c: ["90", "45", "180", "60"] },
    { q: "Which country is famous for the dish paella?", c: ["Spain", "Mexico", "Portugal", "Italy"] },
    { q: "What is the main language spoken in Brazil?", c: ["Portuguese", "Spanish", "French", "English"] },
    { q: "Which chess piece can only move diagonally?", c: ["Bishop", "Rook", "Knight", "King"] },
    { q: "Which is the coldest planet in our solar system?", c: ["Uranus", "Neptune", "Saturn", "Mars"] },
  ];

  BAW.register({
    id: "trivia",
    name: "Quick Fire Trivia",
    icon: "❓",
    tagline: "Five questions. No googling.",
    howTo: "Answer five multiple-choice questions. Get 3 or more right to win.",
    render(root, ctx) {
      const qs = BAW.take(BANK, ctx.cycle, 5, "trivia");
      let i = 0;
      let score = 0;
      const marks = [];
      const dots = el("div", { class: "dots" }, qs.map(() => el("span", { class: "dot" })));
      const stage = el("div", { class: "stage" });
      root.append(dots, stage);

      function show() {
        const q = qs[i];
        [...dots.children].forEach((d, k) => d.classList.toggle("current", k === i));
        const opts = BAW.shuffle(q.c.map((t, k) => ({ t, ok: k === 0 })), ctx.rng);
        const next = el(
          "button",
          { class: "btn primary", hidden: true, onclick: () => (++i < qs.length ? show() : done()) },
          i === qs.length - 1 ? "See result" : "Next question"
        );
        const buttons = opts.map((o) =>
          el("button", {
            class: "choice",
            onclick() {
              buttons.forEach((b, k) => {
                b.disabled = true;
                if (opts[k].ok) b.classList.add("correct");
              });
              if (o.ok) {
                score++;
                marks.push("🟩");
                dots.children[i].classList.add("good");
              } else {
                this.classList.add("wrong");
                marks.push("🟥");
                dots.children[i].classList.add("bad");
              }
              next.hidden = false;
              next.focus();
            },
          }, o.t)
        );
        stage.replaceChildren(
          el("p", { class: "muted small" }, `Question ${i + 1} of ${qs.length}`),
          el("h2", { class: "question" }, q.q),
          el("div", { class: "choices" }, buttons),
          el("div", { class: "actions" }, next)
        );
      }

      function done() {
        [...dots.children].forEach((d) => d.classList.remove("current"));
        stage.replaceChildren(
          el("ul", { class: "recap" }, qs.map((q, k) =>
            el("li", null, el("span", null, marks[k]), el("span", null, q.q, el("strong", null, " " + q.c[0])))
          ))
        );
        ctx.finish({ won: score >= 3, scoreText: `${score}/5 correct`, grid: marks.join("") });
      }

      show();
    },
  });
})();
