// src/components/RoomsManager.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Edit2, Save, X, Mail, MapPin, Users, Monitor, Projector, PenTool, Wifi, Video, Snowflake } from 'lucide-react';
import { useReservations } from '../context/ReservationsContext';

// Lista de recursos disponibles para seleccionar
const AVAILABLE_FEATURES = [
    { label: 'TV / Monitor', icon: Monitor },
    { label: 'Video Conferencia', icon: Video },
    { label: 'Tablero', icon: PenTool },
    { label: 'Proyector', icon: Projector },
    { label: 'Aire Acondicionado', icon: Snowflake },
    { label: 'WiFi Dedicado', icon: Wifi },
];

export default function RoomsManager() {
  const { rooms, addOrUpdateRoom, deleteRoom } = useReservations();
  const [editingId, setEditingId] = useState(null);
  
  // Estado del formulario ampliado
  const [formData, setFormData] = useState({ 
      id: '', nombre: '', email: '', capacidad: 4, recursos: [] 
  });

  const handleEdit = (room) => {
    setEditingId(room.id);
    // Aseguramos que recursos sea un array y capacidad un número
    setFormData({
        ...room,
        capacidad: room.capacidad || 4,
        recursos: room.recursos || []
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({ id: '', nombre: '', email: '', capacidad: 4, recursos: [] });
  };

  const handleSave = () => {
    if (!formData.nombre.trim()) return;
    addOrUpdateRoom(formData);
    handleCancel();
  };

  // Función para activar/desactivar recursos
  const toggleFeature = (featureLabel) => {
      setFormData(prev => {
          const current = prev.recursos || [];
          if (current.includes(featureLabel)) {
              return { ...prev, recursos: current.filter(f => f !== featureLabel) };
          } else {
              return { ...prev, recursos: [...current, featureLabel] };
          }
      });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
          Listado de Salas
        </h3>
        {!editingId && (
          <button
            onClick={() => { setEditingId('NEW'); setFormData({ id: '', nombre: '', email: '', capacidad: 4, recursos: [] }); }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-500/20"
          >
            <Plus className="w-4 h-4" /> Nueva Sala
          </button>
        )}
      </div>

      {/* --- FORMULARIO DE EDICIÓN / CREACIÓN --- */}
      {editingId && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
          className="p-5 border border-blue-200 dark:border-blue-500/30 bg-blue-50/50 dark:bg-blue-500/10 rounded-2xl space-y-5 overflow-hidden"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Nombre */}
            <div>
              <label className="text-xs font-semibold uppercase text-gray-500 mb-1 block">Nombre de la Sala</label>
              <div className="flex items-center gap-2 bg-white dark:bg-[#0F1318] border border-gray-200 dark:border-[#232A36] rounded-xl px-3 h-11">
                <MapPin className="w-4 h-4 text-gray-400" />
                <input 
                  value={formData.nombre}
                  onChange={e => setFormData({...formData, nombre: e.target.value})}
                  placeholder="Ej: Sala de Juntas"
                  className="bg-transparent outline-none w-full text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="text-xs font-semibold uppercase text-gray-500 mb-1 block">Email (Outlook)</label>
              <div className="flex items-center gap-2 bg-white dark:bg-[#0F1318] border border-gray-200 dark:border-[#232A36] rounded-xl px-3 h-11">
                <Mail className="w-4 h-4 text-gray-400" />
                <input 
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  placeholder="sala@dominio.com"
                  className="bg-transparent outline-none w-full text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* Capacidad */}
            <div>
              <label className="text-xs font-semibold uppercase text-gray-500 mb-1 block">Capacidad (Personas)</label>
              <div className="flex items-center gap-2 bg-white dark:bg-[#0F1318] border border-gray-200 dark:border-[#232A36] rounded-xl px-3 h-11">
                <Users className="w-4 h-4 text-gray-400" />
                <input 
                  type="number"
                  min="1"
                  value={formData.capacidad}
                  onChange={e => setFormData({...formData, capacidad: parseInt(e.target.value) || 0})}
                  className="bg-transparent outline-none w-full text-sm text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>

            {/* Equipamiento (Checkboxes visuales) */}
            <div className="md:col-span-2">
                <label className="text-xs font-semibold uppercase text-gray-500 mb-2 block">Equipamiento Disponible</label>
                <div className="flex flex-wrap gap-2">
                    {AVAILABLE_FEATURES.map((feat) => {
                        const isSelected = formData.recursos?.includes(feat.label);
                        const Icon = feat.icon;
                        return (
                            <button
                                key={feat.label}
                                onClick={() => toggleFeature(feat.label)}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all border ${
                                    isSelected 
                                    ? 'bg-blue-100 border-blue-200 text-blue-700 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-300' 
                                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 dark:bg-[#0F1318] dark:border-[#232A36] dark:text-gray-400 dark:hover:bg-[#1A2028]'
                                }`}
                            >
                                <Icon className="w-3.5 h-3.5" />
                                {feat.label}
                            </button>
                        );
                    })}
                </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-blue-200/50 dark:border-blue-500/20">
            <button onClick={handleCancel} className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-200/50 dark:hover:bg-white/5 rounded-lg text-sm transition">Cancelar</button>
            <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm shadow-md transition transform hover:scale-105">
              <Save className="w-4 h-4" /> Guardar Cambios
            </button>
          </div>
        </motion.div>
      )}

      {/* --- LISTA DE SALAS --- */}
      <div className="grid gap-3">
        {rooms.map(room => (
          <motion.div 
            key={room.id}
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="group flex flex-col md:flex-row md:items-center justify-between p-4 bg-white dark:bg-[#151A20] border border-gray-100 dark:border-[#232A36] rounded-2xl shadow-sm hover:shadow-md transition-all gap-4"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-lg shadow-sm">
                {room.nombre.charAt(0)}
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100">{room.nombre}</h4>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" /> {room.capacidad || 4} Personas
                    </span>
                    <span className="hidden md:inline text-gray-300">|</span>
                    <span className="truncate max-w-[200px]">{room.email || 'Sin correo'}</span>
                </div>
                {/* Visualizar iconos de recursos pequeños */}
                <div className="flex items-center gap-2 mt-2">
                    {room.recursos && room.recursos.map(r => {
                        const iconData = AVAILABLE_FEATURES.find(f => f.label === r);
                        if (!iconData) return null;
                        const Icon = iconData.icon;
                        return <Icon key={r} className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" title={r} />
                    })}
                </div>
              </div>
            </div>
            
            <div className="flex gap-2 self-end md:self-center opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={() => handleEdit(room)}
                className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition"
                title="Editar"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button 
                onClick={() => { if(window.confirm('¿Estás seguro de borrar esta sala?')) deleteRoom(room.id) }}
                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                title="Eliminar"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}