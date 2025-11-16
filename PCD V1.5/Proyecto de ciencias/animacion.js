// Degradado animado para sec-hero
const hero = document.getElementById("sec-hero");
const heroTitle = document.getElementById("heroTitle");

const gradients = [
  ["#FF6F61", "#FFCC70"],
  ["#FF8B7B", "#FFD580"],
  ["#FFD580", "#FF6F61"]
];

let gi = 0;

function rotateHeroGradient() {
  const g = gradients[gi];
  hero.style.background = `linear-gradient(90deg, ${g[0]}, ${g[1]})`;
  
  // Contraste para título
  const r = parseInt(g[0].slice(1,3),16);
  const gr = parseInt(g[0].slice(3,5),16);
  const b = parseInt(g[0].slice(5,7),16);
  const lum = 0.299*r + 0.587*gr + 0.114*b;
  heroTitle.style.color = lum > 140 ? "#111" : "#fff";

  gi = (gi + 1) % gradients.length;
}

rotateHeroGradient();
setInterval(rotateHeroGradient, 8000);

// Scroll suave de secciones
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
// Seleccionamos todos los botones del header
const navButtons = document.querySelectorAll('header nav button');

// Función para actualizar el botón activo según la sección visible
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

// Llamamos la función al hacer scroll y al cargar
window.addEventListener('scroll', updateActiveButton);
window.addEventListener('load', updateActiveButton);
