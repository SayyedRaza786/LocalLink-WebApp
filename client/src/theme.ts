import { createTheme, type ThemeOptions } from '@mui/material/styles';

const getThemeOptions = (mode: 'light' | 'dark'): ThemeOptions => ({
  palette: {
    mode,
    primary: {
      main: mode === 'light' ? '#4f46e5' : '#7C5CFC', // Indigo in light mode, Premium Purple in dark mode
      light: mode === 'light' ? '#6366f1' : '#9E85FF',
      dark: mode === 'light' ? '#3730a3' : '#623DF5',
      contrastText: '#ffffff',
    },
    secondary: {
      main: mode === 'light' ? '#0d9488' : '#A855F7', // Teal in light mode, Purple Accent in dark mode
      light: mode === 'light' ? '#14b8a6' : '#C084FC',
      dark: mode === 'light' ? '#115e59' : '#8B5CF6',
      contrastText: '#ffffff',
    },
    background: {
      default: mode === 'light' ? '#f8fafc' : '#0F1117', // Light slate / Charcoal Background
      paper: mode === 'light' ? '#ffffff' : '#181C24',   // White / Surface Grey
    },
    text: {
      primary: mode === 'light' ? '#000000' : '#F8FAFC', // Text primary
      secondary: mode === 'light' ? '#4b5563' : '#94A3B8', // Text secondary
    },
    divider: mode === 'light' ? '#e2e8f0' : '#2A3142',   // Border
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontFamily: '"Outfit", "Inter", sans-serif',
      fontWeight: 700,
    },
    h2: {
      fontFamily: '"Outfit", "Inter", sans-serif',
      fontWeight: 700,
    },
    h3: {
      fontFamily: '"Outfit", "Inter", sans-serif',
      fontWeight: 600,
    },
    h4: {
      fontFamily: '"Outfit", "Inter", sans-serif',
      fontWeight: 600,
    },
    h5: {
      fontFamily: '"Outfit", "Inter", sans-serif',
      fontWeight: 600,
    },
    h6: {
      fontFamily: '"Outfit", "Inter", sans-serif',
      fontWeight: 600,
    },
    subtitle1: {
      fontWeight: 500,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          padding: '8px 16px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        containedPrimary: {
          background: mode === 'light' 
            ? 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)' 
            : 'linear-gradient(135deg, #7C5CFC 0%, #A855F7 100%)',
          '&:hover': {
            background: mode === 'light' 
              ? 'linear-gradient(135deg, #3730a3 0%, #2563eb 100%)' 
              : 'linear-gradient(135deg, #623DF5 0%, #8B5CF6 100%)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          boxShadow: mode === 'light' 
            ? '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)' 
            : '0 4px 6px -1px rgb(0 0 0 / 0.2), 0 2px 4px -2px rgb(0 0 0 / 0.2)',
          border: mode === 'light' ? '1px solid #e2e8f0' : '1px solid #2A3142',
          backgroundImage: 'none',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: mode === 'light' ? 'rgba(255, 255, 255, 0.85)' : 'rgba(15, 17, 23, 0.85)',
          color: mode === 'light' ? '#000000' : '#F8FAFC',
          backdropFilter: 'blur(8px)',
          borderBottom: mode === 'light' ? '1px solid #e2e8f0' : '1px solid #2A3142',
          boxShadow: 'none',
        },
      },
    },
  },
});

export const lightTheme = createTheme(getThemeOptions('light'));
export const darkTheme = createTheme(getThemeOptions('dark'));
