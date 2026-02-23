'use client';

import { useState, useEffect } from 'react';

type Theme = 'light' | 'dark' | 'system';

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('system');

  useEffect(() => {
    const stored = localStorage.getItem('ade-theme') as Theme | null;
    if (stored) {
      setTheme(stored);
    }
  }, []);

  const cycleTheme = () => {
    const next: Theme = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light';
    setTheme(next);

    if (next === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      localStorage.setItem('ade-theme', 'dark');
    } else if (next === 'light') {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
      localStorage.setItem('ade-theme', 'light');
    } else {
      document.documentElement.classList.remove('dark', 'light');
      localStorage.removeItem('ade-theme');
    }
  };

  return (
    <button
      onClick={cycleTheme}
      className="flex items-center justify-center w-8 h-8 rounded-md transition-colors hover:bg-bg-tertiary"
      title={`Theme: ${theme}`}
      aria-label={`Current theme: ${theme}. Click to cycle.`}
    >
      {theme === 'light' && (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="8" cy="8" r="3" />
          <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41" />
        </svg>
      )}
      {theme === 'dark' && (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M13.5 8.5a5.5 5.5 0 01-7-7A5.5 5.5 0 1013.5 8.5z" />
        </svg>
      )}
      {theme === 'system' && (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="2" y="3" width="12" height="9" rx="1" />
          <path d="M5 14h6M8 12v2" />
        </svg>
      )}
    </button>
  );
}
