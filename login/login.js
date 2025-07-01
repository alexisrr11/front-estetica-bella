export function darkMode() {
  const html = document.documentElement;
  const btnModoOscuro = document.getElementById('modoOscuroBtn');

  btnModoOscuro.addEventListener('click', () => {
    html.classList.toggle('dark');
    setTimeout(() => {
      btnModoOscuro.style.background = (btnModoOscuro.style.background === "bisque" ? "black" : "bisque");
      btnModoOscuro.style.color = (btnModoOscuro.style.color === "black" ? "white" : "black");
      btnModoOscuro.textContent = (btnModoOscuro.textContent === "☀️" ? "🌙" : "☀️");
    }, 200);
  });
}
console.log(darkMode());

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const alerta = document.getElementById("loginAlert");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
      const res = await fetch("http://localhost:4000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (res.ok) {
        alerta.textContent = "Inicio de sesión exitoso";
        alerta.classList.remove("hidden");
        alerta.classList.remove("text-red-500");
        alerta.classList.add("text-green-500");

        const nombreCompleto = `${data.usuario.nombre} ${data.usuario.apellido}`;
        localStorage.setItem("usuarioLogueado", nombreCompleto); 
        
        setTimeout(() => {
          window.location.href = "../index.html";
        }, 1500);
      } else {
        alerta.textContent = data.mensaje;
        alerta.classList.remove("hidden");
        alerta.classList.remove("text-green-500");
        alerta.classList.add("text-red-500");
      }
    } catch (err) {
      alerta.textContent = "Error de conexión con el servidor";
      alerta.classList.remove("hidden");
      alerta.classList.remove("text-green-500");
      alerta.classList.add("text-red-500");
    }
  });
});

