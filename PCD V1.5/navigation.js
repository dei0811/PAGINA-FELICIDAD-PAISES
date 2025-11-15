const sections = document.querySelectorAll(".section");
let currentSection = 0;

function showSection(index) {
  if (index < 0) index = sections.length - 1;
  if (index >= sections.length) index = 0;
  currentSection = index;
  sections[index].scrollIntoView({ behavior: "smooth", block: "start" });
}

function nextSection() {
  showSection(currentSection + 1);
}

function prevSection() {
  showSection(currentSection - 1);
}

// Detectar la sección visible al hacer scroll manual
window.addEventListener("scroll", () => {
  let scrollY = window.scrollY;
  sections.forEach((sec, i) => {
    const rect = sec.getBoundingClientRect();
    if (rect.top >= -window.innerHeight / 3 && rect.top < window.innerHeight / 2) {
      currentSection = i;
    }
  });
});

// ====== RESUMEN GLOBAL ======
function calculateGlobalData() {
  const countries = Object.keys(DATA);
  document.getElementById("countCountries").textContent = countries.length;

  let growth = [];

  countries.forEach(c => {
    const arr = DATA[c].evaluation;
    const first = arr[0];
    const last = arr[arr.length - 1];
    growth.push({ country: c, diff: last - first });
  });

  growth.sort((a,b)=>b.diff - a.diff);

  document.getElementById("bestGrowth").textContent =
    `${growth[0].country} (+${growth[0].diff.toFixed(2)})`;

  const last = growth[growth.length - 1];
  document.getElementById("worstGrowth").textContent =
    `${last.country} (${last.diff.toFixed(2)})`;

  // resumen global textual
  const avgFirst = growth.reduce((s,c)=>s + DATA[c.country].evaluation[0], 0) / countries.length;
  const avgLast  = growth.reduce((s,c)=>s + DATA[c.country].evaluation.slice(-1)[0], 0) / countries.length;

  document.getElementById("global-summary").textContent =
    `En promedio, la felicidad mundial pasó de ${avgFirst.toFixed(2)} en 2012 a ${avgLast.toFixed(2)} en 2024, mostrando una variación de ${(avgLast - avgFirst).toFixed(2)} puntos.`;
}

// ====== RANKINGS ======
function generateRankings() {
  const countries = Object.keys(DATA);

  let current = countries.map(c => ({
    name: c,
    val: DATA[c].evaluation.slice(-1)[0]
  }));

  current.sort((a,b)=>b.val - a.val);

  // top 5
  document.getElementById("top5").innerHTML =
    current.slice(0,5).map(c =>
      `<li>${c.name}: ${c.val.toFixed(2)}</li>`
    ).join("");

  // bottom 5
  document.getElementById("bottom5").innerHTML =
    current.slice(-5).map(c =>
      `<li>${c.name}: ${c.val.toFixed(2)}</li>`
    ).join("");
}

window.addEventListener("DOMContentLoaded", () => {
  calculateGlobalData();
  generateRankings();
});
