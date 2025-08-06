'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { CssBaseline } from '@mui/material'

interface ThemeContextType {
  theme: 'light' | 'dark'
  toggleTheme: () => void
  setTheme: (theme: 'light' | 'dark') => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

// Google Calendar inspired color scheme
const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1a73e8',
      light: '#e8f0fe',
      dark: '#1557b0',
    },
    background: {
      default: '#ffffff',
      paper: '#ffffff',
    },
    text: {
      primary: '#202124',
      secondary: '#70757a',
      disabled: '#dadce0',
    },
    divider: '#e8eaed',
    action: {
      hover: '#f8f9fa',
    },
  },
  typography: {
    fontFamily: '"Google Sans", "Roboto", "Arial", sans-serif',
    h5: {
      fontWeight: 400,
      fontSize: '1.375rem',
    },
    h6: {
      fontWeight: 400,
      fontSize: '1.125rem',
    },
  },
  shape: {
    borderRadius: 8,
  },
})

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#8ab4f8',
      light: '#1f2937',
      dark: '#5f8ffc',
    },
    background: {
      default: '#0f172a',
      paper: '#1e293b',
    },
    text: {
      primary: '#e2e8f0',
      secondary: '#94a3b8',
      disabled: '#475569',
    },
    divider: '#374151',
    action: {
      hover: '#1e293b',
    },
  },
  typography: {
    fontFamily: '"Google Sans", "Roboto", "Arial", sans-serif',
    h5: {
      fontWeight: 400,
      fontSize: '1.375rem',
    },
    h6: {
      fontWeight: 400,
      fontSize: '1.125rem',
    },
  },
  shape: {
    borderRadius: 8,
  },
})

export function CustomThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    // Load theme from localStorage or settings
    const savedSettings = localStorage.getItem('dino-v5-settings')
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings)
        if (settings.theme) {
          setThemeState(settings.theme)
        }
      } catch (error) {
        console.error('Failed to load theme setting:', error)
      }
    }
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
  }

  const setTheme = (newTheme: 'light' | 'dark') => {
    setThemeState(newTheme)
    
    // Update localStorage settings
    const savedSettings = localStorage.getItem('dino-v5-settings')
    let settings = {}
    
    if (savedSettings) {
      try {
        settings = JSON.parse(savedSettings)
      } catch (error) {
        console.error('Failed to parse settings:', error)
      }
    }
    
    const updatedSettings = { ...settings, theme: newTheme }
    localStorage.setItem('dino-v5-settings', JSON.stringify(updatedSettings))
  }

  const muiTheme = theme === 'dark' ? darkTheme : lightTheme

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      <ThemeProvider theme={muiTheme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a CustomThemeProvider')
  }
  return context
}