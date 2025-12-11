// src/utils/ics.js
const fmt = (d) => new Date(d).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');

export const buildICS = (r) => {
  const uid = (r.outlookEventId || r.id) + '@salas-fyco';
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Salas FYCO//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${fmt(new Date())}`,
    `DTSTART:${fmt(r.startTime)}`,
    `DTEND:${fmt(r.endTime)}`,
    `SUMMARY:${(r.title || '').replace(/\r?\n/g, ' ')}`,
    `DESCRIPTION:${(r.description || '').replace(/\r?\n/g, ' ')}`,
    `LOCATION:${(r.room?.nombre || 'Sala').replace(/\r?\n/g, ' ')}`,
    'END:VEVENT',
    'END:VCALENDAR'
  ];
  return lines.join('\r\n');
};

export const downloadICS = (r) => {
  const blob = new Blob([buildICS(r)], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${(r.title || 'reserva')}.ics`;
  a.click();
  URL.revokeObjectURL(url);
};
