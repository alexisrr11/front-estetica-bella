function darkMode() {
  const html = document.documentElement;
  const btnModoOscuro = document.getElementById('modoOscuroBtn');
  const modoGuardado = localStorage.getItem("modoOscuro");

  if (modoGuardado === "activado") {
    html.classList.add("dark");
    btnModoOscuro.style.background = "bisque";
    btnModoOscuro.style.color = "black";
    btnModoOscuro.textContent = "☀️";
  } else {
    html.classList.remove("dark");
    btnModoOscuro.style.background = "white";
    btnModoOscuro.style.color = "white";
    btnModoOscuro.textContent = "🌙";
  }

  btnModoOscuro.addEventListener("click", () => {
    html.classList.toggle("dark");

    const estaOscuro = html.classList.contains("dark");

    localStorage.setItem("modoOscuro", estaOscuro ? "activado" : "desactivado");

    setTimeout(() => {
      btnModoOscuro.style.background = estaOscuro ? "bisque" : "white";
      btnModoOscuro.style.color = estaOscuro ? "black" : "white";
      btnModoOscuro.textContent = estaOscuro ? "☀️" : "🌙";
    }, 200);
  });
}

darkMode(); 

document.addEventListener("DOMContentLoaded", async () => {
  const lista = document.getElementById("lista-turnos");
  const listaHoy = document.getElementById("turnos-hoy");
  const totalHoy = document.getElementById("total-turnos-hoy");

  function estilosFiltros(filtros) {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    filtros.forEach(turno => {
      const li = document.createElement("li");

      const fechaHoraTurno = new Date(`${turno.fecha}T${turno.hora}`);
      const fechaTurnoSinHora = new Date(fechaHoraTurno);
      fechaTurnoSinHora.setHours(0, 0, 0, 0);

      let clase = "";
      let botonHTML = "";
      const estaCancelado = turno.estado === "cancelado";

      if (fechaTurnoSinHora.getTime() === hoy.getTime()) {
        clase = "flex justify-between p-3 rounded shadow bg-pink-300 dark:bg-blue-900";

        // Si está cancelado, el botón queda deshabilitado y con otro texto/estilo
        botonHTML = estaCancelado
          ? `<button
           class="ml-2 p-2 bg-gray-400 text-white rounded-xl cursor-not-allowed"
           disabled
         >
           Cancelado
         </button>`
          : `<button
           class="ml-2 p-2 bg-pink-400 text-white rounded-xl hover:bg-pink-500 dark:bg-blue-900"
           data-id="${turno.id}"
           data-nombre="${turno.nombre}"
         >
           Cancelar <br> Turno
         </button>`;

      } else if (fechaHoraTurno > hoy) {
        clase = "flex justify-between p-3 rounded shadow bg-pink-100 dark:bg-gray-500";

        botonHTML = estaCancelado
          ? `<button
           class="ml-2 p-2 bg-gray-400 text-white rounded-xl cursor-not-allowed"
           disabled
         >
           Cancelado
         </button>`
          : `<button
           class="ml-2 p-2 bg-pink-400 text-white rounded-xl hover:bg-pink-500 dark:bg-blue-900"
           data-id="${turno.id}"
           data-nombre="${turno.nombre}"
         >
           Cancelar <br> Turno
         </button>`;

      } else {
        clase = "flex justify-between text-center p-3 rounded shadow bg-gray-100 dark:bg-gray-700";
        botonHTML = "";
      }

      li.className = clase;

      li.innerHTML = `
    <span class="estado-turno">${estaCancelado ? "❌" : "✅"}</span> ${turno.nombre}: ${turno.fecha} a las ${turno.hora} 
    
    ${botonHTML} 
  `;

      lista.appendChild(li);
    });

  }

  try {
    const res = await fetch("http://localhost:4000/turnos");
    let turnos = await res.json();

    //turnos de más cercano a más lejano
    filtrarTurnos(turnos);
    turnos.sort((a, b) => {
      const fechaA = new Date(`${a.fecha}T${a.hora}`);
      const fechaB = new Date(`${b.fecha}T${b.hora}`);
      return fechaB - fechaA;
    });

    estilosFiltros(turnos);

    const hoyArgentina = new Date().toLocaleString("sv-SE", {
      timeZone: "America/Argentina/Buenos_Aires",
    }).split(" ")[0]; // formato ISO: "2025-06-20"

    const turnosHoy = turnos.filter(turno => turno.fecha === hoyArgentina);
    totalHoy.textContent = turnosHoy.length;

    turnosHoy.forEach(turno => {
      const li = document.createElement("li");
      li.className = "p-3 rounded shadow bg-pink-300 dark:bg-blue-900";
      li.textContent = `${turno.nombre} - ${turno.hora}`;
      listaHoy.appendChild(li);
    });

  } catch (error) {
    console.error("Error al cargar turnos:", error);
  }

  function filtrarTurnos(turnos) {
    const lista = document.getElementById("lista-turnos");
    const inputNombre = document.getElementById("busqueda-nombre");
    const inputFecha = document.getElementById("busqueda-fecha");

    if (!inputNombre || !inputFecha) return;

    // Función que renderiza la lista filtrada
    function aplicarFiltros() {
      const texto = inputNombre.value.toLowerCase();
      const fecha = inputFecha.value;

      const filtrados = turnos.filter(turno => {
        const coincideNombre = turno.nombre.toLowerCase().includes(texto);
        const coincideFecha = fecha === "" || turno.fecha === fecha;
        return coincideNombre && coincideFecha;
      });

      lista.innerHTML = "";
      estilosFiltros(filtrados);
    }

    inputNombre.addEventListener("input", aplicarFiltros);
    inputFecha.addEventListener("input", aplicarFiltros);
  }

  lista.addEventListener("click", async (e) => {
    const boton = e.target.closest("button[data-id]");
    if (!boton) return;

    const id = boton.dataset.id;
    const nombre = boton.dataset.nombre;
    const confirmar = confirm(`¿Estás seguro de cancelar el turno de ${nombre}?`);
    if (!confirmar) return;

    try {
      const res = await fetch(`http://localhost:4000/turnos/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ estado: "cancelado" })
      });

      if (!res.ok) throw new Error("Error en el servidor");

      const data = await res.json();

      const spanEstado = boton.closest("li").querySelector("span.estado-turno");
      if (spanEstado) spanEstado.textContent = "❌ Cancelado";

      //Cambiar botón SOLO si el cambio fue exitoso
      boton.disabled = true;
      boton.textContent = "Cancelado";
      boton.classList.remove("bg-pink-400", "hover:bg-pink-500");
      boton.classList.add("bg-gray-400", "cursor-not-allowed");

      alert(`Turno de ${nombre} cancelado correctamente`);

    } catch (err) {
      alert("❌ Error al cancelar el turno");
    }
  });
});
