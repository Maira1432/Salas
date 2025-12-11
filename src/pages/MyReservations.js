// src/pages/MyReservations.js

import { useState, useMemo } from 'react';
import { useReservations } from '../context/ReservationsContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ListSkeleton } from '../components/SkeletonLoader'; // ✅ Importamos el esqueleto

// --- UTILIDADES ---
const getRoomName = (reservation) => {
    if (reservation.room?.nombre) return reservation.room.nombre;
    const roomAttendee = reservation.attendees?.find(a => a.type === 'resource');
    if (roomAttendee) return roomAttendee.emailAddress?.name || roomAttendee.emailAddress?.address;
    if (reservation.location?.displayName && reservation.location.displayName !== "Sala no especificada") {
        return reservation.location.displayName;
    }
    return 'Sala no especificada';
};

const hhmm = (d) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const isFutureOrToday = (d) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); 
    return d && d instanceof Date && d >= today;
};

export default function MyReservations() {
  // ✅ Usamos 'loading' del contexto global
  const { reservations: globalReservations, removeById, loading } = useReservations(); 
  const navigate = useNavigate();

  const futureReservations = useMemo(() => {
      return globalReservations
          .filter(r => isFutureOrToday(r.startTime))
          .sort((a, b) => a.startTime.getTime() - b.startTime.getTime()); 
  }, [globalReservations]);

  const handleDelete = async (reservationId) => {
      if (!window.confirm('¿Estás seguro de que quieres eliminar esta reserva?')) return;
      
      const toastId = toast.loading('Eliminando reserva...');
      try {
          await removeById(reservationId);
          toast.success('Reserva eliminada', { id: toastId, description: 'Evento borrado correctamente.' });
      } catch (e) {
          toast.error('Error al eliminar', { id: toastId, description: e.message });
      }
  };

  return (
    <div className="mx-auto max-w-4xl p-4">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Mis Reservas</h2>

      {/* ✅ LÓGICA DE CARGA MEJORADA */}
      {loading ? (
        <ListSkeleton count={4} />
      ) : futureReservations.length > 0 ? (
        <ul className="space-y-3">
          {futureReservations.map((r) => {
            const start = r.startTime; 
            const end = r.endTime;     
            const dateStr = start.toLocaleDateString([], { day: '2-digit', month: 'short' });

            return (
              <li key={r.id} className="rounded-2xl bg-white dark:bg-[#151A20] border border-gray-200 dark:border-[#232A36] px-5 py-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                    <div>
                        <div className="font-semibold text-lg text-gray-900 dark:text-white">{r.title || '(Sin título)'}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2">
                           <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full dark:bg-blue-900 dark:text-blue-200">
                             {getRoomName(r)}
                           </span>
                           <span>• {dateStr}, {hhmm(start)} – {hhmm(end)}</span>
                        </div>
                    </div>
                    
                    <div className='flex gap-3'>
                        <button
                          onClick={() => navigate(`/create-reservation/${r.id}`)} 
                          className='px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-[#232A36] dark:text-gray-300 dark:hover:bg-[#2E3642] transition-colors'> 
                          Editar
                      </button>
                        <button
                            onClick={() => handleDelete(r.id)} 
                            className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 transition-colors"> 
                            Eliminar
                        </button>
                    </div>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="text-center py-12 bg-white dark:bg-[#151A20] rounded-2xl border border-dashed border-gray-300 dark:border-[#232A36]">
            <p className="text-gray-500 dark:text-gray-400">No tienes reservas futuras.</p>
            <button 
                onClick={() => navigate('/create-reservation')}
                className="mt-4 text-blue-600 font-medium hover:underline"
            >
                Crear una nueva
            </button>
        </div>
      )}
    </div>
  );
}