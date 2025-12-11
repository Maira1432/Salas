import React, { createContext, useContext, useReducer } from 'react';
// IMPORTACIONES NECESARIAS PARA HABLAR CON MICROSOFT
import { msalInstance, loginRequest } from './msalConfig'; 

const Ctx = createContext();

function reducer(state, action) {
  switch (action.type) {
    case 'REMOVE_BY_ID':
      // Asumimos que la API de eliminación se llama antes de este dispatch
      return state.filter(r => (r.id || r._id) !== action.id);
    case 'ADD_OR_UPDATE_SUCCESS': { // Cambiamos el nombre del type para reflejar éxito API
      const r = action.reservation;
      // Usamos el ID devuelto por la API (r.id) para actualizar
      const id = r.id || r._id;
      const others = state.filter(x => (x.id || x._id) !== id);
      return [...others, r];
    }
    default:
      return state;
  }
}

// ----------------------------------------------------------------------------------
// EL PROVEEDOR CON LA LÓGICA ASÍNCRONA
// ----------------------------------------------------------------------------------
export function ReservationsProvider({ children, initial = [] }) {
  const [state, dispatch] = useReducer(reducer, initial);

  // La nueva función asíncrona que habla con Microsoft
  const addOrUpdate = async (reservationPayload) => {
    
    // 1. ADQUIRIR TOKEN SILENCIOSAMENTE
    const account = msalInstance.getActiveAccount();
    if (!account) {
      // Si no hay cuenta, no podemos continuar. Esto nunca debería pasar si el botón está bloqueado.
      throw new Error("Debe iniciar sesión para crear una reserva.");
    }
    
    const tokenResponse = await msalInstance.acquireTokenSilent({
      ...loginRequest,
      account: account
    });
    const token = tokenResponse.accessToken;

    // 2. PREPARAR EL PAYLOAD PARA MICROSOFT GRAPH
    // La data de la reserva debe estar limpia y en formato ISO (viene así de ReservationForm)
    const event = {
        subject: reservationPayload.title,
        body: { contentType: "HTML", content: reservationPayload.description || 'Reserva de Sala FYCO' },
        start: {
            dateTime: reservationPayload.startTime, // Formato ISO 8601
            timeZone: "America/Bogota" // O la zona horaria que uses
        },
        end: {
            dateTime: reservationPayload.endTime,
            timeZone: "America/Bogota"
        },
        location: {
            displayName: reservationPayload.room.nombre // Nombre de la sala
        },
        attendees: [
          // La sala como recurso es CLAVE
          {
            emailAddress: { 
                address: reservationPayload, // <<--- ¡CAMBIA ESTO!
                name: reservationPayload.room.nombre
            },
            type: "resource"
          },
        ]
    };
    
    // 3. LLAMAR A MICROSOFT GRAPH (POST)
    const response = await fetch('https://graph.microsoft.com/v1.0/me/events', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(event)
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error("Error Graph API:", errorData);
        // Lanzamos el error para que ReservationForm lo atrape
        throw new Error(`Error al guardar: ${errorData.error.message}`);
    }

    const apiResponse = await response.json();

    // 4. ACTUALIZAR ESTADO LOCAL CON LA RESPUESTA (incluye el ID final)
    dispatch({ type: 'ADD_OR_UPDATE_SUCCESS', reservation: apiResponse });
    
    return apiResponse;
  };

  // La función de eliminación debe ser ASYNC también
  const removeById = (id) => {
    // Aquí debe ir la lógica para llamar al API de DELETE antes del dispatch
    // dispatch({ type: 'REMOVE_BY_ID', id });
  };
  
  // ----------------------------------------------------------------------------------

  return (
    <Ctx.Provider value={{ reservations: state, removeById, addOrUpdate }}>
      {children}
    </Ctx.Provider>
  );
}

export function useReservations() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useReservations debe usarse dentro de <ReservationsProvider>');
  return ctx;
}