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
