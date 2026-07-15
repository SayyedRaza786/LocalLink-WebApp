import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { lightTheme, darkTheme } from '../theme';

interface ThemeContextType {
  mode: 'light' | 'dark';
  toggleColorMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const CustomThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Read saved theme mode or default to system preference
  const [mode, setMode] = useState<'light' | 'dark'>(() => {
    const savedMode = localStorage.getItem('locallink-theme-mode');
    if (savedMode === 'light' || savedMode === 'dark') return savedMode;
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return systemPrefersDark ? 'dark' : 'light';
  });

  useEffect(() => {
    localStorage.setItem('locallink-theme-mode', mode);
  }, [mode]);

  const colorMode = useMemo(
    () => ({
      mode,
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
      },
    }),
    [mode]
  );

  const theme = useMemo(() => (mode === 'light' ? lightTheme : darkTheme), [mode]);

  return (
    <ThemeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};

export const useCustomTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useCustomTheme must be used within a CustomThemeProvider');
  }
  return context;
};
