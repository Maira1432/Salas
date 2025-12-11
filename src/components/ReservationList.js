// src/components/ReservationList.js
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, Edit3, Trash2, Users, Cloud, HardDrive, RotateCw } from 'lucide-react';
import { resyncReservationToOutlook } from '../utils/resyncOutlook';
import { downloadICS } from '../utils/ics';
import { format } from 'date-fns';

const ReservationList = ({
  reservations = [],
  onEdit,
  onDelete,
  onResync,
  isAdmin = false,
  userName,
}) => {
  const [deletingId, setDeletingId] = useState(null);
  const [syncingId, setSyncingId] = useState(null);

  const handleDelete = async (id) => {
    if (deletingId) return;
    const confirm = window.confirm('¿Estás seguro de eliminar esta reserva?');
    if (!confirm) return;
    try {
      setDeletingId(id);
      await onDelete?.(id);
    } finally {
      setDeletingId(null);
    }
  };

  const Item = ({ r }) => {
    const isMine = !isAdmin ? r.user === userName : true; // (no usado ahora, por si lo quieres mostrar)
    const outlook = !!r.outlookEventId;
    const attendeesCount = Array.isArray(r.attendees) ? r.attendees.length : 0;

    return (
      <motion.li
        className="
          bg-white dark:bg-[#171B22]
          border border-gray-200 dark:border-[#232A36]
          rounded-2xl p-4 shadow-sm
          hover:border-blue-500/20 dark:hover:border-blue-400/25
          transition
        "
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {/* Título + chips */}
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-base md:text-lg font-semibold truncate text-gray-900 dark:text-gray-100">
                {r.title}
              </h4>

              {/* Chip Outlook / Local */}
              {outlook ? (
                <span className="
                  inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full
                  bg-emerald-100 text-emerald-700
                  dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-1 dark:ring-emerald-500/20
                ">
                  <Cloud className="w-3.5 h-3.5" /> Outlook
                </span>
              ) : (
                <span className="
                  inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full
                  bg-gray-100 text-gray-700
                  dark:bg-white/10 dark:text-gray-200 dark:ring-1 dark:ring-white/10
                ">
                  <HardDrive className="w-3.5 h-3.5" /> Local
                </span>
              )}

              {/* Chip invitados */}
              {attendeesCount > 0 && (
                <span className="
                  inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full
                  bg-indigo-100 text-indigo-700
                  dark:bg-indigo-500/15 dark:text-indigo-300 dark:ring-1 dark:ring-indigo-500/20
                ">
                  <Users className="w-3.5 h-3.5" /> {attendeesCount} invitado{attendeesCount > 1 ? 's' : ''}
                </span>
              )}
            </div>

            {/* Meta */}
            <div className="mt-1 text-sm">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                <CalendarDays className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="truncate">
                  {r.room?.nombre || 'Sala'} · {format(new Date(r.startTime), 'dd/MM/yyyy HH:mm')} – {format(new Date(r.endTime), 'HH:mm')}
                </span>
              </div>

              {r.description && (
                <p className="mt-1 line-clamp-2 text-gray-500 dark:text-gray-400">{r.description}</p>
              )}
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{r.user}</p>
            </div>
          </div>

          {/* Acciones */}
          <div className="flex items-center gap-2 shrink-0">
            {/* .ics */}
            <motion.button
              type="button"
              onClick={() => downloadICS(r)}
              className="
                w-9 h-9 grid place-items-center rounded-lg
                bg-transparent
                border border-gray-300/60 dark:border-[#2A3342]
                text-gray-600 dark:text-gray-200
                hover:bg-gray-100 dark:hover:bg-[#141922]
                transition
              "
              whileTap={{ scale: 0.98 }}
              title="Descargar .ics"
            >
              <CalendarDays className="w-4 h-4" />
            </motion.button>

            {/* Editar */}
            <motion.button
              type="button"
              onClick={() => onEdit?.(r)}
              className="
                w-9 h-9 grid place-items-center rounded-lg
                bg-transparent
                border border-gray-300/60 dark:border-[#2A3342]
                text-gray-600 dark:text-gray-200
                hover:bg-gray-100 dark:hover:bg-[#141922]
                transition
              "
              whileTap={{ scale: 0.98 }}
              aria-label="Editar"
              title="Editar"
            >
              <Edit3 className="w-4 h-4" />
            </motion.button>

            {/* Eliminar */}
            <motion.button
              type="button"
              onClick={() => handleDelete(r.id)}
              className={`
                w-9 h-9 grid place-items-center rounded-lg text-white font-medium shadow-sm
                ${deletingId === r.id ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'}
              `}
              whileTap={{ scale: deletingId === r.id ? 1 : 0.98 }}
              disabled={deletingId === r.id}
              aria-label="Eliminar"
              title="Eliminar"
            >
              {deletingId === r.id ? '…' : <Trash2 className="w-4 h-4" />}
            </motion.button>

            {/* Sync (solo Local) */}
            {!outlook && (
              <motion.button
                type="button"
                onClick={async () => {
                  if (syncingId) return;
                  try {
                    setSyncingId(r.id);
                    const updated = await resyncReservationToOutlook(r);
                    await onResync?.(updated);
                  } catch (e) {
                    alert(e?.message || 'No se pudo sincronizar con Outlook.');
                  } finally {
                    setSyncingId(null);
                  }
                }}
                className={`
                  h-9 px-3 rounded-lg border font-medium
                  ${syncingId === r.id
                    ? 'border-gray-400/40 text-gray-400 cursor-not-allowed'
                    : 'border-blue-400/40 text-blue-400 hover:bg-blue-500/10'}
                `}
                whileTap={{ scale: syncingId === r.id ? 1 : 0.98 }}
                disabled={syncingId === r.id}
                title="Sincronizar con Outlook"
              >
                {syncingId === r.id ? 'Sincronizando…' : (
                  <span className="inline-flex items-center gap-1">
                    <RotateCw className="w-4 h-4" /> Sync
                  </span>
                )}
              </motion.button>
            )}
          </div>
        </div>
      </motion.li>
    );
  };

  if (!reservations.length) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="
          rounded-2xl p-8 md:p-10 text-center
          bg-white/80 dark:bg-[#171B22]
          border border-gray-200 dark:border-[#232A36]
          shadow-sm transition-colors
        "
      >
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl
                        bg-blue-500/10 dark:bg-blue-400/10 text-blue-600 dark:text-blue-300">
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
              d="M8 7V3m8 4V3M5 11h14M5 19h14M5 7h14M7 15h10" />
          </svg>
        </div>

        <h3 className="text-base md:text-lg font-semibold text-gray-800 dark:text-gray-100">
          No hay reservas para mostrar
        </h3>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Crea tu primera reserva y la verás aquí.
        </p>

        <div className="mt-6">
          <a
            href="/"
            data-accent="primary"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white font-medium
                       shadow-md hover:bg-blue-700 transition"
          >
            <span>Crear reserva</span>
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </motion.div>
    );
  }

  return (
    <ul className="space-y-3">
      {reservations.map((r) => (
        <Item key={r.id} r={r} />
      ))}
    </ul>
  );
};

export default ReservationList;
