import React, { useState } from "react";
import { motion } from "framer-motion";
import { LogIn, LogOut, CheckCircle2, AlertCircle } from "lucide-react";
import { msalInstance, loginRequest } from '../msalConfig';
import { ensureAccount, logout } from "../utils/auth";

const OutlookSync = () => {
  const [account, setAccount] = useState(msalInstance.getActiveAccount() || msalInstance.getAllAccounts()[0] || null);
  const [error, setError] = useState("");

const handleLogin = async () => {
  try {
    // PASO 1: INTENTAR ENCENDER EL MOTOR (INITIALIZE)
    // Esto es obligatorio en las nuevas versiones.
    try {
        await msalInstance.initialize();
    } catch (initError) {
        // Si ya estaba encendido, ignoramos el error y seguimos.
        console.log("Nota: MSAL ya estaba inicializado o en proceso.");
    }

    // PASO 2: AHORA SÍ, INICIAR SESIÓN
    await msalInstance.loginRedirect(loginRequest); 

  } catch (error) {
    // Si falla algo más, te avisará
    alert("EL ERROR REAL ES:\n" + error.message); 
    console.error("ERROR CRÍTICO:", error);
    setError("Fallo: " + error.message);
  }
};

  const handleLogout = async () => {
    setError("");
    try {
      await logout();
      setAccount(null);
    } catch {
      setError("No se pudo cerrar sesión.");
    }
  };

  return (
    <motion.div
       className="mt-8 bg-white/80 dark:bg-white/5 border border-gray-200/50 dark:border-gray-800/50 rounded-3xl p-6 shadow-xl transition-all backdrop-blur-xl"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}

    >
      <div className="flex items-center gap-3 mb-3">
        {account ? <CheckCircle2 className="w-5 h-5 text-green-600" /> : <AlertCircle className="w-5 h-5 text-yellow-600" />}
        <h3 className="text-lg font-semibold">Sincronización con Outlook</h3>
      </div>

      {error && (
        <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl p-3">{error}</div>
      )}

      {account ? (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-700">
            Sesión iniciada como <span className="font-medium">{account.username}</span>
          </p>
          <motion.button
            onClick={handleLogout}
            className="px-4 py-2 rounded-xl bg-gray-100 text-gray-800 hover:bg-gray-200"
            whileTap={{ scale: 0.98 }}
          >
            <span className="inline-flex items-center gap-2"><LogOut className="w-4 h-4" /> Cerrar sesión</span>
          </motion.button>
        </div>
      ) : (
        <motion.button
          onClick={handleLogin}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-medium shadow-md hover:opacity-95"
          whileTap={{ scale: 0.98 }}
        >
          <span className="inline-flex items-center gap-2"><LogIn className="w-4 h-4" /> Iniciar sesión con Microsoft</span>
        </motion.button>
      )}
    </motion.div>
  );
};

export default OutlookSync;
