import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { initTheme } from './utils/theme';
import { msalInstance } from './msalConfig'; // <--- IMPORTANTE: Importamos la instancia

// Estilos
import './styles.css';
import 'react-day-picker/dist/style.css';

// Inicializar tema antes de renderizar
initTheme();

const root = ReactDOM.createRoot(document.getElementById('root'));

// --- EL CAMBIO MAGICO ---
// 1. Esperamos a que MSAL encienda motores (initialize)
msalInstance.initialize().then(() => {

  // 2. Revisamos si acabamos de volver de Microsoft (handleRedirectPromise)
  msalInstance.handleRedirectPromise().then((response) => {
    
    // Si response existe, es que el login fue exitoso y trajo datos.
    if (response && response.account) {
        console.log("¡Login exitoso! Cuenta activa:", response.account.username);
        msalInstance.setActiveAccount(response.account);
    }

    // 3. SOLO AHORA renderizamos la App (cuando ya sabemos si hay usuario o no)
    root.render(
      // Puedes quitar StrictMode si te da problemas de doble render, pero es útil en dev
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );

  }).catch(error => {
    console.error("Error al procesar el redirect:", error);
    // Renderizamos igual para que no quede la pantalla blanca, aunque haya error
    root.render(<App />);
  });

});