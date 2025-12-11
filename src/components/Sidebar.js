// src/components/Sidebar.js
import React from 'react';
import { motion } from 'framer-motion';
import { NavLink } from 'react-router-dom';
import { Home, Calendar, Settings, User, X } from 'lucide-react';
// 1. IMPORTAR FUNCIONES DE SEGURIDAD
import { msalInstance } from '../msalConfig';
import { isAdmin } from '../utils/admins';

const MotionNavLink = motion(NavLink);

const Sidebar = ({ isOpen, onClose }) => {
  // 2. VERIFICAR SI EL USUARIO ES ADMIN
  const account = msalInstance.getActiveAccount();
  const userIsAdmin = isAdmin(account?.username);

  // 3. DEFINIR ITEMS DEL MENÚ
  const navItems = [
    //{ path: '/', icon: Home, label: 'Crear Reserva' },
    { path: '/calendar', icon: Calendar, label: 'Calendario' }, // ✅ Nuevo botón
    { path: '/my-reservations', icon: User, label: 'Mis Reservas' },
  ];

  // 4. SOLO AGREGAR "ADMIN" SI TIENE PERMISOS
  if (userIsAdmin) {
    navItems.push({ path: '/admin', icon: Settings, label: 'Admin' });
  }

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <motion.button
          type="button"
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          aria-label="Cerrar menú"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
      )}

      {/* Drawer */}
      <motion.aside
        className="fixed inset-y-0 left-0 z-50 w-64 bg-white/90 backdrop-blur-xl border-r border-gray-200/50 shadow-xl md:hidden"
        role="dialog"
        aria-modal="true"
        aria-label="Menú de navegación"
        initial={false}
        animate={{ x: isOpen ? 0 : -256 }}
        transition={{ duration: 0.28 }}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Calendar className="w-6 h-6 text-blue-600" aria-hidden="true" />
            <h2 className="text-xl font-bold text-gray-800">Salas FYCO</h2>
          </div>
          <motion.button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100"
            aria-label="Cerrar menú"
            whileTap={{ scale: 0.95 }}
          >
            <X className="w-6 h-6 text-gray-600" aria-hidden="true" />
          </motion.button>
        </div>

        <nav className="p-4 space-y-2" role="navigation" aria-label="Navegación móvil">
          {navItems.map(({ path, icon: Icon, label }) => (
            <MotionNavLink
              key={path}
              to={path}
              onClick={onClose}
              className={({ isActive }) =>
                [
                  'flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-300',
                  isActive
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:text-blue-700 hover:bg-blue-50',
                ].join(' ')
              }
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              aria-label={label}
            >
              <Icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
              <span className="text-sm">{label}</span>
            </MotionNavLink>
          ))}
        </nav>
      </motion.aside>
    </>
  );
};

export default Sidebar;