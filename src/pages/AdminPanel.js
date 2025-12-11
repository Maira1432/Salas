// src/pages/AdminPanel.js
import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Menu, Search, RefreshCw, FileDown, LayoutGrid, List, LayoutDashboard, ShieldAlert } from 'lucide-react'; // Agregué ShieldAlert para el icono de bloqueo
import Sidebar from '../components/Sidebar';
import ReservationList from '../components/ReservationList';
import ReservationForm from '../components/ReservationForm';
import RoomsManager from '../components/RoomsManager';
import { useReservations } from '../context/ReservationsContext';
import { deleteReservationInOutlookIfAny } from '../utils/deleteReservation';
import { downloadReservationsCSV } from '../utils/csv';
import AdminDashboard from '../components/AdminDashboard';
import { msalInstance } from '../msalConfig'; 
import { isAdmin } from '../utils/admins';    

// ... (tus helpers useDebounced y groupByDay se quedan igual) ...
const useDebounced = (value, ms = 250) => {
  const [v, setV] = useState(value);
  useEffect(() => { const t = setTimeout(() => setV(value), ms); return () => clearTimeout(t); }, [value, ms]);
  return v;
};
const groupByDay = (list) => list.reduce((acc, r) => {
    const d = new Date(r.startTime);
    const key = d.toLocaleDateString('es-ES', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
    (acc[key] ||= []).push(r); return acc;
}, {});
// --------------------------------

const AdminPanel = ({ sidebarOpen, toggleSidebar, currentPath }) => {
  
  // ===========================================================================
  // 1. 🔒 LÓGICA DE SEGURIDAD (Esto es lo que faltaba)
  // ===========================================================================
  const account = msalInstance.getActiveAccount();
  const userIsAdmin = isAdmin(account?.username);

  // Hooks del contexto (se ejecutan siempre, pero el renderizado se bloquea abajo)
  const { reservations, addOrUpdate, removeById, rooms } = useReservations();

  // 2. Estado para las pestañas (Vistas)
  const [activeTab, setActiveTab] = useState('reservations'); 
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRoom, setFilterRoom] = useState('all');
  const [filterDate, setFilterDate] = useState('');
  const [editing, setEditing] = useState(null);
  
  // Helpers de filtrado
  const debounced = useDebounced(searchTerm, 250);
  const filtered = useMemo(() => {
    const q = debounced.trim().toLowerCase();
    return reservations.filter((r) => {
      const roomName = r.room?.nombre || '';
      const textOk = r.title.toLowerCase().includes(q) || r.user.toLowerCase().includes(q) || roomName.toLowerCase().includes(q);
      const roomOk = filterRoom === 'all' ? true : r.room?.id === filterRoom;
      const dateOk = filterDate ? new Date(r.startTime).toISOString().slice(0, 10) === filterDate : true;
      return textOk && roomOk && dateOk;
    });
  }, [reservations, debounced, filterRoom, filterDate]);

  const handleDelete = async (id) => {
    const target = reservations.find((r) => r.id === id);
    if (target) await deleteReservationInOutlookIfAny(target);
    removeById(id);
  };

  const grouped = useMemo(() => groupByDay(filtered), [filtered]);
  const resetFilters = () => { setSearchTerm(''); setFilterRoom('all'); setFilterDate(''); };

  // ===========================================================================
  // 3. 🚫 BLOQUEO DE RENDERIZADO (Si no es admin, muestra esto y NO el panel)
  // ===========================================================================
  if (!userIsAdmin) {
    return (
      <div className="bg-transparent dark:bg-transparent text-inherit min-h-screen flex flex-col items-center justify-center p-6 text-center">
        {/* Mantenemos el Sidebar para que pueda navegar a otro lado */}
        <Sidebar isOpen={sidebarOpen} onClose={toggleSidebar} currentPath={currentPath} />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} 
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-[#151A20] p-8 rounded-3xl shadow-2xl border border-red-100 dark:border-red-900/30 max-w-md mt-10"
        >
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Acceso Restringido</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Lo sentimos, esta sección es exclusiva para administradores del sistema.
          </p>
          <button 
            onClick={() => window.location.href = '/my-reservations'}
            className="bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 transition w-full font-medium shadow-lg shadow-blue-500/30"
          >
            Volver a Mis Reservas
          </button>
        </motion.div>
      </div>
    );
  }

  // ===========================================================================
  // 4. RENDERIZADO DEL PANEL (Solo llega aquí si es Admin)
  // ===========================================================================
  return (
    <div className="bg-transparent dark:bg-transparent text-inherit">
      <Sidebar isOpen={sidebarOpen} onClose={toggleSidebar} currentPath={currentPath} />

      <motion.div className="container mx-auto px-4 py-8 max-w-6xl" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        
        {/* Encabezado y Pestañas */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <button onClick={toggleSidebar} className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10">
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-bold tracking-tight">Panel de Administración</h2>
          </div>
          
          {/* Selector de Vistas (Tabs) */}
          <div className="flex p-1 bg-gray-100 dark:bg-[#151A20] rounded-xl border border-gray-200 dark:border-[#232A36]">
            <button
              onClick={() => setActiveTab('reservations')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'reservations' 
                ? 'bg-white dark:bg-[#232A36] text-blue-600 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <List className="w-4 h-4" /> Reservas
            </button>
            <button
              onClick={() => setActiveTab('rooms')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'rooms' 
                ? 'bg-white dark:bg-[#232A36] text-blue-600 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <LayoutGrid className="w-4 h-4" /> Gestión de Salas
            </button>

            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'dashboard' 
                ? 'bg-white dark:bg-[#232A36] text-blue-600 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" /> Dashboard
          </button>
          </div>
        </div>

        {/* --- CONTENIDO DE LA PESTAÑA: RESERVAS --- */}
        {activeTab === 'reservations' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
            
            {/* Toolbar de Filtros */}
            <div className="p-3 md:p-4 mb-6 rounded-2xl bg-white/70 dark:bg-[#151A20]/90 border border-gray-200/70 dark:border-[#232A36] backdrop-blur shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-[1fr,200px,180px,auto,auto] gap-3 items-center">
                
                {/* Búsqueda */}
                <div className="relative">
                  <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar..."
                    className="w-full h-10 pl-10 pr-3 rounded-xl bg-gray-50 dark:bg-[#0F1318] border border-gray-200 dark:border-[#232A36] focus:ring-2 focus:ring-blue-500/30"
                  />
                </div>

                {/* Filtro de Sala DINÁMICO */}
                <select
                  value={filterRoom}
                  onChange={(e) => setFilterRoom(e.target.value)}
                  className="h-10 px-3 rounded-xl bg-gray-50 dark:bg-[#0F1318] border border-gray-200 dark:border-[#232A36] focus:ring-2 focus:ring-blue-500/30"
                >
                  <option value="all">Todas las salas</option>
                  {rooms.map(r => (
                    <option key={r.id} value={r.id}>{r.nombre}</option>
                  ))}
                </select>

                {/* Filtro Fecha */}
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="h-10 px-3 rounded-xl bg-gray-50 dark:bg-[#0F1318] border border-gray-200 dark:border-[#232A36] focus:ring-2 focus:ring-blue-500/30"
                />

                {/* Botones de Acción */}
                <motion.button onClick={() => downloadReservationsCSV(filtered)} disabled={!filtered.length} className="h-10 px-3 rounded-xl bg-gray-50 dark:bg-[#0F1318] border border-gray-200 dark:border-[#232A36] hover:bg-gray-100 disabled:opacity-50">
                   <FileDown className="w-5 h-5" />
                </motion.button>
                <motion.button onClick={resetFilters} className="h-10 w-10 grid place-items-center rounded-xl bg-gray-50 dark:bg-[#0F1318] border border-gray-200 dark:border-[#232A36] hover:bg-gray-100">
                  ⟲
                </motion.button>
              </div>
            </div>

            {/* Listado de Reservas */}
            {Object.keys(grouped).length === 0 ? (
               <div className="p-10 text-center text-gray-500">No hay reservas con estos filtros.</div>
            ) : (
              Object.entries(grouped).map(([day, items]) => (
                <div key={day} className="mb-6">
                  <div className="sticky top-16 z-10 px-4 py-2 bg-gray-50/90 dark:bg-black/50 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 mb-2">
                     <span className="text-xs font-bold uppercase text-gray-500">{day}</span>
                  </div>
                  <ReservationList reservations={items} onEdit={setEditing} onDelete={handleDelete} onResync={addOrUpdate} isAdmin />
                </div>
              ))
            )}
          </motion.div>
        )}

        {/* --- CONTENIDO DE LA PESTAÑA: SALAS --- */}
        {activeTab === 'rooms' && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }}>
             <RoomsManager />
          </motion.div>
        )}

        {/* Modal de Edición de Reservas */}
        {editing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
             <div className="bg-white dark:bg-[#171B22] w-full max-w-2xl rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
                <ReservationForm
                  userName={editing.user}
                  reservationToEdit={editing}
                  onUpsert={(res) => { addOrUpdate(res); setEditing(null); }}
                  onCancel={() => setEditing(null)}
                />
             </div>
          </div>
        )}

        {/* --- CONTENIDO DE LA PESTAÑA: DASHBOARD --- */}
          {activeTab === 'dashboard' && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.2 }}>
              <AdminDashboard reservations={reservations} />
            </motion.div>
        )}

      </motion.div>
    </div>
  );
};

export default AdminPanel;