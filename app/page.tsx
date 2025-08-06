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
  IconButton
} from '@mui/material'
import {
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  Dashboard as DashboardIcon
} from '@mui/icons-material'
import Sidebar from '@/components/sidebar/Sidebar'
import CountryFilter from '@/components/calendar/CountryFilter'
import VisaWarnings from '@/components/calendar/VisaWarnings'
import StaysList from '@/components/stays/StaysList'
import UserMenu from '@/components/auth/UserMenu'
import { Country, Stay } from '@/lib/types'
import { getStays } from '@/lib/supabase/stays'
import { loadStaysFromStorage, saveStaysToStorage } from '@/lib/storage/stays-storage'

const countries: Country[] = [
  { code: 'KR', name: '한국', flag: '🇰🇷' },
  { code: 'JP', name: '일본', flag: '🇯🇵' },
  { code: 'TH', name: '태국', flag: '🇹🇭' },
  { code: 'VN', name: '베트남', flag: '🇻🇳' },
]

export default function Home() {
  const [selectedCountry, setSelectedCountry] = useState<string>('KR')
  const [selectedCountries, setSelectedCountries] = useState<string[]>(['KR', 'JP', 'TH', 'VN'])
  const [stays, setStays] = useState<Stay[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAllStays()
  }, [])

  const loadAllStays = async () => {
    setLoading(true)
    try {
      // Load from localStorage first
      let data = loadStaysFromStorage()
      
      // If no local data, try Supabase
      if (data.length === 0) {
        try {
          data = await getStays()
          // Save to localStorage for future use
          if (data.length > 0) {
            saveStaysToStorage(data)
          }
        } catch (supabaseError) {
          console.warn('Supabase not available, using localStorage only:', supabaseError)
        }
      }
      
      setStays(data)
    } catch (error) {
      console.error('Failed to load stays:', error)
      setStays([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: 'white' }}>
      <Sidebar 
        countries={countries}
        selectedCountry={selectedCountry}
        onSelectCountry={setSelectedCountry}
        currentPage="dashboard"
        onAddStay={loadAllStays}
      />
      
      <Box component="main" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#f8f9fa' }}>
        {/* Material Design 3 Style Header */}
        <AppBar 
          position="sticky" 
          elevation={0}
          sx={{ 
            backgroundColor: 'white',
            borderBottom: '1px solid #e8eaed',
            top: 0,
            zIndex: 100
          }}
        >
          <Toolbar sx={{ px: { xs: 2, md: 3 } }}>
            <DashboardIcon sx={{ color: '#1a73e8', mr: 2 }} />
            <Typography 
              variant="h6" 
              component="h1" 
              sx={{ 
                flexGrow: 1,
                color: '#202124',
                fontFamily: 'Google Sans, Roboto, sans-serif',
                fontWeight: 500,
                fontSize: '1.125rem'
              }}
            >
              Dashboard
            </Typography>

            {/* Action Bar */}
            <Stack direction="row" spacing={1} alignItems="center">
              <IconButton 
                sx={{ color: '#5f6368' }}
                size="small"
              >
                <SearchIcon fontSize="small" />
              </IconButton>
              
              <IconButton 
                sx={{ color: '#5f6368' }}
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
          <Container maxWidth="xl" sx={{ py: 3 }}>
          
          <Stack spacing={3}>
            {/* Quick Stats Cards */}
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6, lg: 3 }}>
                <Paper 
                  elevation={0}
                  sx={{ 
                    p: 3, 
                    border: '1px solid #e8eaed',
                    borderRadius: 2,
                    '&:hover': {
                      boxShadow: '0 1px 6px 0 rgba(32,33,36,.28)',
                      borderColor: 'transparent'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  <Stack spacing={1}>
                    <Typography variant="body2" color="text.secondary">
                      Countries Visited
                    </Typography>
                    <Typography variant="h4" fontWeight={500}>
                      {[...new Set(stays.map(s => s.countryCode))].length}
                    </Typography>
                  </Stack>
                </Paper>
              </Grid>
              
              <Grid size={{ xs: 12, md: 6, lg: 3 }}>
                <Paper 
                  elevation={0}
                  sx={{ 
                    p: 3, 
                    border: '1px solid #e8eaed',
                    borderRadius: 2,
                    '&:hover': {
                      boxShadow: '0 1px 6px 0 rgba(32,33,36,.28)',
                      borderColor: 'transparent'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  <Stack spacing={1}>
                    <Typography variant="body2" color="text.secondary">
                      Total Days Traveled
                    </Typography>
                    <Typography variant="h4" fontWeight={500}>
                      {stays.reduce((acc, stay) => {
                        const days = stay.exitDate 
                          ? Math.ceil((new Date(stay.exitDate).getTime() - new Date(stay.entryDate).getTime()) / (1000 * 60 * 60 * 24)) + 1
                          : Math.ceil((new Date().getTime() - new Date(stay.entryDate).getTime()) / (1000 * 60 * 60 * 24)) + 1
                        return acc + days
                      }, 0)}
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