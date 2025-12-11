// src/components/DatePickerField.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { DayPicker } from 'react-day-picker';
import { format, parse, isValid, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarDays, X, ChevronLeft, ChevronRight } from 'lucide-react';

const isDarkMode = () =>
  typeof document !== 'undefined' &&
  document.documentElement.classList.contains('dark');

// Usa --brand-accent o el color de algún botón con data-accent="primary"
const getAccentColor = () => {
  if (typeof window === 'undefined') return '#3B82F6';
  const varFromRoot = getComputedStyle(document.documentElement)
    .getPropertyValue('--brand-accent')
    .trim();
  if (varFromRoot) return varFromRoot;

  const el = document.querySelector('[data-accent="primary"]');
  if (el) {
    const c = getComputedStyle(el).color;
    if (c) return c;
  }
  return '#3B82F6';
};

const IconLeft = () => <ChevronLeft className="w-4 h-4" />;
const IconRight = () => <ChevronRight className="w-4 h-4" />;

const FMT = 'yyyy-MM-dd';
const parseISO = (s) => {
  const d = parse(s, FMT, new Date());
  return isValid(d) ? d : undefined;
};

// Hard-fix de layout (a prueba de resets globales)
const RDP_HARD_FIX = `
.rdp table{ width:100% !important; border-collapse:collapse !important; table-layout:fixed !important; }
.rdp thead, .rdp tbody { display: table-header-group !important; }
.rdp tr { display: table-row !important; }
.rdp th, .rdp td { display: table-cell !important; padding:0 !important; text-align:center !important; vertical-align:middle !important; }
.rdp .rdp-day{ width:2.25rem !important; height:2.25rem !important; display:grid !important; place-items:center !important; margin:0 auto !important; border-radius:.75rem !important; cursor:pointer; }

/* Paletas base seguras */
.rdp{ color:#111827 !important; }
.rdp .rdp-head_cell{ color:#6B7280 !important; }
.rdp .rdp-day_outside{ color:#D1D5DB !important; }
.rdp .rdp-day:hover{ background:rgba(0,0,0,.04); }

.dark .rdp{ color:#E5E7EB !important; }
.dark .rdp .rdp-caption_label{ color:#F9FAFB !important; }
.dark .rdp .rdp-head_cell{ color:rgba(255,255,255,.65) !important; }
.dark .rdp .rdp-day{ color:#E5E7EB !important; }
.dark .rdp .rdp-day_outside{ color:rgba(255,255,255,.38) !important; }
.dark .rdp .rdp-day:hover{ background:rgba(255,255,255,.07); }

/* Evitar atenuaciones */
.dark .rdp, .dark .rdp * { opacity: 1 !important; }

.rdp .rdp-caption_label{ font-weight:700 !important; }
.rdp .rdp-head_cell{ font-weight:600 !important; height:2.25rem !important; }
`;

export default function DatePickerField({
  value, onChange,
  placeholder = 'dd/mm/aaaa',
  id, name = 'date', required, disabled,
  mode = 'auto',
}) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef(null);
  const popRef = useRef(null);

  const isDesktop = useMemo(() => {
    if (mode === 'native') return false;
    if (mode === 'custom') return true;
    if (typeof window === 'undefined' || !window.matchMedia) return true;
    const m1 = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const m2 = window.innerWidth >= 768;
    return m1 && m2;
  }, [mode]);

  useEffect(() => {
    const onDown = (e) => {
      if (!open) return;
      if (popRef.current?.contains(e.target)) return;
      if (btnRef.current?.contains(e.target)) return;
      setOpen(false);
    };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const selected = value ? parseISO(value) : undefined;

  // Móvil: input nativo
  if (!isDesktop) {
    return (
      <div className="relative">
        <input
          id={id} name={name} type="date" required={required} disabled={disabled}
          value={value || ''} onChange={(e) => onChange?.(e.target.value)}
          className="mt-1.5 w-full h-11 rounded-xl px-3.5
                     bg-white dark:bg-[#0F1318]
                     border border-gray-300 dark:border-[#2A3342]
                     text-gray-900 dark:text-gray-100
                     placeholder:text-gray-400 dark:placeholder:text-gray-500
                     focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          placeholder={placeholder}
        />
        <CalendarDays className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 opacity-70 pointer-events-none" />
      </div>
    );
  }

  // Desktop
  const btnLabel = value ? format(parseISO(value), 'dd/MM/yyyy') : placeholder;

  // Popover centrado respecto al input
  const [pos, setPos] = useState({ top: 0, left: 0, minWidth: 320 });
  useEffect(() => {
    if (!open || !btnRef.current) return;
    const r = btnRef.current.getBoundingClientRect();
    const gap = 8;
    const width = Math.max(320, r.width);
    let left = r.left + (r.width - width) / 2;
    left = Math.max(8, Math.min(window.innerWidth - width - 8, left));
    const top = r.bottom + gap + window.scrollY;
    setPos({ top, left: left + window.scrollX, minWidth: width });
  }, [open]);

  const dark = isDarkMode();
  const accent = getAccentColor();

  const Popover = (
    <div
      ref={popRef}
      role="dialog"
      style={{ position: 'absolute', top: pos.top, left: pos.left, minWidth: pos.minWidth }}
      className="rdp-pop z-[1000] rounded-2xl border border-gray-200/70 dark:border-[#374151]
                 bg-white dark:bg-[#111827] text-gray-900 dark:text-gray-100
                 shadow-xl p-3 max-h-[420px] overflow-auto"
    >
      {/* Blindaje contra filtros/opacity heredados */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
.rdp-pop{
  opacity:1 !important; filter:none !important; -webkit-filter:none !important;
  mix-blend-mode:normal !important; isolation:isolate;
  --tw-text-opacity:1 !important;
}
.rdp-pop *{ mix-blend-mode:normal !important; }
          `,
        }}
      />
      {/* Fix de layout */}
      <style dangerouslySetInnerHTML={{ __html: RDP_HARD_FIX }} />
      {/* Acento de marca para seleccionado, flechas y “hoy” */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
.rdp-pop .rdp-day_selected{ background:${accent} !important; color:#fff !important; box-shadow:none !important; }
.dark .rdp-pop .rdp-day_selected{ background:${accent} !important; color:#fff !important; }
.rdp-pop .rdp-day_today::after{ background:${accent} !important; }

.rdp-pop .rdp-button_previous,
.rdp-pop .rdp-button_next{ color:${accent} !important; }
.rdp-pop .rdp-button_previous:hover,
.rdp-pop .rdp-button_next:hover{
  background:${dark ? 'rgba(255,255,255,.08)' : 'rgba(0,0,0,.06)'} !important;
  border-radius:.5rem !important;
}
          `,
        }}
      />

      {/* Atajos */}
      <div className="flex items-center justify-between px-2 pb-1">
        <div className="flex items-center gap-2">
          <button
            className="text-xs px-2 py-1 rounded-md border border-gray-200 dark:border-[#2A3342]
                       hover:bg-gray-100 dark:hover:bg-white/10 text-gray-700 dark:text-gray-200"
            onClick={() => { onChange?.(format(new Date(), FMT)); setOpen(false); }}
          >
            Hoy
          </button>
          <button
            className="text-xs px-2 py-1 rounded-md border border-gray-200 dark:border-[#2A3342]
                       hover:bg-gray-100 dark:hover:bg-white/10 text-gray-700 dark:text-gray-200"
            onClick={() => { onChange?.(format(addDays(new Date(), 1), FMT)); setOpen(false); }}
          >
            Mañana
          </button>
          <button
            className="text-xs px-2 py-1 rounded-md border border-gray-200 dark:border-[#2A3342]
                       hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300"
            onClick={() => { onChange?.(''); setOpen(false); }}
          >
            Limpiar
          </button>
        </div>
        <button
          onClick={() => setOpen(false)}
          className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400"
          aria-label="Cerrar calendario"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <DayPicker
        captionLayout="dropdown-buttons"
        fromYear={2020}
        toYear={2032}
        components={{ IconLeft, IconRight }}
        mode="single"
        locale={es}
        selected={selected}
        onSelect={(d) => { if (d) { onChange?.(format(d, FMT)); setOpen(false); } }}
        showOutsideDays
        weekStartsOn={1}
        disabled={{ before: new Date() }}
        formatters={{
          formatWeekdayName: (day) =>
            new Intl.DateTimeFormat('es-ES', { weekday: 'short' })
              .format(day).slice(0,2).toUpperCase(),
        }}
        styles={{
          root: { color: dark ? '#E5E7EB' : '#111827' },
          caption: { color: dark ? '#F9FAFB' : '#111827' },
          head_cell: { color: dark ? 'rgba(255,255,255,.65)' : '#6B7280', fontWeight: 600 },
          day: { color: dark ? '#E5E7EB' : '#111827', fontWeight: 500 },
          day_outside: { color: dark ? 'rgba(255,255,255,.38)' : '#D1D5DB' },
          day_selected: { background: accent, color: '#FFFFFF' },
        }}
        classNames={{
          caption_label: 'text-sm font-semibold tracking-tight',
          nav: 'flex items-center',
          button_previous:
            'p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 focus:outline-none',
          button_next:
            'p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 focus:outline-none',
          head: 'mt-1',
          head_row: 'text-xs',
          head_cell: 'font-medium',
          month: 'space-y-2',
          day:
            'transition-colors hover:bg-gray-100 dark:hover:bg-white/5 focus:outline-none',
          // 👉 “Hoy” sin color aquí; lo pinta el <style> inline con el acento
          day_today:
            'relative after:content-[""] after:absolute after:bottom-1 after:w-1.5 after:h-1.5 after:rounded-full',
          day_outside: 'opacity-100', // el color real lo llevan en styles.day_outside
          day_disabled: 'opacity-40 cursor-not-allowed',
        }}
      />
    </div>
  );

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        id={id}
        className="mt-1.5 w-full h-11 rounded-xl px-3.5 text-left
                   bg-white dark:bg-[#0F1318]
                   border border-gray-300 dark:border-[#2A3342]
                   text-gray-900 dark:text-gray-100
                   focus:outline-none focus:ring-2 focus:ring-blue-500/30
                   flex items-center justify-between"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <span className={value ? '' : 'text-gray-400 dark:text-gray-500'}>
          {btnLabel}
        </span>
        <CalendarDays className="w-4 h-4 opacity-80" />
      </button>

      <input type="hidden" name={name} value={value || ''} required={required} disabled={disabled} />
      {open && createPortal(Popover, document.body)}
    </>
  );
}