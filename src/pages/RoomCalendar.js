// src/pages/RoomCalendar.js

import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar as CalIcon, Clock, Plus } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { useReservations } from '../context/ReservationsContext';
import { useNavigate } from 'react-router-dom';
import { CalendarSkeleton } from '../components/SkeletonLoader';

// ✅ 1. FUNCIÓN AUXILIAR PARA OBTENER LA FECHA A LAS 00:00:00 (Neutraliza el tiempo)
const getZeroTimeDate = (date) => {
    // Si no es un objeto Date válido, lo devolvemos tal cual para evitar un error fatal.
    if (!(date instanceof Date) || isNaN(date.getTime())) return date; 
    const newDate = new Date(date);
    // Establece la hora a 00:00:00.000, respetando la zona horaria local
    newDate.setHours(0, 0, 0, 0); 
    return newDate;
};

// ✅ 2. FUNCIÓN AUXILIAR DE COMPARACIÓN SEGURA (Día, Mes, Año Local)
const isSameDaySimple = (date1, date2) => {
    // Es vital chequear que sean objetos Date antes de acceder a sus métodos
    if (!date1 || !date2 || !(date1 instanceof Date) || !(date2 instanceof Date)) return false;
    
    // Comparamos el año, mes y día
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
};


// Configuración de la grilla
const START_HOUR = 6; // 6:00 AM
const END_HOUR = 19;  // 7:00 PM
const HOUR_HEIGHT = 80; // Píxeles de altura por hora (ajustable)


export default function RoomCalendar({ sidebarOpen, toggleSidebar, currentPath, userName }) {
  const navigate = useNavigate();
  const { reservations, rooms, loading } = useReservations();
  
  // Usamos el hook de estado de fecha
  const [selectedDate, setSelectedDate] = useState(new Date()); 

  // --- NAVEGACIÓN DE FECHAS ---
  const handlePrevDay = () => {
    const prev = new Date(selectedDate);
    prev.setDate(prev.getDate() - 1);
    setSelectedDate(prev);
  };

  const handleNextDay = () => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + 1);
    setSelectedDate(next);
  };

  const isToday = (d) => {
    const today = new Date();
    return isSameDaySimple(d, today);
  };

  // --- FILTRAR RESERVAS DEL DÍA (USANDO COMPARACIÓN SEGURA Y NEUTRALIZACIÓN) ---
  const dailyReservations = useMemo(() => {
    if (!reservations || !Array.isArray(reservations)) return []; 
    
    // 1. NEUTRALIZAR LA FECHA SELECCIONADA (00:00:00 local)
    const neutralSelectedDate = getZeroTimeDate(selectedDate);
      
    return reservations.filter(r => {
        // 2. ✅ CORRECCIÓN FINAL: NEUTRALIZAR LA FECHA DE LA RESERVA
        // Esto elimina cualquier efecto de la hora y de la zona horaria antes de la comparación
        const neutralReservationDate = getZeroTimeDate(r.startTime);
        
        // 3. COMPARAR LAS DOS FECHAS NEUTRAS
        return isSameDaySimple(neutralReservationDate, neutralSelectedDate);
    });
  }, [reservations, selectedDate]); 

  // --- CÁLCULO DE POSICIONES CSS ---
  const getEventStyle = (start, end) => {
    const s = start;
    const e = end;

    // Calcular minutos desde el inicio del día (START_HOUR)
    const startMinutes = (s.getHours() * 60) + s.getMinutes();
    const endMinutes = (e.getHours() * 60) + e.getMinutes();
    const dayStartMinutes = START_HOUR * 60;

    const top = ((startMinutes - dayStartMinutes) / 60) * HOUR_HEIGHT;
    const height = ((endMinutes - startMinutes) / 60) * HOUR_HEIGHT;

    // Solo renderizar eventos que caen dentro del horario visible
    if (top < 0 || height <= 0) return null;

    return {
      top: `${top}px`,
      height: `${height}px`,
    };
  };

  // Generar array de horas para el eje Y
  const hours = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i);

  // FUNCIÓN DE FUSIÓN: CALENDARIO + CREAR RESERVA
  const handleSlotClick = (e, room) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const yClick = e.clientY - rect.top; 
      
      const minutesFromStart = Math.floor((yClick / HOUR_HEIGHT) * 60);
      // Ajuste de 30 minutos
      const snappedMinutes = Math.round(minutesFromStart / 30) * 30;

      const startHour = START_HOUR + Math.floor(snappedMinutes / 60);
      const startMinute = snappedMinutes % 60;
      
      const startTime = `${String(startHour).padStart(2, '0')}:${String(startMinute).padStart(2, '0')}`;
      const dateStr = selectedDate.toISOString().slice(0, 10);

      navigate(`/create-reservation?roomId=${room.id}&date=${dateStr}&start=${startTime}`);
  };


  return (
    <div className="bg-transparent text-inherit min-h-screen flex">
      <Sidebar isOpen={sidebarOpen} onClose={toggleSidebar} currentPath={currentPath} />

      <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-hidden flex flex-col h-screen">
        
        {/* HEADER DEL CALENDARIO */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <CalIcon className="w-6 h-6 text-blue-600" />
              Calendario de Salas
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Vista general de ocupación diaria
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white dark:bg-[#151A20] p-1.5 rounded-xl border border-gray-200 dark:border-[#232A36] shadow-sm">
            <button onClick={handlePrevDay} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="text-center min-w-[140px]">
               <span className="block text-sm font-bold text-gray-800 dark:text-gray-100">
                 {selectedDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
               </span>
               {isToday(selectedDate) && <span className="text-xs text-blue-600 font-medium">Hoy</span>}
            </div>
            <button onClick={handleNextDay} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <button 
             onClick={() => navigate('/create-reservation')}
             className="hidden md:flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-medium shadow-lg shadow-blue-500/30 transition-all"
          >
            <Plus className="w-4 h-4" /> Nueva Reserva
          </button>
        </div>

        {/* --- GRILLA DEL CALENDARIO (SCROLLABLE) --- */}
        <div className="flex-1 overflow-auto bg-white dark:bg-[#151A20] rounded-2xl border border-gray-200 dark:border-[#232A36] shadow-sm relative">
            <div className="min-w-[800px]">
                
                {/* 1. CABECERA DE SALAS (Siempre visible) */}
                <div className="sticky top-0 z-20 flex border-b border-gray-200 dark:border-[#232A36] bg-gray-50 dark:bg-[#0F1318]">
                    <div className="w-16 flex-shrink-0 border-r border-gray-200 dark:border-[#232A36] bg-gray-50 dark:bg-[#0F1318]" />
                    {rooms.map(room => (
                        <div key={room.id} className="flex-1 p-3 text-center border-r border-gray-200 dark:border-[#232A36] min-w-[150px]">
                            <h4 className="font-semibold text-sm text-gray-800 dark:text-gray-100 truncate">{room.nombre}</h4>
                            <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1">
                                <span>Cap: {room.capacidad || '?'}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* 2. CUERPO DE LA GRILLA O LOADING */}
                {loading ? (
                    // ✅ MOSTRAR ESQUELETO SI ESTÁ CARGANDO
                    <CalendarSkeleton roomCount={rooms.length} />
                ) : (
                    // ✅ MOSTRAR GRILLA REAL SI YA CARGÓ
                    <div className="relative flex" style={{ height: (hours.length * HOUR_HEIGHT) + 'px' }}>
                        
                        {/* COLUMNA DE HORAS */}
                        <div className="w-16 flex-shrink-0 border-r border-gray-200 dark:border-[#232A36] bg-gray-50/50 dark:bg-[#0F1318]/50">
                            {hours.map(h => (
                                <div key={h} className="relative border-b border-gray-100 dark:border-[#232A36]/50" style={{ height: HOUR_HEIGHT }}>
                                    <span className="absolute -top-3 left-2 text-xs font-medium text-gray-400">
                                        {h}:00
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* COLUMNAS DE SALAS */}
                        {rooms.map(room => {
                            const roomEvents = dailyReservations.filter(r => r.room?.id === room.id);

                            return (
                                <div 
                                    key={room.id} 
                                    className="flex-1 relative border-r border-gray-200 dark:border-[#232A36] min-w-[150px] cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                                    onClick={(e) => handleSlotClick(e, room)}
                                >
                                    {/* Líneas guía */}
                                    {hours.map(h => (
                                        <div key={h} className="border-b border-gray-100 dark:border-[#232A36]/30 w-full" style={{ height: HOUR_HEIGHT }} />
                                    ))}

                                    {/* Eventos */}
                                    {roomEvents.map(ev => {
                                        const style = getEventStyle(ev.startTime, ev.endTime);
                                        if (!style) return null; 
                                        
                                        return (
                                            <motion.div
                                                key={ev.id}
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                whileHover={{ scale: 1.02, zIndex: 10 }}
                                                onClick={(e) => { e.stopPropagation(); navigate(`/create-reservation/${ev.id}`); }}
                                                className="absolute left-1 right-1 rounded-lg p-2 text-xs border cursor-pointer overflow-hidden
                                                           bg-blue-100 border-blue-200 text-blue-800 
                                                           dark:bg-blue-900/40 dark:border-blue-700 dark:text-blue-100 shadow-sm"
                                                style={style}
                                            >
                                                <div className="font-bold truncate">{ev.title}</div>
                                                <div className="text-blue-600 dark:text-blue-300 text-[10px] flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {ev.startTime.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} - 
                                                    {ev.endTime.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                                                </div>
                                                <div className="mt-1 opacity-80 truncate">{ev.user}</div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
      </main>
    </div>
  );
}