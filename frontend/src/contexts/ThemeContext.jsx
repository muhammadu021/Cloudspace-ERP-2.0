import React, { createContext, useState, useEffect, useContext } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectThemePreference, setThemePreference } from '../store/slices/preferencesSlice';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const dispatch = useDispatch();
  const savedTheme = useSelector(selectThemePreference);
  const [theme, setTheme] = useState(savedTheme || 'light');

  useEffect(() => {
    // Load theme from localStorage on mount
    const localTheme = localStorage.getItem('theme');
    if (localTheme && localTheme !== theme) {
      setTheme(localTheme);
      dispatch(setThemePreference(localTheme));
    }
  }, []);

  useEffect(() => {
    // Apply theme to document and persist
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
    dispatch(setThemePreference(theme));
  }, [theme, dispatch]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const value = {
    theme,
    setTheme,
    toggleTheme
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
