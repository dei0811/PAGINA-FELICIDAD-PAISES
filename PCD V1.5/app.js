// ========================================================
// ===============  UN MUNDO FELIZ — app.js  ==============
// ===============    VERSIÓN UNIFICADA 2025   ============
// ========================================================


// ========================================================
// =============== VARIABLES GLOBALES ======================
// ========================================================

let slideAChart = null;
let slideBChart = null;
let compareChart = null;

let slideAIndex = 0; // 0 = evaluación, 1 = normalizadas
let slideBIndex = 0; // 0 = PIB, 1 = vida, 2 = desigualdad

const picker = document.getElementById("countryPicker");
const graphA = document.getElementById("graphSlideA");
const graphB = document.getElementById("graphSlideB");

const countryNameEl = document.getElementById("countryName");
const socialTitleEl = document.getElementById("socialTitle");
const socialTextEl = document.getElementById("socialText");
const eventsListEl = document.getElementById("eventsList");
const tooltipSmall = document.getElementById("tooltipSmall");

const indicatorA = document.querySelectorAll(".slide-a-indicator .pill");
const indicatorB = document.querySelectorAll(".slide-b-indicator .pill");

const sectionSocial = document.getElementById("world-social");

const countryNames = Object.keys(datasets);


// ========================================================
// ==================  IMÁGENES DE FONDO  =================
// ========================================================

const countryBackgrounds = {
  "Afganistán": "Imagenes/Imagenes_Paises/afgan_feliz.jpg",
  "Colombia": "Imagenes/Imagenes_Paises/colombia_feliz.jpg",
  "Dinamarca": "Imagenes/Imagenes_Paises/dinamarca_feliz.jpg",
  "Estados Unidos": "Imagenes/Imagenes_Paises/gringo_feliz.jpg",
  "Perú": "Imagenes/Imagenes_Paises/Peru_feliz.jpg"
};


// ========================================================
// ==================  EVENTOS POR PAÍS  ==================
// ========================================================

const historicalEvents = {
  "Afganistán": [
    { year: 2013, text: "Periodo de inestabilidad que dificultó datos." },
    { year: 2014, text: "Retiro de tropas internacionales." },
    { year: 2021, text: "Toma del poder por los Talibán." }
  ],
  "Colombia": [
    { year: 2016, text: "Acuerdo de paz mejoró la percepción social." },
    { year: 2020, text: "Pandemia afectó empleo y expectativas." }
  ],
  "Dinamarca": [
    { year: 2015, text: "Alta cohesión social y bienestar." }
  ],
  "Estados Unidos": [
    { year: 2016, text: "Polarización política." }
  ],
  "Perú": [
    { year: 2017, text: "Crisis política afectó confianza." }
  ]
};


// ========================================================
// ================ FUNCIONES AUXILIARES ===================
// ========================================================

function safeDestroy(chart){
  try { if (chart) chart.destroy(); } catch(e){}
}


// ========================================================
// ======================= SLIDE A =========================
// ========================================================

function renderSlideA(country){
  const data = datasets[country];
  const years = data.map(e => e.year);

  safeDestroy(slideAChart);
  const ctx = graphA.getContext("2d");

  if (slideAIndex === 0){
    slideAChart = new Chart(ctx, {
      type: "line",
      data: {
        labels: years,
        datasets: [{
          label: "Evaluación de vida",
          data: data.map(e => e.lifeEval ?? null),
          borderColor: "#ff6f61",
          tension: 0.3,
          spanGaps: true
        }]
      },
      options: { responsive:true, maintainAspectRatio:false }
    });

  } else {
    slideAChart = new Chart(ctx, {
      type: "line",
      data: {
        labels: years,
        datasets: [
          { label:"Apoyo social (norm.)", data: data.map(e=>e.socialSupport*10), borderColor:"#ff6f61", tension:0.3 },
          { label:"Libertad (norm.)", data: data.map(e=>e.freedom*10), borderColor:"#4bc0c0", tension:0.3 },
          { label:"Generosidad (norm.)", data: data.map(e=>e.generosity*10), borderColor:"#9966ff", tension:0.3 },
          { label:"Corrupción (norm.)", data: data.map(e=>e.corruption*10), borderColor:"#36a2eb", tension:0.3 }
        ]
      },
      options:{ responsive:true, maintainAspectRatio:false, scales:{ y:{ suggestedMin:0, suggestedMax:10 } } }
    });
  }

  indicatorA.forEach(p => p.classList.toggle("active", Number(p.dataset.index) === slideAIndex));
}


// ========================================================
// ======================= SLIDE B =========================
// ========================================================

function renderSlideB(country){
  const data = datasets[country];
  const years = data.map(e => e.year);

  const keys = ["gdp","lifeExpectancy","inequality"];
  const labels = ["PIB per cápita","Esperanza de vida","Desigualdad"];
  const colors = ["#f39c12","#27ae60","#8e44ad"];

  const key = keys[slideBIndex];
  const label = labels[slideBIndex];
  const color = colors[slideBIndex];

  const values = data.map(e => e[key] ?? null);

  safeDestroy(slideBChart);

  const ctx = graphB.getContext("2d");
  slideBChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: years,
      datasets:[{
        label,
        data: values,
        borderColor: color,
        tension:0.3,
        spanGaps:true
      }]
    },
    options:{ responsive:true, maintainAspectRatio:false }
  });

  tooltipSmall.textContent = `Mostrando: ${label}. Último valor: ${values.filter(v=>v!=null).slice(-1)[0] ?? "N/A"}.`;

  indicatorB.forEach(p => p.classList.toggle("active", Number(p.dataset.index) === slideBIndex));
}


// ========================================================
// ============ INTERPRETACIÓN Y EVENTOS ==================
// ========================================================

function updateBackground(country){
  const img = countryBackgrounds[country];
  sectionSocial.style.backgroundImage = img
    ? `linear-gradient(rgba(0,0,0,0.18), rgba(0,0,0,0.18)), url('${img}')`
    : "";
}

function updateEvents(country){
  const list = historicalEvents[country] || [];
  eventsListEl.innerHTML = "";

  if (!list.length){
    eventsListEl.innerHTML = "<li>No hay eventos relevantes registrados.</li>";
    return;
  }

  list.forEach(ev=>{
    const li = document.createElement("li");
    li.textContent = `${ev.year} — ${ev.text}`;
    eventsListEl.appendChild(li);
  });
}

function updateInterpretation(country){
  const arr = datasets[country];
  const first = arr.find(r=>r.lifeEval!=null);
  const last = [...arr].reverse().find(r=>r.lifeEval!=null);

  const change = ((last?.lifeEval ?? 0) - (first?.lifeEval ?? 0)).toFixed(2);

  socialTitleEl.textContent = `Percepción social en ${country}`;
  socialTextEl.textContent = `Entre ${arr[0].year} y ${arr[arr.length-1].year}, la evaluación de vida cambió ${change} puntos.`;
}


// ========================================================
// ===================== APPLY COUNTRY ====================
// ========================================================

function applyCountry(country){
  updateBackground(country);
  updateEvents(country);
  updateInterpretation(country);
  countryNameEl.textContent = country.toUpperCase();

  renderSlideA(country);
  renderSlideB(country);
}


// ========================================================
// =============== INIT SOCIAL SECTION =====================
// ========================================================

function initSocialSection(){
  picker.innerHTML = "";
  countryNames.forEach(c=>{
    const opt = document.createElement("option");
    opt.value = c;
    opt.textContent = c;
    picker.appendChild(opt);
  });

  picker.value = countryNames[0];
  applyCountry(countryNames[0]);

  picker.addEventListener("change", ()=>{
    slideAIndex = 0;
    slideBIndex = 0;
    applyCountry(picker.value);
  });

  document.getElementById("slideAprev").onclick = ()=>{
    slideAIndex = (slideAIndex - 1 + 2) % 2;
    renderSlideA(picker.value);
  };

  document.getElementById("slideAnext").onclick = ()=>{
    slideAIndex = (slideAIndex + 1) % 2;
    renderSlideA(picker.value);
  };

  document.getElementById("slideBprev").onclick = ()=>{
    slideBIndex = (slideBIndex - 1 + 3) % 3;
    renderSlideB(picker.value);
  };

  document.getElementById("slideBnext").onclick = ()=>{
    slideBIndex = (slideBIndex + 1) % 3;
    renderSlideB(picker.value);
  };

  indicatorA.forEach(p=>{
    p.addEventListener("click", ()=>{
      slideAIndex = Number(p.dataset.index);
      renderSlideA(picker.value);
    });
  });

  indicatorB.forEach(p=>{
    p.addEventListener("click", ()=>{
      slideBIndex = Number(p.dataset.index);
      renderSlideB(picker.value);
    });
  });

  window.addEventListener("resize", ()=>{
    clearTimeout(window._chartResizeTimer);
    window._chartResizeTimer = setTimeout(()=>{
      renderSlideA(picker.value);
      renderSlideB(picker.value);
    },200);
  });
}


// ========================================================
// ================= COMPARADOR DE PAÍSES =================
// ========================================================

function toggleDropdown(){
  const panel = document.getElementById("dropdown");
  panel.classList.toggle("show");

  const btn = document.querySelector(".compare-btn");
  const exp = panel.classList.contains("show");

  btn.setAttribute("aria-expanded", exp);
  btn.querySelector(".arrow").textContent = exp ? "▲" : "▼";
}

function loadDropdown(){
  const dropdown = document.getElementById("dropdown");
  dropdown.innerHTML = "";

  countryNames.forEach(c=>{
    const label = document.createElement("label");
    label.innerHTML = `
      <input type="checkbox" value="${c}" onchange="updateSelected()">
      ${c}
    `;
    dropdown.appendChild(label);
  });
}

function updateSelected(){
  const listEl = document.getElementById("selectedList");
  const checkboxes = document.querySelectorAll('#dropdown input[type="checkbox"]');

  const selected = Array.from(checkboxes)
        .filter(cb=>cb.checked)
        .map(cb=>cb.value);

  if (!selected.length){
    listEl.textContent = "Ningún país seleccionado";
    document.getElementById("compareChartContainer").style.display = "none";
    return;
  }

  listEl.textContent = "Seleccionados: " + selected.join(", ");
  updateCompareChart(selected);
}

function updateCompareChart(selected){
  const ctx = document.getElementById("compareChart").getContext("2d");

  safeDestroy(compareChart);

  const datasetsCmp = selected.map(country=>{
    const arr = datasets[country];
    return {
      label: country,
      data: arr.map(e => e.lifeEval ?? null),
      tension: 0.3,
      spanGaps: true
    };
  });

  compareChart = new Chart(ctx,{
    type:"line",
    data:{
      labels: datasets[selected[0]].map(e=>e.year),
      datasets: datasetsCmp
    },
    options:{ responsive:true, maintainAspectRatio:false }
  });

  document.getElementById("compareChartContainer").style.display = "block";
}

window.addEventListener("click", e=>{
  const panel = document.getElementById("dropdown");
  const btn = document.querySelector(".compare-btn");

  if (!panel.contains(e.target) && !btn.contains(e.target)){
    panel.classList.remove("show");
    btn.setAttribute("aria-expanded","false");
    btn.querySelector(".arrow").textContent = "▼";
  }
});


// ========================================================
// ==================== INIT GENERAL =======================
// ========================================================

document.addEventListener("DOMContentLoaded", ()=>{
  loadDropdown();
  initSocialSection();
});
