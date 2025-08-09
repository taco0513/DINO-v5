'use client'

import { useState, useEffect } from 'react'
import { 
  Box, 
  Typography, 
  Container, 
  Paper, 
  Stack,
  Grid,
  AppBar,
  Toolbar,
  IconButton,
  useTheme
} from '@mui/material'
import {
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  Dashboard as DashboardIcon
} from '@mui/icons-material'
import Sidebar from '@/components/sidebar/SidebarEnhanced'
import CountryFilter from '@/components/calendar/CountryFilter'
import VisaWarnings from '@/components/calendar/VisaWarnings'
import StaysList from '@/components/stays/StaysList'
import UserMenu from '@/components/auth/UserMenu'
import ModularDashboard from '@/components/dashboard/ModularDashboard'
import { Country, Stay } from '@/lib/types'
import { getStays } from '@/lib/supabase/stays'
import { loadStaysFromStorage, saveStaysToStorage } from '@/lib/storage/stays-storage'
import { detectDateConflicts, autoResolveConflicts } from '@/lib/utils/date-conflict-resolver'
import { countries } from '@/lib/data/countries-and-airports'
import { logger } from '@/lib/utils/logger'

export default function Home() {
  const [selectedCountry, setSelectedCountry] = useState<string>('')
  const [selectedCountries, setSelectedCountries] = useState<string[]>([])
  const [stays, setStays] = useState<Stay[]>([])
  const [loading, setLoading] = useState(true)
  const theme = useTheme()

  useEffect(() => {
    loadAllStays()
  }, [])

  const loadAllStays = async () => {
    setLoading(true)
    try {
      let data: Stay[] = []
      
      // Try Supabase first for most up-to-date data
      try {
        logger.info('📡 Loading from Supabase...')
        data = await getStays()
        
        if (data.length > 0) {
          logger.info(`✅ Loaded ${data.length} stays from Supabase`)
          // Save to localStorage as backup
          saveStaysToStorage(data)
        } else {
          logger.info('📊 No data in Supabase, checking localStorage...')
          // If Supabase is empty, check localStorage
          data = loadStaysFromStorage()
          if (data.length > 0) {
            logger.info(`💾 Using ${data.length} stays from localStorage backup`)
          }
        }
      } catch (supabaseError) {
        logger.warn('⚠️ Supabase unavailable, using localStorage:', supabaseError)
        data = loadStaysFromStorage()
        if (data.length > 0) {
          logger.info(`💾 Using ${data.length} stays from localStorage`)
        }
      }
      
      // Auto-resolve any date conflicts
      const conflicts = detectDateConflicts(data)
      if (conflicts.some(c => c.severity === 'critical')) {
        logger.info('🔧 Auto-resolving', conflicts.length, 'date conflicts...')
        const resolvedStays = autoResolveConflicts(data)
        // Update localStorage with resolved data
        saveStaysToStorage(resolvedStays)
        data = resolvedStays
      }
      
      setStays(data)
    } catch (error) {
      logger.error('Failed to load stays:', error)
      setStays([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: theme.palette.background.default }}>
      <Sidebar 
        countries={countries}
        selectedCountry={selectedCountry}
        onSelectCountry={setSelectedCountry}
        currentPage="dashboard"
        onAddStay={loadAllStays}
      />
      
      <Box component="main" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', backgroundColor: theme.palette.background.default }}>
        {/* Material Design 3 Style Header */}
        <AppBar 
          position="sticky" 
          elevation={0}
          sx={{ 
            backgroundColor: theme.palette.background.paper,
            borderBottom: `1px solid ${theme.palette.divider}`,
            color: theme.palette.text.primary,
            top: 0,
            zIndex: 100
          }}
        >
          <Toolbar sx={{ px: { xs: 2, md: 3 } }}>
            <DashboardIcon sx={{ color: theme.palette.primary.main, mr: 2 }} />
            <Typography 
              variant="h6" 
              component="h1" 
              sx={{ 
                flexGrow: 1,
                color: theme.palette.text.primary,
                fontWeight: 500
              }}
            >
              Dashboard
            </Typography>

            {/* Action Bar */}
            <Stack direction="row" spacing={1} alignItems="center">
              <IconButton 
                sx={{ color: theme.palette.text.secondary }}
                size="small"
              >
                <SearchIcon fontSize="small" />
              </IconButton>
              
              <IconButton 
                sx={{ color: theme.palette.text.secondary }}
                size="small"
              >
                <NotificationsIcon fontSize="small" />
              </IconButton>
              
              <UserMenu />
            </Stack>
          </Toolbar>
        </AppBar>

        {/* Main Content Area */}
        <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
          <Container maxWidth="xl" sx={{ py: theme.spacing(3) }}>
          
          <Stack spacing={3}>
            {/* Modular Dashboard */}
            <ModularDashboard stays={stays} />
            
            {/* Quick Stats Cards - Hidden for now, replaced by modular dashboard */}
            <Grid container spacing={3} sx={{ display: 'none' }}>
              <Grid size={{ xs: 12, md: 6, lg: 3 }}>
                <Paper 
                  elevation={0}
                  sx={{ 
                    p: theme.spacing(3),
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: theme.shape.borderRadius,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: theme.shadows[2],
                      borderColor: 'transparent'
                    }
                  }}
                >
                  <Stack spacing={1}>
                    <Typography variant="body2" color="text.secondary">
                      Countries Visited
                    </Typography>
                    <Typography variant="h4" fontWeight={500}>
                      {stays.length > 0 ? [...new Set(stays.map(s => s.countryCode))].length : 0}
                    </Typography>
                  </Stack>
                </Paper>
              </Grid>
              
              <Grid size={{ xs: 12, md: 6, lg: 3 }}>
                <Paper 
                  elevation={0}
                  sx={{ 
                    p: theme.spacing(3),
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: theme.shape.borderRadius,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: theme.shadows[2],
                      borderColor: 'transparent'
                    }
                  }}
                >
                  <Stack spacing={1}>
                    <Typography variant="body2" color="text.secondary">
                      Total Days Traveled
                    </Typography>
                    <Typography variant="h4" fontWeight={500}>
                      {stays.length > 0 ? stays.reduce((acc, stay) => {
                        try {
                          // Validate dates first
                          if (!stay.entryDate || isNaN(new Date(stay.entryDate).getTime())) {
                            return acc
                          }
                          
                          const entryDate = new Date(stay.entryDate)
                          let days = 0
                          
                          if (stay.exitDate && !isNaN(new Date(stay.exitDate).getTime())) {
                            const exitDate = new Date(stay.exitDate)
                            days = Math.ceil((exitDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
                          } else {
                            days = Math.ceil((new Date().getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
                          }
                          
                          return acc + (days > 0 ? days : 0)
                        } catch (error) {
                          logger.error('Error calculating days for stay:', stay, error)
                          return acc
                        }
                      }, 0) : 0}
                    </Typography>
                  </Stack>
                </Paper>
              </Grid>

              <Grid size={{ xs: 12, md: 6, lg: 3 }}>
                <CountryFilter 
                  countries={countries}
                  stays={stays}
                  selectedCountries={selectedCountries}
                  onSelectionChange={setSelectedCountries}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6, lg: 3 }}>
                <VisaWarnings 
                  countries={countries}
                  stays={stays}
                />
              </Grid>
            </Grid>


            {/* Recent Activity */}
            <StaysList 
              countries={countries}
              onStaysChange={loadAllStays}
            />
            </Stack>
          </Container>
        </Box>
      </Box>
    </Box>
  )
}