'use client'

import { useState, useEffect } from 'react'
import { 
  Box, 
  Typography, 
  Container, 
  Paper, 
  Chip, 
  Stack,
  Grid,
  AppBar,
  Toolbar,
  IconButton,
  Avatar,
  Breadcrumbs,
  Link,
  Tab,
  Tabs,
  useMediaQuery,
  useTheme
} from '@mui/material'
import {
  Search as SearchIcon,
  Apps as AppsIcon,
  Notifications as NotificationsIcon,
  Help as HelpIcon,
  CalendarMonth as CalendarIcon,
  FilterAlt as FilterIcon
} from '@mui/icons-material'
import UserMenu from '@/components/auth/UserMenu'
import dynamic from 'next/dynamic'
import LoadingSkeleton from '@/components/ui/LoadingSkeleton'

// Dynamic imports for better performance
const RollingCalendar = dynamic(() => import('@/components/calendar/RollingCalendar'), {
  loading: () => <LoadingSkeleton variant="list" />,
  ssr: false
})
const StayManagerEnhanced = dynamic(() => import('@/components/stays/StayManagerEnhanced'), {
  loading: () => <LoadingSkeleton variant="card" />,
  ssr: false
})
const StaysList = dynamic(() => import('@/components/stays/StaysList'), {
  loading: () => <LoadingSkeleton variant="list" />,
  ssr: false
})
import { Country, Stay } from '@/lib/types'
import { getStays } from '@/lib/supabase/stays'
import { loadStaysFromStorage, saveStaysToStorage } from '@/lib/storage/stays-storage'
const CountryFilter = dynamic(() => import('@/components/calendar/CountryFilter'))
const VisaWarnings = dynamic(() => import('@/components/calendar/VisaWarnings'))
const VisaWindows = dynamic(() => import('@/components/calendar/VisaWindows'))
const CalendarCountryFilter = dynamic(() => import('@/components/calendar/CalendarCountryFilter'))
import { countries } from '@/lib/data/countries-and-airports'
import ErrorBoundary from '@/components/ui/ErrorBoundary'
import EmptyState from '@/components/ui/EmptyState'

export default function CalendarPage() {
  const [selectedCountries, setSelectedCountries] = useState<string[]>([])
  const [stays, setStays] = useState<Stay[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddStay, setShowAddStay] = useState(false)
  const [activeTab, setActiveTab] = useState(0) // 0: Calendar View, 1: Manage Stays
  const [visaWindowCountry, setVisaWindowCountry] = useState<string | null>(null) // For calendar visa window filter
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

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

  const handleCountryToggle = (event: React.MouseEvent<HTMLElement>, newSelectedCountries: string[]) => {
    setSelectedCountries(newSelectedCountries)
  }

  const filteredStays = stays.filter(stay => 
    selectedCountries.length === 0 || selectedCountries.includes(stay.countryCode)
  )

  return (
    <Box component="main" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', backgroundColor: theme.palette.background.default }}>
        {/* Material Design 2 Style Header */}
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
            <CalendarIcon sx={{ color: theme.palette.primary.main, mr: 2 }} />
            <Typography 
              variant="h6" 
              component="h1" 
              sx={{ 
                flexGrow: 1,
                color: theme.palette.text.primary,
                fontWeight: 500
              }}
            >
              Travel Calendar
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

          {/* Tab Navigation */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}>
            <Tabs 
              value={activeTab} 
              onChange={(e, newValue) => setActiveTab(newValue)}
              sx={{
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 500,
                  fontSize: '14px',
                  minHeight: 48,
                  color: theme.palette.text.secondary,
                  '&.Mui-selected': {
                    color: theme.palette.primary.main
                  }
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: theme.palette.primary.main,
                  height: 3,
                  borderRadius: '3px 3px 0 0'
                }
              }}
            >
              <Tab icon={<CalendarIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Calendar View" />
              <Tab icon={<FilterIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Manage Stays" />
            </Tabs>
          </Box>
        </AppBar>

        {/* Main Content Area with Tab Panels */}
        <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
          <Container maxWidth="xl" sx={{ py: theme.spacing(3) }}>
            
            {/* Tab Panel: Calendar View */}
            {activeTab === 0 && (
              <Stack spacing={3}>
                {/* Country Filter for Visa Window */}
                <CalendarCountryFilter
                  countries={countries}
                  stays={stays}
                  selectedCountry={visaWindowCountry}
                  onCountryChange={setVisaWindowCountry}
                />
                
                {/* 16-Month Rolling Calendar */}
                <RollingCalendar 
                  stays={filteredStays}
                  countries={countries}
                  selectedCountries={selectedCountries}
                  loading={loading}
                  visaWindowCountry={visaWindowCountry}
                />
              </Stack>
            )}

            {/* Tab Panel: Manage Stays */}
            {activeTab === 1 && (
              <Stack spacing={3}>
                {/* Entry/Exit Records Management */}
                <StayManagerEnhanced 
                  countries={countries}
                  selectedCountries={selectedCountries}
                  onStaysChange={loadAllStays}
                />

                {/* All Stays List */}
                <StaysList 
                  countries={countries}
                  onStaysChange={loadAllStays}
                />
              </Stack>
            )}

          </Container>
        </Box>
    </Box>
  )
}