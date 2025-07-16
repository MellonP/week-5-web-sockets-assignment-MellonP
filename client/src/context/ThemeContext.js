import { createContext, useState, useEffect } from 'react';

const lightTheme = {
  background: '#f5f5f5',
  backgroundSecondary: '#ffffff',
  text: '#333333',
  textSecondary: '#666666',
  primary: '#4f46e5',
  secondary: '#10b981',
  border: '#e5e7eb',
  messageBackground: '#ffffff',
  messageText: '#333333',
  messageBorder: '#e5e7eb',
};

const darkTheme = {
  background: '#1a1a1a',
  backgroundSecondary: '#2d2d2d',
  text: '#f5f5f5',
  textSecondary: '#d1d5db',
  primary: '#7c3aed',
  secondary: '#059669',
  border: '#4b5563',
  messageBackground: '#2d2d2d',
  messageText: '#f5f5f5',
  messageBorder: '#4b5563',
};

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(lightTheme);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check for saved theme preference or system preference
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
      setIsDarkMode(true);
      setTheme(darkTheme);
    }
  }, []);

  const toggleTheme = () => {
    const newIsDarkMode = !isDarkMode;
    setIsDarkMode(newIsDarkMode);
    setTheme(newIsDarkMode ? darkTheme : lightTheme);
    localStorage.setItem('theme', newIsDarkMode ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};