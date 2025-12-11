import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock } from 'lucide-react';

function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }

export default function TimePickerField({
  value = '09:00',          // "HH:mm" (24h) o "hh:mm" con am/pm si use12h=true
  onChange,
  placeholder = 'hh:mm',
  use12h = false,            // cambia a false si prefieres 24h
  minuteStep = 30,           // 5|10|15|30
  disabled = false,
  className = '',
  id
}) {
  // estado visible formateado
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  // descomponer valor entrante
  const initial = useMemo(() => {
    if (!value) return { h: 9, m: 0, am: true };
    const [H, M] = value.split(':').map(Number);
    if (use12h) {
      const am = H < 12;
      const h12 = H % 12 || 12;
      return { h: h12, m: M, am };
    }
    return { h: H, m: M, am: true };
  }, [value, use12h]);

  const [h, setH] = useState(initial.h);
  const [m, setM] = useState(initial.m);
  const [am, setAm] = useState(initial.am);

  useEffect(() => { // sincroniza cuando la prop value cambia externamente
    setH(initial.h); setM(initial.m); setAm(initial.am);
  }, [initial.h, initial.m, initial.am]);

  // listas
  const hours = use12h ? Array.from({length:12},(_,i)=>i+1) : Array.from({length:24},(_,i)=>i);
  const minutes = Array.from({length: 60/minuteStep}, (_,i)=>i*minuteStep);

  // formateos
  const pad = (n)=> String(n).padStart(2,'0');
  const display = useMemo(() => {
    if (use12h) return `${pad(h)}:${pad(m)} ${am ? 'a.m.' : 'p.m.'}`;
    return `${pad(h)}:${pad(m)}`;
  }, [h, m, am, use12h]);

  const toValue = () => {
    let HH = h;
    if (use12h) {
      HH = (h % 12) + (am ? 0 : 12);
      if (HH === 24) HH = 12; // no debería suceder, por si acaso
    }
    onChange?.(`${pad(HH)}:${pad(m)}`);
  };

  // cerrar por click fuera / escape
  useEffect(() => {
    function handler(e) {
      if (!open) return;
      if (e.key === 'Escape') setOpen(false);
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    document.addEventListener('keydown', handler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('keydown', handler);
    };
  }, [open]);

  // rueda del mouse en cada columna
  const onWheelH = (e)=> { e.preventDefault();
    if (use12h) setH(prev => ((prev - 1 + (e.deltaY>0?1:-1)) % 12 + 12)%12 + 1);
    else setH(prev => (prev + (e.deltaY>0?1:-1) + 24) % 24);
  };
  const onWheelM = (e)=> { e.preventDefault();
    setM(prev => ( (prev + (e.deltaY>0?minuteStep:-minuteStep) + 60) % 60 ));
  };

  // teclado cuando popover abierto
  const onKeyCol = (col, e) => {
    if (!open) return;
    if (col === 'h') {
      if (e.key === 'ArrowUp') setH(p=> use12h ? (p%12)+1 : (p+1)%24);
      if (e.key === 'ArrowDown') setH(p=> use12h ? (p+10)%12+1 : (p+23)%24);
    }
    if (col === 'm') {
      if (e.key === 'ArrowUp') setM(p=> (p+minuteStep)%60);
      if (e.key === 'ArrowDown') setM(p=> (p+60-minuteStep)%60);
    }
    if (col === 'ampm' && (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === ' ')) setAm(p=>!p);
    if (e.key === 'Enter') { toValue(); setOpen(false); }
  };

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      {/* input de texto controlado (no input type="time" para evitar el nativo) */}
      <button
        id={id}
        type="button"
        disabled={disabled}
        onClick={()=>setOpen(o=>!o)}
        className="mt-1.5 w-full h-11 rounded-xl px-3.5 text-left
                   bg-white dark:bg-[#0F1318]
                   border border-gray-300 dark:border-[#2A3342]
                   text-gray-900 dark:text-gray-100 font-semibold tracking-tight
                   focus:outline-none focus:ring-2 focus:ring-blue-500/30
                   inline-flex items-center justify-between"
      >
        <span className={value ? '' : 'text-gray-400 dark:text-gray-500'}>
          {value ? display : placeholder}
        </span>
        <Clock className="w-4 h-4 opacity-70" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ y: 6, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 6, opacity: 0 }}
            transition={{ duration: 0.16 }}
            className="absolute z-40 mt-2 w-[320px] rounded-xl border
                       border-gray-200 dark:border-[#232A36]
                       bg-white/95 dark:bg-[#0F1318]/95 backdrop-blur
                       shadow-2xl p-2"
          >
            <div className="grid grid-cols-3 gap-2">
              {/* HORAS */}
              <div
                tabIndex={0}
                onKeyDown={(e)=>onKeyCol('h', e)}
                onWheel={onWheelH}
                className="max-h-56 overflow-y-auto rounded-lg border border-gray-200 dark:border-[#2A3342] bg-white dark:bg-[#0F1318]"
              >
                {hours.map((hh) => (
                  <button
                    key={hh}
                    type="button"
                    onClick={()=> setH(hh)}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-[#141922] ${h===hh?'bg-blue-600 text-white hover:bg-blue-600':''}`}
                  >
                    {String(hh).padStart(2,'0')}
                  </button>
                ))}
              </div>

              {/* MINUTOS */}
              <div
                tabIndex={0}
                onKeyDown={(e)=>onKeyCol('m', e)}
                onWheel={onWheelM}
                className="max-h-56 overflow-y-auto rounded-lg border border-gray-200 dark:border-[#2A3342] bg-white dark:bg-[#0F1318]"
              >
                {minutes.map((mm) => (
                  <button
                    key={mm}
                    type="button"
                    onClick={()=> setM(clamp(mm,0,59))}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-[#141922] ${m===mm?'bg-blue-600 text-white hover:bg-blue-600':''}`}
                  >
                    {String(mm).padStart(2,'0')}
                  </button>
                ))}
              </div>

              {/* AM/PM o atajos */}
              <div
                tabIndex={0}
                onKeyDown={(e)=>onKeyCol('ampm', e)}
                className="rounded-lg border border-gray-200 dark:border-[#2A3342] bg-white dark:bg-[#0F1318] p-2 flex flex-col gap-2"
              >
                {use12h ? (
                  <>
                    <button
                      type="button"
                      onClick={()=> setAm(true)}
                      className={`w-full px-3 py-2 text-sm rounded-md hover:bg-gray-50 dark:hover:bg-[#141922] ${am ? 'bg-blue-600 text-white hover:bg-blue-600' : ''}`}
                    >a.m.</button>
                    <button
                      type="button"
                      onClick={()=> setAm(false)}
                      className={`w-full px-3 py-2 text-sm rounded-md hover:bg-gray-50 dark:hover:bg-[#141922] ${!am ? 'bg-blue-600 text-white hover:bg-blue-600' : ''}`}
                    >p.m.</button>
                  </>
                ) : (
                  <>
                    <button type="button"
                      onClick={()=> setM((m+minuteStep)%60)}
                      className="w-full px-3 py-2 text-sm rounded-md hover:bg-gray-50 dark:hover:bg-[#141922]"
                    >+{minuteStep} min</button>
                    <button type="button"
                      onClick={()=> setM((m+60-minuteStep)%60)}
                      className="w-full px-3 py-2 text-sm rounded-md hover:bg-gray-50 dark:hover:bg-[#141922]"
                    >-{minuteStep} min</button>
                  </>
                )}
                <button
                  type="button"
                  onClick={()=> { toValue(); setOpen(false);} }
                  className="mt-auto w-full px-3 py-2 text-sm rounded-md text-white bg-blue-600 hover:bg-blue-500"
                >Aplicar</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
