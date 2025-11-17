/* ========== Social + Socioeconomic minimal controller ========== */
(function(){
  // Chart instances (one per canvas at a time)
  let slideAChart = null; // canvas: graphSlideA
  let slideBChart = null; // canvas: graphSlideB

  // slide indices
  let slideAIndex = 0; // 0 = lifeEval, 1 = normalized metrics combined
  let slideBIndex = 0; // 0 = gdp, 1 = lifeExpectancy, 2 = inequality

  // dom
  const picker = document.getElementById("countryPicker");
  const graphA = document.getElementById("graphSlideA");
  const graphB = document.getElementById("graphSlideB");
  const countryNameEl = document.getElementById("countryName");
  const socialTitleEl = document.getElementById("socialTitle");
  const socialTextEl = document.getElementById("socialText");
  const eventsListEl = document.getElementById("eventsList");
  const slideAprev = document.getElementById("slideAprev");
  const slideAnext = document.getElementById("slideAnext");
  const slideBprev = document.getElementById("slideBprev");
  const slideBnext = document.getElementById("slideBnext");
  const indicatorA = document.querySelectorAll(".slide-a-indicator .pill");
  const indicatorB = document.querySelectorAll(".slide-b-indicator .pill");
  const tooltipSmall = document.getElementById("tooltipSmall");
  const sectionSocial = document.getElementById("world-social");

  // backgrounds mapping (validate paths)
  const countryBackgrounds = {
    "Afganistán": "Imagenes/Imagenes_Paises/afgan_feliz.jpg",
    "Colombia": "Imagenes/Imagenes_Paises/colombia_feliz.jpg",
    "Dinamarca": "Imagenes/Imagenes_Paises/dinamarca_feliz.jpg",
    "Estados Unidos": "Imagenes/Imagenes_Paises/gringo_feliz.jpg",
    "Perú": "Imagenes/Imagenes_Paises/Peru_feliz.jpg"
  };

  // historical events (add more if needed)
  const historicalEvents = {
    "Afganistán": [
      { year: 2013, text: "Periodo de inestabilidad que dificultó recolección de datos oficiales." },
      { year: 2014, text: "Retiro de tropas internacionales afectó la estabilidad social." },
      { year: 2021, text: "Toma del poder por los Talibán generó caída histórica." }
    ],
    "Colombia": [
      { year: 2016, text: "Acuerdo de paz aumentó percepción de seguridad en zonas afectadas." },
      { year: 2020, text: "Pandemia afectó empleo y confianza institucional." }
    ],
    "Dinamarca": [
      { year: 2015, text: "Se mantiene alta cohesión social y bienestar." }
    ],
    "Estados Unidos": [
      { year: 2016, text: "Alta polarización política impactó percepción social." }
    ],
    "Perú": [
      { year: 2017, text: "Crisis política que afectó confianza." }
    ]
  };

  // small helper: safe destroy
  function safeDestroy(chart){
    try{ if(chart && typeof chart.destroy === "function") chart.destroy(); } catch(e){ /* ignore */ }
  }

  // RENDER SLIDE A (main big canvas)
  function renderSlideA(country){
    const entries = datasets[country] || [];
    const years = entries.map(e=>e.year);
    const life = entries.map(e=> (e.lifeEval != null ? e.lifeEval : null) );

    // normalized metrics for slide A (0-10)
    const support = entries.map(e => e.socialSupport != null ? e.socialSupport * 10 : null);
    const freedom = entries.map(e => e.freedom != null ? e.freedom * 10 : null);
    const generosity = entries.map(e => e.generosity != null ? e.generosity * 10 : null);
    const corruption = entries.map(e => e.corruption != null ? e.corruption * 10 : null);

    // destroy old chart
    safeDestroy(slideAChart);

    const ctx = graphA.getContext("2d");

    if (slideAIndex === 0) {
      slideAChart = new Chart(ctx, {
        type: "line",
        data: { labels: years, datasets:[{ label:"Evaluación de vida", data: life, borderColor:"#ff6f61", tension:0.3, spanGaps:true, pointRadius:3 }] },
        options: { responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}} }
      });
    } else {
      slideAChart = new Chart(ctx, {
        type: "line",
        data: {
          labels: years,
          datasets: [
            { label:"Apoyo social (norm.)", data: support, borderColor:"#ff6f61", tension:0.3, spanGaps:true },
            { label:"Libertad (norm.)", data: freedom, borderColor:"#4bc0c0", tension:0.3, spanGaps:true },
            { label:"Generosidad (norm.)", data: generosity, borderColor:"#9966ff", tension:0.3, spanGaps:true },
            { label:"Corrupción (norm.)", data: corruption, borderColor:"#36a2eb", tension:0.3, spanGaps:true }
          ]
        },
        options: { responsive:true, maintainAspectRatio:false, scales:{ y:{ suggestedMin:0, suggestedMax:10 } } }
      });
    }

    // update indicators UI
    indicatorA.forEach(p => p.classList.toggle("active", Number(p.dataset.index) === slideAIndex));
  }

  // RENDER SLIDE B (small socio canvas)
  function renderSlideB(country){
    const entries = datasets[country] || [];
    const years = entries.map(e=>e.year);
    const keys = ["gdp","lifeExpectancy","inequality"];
    const labels = ["PIB per cápita","Esperanza de vida","Desigualdad"];
    const colors = ["#f39c12","#27ae60","#8e44ad"];

    const key = keys[slideBIndex];
    const label = labels[slideBIndex];
    const color = colors[slideBIndex];
    const values = entries.map(e => (e[key] != null ? e[key] : null));

    safeDestroy(slideBChart);
    const ctx = graphB.getContext("2d");
    slideBChart = new Chart(ctx, {
      type: "line",
      data: { labels: years, datasets:[{ label, data: values, borderColor: color, tension:0.3, spanGaps:true, pointRadius:2 }] },
      options: { responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}} }
    });

    // tooltip small text
    tooltipSmall.textContent = `Mostrando: ${label}. Último valor: ${values.filter(v=>v!=null).slice(-1)[0] ?? "N/A"}.`;

    // update B indicators
    indicatorB.forEach(p => p.classList.toggle("active", Number(p.dataset.index) === slideBIndex));
  }

  // update background (section)
  function updateBackground(country){
    const img = countryBackgrounds[country];
    if(img){
      // set background with mild overlay for readability
      sectionSocial.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.18), rgba(0,0,0,0.18)), url('${img}')`;
      sectionSocial.style.backgroundSize = "cover";
      sectionSocial.style.backgroundPosition = "center";
    } else {
      sectionSocial.style.backgroundImage = "";
    }
  }

  // update events list
  function updateEvents(country){
    eventsListEl.innerHTML = "";
    const arr = historicalEvents[country] || [];
    if(arr.length === 0){
      eventsListEl.innerHTML = "<li>No hay eventos destacados registrados.</li>";
      return;
    }
    arr.forEach(ev => {
      const li = document.createElement("li");
      li.textContent = `${ev.year} — ${ev.text}`;
      eventsListEl.appendChild(li);
    });
  }

  // update interpretation text
  function updateInterpretation(country){
    const arr = datasets[country] || [];
    if(!arr.length){
      socialTitleEl.textContent = `Percepción social en ${country}`;
      socialTextEl.textContent = "No hay datos disponibles.";
      return;
    }
    const first = arr.find(r=>r.lifeEval != null);
    const last = [...arr].reverse().find(r=>r.lifeEval != null);
    const change = ( (last?.lifeEval ?? 0) - (first?.lifeEval ?? 0) );
    socialTitleEl.textContent = `Percepción social en ${country}`;
    let txt = `Entre ${arr[0].year} y ${arr[arr.length-1].year}, la evaluación de vida cambió ${isFinite(change)? change.toFixed(2) : "N/A"} puntos.`;
    // gaps detect
    const gaps = arr.some(r => r.lifeEval == null);
    if (gaps) txt += " Hay años con datos faltantes (mostrados como gaps).";
    socialTextEl.textContent = txt;
  }

  // apply current country: update background, events, interpretation and both slides
  function applyCountry(country){
    if(!country) return;
    countryNameEl.textContent = country.toUpperCase();
    updateBackground(country);
    updateEvents(country);
    updateInterpretation(country);

    // render both slides (slide A and slide B)
    renderSlideA(country);
    renderSlideB(country);
  }

  // initialize section — call after datasets loaded
  function initSocial(){
    if (typeof datasets === "undefined") {
      console.error("datasets no encontrado. Asegúrate de cargar DATOS.js antes que este script.");
      return;
    }

    // populate picker
    picker.innerHTML = "";
    Object.keys(datasets).forEach(c => {
      const opt = document.createElement("option");
      opt.value = c;
      opt.textContent = c;
      picker.appendChild(opt);
    });

    // set first country
    const first = Object.keys(datasets)[0];
    if(first) {
      picker.value = first;
      applyCountry(first);
    }

    // listeners
    picker.addEventListener("change", () => {
      const c = picker.value;
      // reset slide indices (optional)
      slideAIndex = 0;
      slideBIndex = 0;
      applyCountry(c);
    });

    // slide controls A
    slideAprev && slideAprev.addEventListener("click", () => {
      slideAIndex = (slideAIndex - 1 + 2) % 2; // two slides
      renderSlideA(picker.value);
    });
    slideAnext && slideAnext.addEventListener("click", () => {
      slideAIndex = (slideAIndex + 1) % 2;
      renderSlideA(picker.value);
    });

    // indicators clickable
    indicatorA.forEach(p => p.addEventListener("click", e => {
      slideAIndex = Number(p.dataset.index);
      renderSlideA(picker.value);
    }));

    // slide controls B
    slideBprev && slideBprev.addEventListener("click", () => {
      slideBIndex = (slideBIndex - 1 + 3) % 3;
      renderSlideB(picker.value);
    });
    slideBnext && slideBnext.addEventListener("click", () => {
      slideBIndex = (slideBIndex + 1) % 3;
      renderSlideB(picker.value);
    });
    indicatorB.forEach(p => p.addEventListener("click", ()=> {
      slideBIndex = Number(p.dataset.index);
      renderSlideB(picker.value);
    }));

    // resize safety: destroy and re-render on resize to prevent Chart reuse error
    window.addEventListener("resize", () => {
      // small debounce
      clearTimeout(window._chartResizeTimer);
      window._chartResizeTimer = setTimeout(() => {
        // re-render current charts
        renderSlideA(picker.value);
        renderSlideB(picker.value);
      }, 200);
    });
  }

  // auto-init when DOM ready and datasets present
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initSocial);
  } else {
    initSocial();
  }

  // expose for debugging (optional)
  window.__socialControl = {
    renderSlideA, renderSlideB, applyCountry, safeDestroy
  };

})();
