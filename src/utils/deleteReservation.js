// src/utils/deleteReservation.js
import { graphDeleteEvent } from "./graph";

/**
 * Borra en Outlook (si hay outlookEventId) y luego deja que el caller elimine localmente.
 * No lanza error si falla Graph: lo registra en consola y retorna.
 */
export const deleteReservationInOutlookIfAny = async (reservation) => {
  try {
    if (reservation?.outlookEventId) {
      await graphDeleteEvent(reservation.outlookEventId);
    }
  } catch (e) {
    console.warn("No se pudo eliminar el evento en Outlook. Se continuará con el borrado local.", e);
  }
};
