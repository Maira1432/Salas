// src/utils/theme.js
const STORAGE_KEY = 'theme';

// Detecta el tema del sistema
const getSystemTheme = () =>
  window.matchMedia &&
  window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';

export const getSavedTheme = () =>
  localStorage.getItem(STORAGE_KEY) ?? 'system';

// Aplica el tema al <html>
export const applyTheme = (pref) => {
  const html = document.documentElement;
  const effective = pref === 'system' ? getSystemTheme() : pref;

  if (effective === 'dark') html.classList.add('dark');
  else html.classList.remove('dark');
};

// Guarda y aplica el tema
export const setTheme = (pref) => {
  console.log('[theme] setTheme', pref);
  localStorage.setItem(STORAGE_KEY, pref);
  applyTheme(pref);
};

// Inicializa al cargar la app
export const initTheme = () => {
  const saved = getSavedTheme();
  applyTheme(saved);

  // Escucha cambios del sistema si está en modo "system"
  if (saved === 'system' && window.matchMedia) {
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => applyTheme('system');
    try {
      mql.addEventListener('change', handler);
    } catch {
      mql.addListener(handler); // Safari viejo
    }
  }
};
