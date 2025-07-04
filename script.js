
const SUPABASE_URL = 'https://kmhstbymlzamyzxtioad.supabase.co';
const SUPABASE_KEY = 'TU_SUPABASE_KEY'; // ← Pega tu clave completa aquí

let chartUsuarios, chartMotivos, chartFechas;

async function cargarDatos() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/registros?select=*`, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
  });
  const datos = await res.json();
  mostrarDatos(datos);
  graficarDatos(datos);
}

function mostrarDatos(registros) {
  const filtroUsuario = document.getElementById("filtroUsuario").value.toLowerCase();
  const filtroEstado = document.getElementById("filtroEstado").value.toLowerCase();
  const filtroFecha = document.getElementById("filtroFecha").value;

  const cuerpo = document.querySelector("#tabla tbody");
  cuerpo.innerHTML = "";

  const filtrados = registros.filter(r =>
    (!filtroUsuario || r.encargado?.toLowerCase().includes(filtroUsuario)) &&
    (!filtroEstado || r.estado?.toLowerCase().includes(filtroEstado)) &&
    (!filtroFecha || r.fecha === filtroFecha)
  );

  filtrados.forEach(r => {
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${r.fecha}</td><td>${r.encargado}</td><td>${r.cliente}</td>
      <td>${r.inicio}</td><td>${r.fin}</td><td>${r.duracion}</td>
      <td>${r.motivo}</td><td>${r.estado}</td><td>${r.comentario}</td>
    `;
    cuerpo.appendChild(fila);
  });
}

function graficarDatos(registros) {
  const contar = (arr, campo) =>
    arr.reduce((acc, obj) => {
      const key = obj[campo] || "Sin dato";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

  const porUsuario = contar(registros, "encargado");
  const porMotivo = contar(registros, "motivo");
  const porFecha = contar(registros, "fecha");

  const renderChart = (ctx, labels, title, chartRef) => {
    if (chartRef) chartRef.destroy();
    return new Chart(ctx, {
      type: "bar",
      data: {
        labels: Object.keys(labels),
        datasets: [{
          label: title,
          data: Object.values(labels),
          backgroundColor: "#4caf50",
        }]
      },
      options: { responsive: true, plugins: { legend: { display: false } } }
    });
  };

  chartUsuarios = renderChart(document.getElementById("graficaUsuarios"), porUsuario, "Registros por Usuario", chartUsuarios);
  chartMotivos  = renderChart(document.getElementById("graficaMotivos"), porMotivo, "Motivos frecuentes", chartMotivos);
  chartFechas   = renderChart(document.getElementById("graficaFechas"), porFecha, "Registros por Día", chartFechas);
}

function exportarCSV() {
  const filas = document.querySelectorAll("table tr");
  let csv = "";
  filas.forEach(fila => {
    const celdas = fila.querySelectorAll("th, td");
    const filaTexto = Array.from(celdas).map(c => `"${c.innerText}"`).join(",");
    csv += filaTexto + "\n";
  });
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "registros.csv";
  a.click();
  URL.revokeObjectURL(url);
}

document.getElementById("filtroUsuario").addEventListener("input", cargarDatos);
document.getElementById("filtroEstado").addEventListener("input", cargarDatos);
document.getElementById("filtroFecha").addEventListener("change", cargarDatos);

window.onload = () => {
  cargarDatos();
  setInterval(cargarDatos, 30000);
};
