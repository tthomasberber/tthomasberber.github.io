const CALENDAR_ID = "2ed7f8893370ae65002b6fa1cf712257ab9cef1bc2a93072cd951eeaac6dce03@group.calendar.google.comI";

function doGet(e) {
  const fecha = e.parameter.fecha;
  const ocupados = fecha ? getOcupados(fecha) : [];
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, ocupados }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const d = JSON.parse(e.postData.contents);
    const ocupados = getOcupados(d.fecha);
    if (ocupados.includes(d.horario)) {
      return ContentService
        .createTextOutput(JSON.stringify({ ok: false, error: "ya fue reservado" }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    const [y, m, dia] = d.fecha.split("-").map(Number);
    const [h, min] = d.horario.split(":").map(Number);
    const inicio = new Date(y, m - 1, dia, h, min);
    const fin = new Date(inicio.getTime() + 45 * 60 * 1000);
    CalendarApp.getCalendarById(CALENDAR_ID).createEvent(
      `✂️ ${d.nombre} — ${d.servicio}`,
      inicio, fin,
      { description: `Cliente: ${d.nombre}\nServicio: ${d.servicio}\nPrecio: ${d.precio}` }
    );
    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function getOcupados(fecha) {
  const [y, m, d] = fecha.split("-").map(Number);
  const inicio = new Date(y, m - 1, d, 0, 0, 0);
  const fin = new Date(y, m - 1, d, 23, 59, 59);
  return CalendarApp.getCalendarById(CALENDAR_ID)
    .getEvents(inicio, fin)
    .map(ev => {
      const s = ev.getStartTime();
      return String(s.getHours()).padStart(2,"0") + ":" + String(s.getMinutes()).padStart(2,"0");
    });
}
