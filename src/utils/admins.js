// src/utils/admins.js

// Lista de correos electrónicos que tienen permiso de administrador
// IMPORTANTE: Escríbelos en minúsculas para evitar errores.
export const ADMIN_EMAILS = [
  'maira.quintero@fycotelecom.com',
  //'elsy.contreras@fycotelecom.com',
];

// Función helper para verificar
export const isAdmin = (email) => {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
};