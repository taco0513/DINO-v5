'use client'

import { 
  Paper, 
  Typography, 
  Box, 
  useTheme,
  Stack,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar
} from '@mui/material'
import { 
  Place as PlaceIcon,
  Flight as FlightIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material'
import { Stay } from '@/lib/types'
import { countries } from '@/lib/data/countries-and-airports'
import { useMemo } from 'react'

interface MapWidgetProps {
  stays: Stay[]
  height?: number
  title?: string
}

export default function MapWidget({ stays, height = 320, title }: MapWidgetProps) {
  const theme = useTheme()
  
  // Calculate statistics from stays
  const stats = useMemo(() => {
    if (!stays || stays.length === 0) {
      return {
        totalCountries: 0,
        currentCountry: null,
        recentCountries: [],
        totalDays: 0,
        longestStay: null
      }
    }
    
    // Get unique countries
    const uniqueCountries = [...new Set(stays.map(s => s.countryCode))]
    
    // Get current country (ongoing stay)
    const ongoingStay = stays.find(s => !s.exitDate)
    const currentCountry = ongoingStay 
      ? countries.find(c => c.code === ongoingStay.countryCode)
      : null
    
    // Get recent countries (last 5 unique)
    const recentCountryCodes = stays
      .slice(-10)
      .map(s => s.countryCode)
      .filter((code, index, self) => self.indexOf(code) === index)
      .slice(0, 5)
    
    const recentCountries = recentCountryCodes
      .map(code => {
        const country = countries.find(c => c.code === code)
        const countryStays = stays.filter(s => s.countryCode === code)
        const totalDays = countryStays.reduce((sum, stay) => {
          const days = stay.exitDate 
            ? Math.ceil((new Date(stay.exitDate).getTime() - new Date(stay.entryDate).getTime()) / (1000 * 60 * 60 * 24)) + 1
            : Math.ceil((new Date().getTime() - new Date(stay.entryDate).getTime()) / (1000 * 60 * 60 * 24)) + 1
          return sum + days
        }, 0)
        
        return {
          country,
          visits: countryStays.length,
          totalDays
        }
      })
      .filter(item => item.country)
    
    // Calculate total days
    const totalDays = stays.reduce((sum, stay) => {
      const days = stay.exitDate 
        ? Math.ceil((new Date(stay.exitDate).getTime() - new Date(stay.entryDate).getTime()) / (1000 * 60 * 60 * 24)) + 1
        : Math.ceil((new Date().getTime() - new Date(stay.entryDate).getTime()) / (1000 * 60 * 60 * 24)) + 1
      return sum + days
    }, 0)
    
    // Find longest stay
    const longestStay = stays.reduce((longest, stay) => {
      const days = stay.exitDate 
        ? Math.ceil((new Date(stay.exitDate).getTime() - new Date(stay.entryDate).getTime()) / (1000 * 60 * 60 * 24)) + 1
        : Math.ceil((new Date().getTime() - new Date(stay.entryDate).getTime()) / (1000 * 60 * 60 * 24)) + 1
      
      if (!longest || days > longest.days) {
        const country = countries.find(c => c.code === stay.countryCode)
        return { country, days, stay }
      }
      return longest
    }, null as { country: any; days: number; stay: Stay } | null)
    
    return {
      totalCountries: uniqueCountries.length,
      currentCountry,
      recentCountries,
      totalDays,
      longestStay
    }
  }, [stays])
  
  return (
    <Paper sx={{ height: '100%', p: 2, display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 500, fontSize: '1rem' }}>
          {title || 'Travel Map'}
        </Typography>
        
        {stats.currentCountry && (
          <Chip
            icon={<PlaceIcon />}
            label={`Currently in ${stats.currentCountry.name}`}
            color="primary"
            size="small"
            sx={{ fontWeight: 500 }}
          />
        )}
      </Stack>
      
      {/* Map Placeholder */}
      <Box 
        sx={{ 
          flex: 1,
          minHeight: 0,
          backgroundColor: theme.palette.action.hover,
          borderRadius: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* World map visualization placeholder */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(135deg, ${theme.palette.primary.light}20 0%, ${theme.palette.secondary.light}20 100%)`,
            opacity: 0.5
          }}
        />
        
        {/* Stats overlay */}
        <Stack 
          spacing={2} 
          sx={{ 
            position: 'relative',
            zIndex: 1,
            width: '100%',
            maxWidth: 400,
            p: 2
          }}
        >
          {/* Quick stats */}
          <Stack direction="row" spacing={2} justifyContent="center">
            <Chip
              icon={<FlightIcon />}
              label={`${stats.totalCountries} Countries`}
              variant="filled"
              sx={{ backgroundColor: theme.palette.background.paper }}
            />
            <Chip
              icon={<ScheduleIcon />}
              label={`${stats.totalDays} Days`}
              variant="filled"
              sx={{ backgroundColor: theme.palette.background.paper }}
            />
          </Stack>
          
          {/* Recent countries list */}
          {stats.recentCountries.length > 0 && (
            <Paper 
              elevation={0} 
              sx={{ 
                backgroundColor: theme.palette.background.paper,
                p: 1
              }}
            >
              <Typography 
                variant="caption" 
                sx={{ 
                  px: 1,
                  color: theme.palette.text.secondary,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}
              >
                Recent Countries
              </Typography>
              <List dense sx={{ py: 0 }}>
                {stats.recentCountries.slice(0, 3).map((item, index) => (
                  <ListItem key={index} sx={{ px: 1, py: 0.5 }}>
                    <ListItemAvatar sx={{ minWidth: 32 }}>
                      <Avatar sx={{ width: 24, height: 24, fontSize: '1rem' }}>
                        {item.country?.flag}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText 
                      primary={item.country?.name}
                      secondary={`${item.visits} visits • ${item.totalDays} days`}
                      primaryTypographyProps={{ fontSize: '0.875rem' }}
                      secondaryTypographyProps={{ fontSize: '0.75rem' }}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          )}
          
          {/* Longest stay */}
          {stats.longestStay && (
            <Box 
              sx={{ 
                textAlign: 'center',
                p: 1,
                backgroundColor: theme.palette.background.paper,
                borderRadius: 1
              }}
            >
              <Typography variant="caption" color="text.secondary">
                Longest Stay
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {stats.longestStay.country?.flag} {stats.longestStay.country?.name} • {stats.longestStay.days} days
              </Typography>
            </Box>
          )}
        </Stack>
        
        {!stats.totalCountries && (
          <Typography color="text.secondary" sx={{ position: 'relative', zIndex: 1 }}>
            No travel data available
          </Typography>
        )}
      </Box>
      
      {/* Footer note */}
      <Typography 
        variant="caption" 
        color="text.secondary" 
        sx={{ 
          mt: 1, 
          textAlign: 'center',
          fontStyle: 'italic'
        }}
      >
        Interactive map coming soon
      </Typography>
    </Paper>
  )
}