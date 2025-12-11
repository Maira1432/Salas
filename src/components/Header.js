// src/components/Header.js
import React from 'react';
import { motion } from 'framer-motion';
// Aseguramos que Calendar esté disponible, ya que se usa CalendarIcon
import { Home, Calendar as CalendarIcon, Settings, User } from 'lucide-react'; 
import { NavLink, useLocation } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import { msalInstance } from '../msalConfig';
import { isAdmin } from '../utils/admins';


export default function Header({ currentPath: propPath }) {
  const location = useLocation();
  const currentPath = propPath ?? location.pathname;
  
  // 1. Obtener estado de seguridad (Directamente en el cuerpo del componente)
  const account = msalInstance.getActiveAccount();
  const userIsAdmin = isAdmin(account?.username);

  // 2. Definir items de navegación (Excluyendo 'Admin' por defecto)
  const navItems = [
    //{ path: '/', icon: Home, label: 'Crear Reserva' },
    { path: '/calendar', icon: CalendarIcon, label: 'Calendario' }, // ✅ NUEVO ENLACE
    { path: '/my-reservations', icon: User, label: 'Mis Reservas' },
  ];

  // 3. Agregar 'Admin' SOLO si tiene permisos
  if (userIsAdmin) {
    navItems.push({ path: '/admin', icon: Settings, label: 'Admin' });
  }

  return (
    <motion.header
      className="bg-white/80 dark:bg-white/5 backdrop-blur-xl border-b border-gray-200/60 dark:border-gray-800/50 shadow-lg transition-colors"
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.35 }}
    >
      <div className="mx-auto max-w-6xl px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Brand */}
          <motion.div className="flex items-center gap-3" whileHover={{ scale: 1.03 }}>
            <CalendarIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-purple-400">
              Salas FYCO
            </h1>
          </motion.div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            <nav className="flex items-center gap-2">
              {/* 4. Mapeo final sobre el arreglo filtrado/condicional */}
              {navItems.map(({ path, icon: Icon, label }) => (
                <NavLink
                  key={path}
                  to={path}
                  end
                  className={({ isActive }) =>
                    [
                      'flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200',
                      isActive || currentPath === path
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300 shadow-sm'
                        : 'text-gray-700 hover:text-blue-700 hover:bg-blue-50 dark:text-gray-300 dark:hover:text-blue-300 dark:hover:bg-white/10',
                      'border border-transparent hover:border-blue-200/60 dark:hover:border-white/10',
                    ].join(' ')
                  }
                >
                  <Icon className="w-5 h-5" />
                  <span>{label}</span>
                </NavLink>
              ))}
            </nav>
          </div>
        </div>
        {/* ... el resto del código ... */}
      </div>
    </motion.header>
  );
}