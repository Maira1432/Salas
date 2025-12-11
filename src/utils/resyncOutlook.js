// src/utils/resyncOutlook.js
import { msalInstance } from "../msalConfig";
import { graphCreateEvent, graphUpdateEvent, graphHasConflict } from "./graph";

/**
 * Intenta sincronizar una reserva local con Outlook.
 * Devuelve la reserva actualizada (con outlookEventId) o lanza Error.
 */
export const resyncReservationToOutlook = async (reservation) => {
  const account = msalInstance.getActiveAccount() || msalInstance.getAllAccounts()[0];
  if (!account) throw new Error("No has iniciado sesión en Microsoft.");

  // Evitar conflicto con otros eventos personales
  const startISO = new Date(reservation.startTime).toISOString();
  const endISO = new Date(reservation.endTime).toISOString();
  const conflict = await graphHasConflict(startISO, endISO, reservation.outlookEventId);
  if (conflict) {
    throw new Error("Tienes otro evento en Outlook en ese rango horario.");
  }

  if (reservation.outlookEventId) {
    const ev = await graphUpdateEvent(reservation.outlookEventId, reservation);
    return { ...reservation, outlookEventId: ev?.id || reservation.outlookEventId };
  } else {
    const ev = await graphCreateEvent(reservation);
    return { ...reservation, outlookEventId: ev?.id };
  }
};

/**
 * Reintenta varias (útil si más adelante quieres “Sincronizar todas”)
 */
export const bulkResyncToOutlook = async (reservations = []) => {
  const results = [];
  for (const r of reservations) {
    try {
      const updated = await resyncReservationToOutlook(r);
      results.push({ ok: true, reservation: updated });
    } catch (e) {
      results.push({ ok: false, reservation: r, error: e?.message || String(e) });
    }
  }
  return results;
};
