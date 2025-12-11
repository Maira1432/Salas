// src/api/reservations.js
export async function apiDeleteReservation(id, accessToken) {
  if (!id) throw new Error('ID de reserva no proporcionado.');

  const res = await fetch(`/api/reservations/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
  });

  if (!res.ok) {
    const text = await res.text();
    if (res.status === 403) throw new Error('No tienes permiso para eliminar esta reserva.');
    throw new Error(text || 'No se pudo eliminar la reserva.');
  }

  return true;
}
