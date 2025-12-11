import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, X } from 'lucide-react';

export default function ConfirmationModal({ open, onClose, data, onCTA }) {
  if (!open) return null;
  const start = new Date(data.start);
  const end = new Date(data.end);
  const fmt = (d) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
        <div className="absolute inset-0 bg-black/40" onClick={onClose} />
        <motion.div
          role="dialog" aria-modal="true" aria-labelledby="confirm-title"
          initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.2 }}
          className="relative w-full sm:max-w-md mx-auto sm:mx-0 rounded-2xl border border-gray-200 dark:border-[#232A36] bg-white dark:bg-[#171B22] p-5 shadow-2xl"
        >
          <button
            onClick={onClose}
            className="absolute top-3 right-3 rounded-md p-1 hover:bg-black/5 dark:hover:bg-white/10"
            aria-label="Cerrar"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-6 h-6 text-green-500 mt-0.5" />
            <div>
              <h3 id="confirm-title" className="text-base font-semibold text-gray-900 dark:text-gray-100">
                ¡Reserva creada!
              </h3>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                {data.title ? <><strong>{data.title}</strong> · </> : null}
                {data.roomName} — {fmt(start)}–{fmt(end)}
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              onClick={onCTA?.primary}
              className="sm:col-span-2 rounded-xl px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Ver mis reservas
            </button>
            <button
              onClick={onClose}
              className="rounded-xl px-3 py-2 text-sm border border-gray-200 dark:border-[#2A3342] hover:bg-gray-50 dark:hover:bg-[#141922]"
            >
              Cerrar
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}