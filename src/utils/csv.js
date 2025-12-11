// src/utils/csv.js
const csvEscape = (val) => {
  const s = (val ?? '').toString().replace(/\r?\n/g, ' ').trim();
  if (s.includes(',') || s.includes('"')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
};

export const buildReservationsCSV = (reservations = []) => {
  const headers = [
    'ID','Título','Usuario','Sala','Inicio','Fin','Estado','Invitados','OutlookId'
  ];
  const rows = reservations.map(r => ([
    r.id,
    r.title || '',
    r.user || '',
    r.room?.nombre || '',
    new Date(r.startTime).toISOString(),
    new Date(r.endTime).toISOString(),
    r.status || '',
    Array.isArray(r.attendees) ? r.attendees.join('; ') : '',
    r.outlookEventId || ''
  ].map(csvEscape).join(',')));

  return [headers.join(','), ...rows].join('\r\n');
};

export const downloadReservationsCSV = (reservations, filename = 'reservas.csv') => {
  const csv = buildReservationsCSV(reservations);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
};
