// src/utils/reservations.js

// Catálogo de salas (usa estos objetos en todo el proyecto)
export const rooms = [
  { id: '1', nombre: 'Círculo de Sabios I', capacidad: 5 },
  { id: '2', nombre: 'Círculo de Sabios II', capacidad: 5 },
  { id: '3', nombre: 'Círculo de Sabios III', capacidad: 5 },
  { id: '4', nombre: 'Consejo de la Tribu', capacidad: 12 },
  { id: '5', nombre: 'Plaza de Conexiones', capacidad: 6 },
];

// Reserva inicial de ejemplo (fechas en ISO; en memoria se convierten a Date)
export const initialReservations = [
  {
    id: '1',
    user: 'Juan Pérez',
    room: rooms[0],
    startTime: '2024-10-15T10:00:00.000Z',
    endTime: '2024-10-15T11:00:00.000Z',
    title: 'Reunión equipo',
    description: 'Discusión semanal',
    status: 'confirmed',
  },
  {
    id: '2',
    user: 'Ana García',
    room: rooms[1],
    startTime: '2024-10-16T14:00:00.000Z',
    endTime: '2024-10-16T15:30:00.000Z',
    title: 'Presentación',
    description: 'Demo del proyecto',
    status: 'pending',
  },
  {
    id: '3',
    user: 'Carlos López',
    room: rooms[0],
    startTime: '2024-10-17T09:00:00.000Z',
    endTime: '2024-10-17T10:30:00.000Z',
    title: 'Entrevista',
    description: 'Candidato nuevo',
    status: 'confirmed',
  },
];

// ID corto y único
export const generateId = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2);

// --- Bonus: utilidades para choques de horario (a usar cuando quieras) ---
export const overlaps = (aStart, aEnd, bStart, bEnd) =>
  new Date(aStart) < new Date(bEnd) && new Date(bStart) < new Date(aEnd);

// Añade/actualiza esta función en src/utils/reservations.js
export const hasRoomConflict = (
  reservations,
  { id, roomId, startTime, endTime },
  bufferMin = 10 // <-- buffer configurable en minutos (default 10)
) => {
  const start = new Date(startTime).getTime();
  const end = new Date(endTime).getTime();
  const b = bufferMin * 60 * 1000; // a ms

  return reservations.some((r) => {
    if (!r?.room?.id) return false;
    if (r.room.id !== roomId) return false;
    if (r.id === id) return false;

    const rs = new Date(r.startTime).getTime();
    const re = new Date(r.endTime).getTime();

    // Solape considerando buffer a ambos lados:
    // [start, end] choca con [rs - b, re + b]
    return start < (re + b) && (rs - b) < end;
  });
};
