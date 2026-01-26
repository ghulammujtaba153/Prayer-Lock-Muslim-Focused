'use client';

import React from 'react';
import { useTheme } from '@/context/themeContext';
import { MdLightMode, MdDarkMode } from 'react-icons/md';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="fixed bottom-6 right-6 z-50 p-4 rounded-full glass-card shadow-2xl hover:scale-110 transition-all duration-300 group"
      aria-label="Toggle theme"
    >
      <div className="relative w-6 h-6">
        {theme === 'light' ? (
          <MdDarkMode className="w-6 h-6 text-gray-700 dark:text-gray-200 group-hover:rotate-12 transition-transform duration-300" />
        ) : (
          <MdLightMode className="w-6 h-6 text-yellow-400 group-hover:rotate-12 transition-transform duration-300" />
        )}
      </div>
    </button>
  );
}
