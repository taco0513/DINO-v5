import { createTheme } from '@mui/material/styles'
import { red, blue, teal, green, orange, grey } from '@mui/material/colors'

// Extend the theme interface for custom Google colors
declare module '@mui/material/styles' {
  interface Palette {
    google: {
      blue: string
      red: string
      yellow: string
      green: string
      grey: string
      greyLight: string
      greyDark: string
      surface: string
      border: string
      borderLight: string
    }
  }
  interface PaletteOptions {
    google?: {
      blue: string
      red: string
      yellow: string
      green: string
      grey: string
      greyLight: string
      greyDark: string
      surface: string
      border: string
      borderLight: string
    }
  }
}

// Material Design 2 + Google Brand Colors 통합 테마
export const theme = createTheme({
  palette: {
    mode: 'light',
    // MD2 Primary Colors with Google Blue
    primary: {
      main: '#1a73e8',      // Google Blue (primary brand color)
      light: '#4285f4',     // Lighter Google Blue
      dark: '#1557b0',      // Darker Google Blue
      contrastText: '#ffffff',
    },
    secondary: {
      main: teal[600],      // MD2 Teal for accents
      light: teal[400],
      dark: teal[800],
      contrastText: '#ffffff',
    },
    error: {
      main: '#d93025',      // Google Red
      light: '#ea4335',
      dark: '#a50e0e',
      contrastText: '#ffffff',
    },
    warning: {
      main: '#fbbc04',      // Google Yellow
      light: '#fdd663',
      dark: '#f9ab00',
      contrastText: '#000000',
    },
    info: {
      main: '#4285f4',      // Google Blue (lighter)
      light: '#669df6',
      dark: '#1a73e8',
      contrastText: '#ffffff',
    },
    success: {
      main: '#0f9d58',      // Google Green (classic)
      light: '#34a853',     // Google Green (current)
      dark: '#0d7940',
      contrastText: '#ffffff',
    },
    // Google-specific colors
    google: {
      blue: '#1a73e8',      // Primary Google Blue
      red: '#ea4335',       // Google Red
      yellow: '#fbbc04',    // Google Yellow
      green: '#34a853',     // Google Green
      grey: '#5f6368',      // Google Grey 700
      greyLight: '#70757a', // Google Grey 600
      greyDark: '#202124',  // Google Grey 900
      surface: '#f8f9fa',   // Google Surface
      border: '#dadce0',    // Google Border
      borderLight: '#e8eaed', // Google Light Border
    },
    // MD2 Background with Google colors
    background: {
      default: '#ffffff',   // Clean white background
      paper: '#ffffff',
    },
    text: {
      primary: '#202124',   // Google Grey 900
      secondary: '#5f6368', // Google Grey 700
      disabled: '#9aa0a6',  // Google Grey 500
    },
    grey: {
      50: '#f8f9fa',
      100: '#f1f3f4',
      200: '#e8eaed',
      300: '#dadce0',
      400: '#bdc1c6',
      500: '#9aa0a6',
      600: '#80868b',
      700: '#5f6368',
      800: '#3c4043',
      900: '#202124',
    },
    divider: '#e8eaed',     // Google Light Border
    action: {
      hover: 'rgba(0, 0, 0, 0.04)',
      selected: 'rgba(26, 115, 232, 0.08)', // Google Blue with opacity
      disabled: 'rgba(0, 0, 0, 0.26)',
      disabledBackground: 'rgba(0, 0, 0, 0.12)',
    },
  },
  typography: {
    // Google Sans + Roboto fallback
    fontFamily: [
      '"Google Sans"',
      'Roboto',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    // MD2 Type Scale with Google adjustments
    h1: {
      fontSize: '96px',
      fontWeight: 300,
      letterSpacing: '-1.5px',
      lineHeight: 1.167,
    },
    h2: {
      fontSize: '60px',
      fontWeight: 300,
      letterSpacing: '-0.5px',
      lineHeight: 1.2,
    },
    h3: {
      fontSize: '48px',
      fontWeight: 400,
      letterSpacing: '0px',
      lineHeight: 1.167,
    },
    h4: {
      fontSize: '34px',
      fontWeight: 400,
      letterSpacing: '0.25px',
      lineHeight: 1.235,
    },
    h5: {
      fontSize: '24px',
      fontWeight: 400,
      letterSpacing: '0px',
      lineHeight: 1.334,
    },
    h6: {
      fontSize: '20px',
      fontWeight: 500,
      letterSpacing: '0.15px',
      lineHeight: 1.6,
    },
    subtitle1: {
      fontSize: '16px',
      fontWeight: 400,
      letterSpacing: '0.15px',
      lineHeight: 1.75,
    },
    subtitle2: {
      fontSize: '14px',
      fontWeight: 500,
      letterSpacing: '0.1px',
      lineHeight: 1.57,
    },
    body1: {
      fontSize: '16px',
      fontWeight: 400,
      letterSpacing: '0.5px',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '14px',
      fontWeight: 400,
      letterSpacing: '0.25px',
      lineHeight: 1.43,
    },
    button: {
      fontSize: '14px',
      fontWeight: 500,
      letterSpacing: '1.25px',
      lineHeight: 1.75,
      textTransform: 'uppercase',
    },
    caption: {
      fontSize: '12px',
      fontWeight: 400,
      letterSpacing: '0.4px',
      lineHeight: 1.66,
    },
    overline: {
      fontSize: '10px',
      fontWeight: 400,
      letterSpacing: '1.5px',
      lineHeight: 2.66,
      textTransform: 'uppercase',
    },
  },
  // MD2 Shape with Google style
  shape: {
    borderRadius: 8,  // Google's preferred radius (between 4-8px)
  },
  // MD2 Spacing Scale (8px base)
  spacing: 8,
  // MD2 Shadows
  shadows: [
    'none',
    // Elevation 1
    '0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12)',
    // Elevation 2
    '0px 3px 1px -2px rgba(0,0,0,0.2),0px 2px 2px 0px rgba(0,0,0,0.14),0px 1px 5px 0px rgba(0,0,0,0.12)',
    // Elevation 3
    '0px 3px 3px -2px rgba(0,0,0,0.2),0px 3px 4px 0px rgba(0,0,0,0.14),0px 1px 8px 0px rgba(0,0,0,0.12)',
    // Elevation 4
    '0px 2px 4px -1px rgba(0,0,0,0.2),0px 4px 5px 0px rgba(0,0,0,0.14),0px 1px 10px 0px rgba(0,0,0,0.12)',
    // Elevation 5
    '0px 3px 5px -1px rgba(0,0,0,0.2),0px 5px 8px 0px rgba(0,0,0,0.14),0px 1px 14px 0px rgba(0,0,0,0.12)',
    // Elevation 6
    '0px 3px 5px -1px rgba(0,0,0,0.2),0px 6px 10px 0px rgba(0,0,0,0.14),0px 1px 18px 0px rgba(0,0,0,0.12)',
    // Elevation 7
    '0px 4px 5px -2px rgba(0,0,0,0.2),0px 7px 10px 1px rgba(0,0,0,0.14),0px 2px 16px 1px rgba(0,0,0,0.12)',
    // Elevation 8
    '0px 5px 5px -3px rgba(0,0,0,0.2),0px 8px 10px 1px rgba(0,0,0,0.14),0px 3px 14px 2px rgba(0,0,0,0.12)',
    // Additional elevations for Google style
    '0px 5px 6px -3px rgba(0,0,0,0.2),0px 9px 12px 1px rgba(0,0,0,0.14),0px 3px 16px 2px rgba(0,0,0,0.12)',
    '0px 6px 6px -3px rgba(0,0,0,0.2),0px 10px 14px 1px rgba(0,0,0,0.14),0px 4px 18px 3px rgba(0,0,0,0.12)',
    '0px 6px 7px -4px rgba(0,0,0,0.2),0px 11px 15px 1px rgba(0,0,0,0.14),0px 4px 20px 3px rgba(0,0,0,0.12)',
    '0px 7px 8px -4px rgba(0,0,0,0.2),0px 12px 17px 2px rgba(0,0,0,0.14),0px 5px 22px 4px rgba(0,0,0,0.12)',
    '0px 7px 8px -4px rgba(0,0,0,0.2),0px 13px 19px 2px rgba(0,0,0,0.14),0px 5px 24px 4px rgba(0,0,0,0.12)',
    '0px 7px 9px -4px rgba(0,0,0,0.2),0px 14px 21px 2px rgba(0,0,0,0.14),0px 5px 26px 4px rgba(0,0,0,0.12)',
    '0px 8px 9px -5px rgba(0,0,0,0.2),0px 15px 22px 2px rgba(0,0,0,0.14),0px 6px 28px 5px rgba(0,0,0,0.12)',
    '0px 8px 10px -5px rgba(0,0,0,0.2),0px 16px 24px 2px rgba(0,0,0,0.14),0px 6px 30px 5px rgba(0,0,0,0.12)',
    '0px 8px 11px -5px rgba(0,0,0,0.2),0px 17px 26px 2px rgba(0,0,0,0.14),0px 6px 32px 5px rgba(0,0,0,0.12)',
    '0px 9px 11px -5px rgba(0,0,0,0.2),0px 18px 28px 2px rgba(0,0,0,0.14),0px 7px 34px 6px rgba(0,0,0,0.12)',
    '0px 9px 12px -6px rgba(0,0,0,0.2),0px 19px 29px 2px rgba(0,0,0,0.14),0px 7px 36px 6px rgba(0,0,0,0.12)',
    '0px 10px 13px -6px rgba(0,0,0,0.2),0px 20px 31px 3px rgba(0,0,0,0.14),0px 8px 38px 7px rgba(0,0,0,0.12)',
    '0px 10px 13px -6px rgba(0,0,0,0.2),0px 21px 33px 3px rgba(0,0,0,0.14),0px 8px 40px 7px rgba(0,0,0,0.12)',
    '0px 10px 14px -6px rgba(0,0,0,0.2),0px 22px 35px 3px rgba(0,0,0,0.14),0px 8px 42px 7px rgba(0,0,0,0.12)',
    '0px 11px 14px -7px rgba(0,0,0,0.2),0px 23px 36px 3px rgba(0,0,0,0.14),0px 9px 44px 8px rgba(0,0,0,0.12)',
    '0px 11px 15px -7px rgba(0,0,0,0.2),0px 24px 38px 3px rgba(0,0,0,0.14),0px 9px 46px 8px rgba(0,0,0,0.12)',
  ],
  components: {
    // Material Design 2 Component Overrides with Google style
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarColor: '#bdc1c6 #f8f9fa',
          '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
            width: '8px',
            height: '8px',
          },
          '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
            borderRadius: 8,
            backgroundColor: '#bdc1c6',
            border: '2px solid #f8f9fa',
          },
          '&::-webkit-scrollbar-track, & *::-webkit-scrollbar-track': {
            borderRadius: 8,
            backgroundColor: '#f8f9fa',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        rounded: {
          borderRadius: 8,
        },
        outlined: {
          border: '1px solid #e8eaed',
        },
      },
      defaultProps: {
        elevation: 1,
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          border: '1px solid #e8eaed',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 1px 2px 0px rgba(60,64,67,0.3), 0px 1px 3px 1px rgba(60,64,67,0.15)',
          },
          transition: 'box-shadow 200ms cubic-bezier(0.4, 0, 0.2, 1)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          textTransform: 'none',  // Google style: no uppercase
          fontWeight: 500,
          fontSize: '14px',
          letterSpacing: '0.25px',
          padding: '8px 24px',
          transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 1px 2px 0px rgba(60,64,67,0.3), 0px 1px 3px 1px rgba(60,64,67,0.15)',
          },
        },
        outlined: {
          borderColor: '#dadce0',
          '&:hover': {
            backgroundColor: 'rgba(26, 115, 232, 0.04)',
            borderColor: '#dadce0',
          },
        },
        text: {
          '&:hover': {
            backgroundColor: 'rgba(26, 115, 232, 0.04)',
          },
        },
      },
      defaultProps: {
        disableElevation: true,
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          height: 32,
          fontSize: '14px',
          fontWeight: 400,
        },
        outlined: {
          borderColor: '#dadce0',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 4,
            '& fieldset': {
              borderColor: '#dadce0',
            },
            '&:hover fieldset': {
              borderColor: '#80868b',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#1a73e8',
              borderWidth: 2,
            },
          },
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          fontSize: '14px',
          minHeight: 48,
          '&.Mui-selected': {
            color: '#1a73e8',
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          backgroundColor: '#1a73e8',
          height: 3,
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        root: {
          boxShadow: '0px 3px 5px -1px rgba(0,0,0,0.2),0px 6px 10px 0px rgba(0,0,0,0.14),0px 1px 18px 0px rgba(0,0,0,0.12)',
          '&:hover': {
            boxShadow: '0px 5px 5px -3px rgba(0,0,0,0.2),0px 8px 10px 1px rgba(0,0,0,0.14),0px 3px 14px 2px rgba(0,0,0,0.12)',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          color: '#202124',
          boxShadow: 'none',
          borderBottom: '1px solid #e8eaed',
        },
      },
      defaultProps: {
        elevation: 0,
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#ffffff',
          borderRight: '1px solid #e8eaed',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: '0 24px 24px 0',
          marginRight: 12,
          '&.Mui-selected': {
            backgroundColor: '#e8f0fe',
            '&:hover': {
              backgroundColor: '#e8f0fe',
            },
          },
          '&:hover': {
            backgroundColor: '#f1f3f4',
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
        standardInfo: {
          backgroundColor: '#e8f0fe',
          color: '#1967d2',
        },
        standardSuccess: {
          backgroundColor: '#e6f4ea',
          color: '#137333',
        },
        standardWarning: {
          backgroundColor: '#fef7e0',
          color: '#ea8600',
        },
        standardError: {
          backgroundColor: '#fce8e6',
          color: '#c5221f',
        },
      },
    },
  },
})

// Material Design 2 Dark Theme with Google colors
export const darkTheme = createTheme({
  ...theme,
  palette: {
    ...theme.palette,
    mode: 'dark',
    primary: {
      main: '#8ab4f8',      // Light Google Blue for dark mode
      light: '#aecbfa',
      dark: '#669df6',
      contrastText: '#000000',
    },
    background: {
      default: '#202124',   // Google Dark Grey
      paper: '#292a2d',
    },
    text: {
      primary: '#e8eaed',
      secondary: '#9aa0a6',
      disabled: '#5f6368',
    },
    divider: '#3c4043',
    google: {
      ...theme.palette.google!,
      surface: '#292a2d',
      border: '#3c4043',
      borderLight: '#5f6368',
    },
  },
})

export default theme