import React, { createContext, useContext, useState, useEffect } from 'react';

// 1. Створення контексту
const ThemeContext = createContext();

// 2. Провайдер компонента
export const ThemeProvider = ({ children }) => {
  // Отримуємо збережену тему або використовуємо 'light' за замовчуванням
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('app-theme') || 'light';
  });

useEffect(() => {
  localStorage.setItem('app-theme', theme);
  document.documentElement.setAttribute('data-theme', theme);
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

// 3. Кастомний хук useTheme
// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};