'use client'

import { useState, useMemo, useEffect } from 'react'
import { 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameDay, 
  isSameMonth,
  isWithinInterval,
  subDays,
  format,
  startOfWeek,
  endOfWeek,
  addDays,
  differenceInDays,
  max,
  min
} from 'date-fns'
import {
  Paper,
  Typography,
  Box,
  Grid,
  IconButton,
  Button,
  Skeleton,
  Stack,
  Tooltip,
  useTheme,
  Divider
} from '@mui/material'
import {
  ChevronLeft,
  ChevronRight,
  RestartAlt as ResetIcon
} from '@mui/icons-material'
import { Country, Stay } from '@/lib/types'
import { cardBoxStyle } from '@/lib/styles/common'
import { calculateAllVisaStatuses, calculateVisaStatus, type VisaCalculationContext } from '@/lib/visa-calculations/visa-engine'
import { getCurrentUserEmail } from '@/lib/context/user'

type ViewType = 'month' | 'week' | 'multi-month'

interface RollingCalendarProps {
  stays: Stay[]
  countries: Country[]
  selectedCountries: string[]
  loading: boolean
  visaWindowCountry?: string | null  // Optional: specific country to show visa window for
}

// Country colors for visual consistency
const countryColors: Record<string, string> = {
  'KR': '#ffebee',
  'JP': '#e3f2fd', 
  'TH': '#fff3e0',
  'VN': '#e8f5e9',
  'SG': '#f3e5f5',
  'MY': '#fce4ec',
  'ID': '#efebe9',
  'HK': '#fff3e0',
  'TW': '#eceff1',
  'PH': '#fffde7',
  'IN': '#fff8e1',
  'CN': '#ffebee',
  'US': '#e3f2fd',
  'GB': '#f3e5f5',
  'FR': '#ede7f6', // Schengen
  'DE': '#f5f5f5', // Schengen
  'IT': '#e0f2f1', // Schengen
  'ES': '#e0f2f1', // Schengen
  'NL': '#f1f8e9', // Schengen
  'CH': '#f9fbe7', // Schengen
  'AT': '#fffde7', // Schengen
  'BE': '#fff3e0', // Schengen
  'SE': '#fff3e0', // Schengen
  'NO': '#efebe9', // Schengen
  'DK': '#eceff1', // Schengen
  'FI': '#f3e5f5', // Schengen
  'AU': '#fce4ec',
  'NZ': '#e8f5e9',
  'CA': '#ffebee',
  'MX': '#fff3e0',
  'BR': '#e8f5e9',
  'AR': '#e3f2fd',
  'CL': '#f3e5f5',
  'PE': '#fff3e0',
  'CO': '#fffde7',
  'EC': '#f1f8e9',
  'UY': '#eceff1',
  'ZA': '#ffebee',
  'EG': '#e3f2fd',
  'MA': '#fff3e0',
  'TR': '#ffebee',
  'GR': '#e3f2fd', // Schengen
  'RU': '#fffde7',
  'IL': '#fff3e0',
  'JO': '#f1f8e9',
  'AE': '#fff3e0',
  'QA': '#e8f5e9',
  'SA': '#f9fbe7'
}

export default function RollingCalendar({ 
  stays, 
  countries, 
  selectedCountries, 
  loading,
  visaWindowCountry 
}: RollingCalendarProps) {
  const theme = useTheme()
  const [userEmail] = useState(getCurrentUserEmail())
  
  // Week start setting (0 = Sunday, 1 = Monday)
  const [weekStartsOn, setWeekStartsOn] = useState<0 | 1>(1)
  
  // Calculate visa statuses using proper engine
  const visaStatuses = useMemo(() => {
    if (!stays.length) return []
    
    const context: VisaCalculationContext = {
      nationality: 'US',
      referenceDate: new Date(),
      userEmail
    }
    
    return calculateAllVisaStatuses(stays, context)
  }, [stays, userEmail])
  
  // Helper function to get visa rule for a country
  const getVisaRule = (countryCode: string) => {
    // For Korea, if user has long-term-resident visa type stays, use that rule
    if (countryCode === 'KR' && userEmail === 'zbrianjin@gmail.com') {
      const koreaStays = stays.filter(s => s.countryCode === 'KR')
      const hasLongTermStay = koreaStays.some(s => s.visaType === 'long-term-resident')
      
      if (hasLongTermStay) {
        // Calculate with long-term-resident visa type
        const context: VisaCalculationContext = {
          nationality: 'US',
          referenceDate: new Date(),
          userEmail
        }
        
        const longTermStatus = calculateVisaStatus('KR', stays, context, 'long-term-resident')
        if (longTermStatus.rule) {
          return {
            maxDays: longTermStatus.rule.maxDays,
            periodDays: longTermStatus.rule.periodDays,
            resetType: longTermStatus.rule.resetType,
            color: countryColors[countryCode] || '#f5f5f5'
          }
        }
      }
    }
    
    // Default: use the calculated status from visaStatuses
    const status = visaStatuses.find(s => s.countryCode === countryCode)
    if (status?.rule) {
      return {
        maxDays: status.rule.maxDays,
        periodDays: status.rule.periodDays,
        resetType: status.rule.resetType,
        color: countryColors[countryCode] || '#f5f5f5'
      }
    }
    return null
  }
  
  // Dynamic weekday headers based on week start setting
  const weekdayHeaders = useMemo(() => {
    const sundayFirst = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
    const mondayFirst = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
    return weekStartsOn === 1 ? mondayFirst : sundayFirst
  }, [weekStartsOn])
  
  // Load week start setting from localStorage
  useEffect(() => {
    const loadWeekStartSetting = () => {
      const savedSettings = localStorage.getItem('dino-v5-settings')
      if (savedSettings) {
        try {
          const settings = JSON.parse(savedSettings)
          if (settings.weekStartsOn !== undefined) {
            setWeekStartsOn(settings.weekStartsOn)
          }
        } catch (error) {
          console.error('Failed to load week start setting:', error)
        }
      }
    }
    
    loadWeekStartSetting()
    
    // Listen for settings changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'dino-v5-settings') {
        loadWeekStartSetting()
      }
    }
    
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])
  
  // Always use multi-month view (remove view type switching)
  const viewType: ViewType = 'multi-month'
  
  // Current viewing date (center point for different views)
  const [currentDate, setCurrentDate] = useState(() => new Date())
  
  // End date for the rolling 16-month window (default: 2 months from today) - used for multi-month view
  const [endDate, setEndDate] = useState(() => {
    const date = new Date()
    date.setMonth(date.getMonth() + 2)
    return date
  })

  // Generate 16 months rolling window
  const rollingMonths = useMemo(() => {
    const months = []
    try {
      for (let i = 15; i >= 0; i--) {
        const monthDate = new Date(endDate)
        monthDate.setMonth(endDate.getMonth() - i)
        
        // Validate the generated date
        if (!isNaN(monthDate.getTime())) {
          months.push(monthDate)
        }
      }
    } catch (error) {
      console.error('Error generating rolling months:', error)
      // Fallback to just current month if there's an error
      months.push(new Date())
    }
    return months
  }, [endDate])

  // Get calendar days for a specific month (42 cells = 6 weeks)
  const getCalendarDaysForMonth = (monthDate: Date) => {
    try {
      // Validate input date
      if (!monthDate || isNaN(monthDate.getTime())) {
        console.warn('Invalid month date provided:', monthDate)
        return Array(42).fill(null)
      }

      const monthStart = startOfMonth(monthDate)
      const monthEnd = endOfMonth(monthDate)
      
      // Calculate padding based on week start setting
      const firstDayOfMonth = monthStart.getDay()
      const paddingDays = weekStartsOn === 1 
        ? (firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1)  // Monday start: Sunday = 6 days padding
        : firstDayOfMonth  // Sunday start: normal padding
      
      const calendarDays: (Date | null)[] = []
      
      // Pad with empty slots for previous month days
      for (let i = 0; i < paddingDays; i++) {
        calendarDays.push(null)
      }
      
      // Add actual month days
      const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd })
      monthDays.forEach(day => {
        if (day && !isNaN(day.getTime())) {
          calendarDays.push(day)
        }
      })
      
      // Pad to complete 6 weeks (42 total cells)
      while (calendarDays.length < 42) {
        calendarDays.push(null)
      }
      
      return calendarDays
    } catch (error) {
      console.error('Error generating calendar days for month:', monthDate, error)
      return Array(42).fill(null)
    }
  }

  // Get week days for week view
  const weekDays = useMemo(() => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn })
    const weekEnd = endOfWeek(currentDate, { weekStartsOn })
    return eachDayOfInterval({ start: weekStart, end: weekEnd })
  }, [currentDate, weekStartsOn])

  // Get single month for month view
  const singleMonth = useMemo(() => {
    return getCalendarDaysForMonth(currentDate)
  }, [currentDate, weekStartsOn])

  // Calculate visa windows for the selected country only
  const getVisaWindows = useMemo(() => {
    const windows: Record<string, { start: Date; end: Date }[]> = {}
    const today = new Date()
    
    // Only calculate visa windows if a specific country is selected for visa window display
    if (!visaWindowCountry) return windows
    
    const countryCode = visaWindowCountry
    const rule = getVisaRule(countryCode)
    if (!rule) return windows
    
    windows[countryCode] = []
    
    if (rule.resetType === 'rolling') {
      // Rolling window (e.g., Japan - 90 days in 180)
      // Show the current 180-day window
      const windowStart = subDays(today, rule.periodDays - 1)
      windows[countryCode].push({ start: windowStart, end: today })
    } else {
      // Exit reset (e.g., Korea, Thailand, Vietnam)
      // Show windows for each stay
      const countryStays = stays.filter(stay => stay.countryCode === countryCode && stay.entryDate)
      countryStays.forEach(stay => {
        const stayStart = new Date(stay.entryDate)
        const stayEnd = stay.exitDate ? new Date(stay.exitDate) : today
        
        // Only add if dates are valid
        if (!isNaN(stayStart.getTime()) && !isNaN(stayEnd.getTime())) {
          windows[countryCode].push({ start: stayStart, end: stayEnd })
        }
      })
    }
    
    return windows
  }, [visaWindowCountry, stays])

  // Check if a day is within any visa window
  const getDayVisaWindow = (day: Date) => {
    // Only show visa windows if a specific country is selected
    if (!visaWindowCountry) return null
    
    const windows = getVisaWindows[visaWindowCountry]
    if (!windows) return null
    
    for (const window of windows) {
      if (day >= window.start && day <= window.end) {
        return visaWindowCountry
      }
    }
    return null
  }

  // Get background color for visa windows
  const getDayBackgroundColor = (day: Date) => {
    const visaWindow = getDayVisaWindow(day)
    if (visaWindow) {
      const rule = getVisaRule(visaWindow)
      return rule?.color || 'transparent'
    }
    return 'transparent'
  }

  // Get stays for a specific day
  const getStaysForDay = (day: Date) => {
    return stays.filter(stay => {
      // If a visa window country is selected, only show stays for that country
      if (visaWindowCountry) {
        if (stay.countryCode !== visaWindowCountry) return false
      } else {
        // Otherwise, show stays for selected countries, or all countries if none selected
        if (selectedCountries.length > 0 && !selectedCountries.includes(stay.countryCode)) return false
      }
      
      // Validate stay dates
      if (!stay.entryDate) return false
      
      const entryDate = new Date(stay.entryDate)
      // If no exit date, use today as the end date (ongoing stay)
      const exitDate = stay.exitDate ? new Date(stay.exitDate) : new Date()
      
      // Check for invalid dates
      if (isNaN(entryDate.getTime()) || isNaN(exitDate.getTime())) return false
      
      // Reset times to compare dates only
      const entryDateOnly = new Date(entryDate)
      entryDateOnly.setHours(0, 0, 0, 0)
      
      const exitDateOnly = new Date(exitDate)
      exitDateOnly.setHours(23, 59, 59, 999)
      
      const checkDay = new Date(day)
      checkDay.setHours(12, 0, 0, 0)
      
      // Check if the day is within the stay period (inclusive)
      return checkDay >= entryDateOnly && checkDay <= exitDateOnly
    })
  }

  // Get country color for visual indicators - Generate colors based on country code
  const getCountryColor = (countryCode: string) => {
    const predefinedColors: Record<string, string> = {
      KR: '#ef5350', // Red
      JP: '#1976d2', // Blue 
      TH: '#ff9800', // Orange
      VN: '#4caf50', // Green
      SG: '#9c27b0', // Purple
      MY: '#e91e63', // Pink
      ID: '#795548', // Brown
      HK: '#ff5722', // Deep Orange
      TW: '#607d8b', // Blue Grey
      PH: '#ffeb3b', // Yellow
      IN: '#ffc107', // Amber
      CN: '#f44336', // Red
      US: '#2196f3', // Blue
      GB: '#3f51b5', // Indigo
      FR: '#673ab7', // Deep Purple
      DE: '#9e9e9e', // Grey
      IT: '#00bcd4', // Cyan
      ES: '#009688', // Teal
      NL: '#8bc34a', // Light Green
      CH: '#cddc39', // Lime
      AT: '#ffeb3b', // Yellow
      BE: '#ff9800', // Orange
      SE: '#ff5722', // Deep Orange
      NO: '#795548', // Brown
      DK: '#607d8b', // Blue Grey
      FI: '#9c27b0', // Purple
      AU: '#e91e63', // Pink
      NZ: '#4caf50', // Green
      CA: '#f44336', // Red
      MX: '#ff9800', // Orange
      BR: '#4caf50', // Green
      AR: '#2196f3', // Blue
      CL: '#9c27b0', // Purple
      PE: '#ff5722', // Deep Orange
      CO: '#ffeb3b', // Yellow
      EC: '#8bc34a', // Light Green
      BO: '#795548', // Brown
      UY: '#607d8b', // Blue Grey
      PY: '#9e9e9e', // Grey
      VE: '#e91e63', // Pink
      GY: '#00bcd4', // Cyan
      SR: '#009688', // Teal
      GF: '#cddc39', // Lime
      ZA: '#ef5350', // Red
      EG: '#1976d2', // Blue
      MA: '#ff9800', // Orange
      TN: '#4caf50', // Green
      DZ: '#9c27b0', // Purple
      LY: '#e91e63', // Pink
      SD: '#795548', // Brown
      ET: '#ff5722', // Deep Orange
      KE: '#ffeb3b', // Yellow
      TZ: '#8bc34a', // Light Green
      UG: '#607d8b', // Blue Grey
      RW: '#9e9e9e', // Grey
      GH: '#00bcd4', // Cyan
      NG: '#009688', // Teal
      CI: '#cddc39', // Lime
      SN: '#ef5350', // Red
      ML: '#1976d2', // Blue
      BF: '#ff9800', // Orange
      NE: '#4caf50', // Green
      TD: '#9c27b0', // Purple
      CF: '#e91e63', // Pink
      CM: '#795548', // Brown
      GQ: '#ff5722', // Deep Orange
      GA: '#ffeb3b', // Yellow
      CG: '#8bc34a', // Light Green
      CD: '#607d8b', // Blue Grey
      AO: '#9e9e9e', // Grey
      ZM: '#00bcd4', // Cyan
      ZW: '#009688', // Teal
      BW: '#cddc39', // Lime
      NA: '#ef5350', // Red
      SZ: '#1976d2', // Blue
      LS: '#ff9800', // Orange
      MZ: '#4caf50', // Green
      MW: '#9c27b0', // Purple
      MG: '#e91e63', // Pink
      MU: '#795548', // Brown
      SC: '#ff5722', // Deep Orange
      RU: '#ffeb3b', // Yellow
      KZ: '#8bc34a', // Light Green
      UZ: '#607d8b', // Blue Grey
      TM: '#9e9e9e', // Grey
      KG: '#00bcd4', // Cyan
      TJ: '#009688', // Teal
      AF: '#cddc39', // Lime
      PK: '#ef5350', // Red
      BD: '#1976d2', // Blue
      LK: '#ff9800', // Orange
      MV: '#4caf50', // Green
      NP: '#9c27b0', // Purple
      BT: '#e91e63', // Pink
      MM: '#795548', // Brown
      LA: '#ff5722', // Deep Orange
      KH: '#ffeb3b', // Yellow
      BN: '#8bc34a', // Light Green
      MN: '#607d8b', // Blue Grey
      KP: '#9e9e9e', // Grey
      GE: '#00bcd4', // Cyan
      AM: '#009688', // Teal
      AZ: '#cddc39', // Lime
      TR: '#ef5350', // Red
      GR: '#1976d2', // Blue
      BG: '#ff9800', // Orange
      RO: '#4caf50', // Green
      MD: '#9c27b0', // Purple
      UA: '#e91e63', // Pink
      BY: '#795548', // Brown
      LT: '#ff5722', // Deep Orange
      LV: '#ffeb3b', // Yellow
      EE: '#8bc34a', // Light Green
      PL: '#607d8b', // Blue Grey
      CZ: '#9e9e9e', // Grey
      SK: '#00bcd4', // Cyan
      HU: '#009688', // Teal
      SI: '#cddc39', // Lime
      HR: '#ef5350', // Red
      BA: '#1976d2', // Blue
      RS: '#ff9800', // Orange
      ME: '#4caf50', // Green
      MK: '#9c27b0', // Purple
      AL: '#e91e63', // Pink
      XK: '#795548', // Brown (Kosovo)
      IL: '#ff5722', // Deep Orange
      PS: '#ffeb3b', // Yellow
      JO: '#8bc34a', // Light Green
      LB: '#607d8b', // Blue Grey
      SY: '#9e9e9e', // Grey
      IQ: '#00bcd4', // Cyan
      IR: '#009688', // Teal
      SA: '#cddc39', // Lime
      YE: '#ef5350', // Red
      OM: '#1976d2', // Blue
      AE: '#ff9800', // Orange
      QA: '#4caf50', // Green
      BH: '#9c27b0', // Purple
      KW: '#e91e63', // Pink
    }

    // If predefined color exists, use it
    if (predefinedColors[countryCode]) {
      return predefinedColors[countryCode]
    }
    
    // Otherwise, generate a color based on country code
    let hash = 0
    for (let i = 0; i < countryCode.length; i++) {
      hash = countryCode.charCodeAt(i) + ((hash << 5) - hash)
    }
    
    // Convert hash to HSL color
    const hue = Math.abs(hash) % 360
    const saturation = 65 // Fixed saturation for consistency
    const lightness = 50 // Fixed lightness for readability
    
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`
  }

  // Navigation functions
  const navigateMonths = (direction: 'prev' | 'next') => {
    if (viewType === 'multi-month') {
      setEndDate(prev => {
        const newDate = new Date(prev)
        newDate.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1))
        return newDate
      })
    } else if (viewType === 'month') {
      setCurrentDate(prev => {
        const newDate = new Date(prev)
        newDate.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1))
        return newDate
      })
    } else if (viewType === 'week') {
      setCurrentDate(prev => {
        const newDate = new Date(prev)
        newDate.setDate(prev.getDate() + (direction === 'next' ? 7 : -7))
        return newDate
      })
    }
  }

  const resetToDefault = () => {
    const date = new Date()
    date.setMonth(date.getMonth() + 2)
    setEndDate(date)
    setCurrentDate(new Date())
  }

  if (loading) {
    return (
      <Paper sx={{ p: 3 }}>
        <Skeleton variant="text" width="25%" height={40} sx={{ mb: 3 }} />
        <Grid container spacing={2}>
          {Array.from({ length: 16 }).map((_, i) => (
            <Grid size={{ xs: 6, md: 3 }} key={i}>
              <Skeleton variant="rectangular" height={250} sx={{ borderRadius: 2 }} />
            </Grid>
          ))}
        </Grid>
      </Paper>
    )
  }

  const today = new Date()
  
  return (
    <Box sx={cardBoxStyle}>
      {/* Ultra Minimal Google Style Header */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        mb: 3,
        pb: 2,
        px: 3,
        pt: 3,
        borderBottom: '1px solid #f1f3f4'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <Box>
            <Typography 
              variant="h6" 
              component="h2" 
              sx={{ 
                fontWeight: 400,
                fontFamily: 'Google Sans, Roboto, sans-serif',
                color: '#202124', // Google's text color
                mb: 2,
                fontSize: '1.375rem'
              }}
            >
              16-Month Rolling Calendar
            </Typography>
            <Button
              onClick={resetToDefault}
              variant="outlined"
              size="small"
              startIcon={<ResetIcon />}
              sx={{
                borderRadius: 5, // Google's pill-shaped buttons
                textTransform: 'none',
                fontWeight: 500,
                backgroundColor: 'background.paper',
                '&:hover': {
                  backgroundColor: 'action.hover'
                }
              }}
            >
              {format(subDays(endDate, 15 * 30), 'MMM yyyy')} - {format(endDate, 'MMM yyyy')}
            </Button>
          </Box>
        </Box>
        
        <Stack direction="row" spacing={1}>
          <Tooltip title="Previous month">
            <IconButton
              onClick={() => navigateMonths('prev')}
              size="medium"
              sx={{
                borderRadius: 2,
                backgroundColor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                '&:hover': {
                  backgroundColor: 'action.hover'
                }
              }}
            >
              <ChevronLeft />
            </IconButton>
          </Tooltip>
          <Tooltip title="Next month">
            <IconButton
              onClick={() => navigateMonths('next')}
              size="medium"
              sx={{
                borderRadius: 2,
                backgroundColor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                '&:hover': {
                  backgroundColor: 'action.hover'
                }
              }}
            >
              <ChevronRight />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>

      {/* Render 16-month rolling calendar */}
      <Box sx={{ px: 3, pb: 3 }}>
        <Grid container spacing={2}>
          {rollingMonths.map((monthDate, monthIndex) => {
            const calendarDays = getCalendarDaysForMonth(monthDate)
            
            return (
              <Grid size={{ xs: 6, md: 3 }} key={monthIndex}>
              <Box 
                sx={{ 
                  p: 2, 
                  backgroundColor: 'white'
                }}
              >
                {/* Ultra Minimal Month Header */}
                <Box sx={{ 
                  textAlign: 'left', 
                  mb: 2
                }}>
                  <Typography 
                    variant="subtitle2" 
                    sx={{
                      fontWeight: 400,
                      fontFamily: 'Google Sans, Roboto, sans-serif',
                      color: '#202124',
                      fontSize: '0.875rem'
                    }}
                  >
                    {format(monthDate, 'MMMM')}
                  </Typography>
                </Box>
                
                {/* Ultra Minimal Weekday Headers */}
                <Grid container spacing={0} sx={{ mb: 1 }}>
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                    <Grid size={{ xs: 'auto' }} key={i} sx={{ width: 'calc(100% / 7)' }}>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          textAlign: 'center', 
                          color: '#70757a', // Google's muted text
                          py: 0.25, 
                          display: 'block',
                          fontWeight: 400,
                          fontSize: '11px'
                        }}
                      >
                        {day}
                      </Typography>
                    </Grid>
                  ))}
                </Grid>
                
                {/* Ultra Minimal Google Style Days Grid */}
                <Grid container spacing={0}>
                  {calendarDays.map((day, dayIndex) => {
                    if (day === null) {
                      return (
                        <Grid size={{ xs: 'auto' }} key={dayIndex} sx={{ width: 'calc(100% / 7)' }}>
                          <Box sx={{ height: 3, minHeight: 24 }} />
                        </Grid>
                      )
                    }
                  
                    const dayStays = getStaysForDay(day)
                    const isToday = isSameDay(day, today)
                    const isCurrentMonth = isSameMonth(day, monthDate)
                    const dayBackground = getDayBackgroundColor(day)
                    
                    // Get the primary country for this day (for circle indicator)
                    const primaryStay = dayStays[0]
                    const hasStay = dayStays.length > 0
                    
                    return (
                      <Grid size={{ xs: 'auto' }} key={dayIndex} sx={{ width: 'calc(100% / 7)' }}>
                        <Box
                          sx={{
                            height: 3,
                            minHeight: 24,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            position: 'relative',
                            cursor: hasStay ? 'pointer' : 'default',
                            backgroundColor: dayBackground,
                            // Show stay indicator as circle with country color
                            ...(hasStay && {
                              '&::after': {
                                content: '""',
                                position: 'absolute',
                                width: 20,
                                height: 20,
                                borderRadius: '50%',
                                backgroundColor: getCountryColor(primaryStay.countryCode),
                                opacity: 0.85,
                                zIndex: 1
                              }
                            }),
                            // Today gets blue circle
                            ...(isToday && {
                              '&::after': {
                                content: '""',
                                position: 'absolute',
                                width: 22,
                                height: 22,
                                borderRadius: '50%',
                                backgroundColor: '#1a73e8',
                                zIndex: 1
                              }
                            })
                          }}
                        >
                          {/* Day Number */}
                          <Typography 
                            component="span" 
                            sx={{ 
                              fontSize: '12px',
                              fontWeight: hasStay || isToday ? 500 : 400,
                              color: !isCurrentMonth 
                                ? '#dadce0' 
                                : (hasStay || isToday)
                                  ? 'white'
                                  : '#202124',
                              lineHeight: 1,
                              position: 'relative',
                              zIndex: 2
                            }}
                          >
                            {format(day, 'd')}
                          </Typography>
                        </Box>
                      </Grid>
                    )
                  })}
                </Grid>
              </Box>
            </Grid>
          )
        })}
        </Grid>
      </Box>

      {/* Removed Single Month View */}
      {false && (
        <Box 
          sx={{ 
            p: 2, 
            backgroundColor: 'white'
          }}
        >
          {/* Ultra Minimal Month Header */}
          <Box sx={{ 
            textAlign: 'center', 
            mb: 3
          }}>
            <Typography 
              variant="h5" 
              sx={{
                fontWeight: 400,
                fontFamily: 'Google Sans, Roboto, sans-serif',
                color: '#202124',
                fontSize: '1.5rem'
              }}
            >
              {format(currentDate, 'MMMM yyyy')}
            </Typography>
          </Box>
          
          {/* Ultra Minimal Weekday Headers */}
          <Grid container spacing={0} sx={{ mb: 1 }}>
            {weekdayHeaders.map((day, i) => (
              <Grid size={12/7} key={i}>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    textAlign: 'center', 
                    color: '#70757a', 
                    py: 1, 
                    fontWeight: 400,
                    fontSize: '11px',
                    display: 'block'
                  }}
                >
                  {day}
                </Typography>
              </Grid>
            ))}
          </Grid>
          
          {/* Ultra Minimal Calendar Days Grid */}
          <Grid container spacing={0}>
            {singleMonth.map((day, dayIndex) => {
              if (day === null) {
                return (
                  <Grid size={12/7} key={dayIndex}>
                    <Box sx={{ height: 6, minHeight: 48 }} />
                  </Grid>
                )
              }
            
              const dayStays = getStaysForDay(day)
              const isToday = isSameDay(day, today)
              const isCurrentMonth = isSameMonth(day, currentDate)
              
              return (
                <Grid size={12/7} key={dayIndex}>
                  <Box
                    sx={{
                      height: 6,
                      minHeight: 48,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      cursor: dayStays.length > 0 ? 'pointer' : 'default',
                      // Ultra minimal - only today gets special styling
                      ...(isToday && {
                        backgroundColor: '#1a73e8',
                        borderRadius: '50%',
                        color: 'white',
                        width: 32,
                        height: 32,
                        mx: 'auto'
                      })
                    }}
                  >
                    {/* Ultra Minimal Day Number */}
                    <Typography 
                      component="span" 
                      sx={{ 
                        fontSize: '14px',
                        fontWeight: 400,
                        color: !isCurrentMonth 
                          ? '#dadce0' 
                          : isToday 
                            ? 'white'
                            : '#202124',
                        lineHeight: 1
                      }}
                    >
                      {format(day, 'd')}
                    </Typography>
                    
                    {/* Minimal Event Dots */}
                    {dayStays.length > 0 && !isToday && (
                      <Box sx={{ 
                        position: 'absolute',
                        bottom: 4,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        display: 'flex',
                        gap: 1
                      }}>
                        {dayStays.slice(0, 4).map((stay, stayIndex) => (
                          <Box
                            key={stay.id}
                            sx={{
                              width: 6,
                              height: 6,
                              borderRadius: '50%',
                              backgroundColor: getCountryColor(stay.countryCode)
                            }}
                            title={`${countries.find(c => c.code === stay.countryCode)?.name}`}
                          />
                        ))}
                      </Box>
                    )}
                  </Box>
                </Grid>
              )
            })}
          </Grid>
        </Box>
      )}

      {/* Removed Week View */}
      {false && (
        <Box 
          sx={{ 
            p: 2, 
            backgroundColor: 'white'
          }}
        >
          {/* Ultra Minimal Week Header */}
          <Box sx={{ 
            textAlign: 'center', 
            mb: 3
          }}>
            <Typography 
              variant="h5" 
              sx={{
                fontWeight: 400,
                fontFamily: 'Google Sans, Roboto, sans-serif',
                color: '#202124',
                fontSize: '1.5rem'
              }}
            >
              {format(startOfWeek(currentDate, { weekStartsOn }), 'MMM d')} - {format(endOfWeek(currentDate, { weekStartsOn }), 'MMM d, yyyy')}
            </Typography>
          </Box>
          
          {/* Ultra Minimal Week Days */}
          <Grid container spacing={0}>
            {weekDays.map((day, dayIndex) => {
              const dayStays = getStaysForDay(day)
              const isToday = isSameDay(day, today)
              
              return (
                <Grid size={12/7} key={dayIndex}>
                  <Box
                    sx={{
                      p: 2,
                      minHeight: 10,
                      display: 'flex',
                      flexDirection: 'column',
                      backgroundColor: 'white',
                      borderRight: dayIndex < 6 ? '1px solid #f1f3f4' : 'none'
                    }}
                  >
                    {/* Ultra Minimal Day Header */}
                    <Box sx={{ textAlign: 'center', mb: 2 }}>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: '#70757a',
                          fontWeight: 500,
                          fontSize: '11px'
                        }}
                      >
                        {format(day, 'EEE').toUpperCase()}
                      </Typography>
                      <Box 
                        sx={{
                          mt: 0.5,
                          ...(isToday && {
                            backgroundColor: '#1a73e8',
                            borderRadius: '50%',
                            color: 'white',
                            width: 32,
                            height: 32,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mx: 'auto'
                          })
                        }}
                      >
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            fontWeight: 400,
                            color: isToday ? 'white' : '#202124',
                            fontSize: '1.125rem'
                          }}
                        >
                          {format(day, 'd')}
                        </Typography>
                      </Box>
                    </Box>
                    
                    {/* Ultra Minimal Events */}
                    <Box sx={{ flex: 1 }}>
                      {dayStays.map((stay, stayIndex) => {
                        const country = countries.find(c => c.code === stay.countryCode)
                        return (
                          <Box
                            key={stay.id}
                            sx={{
                              mb: 0.5,
                              px: 1,
                              py: 0.5,
                              borderRadius: 3,
                              backgroundColor: getCountryColor(stay.countryCode),
                              color: 'white',
                              fontSize: '11px',
                              fontWeight: 500,
                              cursor: 'pointer',
                              '&:hover': {
                                opacity: 0.8
                              }
                            }}
                            title={`${country?.name}${stay.notes ? ` - ${stay.notes}` : ''}`}
                          >
                            <Typography variant="caption" sx={{ color: 'white', fontSize: '10px' }}>
                              {country?.flag} {country?.name}
                            </Typography>
                          </Box>
                        )
                      })}
                    </Box>
                  </Box>
                </Grid>
              )
            })}
          </Grid>
        </Box>
      )}
      
      {/* Legend - Shows stay indicators and visa window when there are actual stays */}
      {stays.length > 0 && (
        <Box sx={{ 
          mt: 4, 
          pt: 2,
          px: 3,
          borderTop: '1px solid #f1f3f4'
        }}>
          <Stack spacing={2}>
            {/* Stay Indicators - Only show countries that have actual stays */}
            {(() => {
              // Get countries that have actual stay records
              const countriesWithStays = Array.from(new Set(stays.map(stay => stay.countryCode)))
              const availableCountries = countries
                .filter(country => countriesWithStays.includes(country.code))
                .filter(country => {
                  // If visa window country is selected, only show that country
                  if (visaWindowCountry) {
                    return country.code === visaWindowCountry
                  }
                  // Otherwise show countries with stays that are also selected
                  return selectedCountries.includes(country.code)
                })
              
              // Only show indicators if there are countries to display
              if (availableCountries.length === 0) return null
              
              return (
                <Box sx={{ 
                  display: 'flex',
                  alignItems: 'center',
                  gap: 3,
                  justifyContent: 'center'
                }}>
                  <Typography variant="caption" sx={{ color: '#70757a', fontSize: '11px', fontWeight: 500 }}>
                    Stay Indicators:
                  </Typography>
                  {availableCountries.map(country => (
                    <Box key={country.code} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ 
                        width: 16, 
                        height: 16, 
                        borderRadius: '50%',
                        backgroundColor: getCountryColor(country.code),
                        opacity: 0.85
                      }} />
                      <Typography variant="caption" sx={{ color: '#70757a', fontSize: '11px' }}>
                        {country.flag} {country.name}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )
            })()}
            
            {/* Visa Windows - Only show when a country is selected */}
            {visaWindowCountry && (
              <Box sx={{ 
                display: 'flex',
                alignItems: 'center',
                gap: 3,
                justifyContent: 'center'
              }}>
                <Typography variant="caption" sx={{ color: '#70757a', fontSize: '11px', fontWeight: 500 }}>
                  Visa Window:
                </Typography>
                {(() => {
                  const country = countries.find(c => c.code === visaWindowCountry)
                  const rule = getVisaRule(visaWindowCountry)
                  if (!rule || !country) return null
                  
                  return (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ 
                        width: 16, 
                        height: 16, 
                        backgroundColor: rule.color,
                        border: '1px solid #e0e0e0'
                      }} />
                      <Typography variant="caption" sx={{ color: '#70757a', fontSize: '11px' }}>
                        {country.flag} {rule.resetType === 'rolling' 
                          ? `Rolling ${rule.periodDays}-day window (${rule.maxDays} days max)` 
                          : `${rule.maxDays} days per entry`}
                      </Typography>
                    </Box>
                  )
                })()}
              </Box>
            )}
          </Stack>
        </Box>
      )}
    </Box>
  )
}