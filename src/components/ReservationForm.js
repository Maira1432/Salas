// src/components/ReservationForm.jsx

import React, { useState, useEffect } from 'react';
import { Save, X, Calendar, Clock, MapPin, AlignLeft } from 'lucide-react';
import { useReservations } from '../context/ReservationsContext';
import { toast } from 'sonner'; 

const ReservationForm = ({ 
  reservationToEdit, 
  prefillData, 
  onUpsert, 
  onCancel 
}) => {
  // ✅ 1. TRAEMOS 'reservations' DEL CONTEXTO PARA COMPARAR
  const { rooms, reservations } = useReservations(); 
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    roomId: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '08:00',
    endTime: '09:00',
    description: '',
  });

  // Cargar datos al iniciar
  useEffect(() => {
    if (reservationToEdit) {
      const start = new Date(reservationToEdit.startTime);
      const end = new Date(reservationToEdit.endTime);
      setFormData({
        title: reservationToEdit.title || '',
        roomId: reservationToEdit.room?.id || reservationToEdit.roomId || '',
        date: start.toISOString().split('T')[0],
        startTime: start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
        endTime: end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
        description: reservationToEdit.description || '',
      });
    } else if (prefillData) {
      const endObj = new Date(prefillData.endTime);
      setFormData({
        title: '',
        roomId: prefillData.roomId || '',
        date: prefillData.date || new Date().toISOString().split('T')[0],
        startTime: prefillData.start || '08:00',
        endTime: endObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) || '09:00',
        description: '',
      });
    }
  }, [reservationToEdit, prefillData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Toast de carga
    const toastId = toast.loading('Verificando disponibilidad...');

    try {
      // 1. Validaciones básicas
      if (!formData.title || !formData.roomId || !formData.date) {
        throw new Error("Por favor completa los campos obligatorios (*)");
      }
      if (formData.endTime <= formData.startTime) {
        throw new Error("La hora de fin debe ser posterior a la de inicio");
      }

      // 2. Preparar fechas para validación
      const startDateTimeISO = `${formData.date}T${formData.startTime}:00`;
      const endDateTimeISO = `${formData.date}T${formData.endTime}:00`;
      
      const newStart = new Date(startDateTimeISO);
      const newEnd = new Date(endDateTimeISO);

      // ✅ 3. VALIDACIÓN DE CONFLICTOS (Lógica Nueva)
      const hasConflict = reservations.some(res => {
        // Ignorar la reserva actual si estamos editando
        if (reservationToEdit && res.id === reservationToEdit.id) return false;

        // Solo verificar reservas de la MISMA sala
        if (res.room?.id !== formData.roomId) return false;

        const existingStart = new Date(res.startTime);
        const existingEnd = new Date(res.endTime);

        // Fórmula de superposición de rangos:
        // (InicioA < FinB) Y (FinA > InicioB)
        return newStart < existingEnd && newEnd > existingStart;
      });

      if (hasConflict) {
        // Si hay conflicto, lanzamos error manual
        throw new Error("⚠️ Conflicto: La sala ya está ocupada en ese horario.");
      }

      // 4. Buscar datos de sala
      const selectedRoom = rooms.find(r => r.id === formData.roomId);
      if (!selectedRoom) throw new Error("Sala inválida");

      // 5. Payload
      const payload = {
        id: reservationToEdit?.id,
        title: formData.title,
        startTime: startDateTimeISO,
        endTime: endDateTimeISO,
        room: selectedRoom,
        roomEmail: selectedRoom.email,
        description: formData.description,
      };

      // 6. Enviar
      await onUpsert(payload);

      toast.success(reservationToEdit ? 'Reserva actualizada' : 'Reserva creada', {
        id: toastId,
        description: 'Se ha guardado correctamente en tu calendario.'
      });

      onCancel();

    } catch (err) {
      console.error("Error al guardar:", err);
      toast.error(err.message.includes("Conflicto") ? "Horario no disponible" : "Error al guardar", {
        id: toastId,
        description: err.message
      });
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-[#151A20] rounded-2xl shadow-xl border border-gray-100 dark:border-[#232A36] overflow-hidden">
      <div className="bg-gray-50 dark:bg-[#1C2128] px-6 py-4 border-b border-gray-100 dark:border-[#232A36] flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">
          {reservationToEdit ? 'Editar Reserva' : 'Nueva Reserva'}
        </h2>
        <button onClick={onCancel} className="p-2 hover:bg-gray-200 rounded-full text-gray-500">
          <X size={20} />
        </button>
      </div>

      {error && (
        <div className={`mx-6 mt-4 p-3 border rounded-lg text-sm ${error.includes('Conflicto') ? 'bg-orange-50 border-orange-200 text-orange-800' : 'bg-red-50 border-red-200 text-red-700'}`}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        
        {/* TÍTULO */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Título del evento *</label>
          <div className="relative">
            <AlignLeft className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-[#2E3642] bg-white dark:bg-[#0D1117] text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* SALA */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sala *</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <select
              name="roomId"
              value={formData.roomId}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-[#2E3642] bg-white dark:bg-[#0D1117] text-gray-900 dark:text-white outline-none appearance-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="" disabled>Selecciona una sala...</option>
              {rooms.map(room => (
                <option key={room.id} value={room.id}>
                  {room.nombre} (Cap: {room.capacidad})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* FECHAS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha *</label>
             <input type="date" name="date" value={formData.date} onChange={handleChange} className="w-full p-2 rounded-xl border border-gray-200 dark:bg-[#0D1117] dark:text-white dark:border-[#2E3642] focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Inicio *</label>
             <input type="time" name="startTime" value={formData.startTime} onChange={handleChange} className="w-full p-2 rounded-xl border border-gray-200 dark:bg-[#0D1117] dark:text-white dark:border-[#2E3642] focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fin *</label>
             <input type="time" name="endTime" value={formData.endTime} onChange={handleChange} className="w-full p-2 rounded-xl border border-gray-200 dark:bg-[#0D1117] dark:text-white dark:border-[#2E3642] focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        {/* DESCRIPCIÓN */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descripción</label>
          <textarea
            name="description"
            rows="3"
            value={formData.description}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-[#2E3642] bg-white dark:bg-[#0D1117] text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100 dark:border-[#232A36]">
          <button type="button" onClick={onCancel} className="px-5 py-2.5 rounded-xl text-gray-600 hover:bg-gray-100">Cancelar</button>
          
          <button type="submit" disabled={loading} className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-lg flex items-center gap-2">
            {loading ? 'Verificando...' : (
              <>
                <Save size={18} />
                {reservationToEdit ? 'Actualizar' : 'Crear Reserva'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReservationForm;