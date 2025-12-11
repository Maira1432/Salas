// src/utils/graph.js
import { acquireToken } from "./auth";

/**
 * Cliente base para Microsoft Graph con token.
 */
const graphFetch = async (endpoint, options = {}) => {
  const token = await acquireToken();
  const res = await fetch(`https://graph.microsoft.com/v1.0${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Graph error ${res.status}: ${text || res.statusText}`);
  }
  return res.status === 204 ? null : res.json();
};

/**
 * Utilidades
 */
const toUTC = (d) => new Date(d).toISOString();

/**
 * Normaliza lista de asistentes (correos).
 * Acepta reservation.attendees = ['correo@dom.com', ...]
 */
const normalizeAttendees = (reservation) => {
  const list = Array.isArray(reservation?.attendees) ? reservation.attendees : [];
  return list
    .map((email) => (typeof email === "string" ? email.trim() : ""))
    .filter(Boolean)
    .map((email) => ({
      emailAddress: { address: email },
      type: "required",
    }));
};

/**
 * Mapeo: reserva -> evento de Graph (reunión presencial).
 * - Sin Teams (isOnlineMeeting: false)
 * - Ubicación = nombre de la sala
 * - Recordatorio 15 min
 * - Categoría "Salas FYCO" (opcional)
 * - Invitados (si se proveen)
 */
const toGraphEvent = (reservation) => ({
  subject: reservation.title,
  body: { contentType: "HTML", content: reservation.description || "" },

  start: { dateTime: toUTC(reservation.startTime), timeZone: "UTC" },
  end:   { dateTime: toUTC(reservation.endTime),   timeZone: "UTC" },

  location: { displayName: reservation.room?.nombre || "Sala" },

  // SIN Teams
  isOnlineMeeting: false,

  // Recordatorio
  isReminderOn: true,
  reminderMinutesBeforeStart: 15,

  // Categoría opcional
  categories: ["Salas FYCO"],

  // Invitados opcionales
  attendees: normalizeAttendees(reservation),
});

/**
 * Crear evento en calendario personal del usuario.
 */
export const graphCreateEvent = async (reservation) =>
  graphFetch(`/me/events`, {
    method: "POST",
    body: JSON.stringify(toGraphEvent(reservation)),
  });

/**
 * Actualizar evento existente en calendario personal del usuario.
 */
export const graphUpdateEvent = async (eventId, reservation) =>
  graphFetch(`/me/events/${eventId}`, {
    method: "PATCH",
    body: JSON.stringify(toGraphEvent(reservation)),
  });

/**
 * Borrar evento del calendario personal del usuario.
 */
export const graphDeleteEvent = async (eventId) =>
  graphFetch(`/me/events/${eventId}`, { method: "DELETE" });

/**
 * Chequeo de conflictos en el calendario personal del usuario
 * para el rango [startISO, endISO]. Excluye el propio evento si
 * se pasa excludeEventId (útil al editar).
 */
export const graphHasConflict = async (startISO, endISO, excludeEventId) => {
  const params = new URLSearchParams({
    startDateTime: startISO,
    endDateTime: endISO,
    $select: "id,subject,start,end,showAs",
  });

  const data = await graphFetch(`/me/calendar/calendarView?${params.toString()}`);
  const events = Array.isArray(data?.value) ? data.value : [];

  return events.some((ev) => {
    if (excludeEventId && ev.id === excludeEventId) return false;
    const show = (ev.showAs || "").toLowerCase();
    // Si no hay showAs, tratamos como ocupado; si hay, conflicto cuando no sea "free"
    const isBusy = show ? show !== "free" : true;
    return isBusy;
  });
};
