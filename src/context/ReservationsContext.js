// src/context/ReservationsContext.js

import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { msalInstance, loginRequest } from '../msalConfig';

const ReservationsCtx = createContext(null);

// --- UTILIDADES ---
const reviveDates = (reservations) => {
    if (!reservations || !Array.isArray(reservations)) return []; 
    return reservations.map(res => ({
        ...res,
        startTime: res.startTime ? new Date(res.startTime) : undefined,
        endTime: res.endTime ? new Date(res.endTime) : undefined,
    }));
};

const extractRoomName = (evt) => {
    const roomAttendee = evt.attendees?.find(a => a.type === 'resource');
    if (roomAttendee) return roomAttendee.emailAddress?.name;
    if (evt.location?.displayName && evt.location.displayName !== "Sin sala") {
        return evt.location.displayName;
    }
    return 'Sala no especificada';
};

const INITIAL_ROOMS = [
  { id: '1', nombre: 'Círculo de Sabios I', email: 'circulo.sabios1@fycotelecom.com', capacidad: 8 },
  { id: '2', nombre: 'Círculo de Sabios II', email: 'circulo.sabios2@fycotelecom.com', capacidad: 6 },
  { id: '3', nombre: 'Círculo de Sabios III', email: 'circulo.sabios3@fycotelecom.com', capacidad: 4 },
  { id: '4', nombre: 'Consejo de la Tribu', email: 'consejo.tribu@fycotelecom.com', capacidad: 12 },
  { id: '5', nombre: 'Plaza de Conexiones', email: 'plaza.conexiones@fycotelecom.com', capacidad: 20 },
];

export const ReservationsProvider = ({ children }) => {
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true); // ✅ Nuevo estado de carga
    const [refreshTick, setRefreshTick] = useState(0); 

    const [rooms, setRooms] = useState(() => {
        try {
            const saved = localStorage.getItem('app_rooms');
            return saved ? JSON.parse(saved) : INITIAL_ROOMS;
        } catch (e) {
            return INITIAL_ROOMS;
        }
    });

    useEffect(() => {
        localStorage.setItem('app_rooms', JSON.stringify(rooms));
    }, [rooms]);

    // --- CRUD SALAS ---
    const addOrUpdateRoom = useCallback((room) => {
        setRooms(prev => {
            const exists = prev.find(r => r.id === room.id);
            if (exists) return prev.map(r => r.id === room.id ? room : r);
            return [...prev, { ...room, id: room.id || Date.now().toString() }];
        });
    }, []);

    const deleteRoom = useCallback((roomId) => {
        setRooms(prev => prev.filter(r => r.id !== roomId));
    }, []);

    // --- CARGA DE DATOS PRINCIPAL ---
    useEffect(() => {
        let isMounted = true;
        
        async function fetchReservations() {
            const account = msalInstance.getActiveAccount();
            if (!account) {
                if (isMounted) setLoading(false);
                return;
            }

            try {
                if (isMounted) setLoading(true); // Empieza a cargar
                
                const tokenRes = await msalInstance.acquireTokenSilent({ ...loginRequest, account });
                const graphRes = await fetch('https://graph.microsoft.com/v1.0/me/events?$select=subject,start,end,location,id,attendees,organizer,bodyPreview&$top=50', {
                    headers: {
                        'Authorization': `Bearer ${tokenRes.accessToken}`,
                        'Prefer': 'outlook.timezone="America/Bogota"'
                    }
                });
                
                if (!graphRes.ok) throw new Error(`Error Graph: ${graphRes.status}`);
                const data = await graphRes.json();
                
                const mapped = (data.value || []).map(evt => {
                    const extractedName = extractRoomName(evt);
                    
                    // LÓGICA DE DETECTIVE: Recuperar ID
                    const resourceAttendee = evt.attendees?.find(a => a.type === 'resource');
                    const resourceEmail = resourceAttendee?.emailAddress?.address?.toLowerCase();
                    
                    const foundRoom = rooms.find(r => {
                        if (resourceEmail && r.email.toLowerCase() === resourceEmail) return true;
                        const locationEmail = evt.location?.emailAddress?.address?.toLowerCase();
                        if (locationEmail && r.email.toLowerCase() === locationEmail) return true;
                        if (r.nombre === extractedName) return true;
                        if (extractedName && r.nombre.includes(extractedName)) return true;
                        return false;
                    });

                    return {
                        id: evt.id,
                        title: evt.subject,
                        startTime: evt.start.dateTime, 
                        endTime: evt.end.dateTime,
                        room: { nombre: extractedName, id: foundRoom ? foundRoom.id : null },
                        user: evt.organizer?.emailAddress.name,
                        attendees: evt.attendees || [],
                        location: evt.location?.displayName || ''
                    };
                });

                if (isMounted) setReservations(reviveDates(mapped));
            } catch (error) {
                console.error("Error silencioso cargando reservas:", error);
            } finally {
                if (isMounted) setLoading(false); // Termina de cargar
            }
        }
        fetchReservations();
        return () => { isMounted = false; };
    }, [refreshTick, rooms]); 

    // --- ACCIONES (GUARDAR / ELIMINAR) ---
    const addOrUpdate = useCallback(async (reservationPayload) => {
        const isModification = !!reservationPayload.id;
        const reservationId = reservationPayload.id;
        const account = msalInstance.getActiveAccount();
        if (!account) throw new Error("Sin sesión activa");

        let tokenResponse; 
        try {
            tokenResponse = await msalInstance.acquireTokenSilent({ ...loginRequest, account });
        } catch {
            msalInstance.loginRedirect(loginRequest);
            return;
        }

        const url = isModification 
            ? `https://graph.microsoft.com/v1.0/me/events/${reservationId}` 
            : 'https://graph.microsoft.com/v1.0/me/events';
        const method = isModification ? 'PATCH' : 'POST';

        const eventBody = {
            subject: reservationPayload.title,
            start: { dateTime: reservationPayload.startTime, timeZone: "America/Bogota" },
            end: { dateTime: reservationPayload.endTime, timeZone: "America/Bogota" },
            location: { displayName: reservationPayload.room.nombre }, 
            attendees: [{
                emailAddress: { address: reservationPayload.roomEmail, name: reservationPayload.room.nombre },
                type: "resource"
            }]
        };

        const graphResponse = await fetch(url, {
            method: method,
            headers: { 'Authorization': `Bearer ${tokenResponse.accessToken}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(eventBody)
        });

        if (!graphResponse.ok) {
            const errData = await graphResponse.json();
            throw new Error(errData.error?.message || "Error en la API");
        }

        setRefreshTick(prev => prev + 1); 
        return await graphResponse.json();
    }, []);

    const removeById = useCallback(async (reservationId) => {
        const account = msalInstance.getActiveAccount();
        if (!account) return;
        const tokenRes = await msalInstance.acquireTokenSilent({ ...loginRequest, account });
        const graphRes = await fetch(`https://graph.microsoft.com/v1.0/me/events/${reservationId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${tokenRes.accessToken}` }
        });
        if (graphRes.ok) setRefreshTick(prev => prev + 1);
    }, []);

    // Disponibilidad (Simple)
    const checkAvailability = useCallback(async (roomEmail, dateString) => {
         // ... (Puedes dejar tu lógica actual aquí si la usas, o simplificarla)
         return []; 
    }, []);

    const value = useMemo(() => ({
        reservations, loading, addOrUpdate, removeById, rooms, addOrUpdateRoom, deleteRoom, checkAvailability
    }), [reservations, loading, rooms, refreshTick, addOrUpdate, removeById, addOrUpdateRoom, deleteRoom, checkAvailability]);

    return <ReservationsCtx.Provider value={value}>{children}</ReservationsCtx.Provider>;
};

export const useReservations = () => useContext(ReservationsCtx);