// =========================
// ANIMACIONES GENERALES
// =========================

// Scroll suave de secciones (te mantiene las animaciones actuales)
window.addEventListener("scroll", () => {
  document.querySelectorAll(".section").forEach(sec => {
    const rect = sec.getBoundingClientRect();
    if(rect.top < window.innerHeight * 0.75 && rect.bottom > window.innerHeight * 0.25) {
      sec.classList.add("visible");
    } else {
      sec.classList.remove("visible");
    }
  });
});

// =========================
// ANIMACIÓN DEL HEADER
// =========================

const header = document.querySelector("header");
const heroSection = document.getElementById("sec-hero");

function updateHeaderVisibility() {
    const limit = heroSection.offsetHeight - 90;

    if (window.scrollY < limit) {
        header.classList.add("transparent");   // fondo transparente
    } else {
        header.classList.remove("transparent"); // fondo visible
    }
}


window.addEventListener("scroll", updateHeaderVisibility);
window.addEventListener("load", updateHeaderVisibility);

// =========================
// BOTÓN ACTIVO SEGÚN SECCIÓN
// =========================

const navButtons = document.querySelectorAll('header nav button');

function updateActiveButton() {
  let currentIndex = 0;
  document.querySelectorAll('.section').forEach((sec, index) => {
    const rect = sec.getBoundingClientRect();
    if(rect.top < window.innerHeight * 0.5 && rect.bottom > window.innerHeight * 0.5) {
      currentIndex = index;
    }
  });

  navButtons.forEach((btn, idx) => {
    if(idx === currentIndex) btn.classList.add('active');
    else btn.classList.remove('active');
  });
}

window.addEventListener('scroll', updateActiveButton);
window.addEventListener('load', updateActiveButton);
