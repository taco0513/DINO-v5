// Common styles for consistent UI components
import { SxProps, Theme } from '@mui/material'

// Google Calendar inspired card/box styling
export const cardBoxStyle: SxProps<Theme> = {
  p: 0,
  minHeight: 50,
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: 'white',
  border: '1px solid #e8eaed',
  borderRadius: 2
}

// Google Calendar inspired header styling
export const cardHeaderStyle: SxProps<Theme> = {
  mb: 3,
  pb: 2,
  px: 3,
  pt: 3,
  borderBottom: '1px solid #f1f3f4'
}

// Google Calendar inspired title styling
export const cardTitleStyle: SxProps<Theme> = {
  color: '#202124',
  fontFamily: 'Google Sans, Roboto, sans-serif',
  fontWeight: 400,
  fontSize: '1.125rem',
  mb: 0.5
}

// Google Calendar inspired subtitle styling
export const cardSubtitleStyle: SxProps<Theme> = {
  color: '#70757a',
  fontSize: '13px'
}

// Google Calendar inspired section label
export const sectionLabelStyle: SxProps<Theme> = {
  mb: 2,
  color: '#70757a',
  fontWeight: 500,
  fontSize: '11px',
  textTransform: 'uppercase',
  letterSpacing: '0.8px'
}

// Google Calendar inspired button style
export const googleButtonStyle: SxProps<Theme> = {
  backgroundColor: '#1a73e8',
  textTransform: 'none',
  fontWeight: 500,
  px: 3,
  borderRadius: 2,
  '&:hover': {
    backgroundColor: '#1557b0'
  }
}

// Google Calendar inspired text button
export const googleTextButtonStyle: SxProps<Theme> = {
  color: '#1a73e8',
  textTransform: 'none',
  fontWeight: 500,
  '&:hover': {
    backgroundColor: 'rgba(26, 115, 232, 0.04)'
  }
}

// Export color palette for consistency
export const googleColors = {
  primary: '#1a73e8',
  primaryDark: '#1557b0',
  primaryLight: '#e8f0fe',
  textPrimary: '#202124',
  textSecondary: '#70757a',
  textDisabled: '#dadce0',
  borderLight: '#e8eaed',
  borderLighter: '#f1f3f4',
  hoverLight: '#f8f9fa',
  white: '#ffffff'
}
