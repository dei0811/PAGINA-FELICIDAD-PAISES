document.addEventListener("DOMContentLoaded", function () {

  let current = 0;
  const slides = document.querySelectorAll(".carousel-images img");
  const dots = document.querySelectorAll(".carousel-indicators .dot");
  const subtitle = document.querySelector("#sec-hero .lead");

  /* Cambiar imágenes */
  function updateSlide(index) {
    slides.forEach(s => s.classList.remove("active"));
    dots.forEach(d => d.classList.remove("active"));

    slides[index].classList.add("active");
    dots[index].classList.add("active");

    current = index;
  }

  /* Cambio automático */
  setInterval(() => {
    updateSlide((current + 1) % slides.length);
  }, 6000);

  /* Click en rayitas */
  dots.forEach((dot, i) => {
    dot.addEventListener("click", () => updateSlide(i));
  });

  /* Ocultar indicadores cuando no haya mouse */
  let mouseTimer;
  const indicators = document.querySelector(".carousel-indicators");

  function showIndicators() {
    indicators.classList.remove("hide");
    clearTimeout(mouseTimer);
    mouseTimer = setTimeout(() => indicators.classList.add("hide"), 2500);
  }

  document.addEventListener("mousemove", showIndicators);
  showIndicators();

  /* Header transparente en hero */
  const header = document.querySelector("header");
  const heroSection = document.getElementById("sec-hero");

  function updateHeaderTransparency() {
    const limit = heroSection.offsetHeight - 90;
    if (window.scrollY < limit) header.classList.add("transparent");
    else header.classList.remove("transparent");
  }

  window.addEventListener("scroll", updateHeaderTransparency);
  updateHeaderTransparency();

});
