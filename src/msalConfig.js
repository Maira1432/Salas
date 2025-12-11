 // src/msalConfig.js

import { PublicClientApplication } from "@azure/msal-browser";

const msalConfig = {
  auth: {
    clientId: "8d23218d-b8bc-4af1-b072-c48bfbe0c1d3",
    authority: "https://login.microsoftonline.com/0c4fa9d7-8fb7-4395-99a2-3674e4f8f773",
    // ✅ CRÍTICO: Usa la URL exacta de tu entorno de desarrollo.
    // Si usas el puerto 3000:
    redirectUri: window.location.origin, 
    postLogoutRedirectUri: window.location.origin,
  },
  cache: {
    // ✅ LO DEJAMOS EN localStorage, pero entendemos que al borrarlo, se pierde la sesión.
    cacheLocation: "localStorage", 
    storeAuthStateInCookie: false,
  },
};

export const loginRequest = {
  scopes: ["User.Read", "Calendars.ReadWrite"],
};

export const msalInstance = new PublicClientApplication(msalConfig);