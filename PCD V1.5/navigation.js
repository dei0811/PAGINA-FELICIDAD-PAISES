// ======================================================
// NAVEGACIÓN ENTRE SECCIONES (PARCHE PARA TYPEERROR)
// ======================================================

// Obtenemos solo las secciones que realmente existen
const sections = [
  document.getElementById("sec-hero"),
  document.getElementById("sec-intro"),
  document.getElementById("sec-world"),
  document.getElementById("sec-bibliography"),
  document.getElementById("sec-credits")
].filter(Boolean);


let currentSection = 0;

function showSection(index) {
  if (!sections[index]) return;
  currentSection = index;
  sections[index].scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}

function nextSection() {
  const next = (currentSection + 1) % sections.length;
  showSection(next);
}

function prevSection() {
  const prev = (currentSection - 1 + sections.length) % sections.length;
  showSection(prev);
}

// Scroll listener protegido
window.addEventListener("scroll", () => {
  const winMid = window.innerHeight * 0.45;

  sections.forEach((sec, i) => {
    if (!sec) return;
    const rect = sec.getBoundingClientRect();
    if (rect.top <= winMid && rect.bottom >= winMid) {
      currentSection = i;
    }
  });
});
