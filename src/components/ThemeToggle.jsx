// src/components/ThemeToggle.jsx
import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useDarkMode } from '../hooks/useDarkMode';
import { motion, AnimatePresence, useReducedMotion, rgba } from 'framer-motion';

export default function ThemeToggle() {
  const { isDark, toggle, setSystem, mode } = useDarkMode();
  const reduce = useReducedMotion();

   // Ícono: animación ultra sutil
  const iconVariants = {
    initial: { opacity: 0, scale: reduce ? 1 : 0.995, rotate: reduce ? 0 : -2 },
    animate: { opacity: 1, scale: 1, rotate: 0 },
    exit:    { opacity: 0, scale: reduce ? 1 : 0.995, rotate: reduce ? 0 : 2 },
  };
  const iconTransition = { duration: 0.22, ease: 'easeInOut' };

  // Fondo/borde/sombra del botón
  const toBg = isDark ? 'rgba(22,27,34,1)'   : 'rgba(249,250,251,1)'; // dark.surface vs gray-50
  const toBd = isDark ? 'rgba(30,38,48,1)'   : 'rgba(229,231,235,1)'; // dark.border  vs gray-200
  const toSh = isDark ? '0 2px 10px rgba(0,0,0,0.35)' : '0 2px 10px rgba(0,0,0,0.08)';

  // Halo: color tenue según destino (el ícono que se muestra)
  const haloColor = isDark
    ? 'radial-gradient(40% 40% at 50% 50%, rgba(250,204,21,0.25) 0%, rgba(250,204,21,0) 70%)' // Sol (amarillo)
    : 'radial-gradient(40% 40% at 50% 50%, rgba(96,165,250,0.25) 0%, rgba(96,165,250,0) 70%)'; // Luna (azul)

  // handler: click normal alterna; Alt+Click vuelve a system (auto)
    function handleClick(e) {
    if (e.altKey) {
      setSystem();
      return;
    }
      toggle();
    }
    function handleContextMenu(e) {
      e.preventDefault();
      setSystem(); // click derecho => Auto
    }

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      role="switch"
      aria-checked={mode == 'system' ? 'mixed' : isDark}
      className="p-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400/40 dark:focus:ring-blue-500/30 transition relative overflow-hidden"
      title={
        mode === 'system'
        ? 'Automático por sistema (Alt-clic para alternar, clic para forzar)'
        : (isDark ? 'Cambiar a claro (Alt-clic: automático)' : 'Cambiar a oscuro (Alt-clic: automático)')
      }
      aria-label={isDark ? 'Cambiar a claro' : 'Cambiar a oscuro'}
      aria-pressed={isDark}
      initial={false}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick(e);
        }
      //Shift=S para forzar System rápido (opcional)
      if (e.key.toLowerCase() === 's' && e.shiftKey) setSystem();
      }}
      animate={reduce ? {} : { backgroundColor: toBg, borderColor: toBd, boxShadow: toSh }}
      style={{
        borderWidth: 1,
        backgroundColor: reduce ? (isDark ? '#161B22' : '#F9FAFB') : undefined,
        borderColor: reduce ? (isDark ? '#1E2630' : '#E5E7EB') : undefined,
        boxShadow: reduce ? (isDark ? '0 2px 10px rgba(0,0,0,0.35)' : '0 2px 10px rgba(0,0,0,0.08)') : undefined,
      }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      whileTap={reduce ? {} : { scale: 0.98 }}
    >
    
    {!reduce && (
    <AnimatePresence mode="wait" initial={false}>
      <motion.span
        key={isDark ? 'halo-sun' : 'halo-moon'}
        className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: haloColor, filter: 'blur(4px)' }}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.28, ease: 'easeInOut' }}
        />
    </AnimatePresence>
  )}

      {/* ÍCONO */}
      <div className="relative w-5 h-5">
        <AnimatePresence mode="wait" initial={false}>
          {isDark ? (
            // Estás en dark → mostrar Sol (destino claro)
            <motion.span
              key="sun"
              variants={iconVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={iconTransition}
              className="absolute inset-0 grid place-items-center"
            >
              <Sun className="w-5 h-5 text-yellow-400" />
            </motion.span>
          ) : (
            // Estás en light → mostrar Luna (destino oscuro)
            <motion.span
              key="moon"
              variants={iconVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={iconTransition}
              className="absolute inset-0 grid place-items-center"
            >
              <Moon className="w-5 h-5 text-blue-400" />
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {mode === 'system' && (
        <span
        className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full"
        title="Modo automático (sigue el sistema)"
        style={{backgroundColor: isDark ? 'rgba(96,165,250,0.9)': 'rgba(250,204,21,0.9)'}}
        />
      )}
    </motion.button>
  );
}
