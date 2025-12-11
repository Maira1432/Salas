// src/pages/CreateReservation.js

import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'; // ✅ Importamos useSearchParams
import Sidebar from '../components/Sidebar';
import ReservationForm from '../components/ReservationForm';
import { useReservations } from '../context/ReservationsContext';
import { msalInstance, loginRequest } from '../msalConfig';

export default function CreateReservation({ sidebarOpen, toggleSidebar, currentPath, userName }) {
  const navigate = useNavigate();
  const { id } = useParams(); // Para edición (/create-reservation/:id)
  const [searchParams] = useSearchParams(); // ✅ Para lectura de URL (?roomId=1)
  
  const { reservations, addOrUpdate } = useReservations();
  const [reservationToEdit, setReservationToEdit] = useState(null);
  const [prefillData, setPrefillData] = useState(null);

  // 1. Manejar si es EDICIÓN (viene un ID en la ruta)
  useEffect(() => {
    if (id && reservations.length > 0) {
      const found = reservations.find(r => r.id === id);
      if (found) {
        setReservationToEdit(found);
      }
    }
  }, [id, reservations]);

  // 2. Manejar si es CREACIÓN DESDE QR O CALENDARIO (viene params en la URL)
  useEffect(() => {
    // Si NO estamos editando, miramos los parámetros de la URL
    if (!id) {
      const roomIdParam = searchParams.get('roomId');
      const dateParam = searchParams.get('date');
      const startParam = searchParams.get('start');
      
      // Si hay al menos un roomId, preparamos los datos
      if (roomIdParam) {
        // Calcular hora actual por defecto si no viene en el QR
        const now = new Date();
        const currentHour = now.getHours();
        const nextHour = currentHour + 1;
        
        // Formatear HH:mm
        const defaultStart = `${String(currentHour).padStart(2, '0')}:00`;
        // Construir fecha ISO para el endTime (requerido por el Formulario)
        const defaultEndDate = new Date();
        defaultEndDate.setHours(nextHour, 0, 0, 0);

        setPrefillData({
          roomId: roomIdParam,
          date: dateParam || now.toISOString().split('T')[0],
          start: startParam || defaultStart,
          endTime: defaultEndDate.toISOString() // El formulario espera esto para calcular la hora fin
        });
      }
    }
  }, [id, searchParams]);

  const handleUpsert = async (payload) => {
    await addOrUpdate(payload);
    navigate('/calendar');
  };

  const handleLogin = async () => {
    try {
      await msalInstance.loginRedirect(loginRequest);
    } catch (error) {
      console.error("Error login:", error);
    }
  };

  return (
    <div className="flex h-screen bg-[#F3F4F6] dark:bg-[#0D1117]">
      <Sidebar isOpen={sidebarOpen} onClose={toggleSidebar} currentPath={currentPath} />

      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-3xl mx-auto">
          {/* Header simple */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                {id ? 'Editar Reserva' : 'Nueva Reserva'}
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                {userName !== 'Invitado' ? `Hola, ${userName}` : 'Inicia sesión para reservar'}
              </p>
            </div>
            {userName === 'Invitado' && (
               <button 
                 onClick={handleLogin}
                 className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
               >
                 Iniciar Sesión
               </button>
            )}
          </div>

          {/* Formulario */}
          <ReservationForm 
            reservationToEdit={reservationToEdit}
            prefillData={prefillData} // ✅ Pasamos los datos del QR aquí
            onUpsert={handleUpsert}
            onCancel={() => navigate('/calendar')}
            userName={userName}
          />
        </div>
      </main>
    </div>
  );
}