import React, { createContext, useContext, useState, useEffect } from 'react';

//Створення контексту
const ThemeContext = createContext();

// Провайдер компонента
export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('app-theme') || 'light';
  });

  // Зберігаємо тему при кожній зміні та оновлюємо клас на body
  useEffect(() => {
    localStorage.setItem('app-theme', theme);
    document.body.className = theme + '-theme';
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Кастомний хук useTheme
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};