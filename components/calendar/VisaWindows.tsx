'use client'

import { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Paper,
  Chip,
  Stack,
  LinearProgress,
  IconButton,
  Tooltip,
  ToggleButton,
  ToggleButtonGroup,
  Divider,
  useTheme
} from '@mui/material'
import {
  Timeline as TimelineIcon,
  CalendarMonth as CalendarIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material'
import { format, subDays, differenceInDays, isWithinInterval, min, max } from 'date-fns'
import { Country, Stay } from '@/lib/types'

interface VisaWindow {
  countryCode: string
  windowType: 'rolling' | 'exit' | 'calendar'
  maxDays: number
  periodDays: number
  windowStart: Date
  windowEnd: Date
  daysUsed: number
  daysRemaining: number
  stays: Stay[]
  status: 'safe' | 'warning' | 'critical' | 'exceeded'
}

interface VisaWindowsProps {
  countries: Country[]
  stays: Stay[]
  selectedCountries: string[]
}

// Visa rules for US passport holders
const visaRules = {
  'KR': { maxDays: 90, periodDays: 180, resetType: 'exit' as const },
  'JP': { maxDays: 90, periodDays: 180, resetType: 'rolling' as const },
  'TH': { maxDays: 30, periodDays: 180, resetType: 'exit' as const },
  'VN': { maxDays: 45, periodDays: 180, resetType: 'exit' as const }
}

export default function VisaWindows({ countries, stays, selectedCountries }: VisaWindowsProps) {
  const theme = useTheme()
  const [visaWindows, setVisaWindows] = useState<VisaWindow[]>([])
  const [viewMode, setViewMode] = useState<'timeline' | 'cards'>('cards')
  const [showWindows, setShowWindows] = useState<Record<string, boolean>>({})

  useEffect(() => {
    calculateVisaWindows()
  }, [stays, selectedCountries])

  const calculateVisaWindows = () => {
    const today = new Date()
    const windows: VisaWindow[] = []

    // Get unique countries that have actual stay records
    const countriesWithStays = Array.from(new Set(stays.map(stay => stay.countryCode)))
    
    // Filter by selectedCountries if any are selected
    const countriesToShow = selectedCountries.length > 0 
      ? countriesWithStays.filter(country => selectedCountries.includes(country))
      : countriesWithStays

    countriesToShow.forEach(countryCode => {
      const rule = visaRules[countryCode as keyof typeof visaRules]
      if (!rule) return

      const countryStays = stays.filter(stay => stay.countryCode === countryCode)
      
      if (rule.resetType === 'rolling') {
        // Rolling window (e.g., Japan - 90 days in 180)
        const windowStart = subDays(today, rule.periodDays - 1)
        const windowEnd = today

        const daysUsed = countryStays.reduce((total, stay) => {
          const stayEnd = stay.exitDate ? new Date(stay.exitDate) : today
          const stayStart = new Date(stay.entryDate)
          
          // Calculate overlap with window
          if (stayEnd < windowStart || stayStart > windowEnd) return total
          
          const overlapStart = max([stayStart, windowStart])
          const overlapEnd = min([stayEnd, windowEnd])
          
          return total + differenceInDays(overlapEnd, overlapStart) + 1
        }, 0)

        const daysRemaining = Math.max(0, rule.maxDays - daysUsed)
        
        windows.push({
          countryCode,
          windowType: 'rolling',
          maxDays: rule.maxDays,
          periodDays: rule.periodDays,
          windowStart,
          windowEnd,
          daysUsed,
          daysRemaining,
          stays: countryStays.filter(stay => {
            const stayEnd = stay.exitDate ? new Date(stay.exitDate) : today
            return stayEnd >= windowStart
          }),
          status: getStatus(daysUsed, rule.maxDays)
        })
      } else {
        // Exit reset (e.g., Korea, Thailand, Vietnam)
        // Find the most recent entry
        const sortedStays = [...countryStays].sort((a, b) => 
          new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime()
        )
        
        const mostRecentStay = sortedStays[0]
        
        if (mostRecentStay) {
          const windowStart = new Date(mostRecentStay.entryDate)
          const windowEnd = mostRecentStay.exitDate 
            ? new Date(mostRecentStay.exitDate)
            : today

          const daysUsed = differenceInDays(windowEnd, windowStart) + 1
          const daysRemaining = Math.max(0, rule.maxDays - daysUsed)

          windows.push({
            countryCode,
            windowType: 'exit',
            maxDays: rule.maxDays,
            periodDays: rule.periodDays,
            windowStart,
            windowEnd,
            daysUsed,
            daysRemaining,
            stays: [mostRecentStay],
            status: getStatus(daysUsed, rule.maxDays)
          })
        }
        // Skip countries with no stays - they shouldn't show in visa windows
      }
    })

    setVisaWindows(windows)
    
    // Initialize show/hide state for each window
    const initialShowState: Record<string, boolean> = {}
    windows.forEach(w => {
      initialShowState[w.countryCode] = true
    })
    setShowWindows(initialShowState)
  }

  const getStatus = (daysUsed: number, maxDays: number): VisaWindow['status'] => {
    const percentage = (daysUsed / maxDays) * 100
    if (percentage > 100) return 'exceeded'
    if (percentage >= 90) return 'critical'
    if (percentage >= 75) return 'warning'
    return 'safe'
  }

  const getStatusColor = (status: VisaWindow['status']) => {
    switch (status) {
      case 'exceeded': return '#d32f2f'
      case 'critical': return '#f44336'
      case 'warning': return '#ff9800'
      case 'safe': return '#4caf50'
    }
  }

  const getStatusIcon = (status: VisaWindow['status']) => {
    switch (status) {
      case 'exceeded':
      case 'critical':
        return <WarningIcon sx={{ fontSize: 16, color: getStatusColor(status) }} />
      case 'warning':
        return <InfoIcon sx={{ fontSize: 16, color: getStatusColor(status) }} />
      case 'safe':
        return <CheckCircleIcon sx={{ fontSize: 16, color: getStatusColor(status) }} />
    }
  }

  const toggleWindowVisibility = (countryCode: string) => {
    setShowWindows(prev => ({
      ...prev,
      [countryCode]: !prev[countryCode]
    }))
  }

  // Only show if there are stays AND visa windows
  if (stays.length === 0 || visaWindows.length === 0) {
    return null
  }

  return (
    <Box sx={{
      p: 0,
      minHeight: 50,
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: 'white',
      border: '1px solid',
      borderColor: theme.palette.divider,
      borderRadius: 2
    }}>
      <Box sx={{ 
        mb: 3,
        pb: 2,
        px: 3,
        pt: 3,
        borderBottom: '1px solid',
        borderBottomColor: theme.palette.divider,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Typography 
          variant="h6" 
          component="h2" 
          sx={{
            color: theme.palette.text.primary,
            fontFamily: 'Google Sans, Roboto, sans-serif',
            fontWeight: 400,
            fontSize: '1.125rem',
            mb: 0.5
          }}
        >
          Visa Windows
        </Typography>
        
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={(e, newMode) => newMode && setViewMode(newMode)}
          size="small"
        >
          <ToggleButton value="cards" aria-label="card view">
            <CalendarIcon sx={{ fontSize: 18 }} />
          </ToggleButton>
          <ToggleButton value="timeline" aria-label="timeline view">
            <TimelineIcon sx={{ fontSize: 18 }} />
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Box sx={{ p: 3 }}>
        {viewMode === 'cards' ? (
          <Stack spacing={2}>
            {visaWindows.map(window => {
              const country = countries.find(c => c.code === window.countryCode)
              const percentage = (window.daysUsed / window.maxDays) * 100
              const isVisible = showWindows[window.countryCode]

              return (
                <Paper
                  key={window.countryCode}
                  elevation={0}
                  sx={{
                    p: 2,
                    border: '1px solid #e8eaed',
                    borderRadius: 2,
                    backgroundColor: isVisible ? 'white' : '#f8f9fa'
                  }}
                >
                  <Stack spacing={2}>
                    {/* Header */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="h6" component="span">
                          {country?.flag}
                        </Typography>
                        <Typography variant="subtitle1" fontWeight={500}>
                          {country?.name}
                        </Typography>
                        {getStatusIcon(window.status)}
                        <Chip
                          label={window.windowType === 'rolling' ? 'Rolling Window' : 'Per Entry'}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: '11px' }}
                        />
                      </Stack>
                      
                      <IconButton
                        size="small"
                        onClick={() => toggleWindowVisibility(window.countryCode)}
                      >
                        {isVisible ? <VisibilityIcon /> : <VisibilityOffIcon />}
                      </IconButton>
                    </Box>

                    {isVisible && (
                      <>
                        {/* Window Period */}
                        <Box sx={{ 
                          backgroundColor: '#f8f9fa', 
                          p: 1.5, 
                          borderRadius: 1,
                          border: '1px dashed #dadce0'
                        }}>
                          <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                            {window.windowType === 'rolling' 
                              ? `Rolling ${window.periodDays}-day window`
                              : 'Current entry period'}
                          </Typography>
                          <Typography variant="body2">
                            {format(window.windowStart, 'MMM d, yyyy')} → {format(window.windowEnd, 'MMM d, yyyy')}
                          </Typography>
                        </Box>

                        {/* Progress Bar */}
                        <Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2">
                              {window.daysUsed} / {window.maxDays} days used
                            </Typography>
                            <Typography 
                              variant="body2" 
                              color={window.status === 'safe' ? 'success.main' : 'warning.main'}
                              fontWeight={500}
                            >
                              {window.daysRemaining} days remaining
                            </Typography>
                          </Box>
                          
                          <LinearProgress
                            variant="determinate"
                            value={Math.min(percentage, 100)}
                            sx={{
                              height: 8,
                              borderRadius: 1,
                              backgroundColor: '#e8eaed',
                              '& .MuiLinearProgress-bar': {
                                backgroundColor: getStatusColor(window.status),
                                borderRadius: 1
                              }
                            }}
                          />
                        </Box>

                        {/* Recent Stays in Window */}
                        {window.stays.length > 0 && (
                          <Box>
                            <Typography variant="caption" color="text.secondary" gutterBottom>
                              Stays in this window:
                            </Typography>
                            <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 0.5 }}>
                              {window.stays.slice(0, 3).map((stay, idx) => (
                                <Chip
                                  key={idx}
                                  label={`${format(new Date(stay.entryDate), 'MMM d')}${
                                    stay.exitDate ? ` - ${format(new Date(stay.exitDate), 'MMM d')}` : ' (ongoing)'
                                  }`}
                                  size="small"
                                  variant="outlined"
                                  sx={{ fontSize: '11px' }}
                                />
                              ))}
                              {window.stays.length > 3 && (
                                <Chip
                                  label={`+${window.stays.length - 3} more`}
                                  size="small"
                                  variant="filled"
                                  sx={{ fontSize: '11px' }}
                                />
                              )}
                            </Stack>
                          </Box>
                        )}
                      </>
                    )}
                  </Stack>
                </Paper>
              )
            })}
          </Stack>
        ) : (
          // Timeline View
          <Box sx={{ position: 'relative', pt: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Timeline visualization coming soon...
            </Typography>
            {/* Timeline visualization will be added in the advanced analytics module */}
          </Box>
        )}
      </Box>
    </Box>
  )
}