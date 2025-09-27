// =========================== dashboard.js ===========================

// === Parte 0: Enlaza tu archivo de datasets antes de este JS ===
// <script src="DATOS.js"></script>
// <script src="dashboard.js"></script>

// ================= Datos =================
// const datasets = { Colombia: [...], Dinamarca: [...], "Estados Unidos": [...], Peru: [...], Afganistan: [...] }

// ================= Métricas y colores =================

let chartGDP = null;
let chartLife = null;
let chartIneq = null;
let chartEval = null;

document.addEventListener("DOMContentLoaded", () => {
  console.log("datasets en app.js:", datasets); // solo para verificar
  loadDropdown();   // aquí ya puedes llenar el menú
  updateCard();     // opcional, si quieres que muestre el primer país
});

const metrics = [
  { key:"socialSupport", label:"Apoyo Social" },
  { key:"freedom", label:"Libertad" },
  { key:"generosity", label:"Generosidad" },
  { key:"corruption", label:"Corrupción" }
];
const colors = ["#ff6f61","#4bc0c0","#9966ff","#36a2eb"];

// ================= Normalización global mejorada =================
function buildNormalizedDatasets(raw, metricsDef) {
  const norm = {};

  // Calcular min y max global para cada métrica
  const minByKey = {};
  const maxByKey = {};
  for (const m of metricsDef) {
    const vals = [];
    for (const country in raw) {
      raw[country].forEach(r => {
        if (r[m.key] != null) vals.push(r[m.key]);
      });
    }
    minByKey[m.key] = vals.length ? Math.min(...vals) : 0;
    maxByKey[m.key] = vals.length ? Math.max(...vals) : 1;
  }

  // Normalizar
  for (const country in raw) {
    norm[country] = raw[country].map(r => {
      const out = { year: r.year };

      for (const m of metricsDef) {
        const v = r[m.key];
        if (v == null) {
          out[m.key] = null;
          continue;
        }

        // Caso métricas en [0,1] -> escala directa a [0,10]
        if (["socialSupport", "freedom", "generosity", "corruption"].includes(m.key)) {
          out[m.key] = v * 10;
        } else {
          // Normalización global min-max -> escala 0–10
          const range = maxByKey[m.key] - minByKey[m.key];
          out[m.key] = range === 0 ? 5 : ((v - minByKey[m.key]) / range) * 10;
        }
      }

      return out;
    });
  }

  return norm;
}

// ================= Variables globales =================
let chartInstance = null, currentIndex = 0, compareChart = null;
const countryNames = Object.keys(datasets);
const datasetsNorm = buildNormalizedDatasets(datasets, metrics);

/* ============= [AÑADIDO] Tooltips por país ============= */

// Busca la clave real en datasets, sin importar acentos o mayúsculas
function findCountryKeyLike(targetName){
  const t = targetName.normalize("NFD").replace(/\p{Diacritic}/gu,"").toLowerCase();
  return countryNames.find(n => n.normalize("NFD").replace(/\p{Diacritic}/gu,"").toLowerCase() === t);
}

// Crea base por defecto para todos los países para evitar errores si falta alguno
const tooltipsByCountry = {};
for (const c of countryNames) {
  tooltipsByCountry[c] = {
    gdp: "PIB per cápita: sin detalle específico.",
    life: "Esperanza de vida: sin detalle específico.",
    ineq: "Desigualdad: sin detalle específico.",
    eval: "Evaluación de vida: sin detalle específico."
  };
}

// Sobrescribe con tus textos para los 5 países (se mapea al nombre real del dataset)
const kCol = findCountryKeyLike("Colombia");
if (kCol) tooltipsByCountry[kCol] = {
  gdp: "PIB per cápita creció hasta 2019, cayó en 2020 y se recuperó en 2024 con 18,4 mil USD.",
  life: "Esperanza de vida cayó de 67,9 en 2019 a 65 en 2021 por la pandemia.",
  ineq: "Desigualdad alta y estable (2,2–2,7).",
  eval: "Evaluación de vida: 6,4 (2013–15) → 5,6 (2021–22) → 6,0 (2024)."
};

const kDin = findCountryKeyLike("Dinamarca");
if (kDin) tooltipsByCountry[kDin] = {
  gdp: "PIB muy alto y estable, con ingresos de nivel mundial.",
  life: "Esperanza de vida cercana a 82 años.",
  ineq: "Muy baja desigualdad, de las menores globalmente.",
  eval: "Felicidad por encima de 7,5."
};

const kUSA = findCountryKeyLike("Estados Unidos");
if (kUSA) tooltipsByCountry[kUSA] = {
  gdp: "PIB per cápita entre 60–76 mil USD.",
  life: "Esperanza de vida alta, aunque descendió tras la pandemia.",
  ineq: "Alta desigualdad comparada con Europa.",
  eval: "Evaluación de vida alrededor de 7 puntos."
};

const kPeru = findCountryKeyLike("Perú") || findCountryKeyLike("Peru");
if (kPeru) tooltipsByCountry[kPeru] = {
  gdp: "PIB y felicidad menores que Colombia.",
  life: "Esperanza de vida algo inferior a la colombiana.",
  ineq: "Problemas persistentes de corrupción y desigualdad.",
  eval: "Evaluación de vida estable pero inferior a Colombia."
};

const kAfg = findCountryKeyLike("Afganistán") || findCountryKeyLike("Afganistan");
if (kAfg) tooltipsByCountry[kAfg] = {
  gdp: "PIB per cápita muy bajo.",
  life: "Esperanza de vida reducida, una de las más bajas del mundo.",
  ineq: "Alta desigualdad e inestabilidad.",
  eval: "Evaluación de vida cercana a 1,3."
};

// Escribe los textos en los tooltips del HTML (solo si existen)
function updateOriginalTooltips(country){
  const t = tooltipsByCountry[country] || {};
  const elGDP  = document.getElementById("tooltipGDP");
  const elLife = document.getElementById("tooltipLife");
  const elIneq = document.getElementById("tooltipIneq");
  const elEval = document.getElementById("tooltipEval");

  if (elGDP)  elGDP.textContent  = t.gdp  || "Sin detalle.";
  if (elLife) elLife.textContent = t.life || "Sin detalle.";
  if (elIneq) elIneq.textContent = t.ineq || "Sin detalle.";
  if (elEval) elEval.textContent = t.eval || "Sin detalle.";
}

/* ============= FIN tooltips ============= */


// ================= Slider normalizado =================
function updateCard(){
  const countryName = countryNames[currentIndex];
  const dataNorm = datasetsNorm[countryName];
  document.getElementById("countryName").innerText = `Gráfica de ${countryName}`;
  
  if(chartInstance) chartInstance.destroy();
  
  const ctx = document.getElementById("graphNormalized").getContext("2d");
  chartInstance = new Chart(ctx,{
    type:"line",
    data:{
      labels: dataNorm.map(d=>d.year),
      datasets: metrics.map((m,i)=>({
        label: `${m.label} (norm.)`,
        data: dataNorm.map(d=>d[m.key]??null),
        borderColor: colors[i%colors.length],
        backgroundColor: colors[i%colors.length]+"33",
        tension: 0.3,
        fill: false,
        spanGaps: true,
        pointRadius: 3
      }))
    },
    options:{
      responsive:true,
      maintainAspectRatio:true,
      plugins:{ legend:{position:"bottom"}, title:{display:true, text:`Indicadores normalizados (0–10) - ${countryName}`}},
      scales:{y:{suggestedMin:0, suggestedMax:10}}
    }
  });

  // Redibuja las gráficas originales
  updateOriginalCharts(countryName);

  // === [AÑADIDO] Actualiza tooltips del panel "original" según el país actual ===
  updateOriginalTooltips(countryName);
}

function updateOriginalCharts(country) {
  const data = datasets[country];
  if (!data) return;

  // PIB
  if (chartGDP) chartGDP.destroy();
  chartGDP = new Chart(document.getElementById("graphGDP"), {
    type: "line",
    data: {
      labels: data.map(d => d.year),
      datasets: [{
        label: "PIB per cápita",
        data: data.map(d => d.gdp),
        borderColor: "#f39c12",
        tension: 0.3,
        spanGaps: true
      }]
    },
    options: { responsive: true, scales: { y: { suggestedMin: 0, suggestedMax: 80000 } } }
  });

  // Esperanza de vida
  if (chartLife) chartLife.destroy();
  chartLife = new Chart(document.getElementById("graphLife"), {
    type: "line",
    data: {
      labels: data.map(d => d.year),
      datasets: [{
        label: "Esperanza de vida",
        data: data.map(d => d.lifeExpectancy),
        borderColor: "#27ae60",
        tension: 0.3,
        spanGaps: true
      }]
    },
    options: { responsive: true, scales: { y: { suggestedMin: 40, suggestedMax: 90 } } }
  });

  // Desigualdad
  if (chartIneq) chartIneq.destroy();
  chartIneq = new Chart(document.getElementById("graphIneq"), {
    type: "line",
    data: {
      labels: data.map(d => d.year),
      datasets: [{
        label: "Desigualdad",
        data: data.map(d => d.inequality),
        borderColor: "#8e44ad",
        tension: 0.3,
        spanGaps: true
      }]
    },
    options: { responsive: true, scales: { y: { suggestedMin: 0, suggestedMax: 3 } } }
  });

  // Evaluación de vida
  if (chartEval) chartEval.destroy();
  chartEval = new Chart(document.getElementById("graphEval"), {
    type: "line",
    data: {
      labels: data.map(d => d.year),
      datasets: [{
        label: "Evaluación de vida",
        data: data.map(d => d.lifeEval),
        borderColor: "#c0392b",
        tension: 0.3,
        spanGaps: true
      }]
    },
    options: { responsive: true, scales: { y: { suggestedMin: 0, suggestedMax: 10 } } }
  });
}

function prevCard(){ 
  currentIndex = (currentIndex - 1 + countryNames.length) % countryNames.length; 
  updateCard(); 
}
function nextCard(){ 
  currentIndex = (currentIndex + 1) % countryNames.length; 
  updateCard(); 
}

// ================= Gráficas originales =================
function buildOriginalCharts(){
  const ctxGDP = document.getElementById("graphGDP").getContext("2d");
  const ctxLife = document.getElementById("graphLife").getContext("2d");
  const ctxIneq = document.getElementById("graphIneq").getContext("2d");
  const ctxEval = document.getElementById("graphEval").getContext("2d");

  const country0 = countryNames[0]; // Tomamos el primer país como ejemplo
  const years = datasets[country0].map(d=>d.year);

  new Chart(ctxGDP,{ type:"line", data:{ labels:years, datasets:[{label:"PIB", data:datasets[country0].map(d=>d.gdp), borderColor:"#ff6f61", backgroundColor:"#ff6f6133", tension:0.3, spanGaps:true}]}, options:{responsive:true, plugins:{legend:{position:"bottom"}}} });
  new Chart(ctxLife,{ type:"line", data:{ labels:years, datasets:[{label:"Esperanza de vida", data:datasets[country0].map(d=>d.lifeExpectancy), borderColor:"#4bc0c0", backgroundColor:"#4bc0c033", tension:0.3, spanGaps:true}]}, options:{responsive:true, plugins:{legend:{position:"bottom"}}} });
  new Chart(ctxIneq,{ type:"line", data:{ labels:years, datasets:[{label:"Desigualdad", data:datasets[country0].map(d=>d.inequality), borderColor:"#9966ff", backgroundColor:"#9966ff33", tension:0.3, spanGaps:true}]}, options:{responsive:true, plugins:{legend:{position:"bottom"}}} });
  new Chart(ctxEval,{ type:"line", data:{ labels:years, datasets:[{label:"Evaluación de vida", data:datasets[country0].map(d=>d.lifeEval), borderColor:"#36a2eb", backgroundColor:"#36a2eb33", tension:0.3, spanGaps:true}]}, options:{responsive:true, plugins:{legend:{position:"bottom"}}} });
}

// ================= Dropdown comparador =================
function toggleDropdown(){ 
  document.getElementById("dropdown").classList.toggle("show"); 
}

function loadDropdown(){
  const dropdown = document.getElementById("dropdown"); 
  dropdown.innerHTML = "";
  countryNames.forEach(c=>{
    const label = document.createElement("label");
    label.innerHTML = `<input type="checkbox" value="${c}" onchange="updateSelected()"> ${c}`;
    dropdown.appendChild(label);
  });
}

function updateSelected(){
  const selectedList = document.getElementById("selectedList");
  const checkboxes = document.querySelectorAll('.dropdown-content input[type="checkbox"]');
  const selected = Array.from(checkboxes).filter(cb=>cb.checked).map(cb=>cb.value);
  
  if(selected.length){
    selectedList.innerText = "Seleccionados: " + selected.join(", ");
    updateCompareChart(selected);
  } else {
    selectedList.innerText = "Ningún país seleccionado";
    document.getElementById("compareChartContainer").style.display = "none";
  }
}

function updateCompareChart(selectedCountries){
  const ctx = document.getElementById("compareChart").getContext("2d");
  if(compareChart) compareChart.destroy();
  const ds = selectedCountries.map((country,i)=>({
    label: country,
    data: datasets[country].map(d=>d.lifeEval??null),
    borderColor: colors[i%colors.length],
    backgroundColor: colors[i%colors.length]+"55",
    tension:0.3,
    spanGaps:true
  }));
  compareChart = new Chart(ctx,{
    type:"line",
    data:{ labels:datasets[selectedCountries[0]].map(d=>d.year), datasets: ds },
    options:{ responsive:true, maintainAspectRatio:false, plugins:{legend:{position:"bottom"},title:{display:true,text:"Comparativa de Evaluación de Vida"}} }
  });
  document.getElementById("compareChartContainer").style.display = "block";
}

// ================= Cerrar dropdown si clic fuera =================
window.onclick = function(e){
  if(!e.target.matches('.dropdown-btn')){
    const dds=document.getElementsByClassName("dropdown-content");
    for(let i=0;i<dds.length;i++) if(dds[i].classList.contains('show')) dds[i].classList.remove('show');
  }
}

// ================= Switch view =================
function switchView(view){
  document.getElementById("normalizedView").style.display = view==="normalized"? "flex":"none";
  document.getElementById("originalView").style.display = view==="original"? "flex":"none";
}

// ================= Inicialización =================
window.onload = function(){
  updateCard();
  buildOriginalCharts();
  loadDropdown();

  // === [AÑADIDO] Inicializa tooltips con el primer país visible
  const first = countryNames[0];
  updateOriginalTooltips(first);
};
