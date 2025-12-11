// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';
import Header from './components/Header';
import CreateReservation from './pages/CreateReservation';
import MyReservations from './pages/MyReservations';
import AdminPanel from './pages/AdminPanel';
import { ReservationsProvider } from './context/ReservationsContext';
import { msalInstance } from './msalConfig';
import { EventType } from '@azure/msal-browser';
import { useDarkMode } from './hooks/useDarkMode';
import RoomCalendar from './pages/RoomCalendar';
import { Toaster } from 'sonner'; // ✅ Importamos Sonner

const AppContent = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Hook de modo oscuro (si lo usas en el futuro para clases CSS globales)
  useDarkMode();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [setReservationToEdit] = useState(null); // Estado local (podría eliminarse si AdminPanel se actualiza)

  // Lógica de MSAL (Login/Logout events)
  useEffect(() => {
    const cbId = msalInstance.addEventCallback((event) => {
      if (
        event.eventType === EventType.LOGIN_SUCCESS ||
        event.eventType === EventType.ACQUIRE_TOKEN_SUCCESS ||
        event.eventType === EventType.HANDLE_REDIRECT_END ||
        event.eventType === EventType.LOGOUT_SUCCESS
      ) {
        // Forzamos re-render si cambia el estado de auth
      }
    });
    return () => { if (cbId) msalInstance.removeEventCallback(cbId); };
  }, []);

  const account = msalInstance.getActiveAccount() || msalInstance.getAllAccounts()[0] || null;
  const userName = account?.username || 'Invitado';

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const currentPath = location.pathname;

  // Manejador legado para AdminPanel (si aún lo usa)
  const handleEditReservation = (reservation) => {
    setReservationToEdit(reservation);
    navigate(`/create-reservation/${reservation.id}`); // Mejor dirigimos a la ruta con ID
  };

  return (
    <div className="min-h-screen text-gray-900 dark:text-dark-text-primary bg-gradient-to-b from-[#EEF2FF] to-white dark:from-[#0D1117] dark:to-[#0B1220]">
      <Header currentPath={currentPath} />
      
      <Routes>
        {/* RUTA BASE: Redirigimos a Calendario */}
        <Route path="/" element={<Navigate to="/calendar" replace />} />
        
        {/* CREAR RESERVA (Nueva) */}
        <Route
          path="/create-reservation"
          element={
            <CreateReservation
              userName={userName}
              sidebarOpen={sidebarOpen}
              toggleSidebar={toggleSidebar}
              currentPath={currentPath}
            />
          }
        />

        {/* EDITAR RESERVA (Por ID) */}
        <Route
          path="/create-reservation/:id"
          element={
            <CreateReservation
              userName={userName}
              sidebarOpen={sidebarOpen}
              toggleSidebar={toggleSidebar}
              currentPath={currentPath}
            />
          }
        />
        
        {/* CALENDARIO */}
        <Route 
          path="/calendar" 
          element={
            <RoomCalendar 
               sidebarOpen={sidebarOpen} 
               toggleSidebar={toggleSidebar} 
               currentPath="/calendar"
               userName={userName}
            />
          } 
       />

        {/* MIS RESERVAS */}
        <Route
          path="/my-reservations"
          element={
            <MyReservations
              userName={userName}
              sidebarOpen={sidebarOpen}
              toggleSidebar={toggleSidebar}
              currentPath={currentPath}
            />
          }
        />
        
        {/* ADMIN */}
        <Route
          path="/admin"
          element={
            <AdminPanel
              sidebarOpen={sidebarOpen}
              toggleSidebar={toggleSidebar}
              currentPath={currentPath}
              onEdit={handleEditReservation}
            />
          }
        />
      </Routes>
    </div>
  );
};

const App = () => (
  <Router>
    <ReservationsProvider>
      <AppContent />
    </ReservationsProvider>
    {/* ✅ TOASTER GLOBAL: Aquí es donde debe estar */}
    <Toaster position="top-right" richColors closeButton />
  </Router>
);

export default App;