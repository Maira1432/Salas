import { useEffect, useState, useCallback } from 'react';

const THEME_KEY = 'theme'; // 'system' | 'light' | 'dark'

function getSystemIsDark() {
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function applyTheme(theme) {
  const useDark = theme === 'dark' || (theme === 'system' && getSystemIsDark());
  const root = document.documentElement;
  root.classList.toggle('dark', useDark);
  root.style.colorScheme = useDark ? 'dark' : 'light';
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', useDark ? '#0b0b0d' : '#ffffff');
}

export function useDarkMode() {
  const [mode, setMode] = useState(() => localStorage.getItem(THEME_KEY) || 'system'); // 'system' default
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem(THEME_KEY);
    const useDark = saved
      ? (saved === 'dark' || (saved === 'system' && getSystemIsDark()))
      : getSystemIsDark();
    return useDark;
  });

  // aplica tema cuando cambia mode
  useEffect(() => {
    localStorage.setItem(THEME_KEY, mode);
    applyTheme(mode);
    setIsDark(mode === 'dark' || (mode === 'system' && getSystemIsDark()));
  }, [mode]);

  // escucha cambios del SO SOLO si estamos en 'system'
  useEffect(() => {
    if (mode !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      applyTheme('system');
      setIsDark(getSystemIsDark());
    };
    if (mq.addEventListener) mq.addEventListener('change', handler);
    else mq.addListener(handler);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener('change', handler);
      else mq.removeListener(handler);
    };
  }, [mode]);

  // API del toggle actual: alterna entre dark/light (forzado)
  const toggle = useCallback(() => {
    setMode(prev => {
      const next = (prev === 'dark') ? 'light' : 'dark';
      return next === 'dark' ? 'dark' : 'light';
    });
  }, []);

  // Permite volver a automático (seguir sistema)
  const setSystem = useCallback(() => setMode('system'), []);
  const setLight = useCallback(() => setMode('light'), []);
  const setDark  = useCallback(() => setMode('dark'),  []);

  return { isDark, mode, toggle, setSystem, setLight, setDark };
}
