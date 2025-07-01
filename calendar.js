document.addEventListener('DOMContentLoaded', function () {
  var calendarEl = document.getElementById('calendar');
  var calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    locale: 'es',

    //función personalizada para cargar eventos desde API
    events: async function (fetchInfo, successCallback, failureCallback) {
      try {
        const res = await fetch("http://localhost:4000/turnos");
        const data = await res.json();

        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);

        const nombreLogueado = localStorage.getItem("usuarioLogueado");

        const eventosFiltrados = data
          .filter(turno => {
            const fechaHoraTurno = new Date(`${turno.fecha}T${turno.hora}`);
            return fechaHoraTurno >= hoy && turno.estado === "confirmado";
          })
          .map(turno => ({
            start: `${turno.fecha}T${turno.hora}`,
            id: turno.id,
            title: turno.nombre === nombreLogueado ? turno.nombre : "",
            backgroundColor: turno.nombre === nombreLogueado ? "#ec4899" : "gray"
          }));

        successCallback(eventosFiltrados);
      } catch (error) {
        console.error("Error al cargar eventos", error);
        failureCallback(error);
      }
    }
  });

  calendar.render();
});
