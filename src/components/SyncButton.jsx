// src/components/SyncButton.jsx
import React, { useState } from 'react';
import { RefreshCw, Check } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

export default function SyncButton({ onClick, label = 'Sync', className = '' }) {
  const [status, setStatus] = useState('idle'); // 'idle' | 'syncing' | 'success'
  const reduce = useReducedMotion();

  const handleClick = async () => {
    if (status === 'syncing') return;
    try {
      setStatus('syncing');
      await onClick?.(); // onClick debe retornar una Promise
      setStatus('success');
      setTimeout(() => setStatus('idle'), 900); // halo verde breve
    } catch (e) {
      // en error vuelve a idle; puedes personalizar a 'error' si quieres
      setStatus('idle');
      console.error(e);
    }
  };

  const isSyncing = status === 'syncing';
  const isSuccess = status === 'success';

  // Colores sutiles del halo
  const haloGradient = isSuccess
    ? 'radial-gradient(45% 45% at 50% 50%, rgba(16,185,129,0.22) 0%, rgba(16,185,129,0) 70%)' // verde
    : 'radial-gradient(45% 45% at 50% 50%, rgba(59,130,246,0.24) 0%, rgba(59,130,246,0) 70%)'; // azul

  // Estilos animados del botón (bg/borde/sombra)
  const toBg = 'var(--btn-bg)';
  const toBd = 'var(--btn-bd)';
  const toSh = isSuccess
    ? '0 2px 12px rgba(16,185,129,0.18)'
    : isSyncing
    ? '0 2px 12px rgba(59,130,246,0.16)'
    : '0 2px 10px rgba(0,0,0,0.06)';

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      className={[
        'inline-flex items-center gap-2 px-3 py-2 rounded-xl border',
        'bg-gray-50 dark:bg-dark-surface border-gray-200 dark:border-dark-border',
        'hover:bg-gray-100 dark:hover:bg-dark-border',
        'focus:outline-none focus:ring-2 focus:ring-blue-400/35 dark:focus:ring-blue-500/30',
        'relative overflow-hidden',
        className
      ].join(' ')}
      style={{
        // variables para estados claro/oscuro
        ['--btn-bg']: 'transparent',
        ['--btn-bd']: 'transparent',
      }}
      initial={false}
      animate={reduce ? {} : { backgroundColor: toBg, borderColor: toBd, boxShadow: toSh }}
      transition={{ duration: 0.22, ease: 'easeInOut' }}
      aria-live="polite"
      aria-busy={isSyncing}
      aria-label={isSyncing ? 'Sincronizando' : isSuccess ? 'Sincronizado' : 'Sincronizar'}
      title={isSyncing ? 'Sincronizando…' : isSuccess ? '¡Sincronizado!' : 'Sincronizar'}
    >
      {/* Halo radial sutil */}
      {!reduce && (
        <AnimatePresence mode="wait" initial={false}>
          {(isSyncing || isSuccess) && (
            <motion.span
              key={isSuccess ? 'halo-success' : 'halo-sync'}
              className="absolute inset-0 pointer-events-none"
              style={{ backgroundImage: haloGradient, filter: 'blur(5px)' }}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.26, ease: 'easeInOut' }}
            />
          )}
        </AnimatePresence>
      )}

      {/* Ícono + texto */}
      <div className="relative flex items-center gap-2">
        <div className="w-5 h-5 grid place-items-center">
          <AnimatePresence mode="wait" initial={false}>
            {isSuccess ? (
              <motion.span
                key="check"
                initial={{ opacity: 0, scale: reduce ? 1 : 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: reduce ? 1 : 0.98 }}
                transition={{ duration: 0.18, ease: 'easeInOut' }}
                className="absolute inset-0 grid place-items-center"
              >
                <Check className="w-5 h-5 text-emerald-500" />
              </motion.span>
            ) : (
              <motion.span
                key="refresh"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18, ease: 'easeInOut' }}
                className="absolute inset-0 grid place-items-center"
              >
                <motion.span
                  animate={isSyncing && !reduce ? { rotate: 360 } : { rotate: 0 }}
                  transition={isSyncing && !reduce ? { repeat: Infinity, duration: 1.1, ease: 'linear' } : {}}
                  className="inline-block"
                >
                  <RefreshCw className="w-5 h-5 text-blue-500" />
                </motion.span>
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        <span className="text-sm font-medium">
          {isSyncing ? 'Sincronizando…' : isSuccess ? 'Sincronizado' : label}
        </span>
      </div>
    </motion.button>
  );
}
