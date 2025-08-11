'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
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
import dynamic from 'next/dynamic'
import UserMenu from '@/components/auth/UserMenu'
import LoadingSkeleton from '@/components/ui/LoadingSkeleton'

// Dynamic imports for better performance
const ModularDashboard = dynamic(() => import('@/components/dashboard/ModularDashboard'), {
  loading: () => <LoadingSkeleton variant="dashboard" />,
  ssr: false
})
const StaysList = dynamic(() => import('@/components/stays/StaysList'), {
  loading: () => <LoadingSkeleton variant="list" />,
  ssr: false
})
import ErrorBoundary from '@/components/ui/ErrorBoundary'
import { Country, Stay } from '@/lib/types'
import { getStays } from '@/lib/supabase/stays'
import { loadStaysFromStorage, saveStaysToStorage } from '@/lib/storage/stays-storage'
import { detectDateConflicts, autoResolveConflicts } from '@/lib/utils/date-conflict-resolver'
import { countries } from '@/lib/data/countries-and-airports'
import { logger } from '@/lib/utils/logger'

export default function Home() {
  const [selectedCountries, setSelectedCountries] = useState<string[]>([])
  const [stays, setStays] = useState<Stay[]>([])
  const [loading, setLoading] = useState(true)
  const [dataSource, setDataSource] = useState<'supabase' | 'localStorage' | 'none'>('none')
  const [lastError, setLastError] = useState<string | null>(null)
  const theme = useTheme()

  const loadAllStays = useCallback(async () => {
    setLoading(true)
    try {
      let data: Stay[] = []
      
      // Try Supabase first for most up-to-date data
      try {
        logger.info('📡 Loading from Supabase...')
        data = await getStays()
        
        if (data.length > 0) {
          logger.info(`✅ Loaded ${data.length} stays from Supabase`)
          setDataSource('supabase')
          setLastError(null)
          // Save to localStorage as backup
          saveStaysToStorage(data)
        } else {
          logger.info('📊 No data in Supabase, checking localStorage...')
          // If Supabase is empty, check localStorage
          data = loadStaysFromStorage()
          if (data.length > 0) {
            logger.info(`💾 Using ${data.length} stays from localStorage backup`)
            setDataSource('localStorage')
            setLastError('Supabase is empty, using local backup')
          } else {
            setDataSource('none')
          }
        }
      } catch (supabaseError) {
        const errorMsg = supabaseError instanceof Error ? supabaseError.message : 'Unknown error'
        logger.warn('⚠️ Supabase unavailable, using localStorage:', errorMsg)
        setLastError(`Supabase error: ${errorMsg}`)
        data = loadStaysFromStorage()
        if (data.length > 0) {
          logger.info(`💾 Using ${data.length} stays from localStorage`)
          setDataSource('localStorage')
        } else {
          setDataSource('none')
        }
      }
      
      // Filter out invalid stays first
      const validData = data.filter(stay => 
        stay && 
        stay.countryCode && 
        stay.entryDate &&
        stay.id &&
        stay.countryCode !== 'MISSING' &&
        stay.entryDate !== 'MISSING'
      )
      
      if (validData.length < data.length) {
        logger.warn(`🧹 Filtered out ${data.length - validData.length} invalid stays`)
        data = validData
        // Save cleaned data back to localStorage
        saveStaysToStorage(data)
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
      const errorMsg = error instanceof Error ? error.message : 'Unknown error'
      logger.error('Failed to load stays:', errorMsg)
      setLastError(`Failed to load data: ${errorMsg}`)
      setStays([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadAllStays()
    
    // Remove aggressive auto-refresh - only reload on actual changes
    // const interval = setInterval(() => {
    //   loadAllStays()
    // }, 5000)
    
    // Listen for storage events (when data changes in another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'dino-stays-data') {
        logger.info('📡 Storage changed, reloading stays...')
        loadAllStays()
      }
    }
    
    window.addEventListener('storage', handleStorageChange)
    
    // Listen for custom events from the same tab
    const handleStaysUpdate = () => {
      logger.info('📡 Stays updated, reloading...')
      loadAllStays()
    }
    
    window.addEventListener('stays-updated', handleStaysUpdate)
    
    return () => {
      // clearInterval(interval) // Commented out since we removed the interval
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('stays-updated', handleStaysUpdate)
    }
  }, [loadAllStays])

  return (
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
          
            {/* Data Source Indicator */}
            {(dataSource !== 'supabase' || lastError) && (
              <Paper 
                sx={{ 
                  p: 2, 
                  mb: 2, 
                  backgroundColor: dataSource === 'localStorage' ? '#fff3cd' : '#f8d7da',
                  borderColor: dataSource === 'localStorage' ? '#ffc107' : '#dc3545',
                  borderWidth: 1,
                  borderStyle: 'solid'
                }}
              >
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Box>
                    {dataSource === 'localStorage' ? '⚠️' : '❌'}
                  </Box>
                  <Box>
                    <Typography variant="body2" fontWeight="bold">
                      {dataSource === 'localStorage' ? 'Using Local Storage' : 'No Data Available'}
                    </Typography>
                    {lastError && (
                      <Typography variant="caption" color="text.secondary">
                        {lastError}
                      </Typography>
                    )}
                  </Box>
                </Stack>
              </Paper>
            )}
          
            <Stack spacing={3}>
              {/* Modular Dashboard */}
              <ErrorBoundary>
                {loading ? (
                  <LoadingSkeleton variant="dashboard" />
                ) : (
                  <ModularDashboard stays={stays} />
                )}
              </ErrorBoundary>
              
              {/* Recent Activity */}
              <ErrorBoundary>
                {loading ? (
                  <LoadingSkeleton variant="card" count={3} />
                ) : (
                  <StaysList 
                    countries={countries}
                    onStaysChange={loadAllStays}
                  />
                )}
              </ErrorBoundary>
            </Stack>
          </Container>
        </Box>
      </Box>
  )
}