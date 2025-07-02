function darkMode() {
  const html = document.documentElement;
  const btnModoOscuro = document.getElementById('modoOscuroBtn');

  btnModoOscuro.addEventListener('click', () => {
    html.classList.toggle('dark');
    setTimeout(() => {
      btnModoOscuro.style.background = (btnModoOscuro.style.background === "bisque" ? "white" : "bisque");
      btnModoOscuro.style.color = (btnModoOscuro.style.color === "black" ? "white" : "black");
      btnModoOscuro.textContent = (btnModoOscuro.textContent === "☀️" ? "🌙" : "☀️");
    }, 200);
  });
}
console.log(darkMode());

function mostrarAlerta(msg) {
  const alerta = document.getElementById('alerta');
  alerta.textContent = msg;
  alerta.classList.remove('hidden');

  setTimeout(() => {
    alerta.classList.add('hidden');
  }, 3000);
}

const form = document.getElementById('form-turno');
const lista = document.getElementById('lista-turnos');

const nombre = localStorage.getItem("usuarioLogueado");

if (!nombre) {
  window.location.href = "login/login.js";
}
document.getElementById("nombre-mostrado").textContent = `Nombre: ${nombre}`;

form.addEventListener('submit', async function (e) {
  e.preventDefault();

  document.getElementById("nombre").value = nombre;

  const fecha = document.getElementById('fecha').value;
  const hora = document.getElementById('hora').value;

  if (!nombre || !fecha || !hora) return;

  const fechaSeleccionada = new Date(fecha);
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0); // Ignora hora para comparar solo fecha

  if (fechaSeleccionada < hoy) {
    mostrarAlerta("❌ No se pueden reservar turnos en fechas anteriores a hoy");
    return;
  }

  const turno = { nombre, fecha, hora };

  try {
    const res = await fetch("http://localhost:4000/turnos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(turno)
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.mensaje || "Error al guardar turno");
    }

    // Mostrar en el DOM
    const li = document.createElement('li');
    li.className = 'p-3 border border-gray-300 dark:border-gray-600 rounded-lg';
    li.textContent = `${nombre} - ${fecha} a las ${hora}`;
    form.reset();
    mostrarAlerta("✅ Su turno se ha reservado correctamente");

  } catch (error) {
    console.error("Error:", error.message);
    mostrarAlerta("❌ " + error.message); // Mostrar error en pantalla
  }
});

//Efecto smooth sobre href
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();

    const target = document.querySelector(this.getAttribute("href"));
    target.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  });
});

const btnCerrarSesion = document.getElementById("btn-cerrar-sesion");
const modal = document.getElementById("modal-confirmacion");
const cancelar = document.getElementById("cancelar");
const confirmar = document.getElementById("confirmar");
btnCerrarSesion.addEventListener("click", () => {
  modal.classList.remove("hidden");
});

cancelar.addEventListener("click", () => {
  modal.classList.add("hidden");
});

confirmar.addEventListener("click", () => {
  localStorage.removeItem("usuarioLogueado");
  window.location.href = "login/login.html";
});
