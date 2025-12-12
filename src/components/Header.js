import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Header = ({ currentPath }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Definimos las rutas según tu App.js
  const navLinks = [
    { name: 'Calendario', path: '/calendar' },
    { name: 'Crear Reserva', path: '/create-reservation' },
    { name: 'Mis Reservas', path: '/my-reservations' },
    { name: 'Admin', path: '/admin' },
  ];

  // Función para saber si un link está activo
  const isActive = (path) => currentPath === path;

  return (
    <header className="bg-white dark:bg-[#161b22] border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          
          {/* 1. LOGO */}
          <div className="flex-shrink-0 flex items-center cursor-pointer" onClick={() => navigate('/')}>
            <span className="font-bold text-xl text-indigo-600 dark:text-indigo-400">
              FYCO Reservas
            </span>
          </div>

          {/* 2. MENÚ ESCRITORIO (Se oculta en móvil 'hidden', se ve en PC 'md:flex') */}
          <nav className="hidden md:flex space-x-4 items-center">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  isActive(link.path)
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* 3. BOTÓN HAMBURGUESA (Solo visible en móvil 'md:hidden') */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700 focus:outline-none"
            >
              <span className="sr-only">Abrir menú</span>
              {/* Icono cambia: X si está abierto, Hamburguesa si está cerrado */}
              {isMenuOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 4. MENÚ DESPLEGABLE MÓVIL (Lógica condicional) */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-white dark:bg-[#161b22] border-b border-gray-200 dark:border-gray-800 shadow-lg z-50">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMenuOpen(false)} // Cierra el menú al hacer clic
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive(link.path)
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;