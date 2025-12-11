// src/components/AdminDashboard.jsx
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Users, Calendar, Award } from 'lucide-react';

export default function AdminDashboard({ reservations = [] }) {
  
  // --- CÁLCULOS ESTADÍSTICOS ---
  const stats = useMemo(() => {
    const total = reservations.length;
    if (total === 0) return null;

    // 1. Sala más popular
    const roomCounts = {};
    reservations.forEach(r => {
        const name = r.room?.nombre || 'Desconocida';
        roomCounts[name] = (roomCounts[name] || 0) + 1;
    });
    const topRoomName = Object.keys(roomCounts).reduce((a, b) => roomCounts[a] > roomCounts[b] ? a : b);
    
    // 2. Usuario más activo
    const userCounts = {};
    reservations.forEach(r => {
        // Asumiendo que r.user es el nombre o email
        const user = r.user || 'Anónimo'; 
        userCounts[user] = (userCounts[user] || 0) + 1;
    });
    const topUserName = Object.keys(userCounts).reduce((a, b) => userCounts[a] > userCounts[b] ? a : b);

    // 3. Horas totales reservadas
    const totalMinutes = reservations.reduce((acc, r) => {
        const start = new Date(r.startTime);
        const end = new Date(r.endTime);
        return acc + (end - start) / 60000;
    }, 0);
    const totalHours = Math.round(totalMinutes / 60);

    return {
        total,
        topRoom: { name: topRoomName, count: roomCounts[topRoomName] },
        topUser: { name: topUserName, count: userCounts[topUserName] },
        totalHours
    };
  }, [reservations]);

  if (!stats) {
    return (
      <div className="p-8 text-center text-gray-500 bg-white dark:bg-[#151A20] rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
        No hay suficientes datos para generar estadísticas.
      </div>
    );
  }

  // --- COMPONENTE DE TARJETA ---
  const StatCard = ({ title, value, subtext, icon: Icon, colorClass }) => (
    <motion.div 
      whileHover={{ y: -4 }}
      className="p-6 bg-white dark:bg-[#151A20] border border-gray-100 dark:border-[#232A36] rounded-2xl shadow-sm relative overflow-hidden"
    >
      <div className={`absolute top-0 right-0 p-4 opacity-10 ${colorClass}`}>
        <Icon className="w-16 h-16" />
      </div>
      <div className="flex items-center gap-4 mb-4">
        <div className={`p-3 rounded-xl ${colorClass} bg-opacity-10 text-opacity-100`}>
          <Icon className={`w-6 h-6 ${colorClass.replace('bg-', 'text-')}`} />
        </div>
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{title}</h3>
      </div>
      <div>
        <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{value}</div>
        <div className="text-sm text-gray-500 dark:text-gray-400">{subtext}</div>
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
            title="Reservas Totales" 
            value={stats.total} 
            subtext="En el periodo actual"
            icon={Calendar}
            colorClass="bg-blue-500 text-blue-600"
        />
        <StatCard 
            title="Sala Más Usada" 
            value={stats.topRoom.count} 
            subtext={stats.topRoom.name}
            icon={BarChart3}
            colorClass="bg-purple-500 text-purple-600"
        />
        <StatCard 
            title="Usuario Top" 
            value={stats.topUser.count} 
            subtext={stats.topUser.name}
            icon={Award}
            colorClass="bg-amber-500 text-amber-600"
        />
        <StatCard 
            title="Horas Ocupadas" 
            value={`${stats.totalHours}h`} 
            subtext="Tiempo total de uso"
            icon={TrendingUp}
            colorClass="bg-emerald-500 text-emerald-600"
        />
      </div>

      {/* Aquí podrías agregar gráficas más complejas en el futuro */}
    </div>
  );
}