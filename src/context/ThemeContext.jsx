import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Theme aus localStorage laden
  useEffect(() => {
    // Stelle sicher, dass das DOM bereit ist
    const initializeTheme = () => {
      const savedTheme = localStorage.getItem('ehcb-theme');
      let shouldBeDark = false;
      
      if (savedTheme === 'dark') {
        shouldBeDark = true;
      } else if (savedTheme === null) {
        // Prüfe System-Präferenz beim ersten Besuch
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        shouldBeDark = prefersDark;
        localStorage.setItem('ehcb-theme', prefersDark ? 'dark' : 'light');
      }
      
      setIsDarkMode(shouldBeDark);
      
      // Stelle sicher, dass die Klasse richtig gesetzt wird
      if (shouldBeDark) {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
      }
    };

    // Wenn DOM bereits bereit ist
    if (document.readyState === 'complete') {
      initializeTheme();
    } else {
      // Warte auf DOMContentLoaded
      window.addEventListener('DOMContentLoaded', initializeTheme);
      return () => window.removeEventListener('DOMContentLoaded', initializeTheme);
    }
  }, []);

    // Theme wechseln
  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    
    if (newMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      localStorage.setItem('ehcb-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
      localStorage.setItem('ehcb-theme', 'light');
    }
  };

  const value = {
    isDarkMode,
    toggleDarkMode,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
