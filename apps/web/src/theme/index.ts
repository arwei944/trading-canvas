import { createTheme, ThemeOptions } from '@mui/material/styles';

/**
 * TradingCanvas macOS 极简风格主题
 * 特点：浅色背景、灰色图标、圆角设计、极简阴影
 */

const macTheme: ThemeOptions = {
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, sans-serif',
    h1: {
      fontSize: '2rem',
      fontWeight: 600,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontSize: '1.75rem',
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 600,
    },
    h5: {
      fontSize: '1.125rem',
      fontWeight: 500,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 500,
    },
    body1: {
      fontSize: '0.9375rem',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
    caption: {
      fontSize: '0.8125rem',
      color: '#86868b',
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 10,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#f5f5f7',
          color: '#1d1d1f',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
          backgroundColor: '#ffffff',
          border: '1px solid rgba(0, 0, 0, 0.04)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 16px',
          fontWeight: 500,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        contained: {
          backgroundColor: '#007aff',
          '&:hover': {
            backgroundColor: '#0051d5',
          },
        },
        outlined: {
          borderColor: '#d2d2d7',
          color: '#007aff',
          '&:hover': {
            backgroundColor: 'rgba(0, 122, 255, 0.04)',
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: '#86868b',
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.04)',
            color: '#555555',
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
          padding: '12px 16px',
        },
        head: {
          fontWeight: 600,
          color: '#86868b',
          fontSize: '0.8125rem',
          backgroundColor: 'transparent',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.02)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          backgroundColor: '#f5f5f7',
          color: '#555555',
          fontWeight: 500,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 10,
            backgroundColor: '#f5f5f7',
            '& fieldset': {
              borderColor: 'transparent',
            },
            '&:hover fieldset': {
              borderColor: '#d2d2d7',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#007aff',
            },
          },
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#f5f5f7',
          borderRight: '1px solid rgba(0, 0, 0, 0.06)',
          width: 260,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255, 255, 255, 0.72)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
          boxShadow: 'none',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          margin: '4px 12px',
          padding: '10px 16px',
          color: '#555555',
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.04)',
          },
          '&.Mui-selected': {
            backgroundColor: 'rgba(0, 122, 255, 0.1)',
            color: '#007aff',
            '&:hover': {
              backgroundColor: 'rgba(0, 122, 255, 0.14)',
            },
          },
        },
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          color: '#86868b',
          minWidth: 36,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
        },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          borderColor: '#d2d2d7',
          color: '#555555',
          '&.Mui-selected': {
            backgroundColor: '#007aff',
            color: '#ffffff',
            '&:hover': {
              backgroundColor: '#0051d5',
            },
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 10,
        },
      },
    },
  },
};

export const theme = createTheme({
  ...macTheme,
  palette: {
    mode: 'light',
    primary: {
      main: '#007aff',
      light: '#5ac8fa',
      dark: '#0051d5',
    },
    secondary: {
      main: '#5856d6',
      light: '#af52de',
      dark: '#4b48cd',
    },
    success: {
      main: '#34c759',
      light: '#5fd47a',
      dark: '#248a3d',
    },
    error: {
      main: '#ff3b30',
      light: '#ff6b6b',
      dark: '#c41e3a',
    },
    warning: {
      main: '#ff9500',
      light: '#ffcc00',
      dark: '#c46a00',
    },
    info: {
      main: '#5ac8fa',
      light: '#7dc8fa',
      dark: '#007aff',
    },
    background: {
      default: '#f5f5f7',
      paper: '#ffffff',
    },
    text: {
      primary: '#1d1d1f',
      secondary: '#86868b',
      disabled: '#c7c7cc',
    },
    divider: 'rgba(0, 0, 0, 0.06)',
    action: {
      active: '#555555',
      hover: 'rgba(0, 0, 0, 0.04)',
      selected: 'rgba(0, 122, 255, 0.1)',
      disabled: '#c7c7cc',
      disabledBackground: '#f5f5f7',
    },
  },
});

export default theme;
