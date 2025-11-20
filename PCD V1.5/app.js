// ========================================================
// ===============  UN MUNDO FELIZ — app.js  ==============
// ===============    VERSIÓN UNIFICADA 2025   ============
// ========================================================

// ========================================================
// =============== VARIABLES GLOBALES ======================
// ========================================================

// ================================
// PARCHE — variables DOM seguras
// ================================
let slideAChart = null;
let slideBChart = null;
let compareChart = null;

let slideAIndex = 0;
let slideBIndex = 0;

// Variables DOM — declaradas pero NO inicializadas aún
let picker, graphA, graphB, countryNameEl;
let socialTitleEl, socialTextEl, eventsListEl;
let tooltipSmall, indicatorA, indicatorB;


const countryNames = datasets ? Object.keys(datasets) : [];

// ========================================================
// ==================  IMÁGENES DE FONDO  =================
// ========================================================

// const countryBackgrounds = {
//   "Afganistán": "Imagenes/Imagenes_Paises/afgan_feliz.jpg",
//   "Colombia": "Imagenes/Imagenes_Paises/colombia_feliz.jpg",
//   "Dinamarca": "Imagenes/Imagenes_Paises/dinamarca_feliz.jpg",
//   "Estados Unidos": "Imagenes/Imagenes_Paises/gringo_feliz.jpg",
//   "Perú": "Imagenes/Imagenes_Paises/Peru_feliz.jpg"
// };

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

function safeDestroy(chart) {
  try {
    if (chart) chart.destroy();
  } catch (e) {
    // No hacer nada si hay error al destruir
  }
}

// ========================================================
// ======================= SLIDE A =========================
// ========================================================

function renderSlideA(country) {
  const data = datasets[country];
  const years = data.map(e => e.year);

  safeDestroy(slideAChart);
  const ctx = graphA.getContext("2d");

  if (slideAIndex === 0) {
    // Línea de evaluación de vida
    slideAChart = new Chart(ctx, {
      type: "line",
      data: {
        labels: years,
        datasets: [
          {
            label: "Evaluación de vida",
            data: data.map(e => (e.lifeEval != null ? e.lifeEval : null)),
            borderColor: "#ff6f61",
            tension: 0.3,
            spanGaps: true,
            skipNull: true
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });
  } else {
    // Indicadores normalizados (multiplicados por 10 para visualizar mejor)
    slideAChart = new Chart(ctx, {
      type: "line",
      data: {
        labels: years,
        datasets: [
          {
            label: "Apoyo social (norm.)",
            data: data.map(e => (e.socialSupport != null ? e.socialSupport * 10 : null)),
            borderColor: "#ff6f61",
            tension: 0.3,
            spanGaps: true,
            skipNull: true
          },
          {
            label: "Libertad (norm.)",
            data: data.map(e => (e.freedom != null ? e.freedom * 10 : null)),
            borderColor: "#4bc0c0",
            tension: 0.3,
            spanGaps: true,
            skipNull: true
          },
          {
            label: "Generosidad (norm.)",
            data: data.map(e => (e.generosity != null ? e.generosity * 10 : null)),
            borderColor: "#9966ff",
            tension: 0.3,
            spanGaps: true,
            skipNull: true
          },
          {
            label: "Corrupción (norm.)",
            data: data.map(e => (e.corruption != null ? e.corruption * 10 : null)),
            borderColor: "#36a2eb",
            tension: 0.3,
            spanGaps: true,
            skipNull: true
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            suggestedMin: 0,
            suggestedMax: 10
          }
        }
      }
    });
  }

  // Actualizar indicadores visuales (pills)
  indicatorA.forEach(p =>
    p.classList.toggle("active", Number(p.dataset.index) === slideAIndex)
  );
}

// ========================================================
// ======================= SLIDE B =========================
// ========================================================

function renderSlideB(country) {
  const data = datasets[country];
  const years = data.map(e => e.year);

  const keys = ["gdp", "lifeExpectancy", "inequality"];
  const labels = ["PIB per cápita", "Esperanza de vida", "Desigualdad"];
  const colors = ["#f39c12", "#27ae60", "#8e44ad"];

  const key = keys[slideBIndex];
  const label = labels[slideBIndex];
  const color = colors[slideBIndex];

  const values = data.map(e => (e[key] != null ? e[key] : null));

  safeDestroy(slideBChart);
  const ctx = graphB.getContext("2d");
  slideBChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: years,
      datasets: [
        {
          label,
          data: values,
          borderColor: color,
          tension: 0.3,
          spanGaps: true,
          skipNull: true
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  });

  const lastValue = values.filter(v => v != null).slice(-1)[0];
  tooltipSmall.textContent = `Mostrando: ${label}. Último valor: ${lastValue ?? "N/A"}.`;
}

// ========================================================
// ============ INTERPRETACIÓN Y EVENTOS ==================
// ========================================================

function updateEvents(country) {
  const list = historicalEvents[country] || [];
  eventsListEl.innerHTML = "";

  if (list.length === 0) {
    eventsListEl.innerHTML = "<li>No hay eventos relevantes registrados.</li>";
    return;
  }

  list.forEach(ev => {
    const li = document.createElement("li");
    li.textContent = `${ev.year} — ${ev.text}`;
    eventsListEl.appendChild(li);
  });
}

function updateInterpretation(country) {
  const arr = datasets[country];
  const first = arr.find(r => r.lifeEval != null);
  const last = [...arr].reverse().find(r => r.lifeEval != null);

  const change = ((last?.lifeEval ?? 0) - (first?.lifeEval ?? 0)).toFixed(2);

  socialTitleEl.textContent = `Percepción social en ${country}`;
  socialTextEl.textContent = `Entre ${arr[0].year} y ${arr[arr.length - 1].year}, la evaluación de vida cambió ${change} puntos.`;
}

// ========================================================
// ===================== APPLY COUNTRY ====================
// ========================================================

function applyCountry(country) {
  // updateBackground(country);
  updateEvents(country);
  updateInterpretation(country);
  if (countryNameEl) {
  countryNameEl.textContent = country.toUpperCase();
}


  renderSlideA(country);
  renderSlideB(country);
}

// ========================================================
// =============== INIT SOCIAL SECTION =====================
// ========================================================

function initSocialSection() {
  picker.innerHTML = "";
  countryNames.forEach(c => {
  /// aqui habia algo 
  const opt = document.createElement("option");
  opt.value = c;
  opt.textContent = c;
  picker.appendChild(opt);
});


  picker.value = countryNames[0];
  applyCountry(countryNames[0]);

  picker.addEventListener("change", () => {
    slideAIndex = 0;
    slideBIndex = 0;
    applyCountry(picker.value);
  });

  document.getElementById("slideAprev").onclick = () => {
    slideAIndex = (slideAIndex - 1 + 2) % 2;
    renderSlideA(picker.value);
  };

  document.getElementById("slideAnext").onclick = () => {
    slideAIndex = (slideAIndex + 1) % 2;
    renderSlideA(picker.value);
  };

  document.getElementById("slideBprev").onclick = () => {
    slideBIndex = (slideBIndex - 1 + 3) % 3;
    renderSlideB(picker.value);
  };

  document.getElementById("slideBnext").onclick = () => {
    slideBIndex = (slideBIndex + 1) % 3;
    renderSlideB(picker.value);
  };

  indicatorA.forEach(p => {
    p.addEventListener("click", () => {
      slideAIndex = Number(p.dataset.index);
      renderSlideA(picker.value);
    });
  });

  indicatorB.forEach(p => {
    p.addEventListener("click", () => {
      slideBIndex = Number(p.dataset.index);
      renderSlideB(picker.value);
    });
  });

  window.addEventListener("resize", () => {
    clearTimeout(window._chartResizeTimer);
    window._chartResizeTimer = setTimeout(() => {
      renderSlideA(picker.value);
      renderSlideB(picker.value);
    }, 200);
  });
}

// ========================================================
// ================= COMPARADOR DE PAÍSES =================
// ========================================================

function toggleDropdown() {
  const panel = document.getElementById("dropdown");
  panel.classList.toggle("show");

  const btn = document.querySelector(".compare-btn");
  const expanded = panel.classList.contains("show");

  btn.setAttribute("aria-expanded", expanded);
  btn.querySelector(".arrow").textContent = expanded ? "▲" : "▼";
}

function loadDropdown() {
  const dropdown = document.getElementById("dropdown");
  dropdown.innerHTML = "";

  countryNames.forEach(c => {
    const label = document.createElement("label");
    label.innerHTML = `
      <input type="checkbox" value="${c}" onchange="updateSelected()">
      ${c}
    `;
    dropdown.appendChild(label);
  });
}

function updateSelected() {
  const listEl = document.getElementById("selectedList");
  const checkboxes = document.querySelectorAll('#dropdown input[type="checkbox"]');

  const selected = Array.from(checkboxes)
    .filter(cb => cb.checked)
    .map(cb => cb.value);

  if (selected.length === 0) {
    listEl.textContent = "Ningún país seleccionado";
    document.getElementById("compareChartContainer").style.display = "none";
    return;
  }

  listEl.textContent = "Seleccionados: " + selected.join(", ");
  updateCompareChart(selected);
}

function updateCompareChart(selected) {
  const ctx = document.getElementById("compareChart").getContext("2d");

  safeDestroy(compareChart);

  const datasetsCmp = selected.map(country => {
    const arr = datasets[country];
    return {
      label: country,
      data: arr.map(e => (e.lifeEval != null ? e.lifeEval : null)),
      tension: 0.3,
      spanGaps: true,
      skipNull: true
    };
  });

  compareChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: datasets[selected[0]].map(e => e.year),
      datasets: datasetsCmp
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  });

  document.getElementById("compareChartContainer").style.display = "block";
}

window.addEventListener("click", e => {
  const panel = document.getElementById("dropdown");
  const btn = document.querySelector(".compare-btn");

  if (!panel.contains(e.target) && !btn.contains(e.target)) {
    panel.classList.remove("show");
    btn.setAttribute("aria-expanded", "false");
    btn.querySelector(".arrow").textContent = "▼";
  }
});

// ========================================================
// ==================== INIT GENERAL =======================
// ========================================================

document.addEventListener("DOMContentLoaded", () => {

  // Inicialización segura de nodos del DOM
  picker = document.getElementById("countryPicker");
  graphA = document.getElementById("graphSlideA");
  graphB = document.getElementById("graphSlideB");
  countryNameEl = document.getElementById("countryName");
  socialTitleEl = document.getElementById("socialTitle");
  socialTextEl = document.getElementById("socialText");
  eventsListEl = document.getElementById("eventsList");
  tooltipSmall = document.getElementById("tooltipSmall");
  indicatorA = document.querySelectorAll(".slide-a-indicator .pill");
  indicatorB = document.querySelectorAll(".slide-b-indicator .pill");

  loadDropdown();
  initSocialSection();
});


// ================================
//     SECCIÓN COLOMBIA (NUEVO)
// ================================

document.addEventListener("DOMContentLoaded", () => {
  const colData = datasets["Colombia"];

  // Información principal
  const vals = colData
    .map(e => e.lifeEval)
    .filter(v => v != null);
  const years = colData.map(e => e.year);

  const last = vals[vals.length - 1];
  const best = Math.max(...vals);
  const worst = Math.min(...vals);

  const avg3 = (
    vals
      .slice(-3)
      .reduce((a, b) => a + b, 0) /
    3
  ).toFixed(2);

  document.getElementById("col-last-eval").textContent = last;
  document.getElementById("col-best-worst").textContent = `${best} / ${worst}`;
  document.getElementById("col-avg3").textContent = avg3;

  // Gráfico 1 — Evaluación de vida
  new Chart(document.getElementById("col-chart-life"), {
    type: "line",
    data: {
      labels: years,
      datasets: [
        {
          label: "Evaluación de vida",
          data: vals,
          borderColor: "#004B87",
          backgroundColor: "rgba(0,75,135,0.18)",
          tension: 0.3
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  });

  // Gráfico 2 — Sociales
  new Chart(document.getElementById("col-chart-social"), {
    type: "line",
    data: {
      labels: years,
      datasets: [
        {
          label: "Apoyo social",
          data: colData.map(e => (e.socialSupport != null ? e.socialSupport * 10 : null)),
          borderColor: "#FFC300",
          tension: 0.3
        },
        {
          label: "Libertad",
          data: colData.map(e => (e.freedom != null ? e.freedom * 10 : null)),
          borderColor: "#004B87",
          tension: 0.3
        },
        {
          label: "Generosidad",
          data: colData.map(e => (e.generosity != null ? e.generosity * 10 : null)),
          borderColor: "#C70039",
          tension: 0.3
        },
        {
          label: "Confianza / corrupción",
          data: colData.map(e => (e.corruption != null ? e.corruption * 10 : null)),
          borderColor: "#888888",
          tension: 0.3
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  });

  // Gráfico 3 — Socioeconómicos

  // ================================
//   SLIDER SOCIO — COLOMBIA
// ================================
let colSocioIndex = 0;
let colSocioChart = null;

const socioKeys = ["gdp", "lifeExpectancy", "inequality"];
const socioLabels = ["PIB per cápita", "Esperanza de vida", "Desigualdad"];
const socioColors = ["#004B87", "#FFC300", "#C70039"];

function renderColombiaSocioSlide() {
  const key = socioKeys[colSocioIndex];
  const label = socioLabels[colSocioIndex];
  const color = socioColors[colSocioIndex];

  const values = colData.map(e => e[key] != null ? e[key] : null);

  const ctx = document.getElementById("col-chart-socio").getContext("2d");

  try { if (colSocioChart) colSocioChart.destroy(); } catch(e){}

  colSocioChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: years,
      datasets: [
        {
          label,
          data: values,
          borderColor: color,
          tension: 0.3,
          spanGaps: true,
          skipNull: true
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  });

  // Texto dinámico (opcional)
  document.getElementById("col-socio-info").textContent =
    `Mostrando: ${label}. Último valor: ${values.filter(v => v != null).slice(-1)[0] ?? "N/A"}.`;
}

// Controles del slider (flechas)
document.getElementById("col-socio-prev").onclick = () => {
  colSocioIndex = (colSocioIndex - 1 + 3) % 3;
  renderColombiaSocioSlide();
};

document.getElementById("col-socio-next").onclick = () => {
  colSocioIndex = (colSocioIndex + 1) % 3;
  renderColombiaSocioSlide();
};

// Inicializar slider
renderColombiaSocioSlide();

});

//save