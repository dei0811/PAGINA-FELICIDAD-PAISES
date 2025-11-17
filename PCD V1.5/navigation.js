// ======================================================
// NAVEGACIÓN ENTRE SECCIONES (VERSIÓN REDUCIDA)
// Solo 6 secciones principales según tu HTML
// ======================================================

// Capturar solo las secciones principales
const sections = [
  document.getElementById("sec-hero"),        // 0
  document.getElementById("sec-intro"),       // 1
  document.getElementById("sec-world"),       // 2
  document.getElementById("sec-continents"),  // 3
  document.getElementById("sec-bibliography"),// 4
  document.getElementById("sec-credits")      // 5
];

let currentSection = 0;

// =============================
// MOSTRAR SECCIÓN
// =============================
function showSection(index) {
  if (!sections[index]) return;
  currentSection = index;

  sections[index].scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}

// =============================
// SIGUIENTE / ANTERIOR
// =============================
function nextSection() {
  let next = currentSection + 1;
  if (next >= sections.length) next = 0;
  showSection(next);
}

function prevSection() {
  let prev = currentSection - 1;
  if (prev < 0) prev = sections.length - 1;
  showSection(prev);
}

// =============================
// ACTUALIZAR SECCIÓN ACTUAL (scroll manual)
// =============================
window.addEventListener("scroll", () => {
  let winMid = window.innerHeight * 0.45;

  sections.forEach((sec, i) => {
    const rect = sec.getBoundingClientRect();
    if (rect.top <= winMid && rect.bottom >= winMid) {
      currentSection = i;
    }
  });
});
