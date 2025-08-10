'use client'

import { useState, useEffect } from 'react'
import {
  Paper,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Button,
  Collapse,
  Stack,
  Skeleton,
  Alert,
  AlertTitle,
  useTheme
} from '@mui/material'
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  ListAlt as ListIcon
} from '@mui/icons-material'
import { Country, Stay, isOngoingStay, calculateStayDuration } from '@/lib/types'
import { getStays, updateStay, deleteStay } from '@/lib/supabase/stays'
import { loadStaysFromStorage, deleteStayFromStorage } from '@/lib/storage/stays-storage'
import { 
  detectDateConflicts, 
  autoResolveConflicts, 
  generateConflictSummary,
  type ResolvedStay 
} from '@/lib/utils/date-conflict-resolver'
import EditStayModalEnhanced from './EditStayModalEnhanced'
import EmptyState from '@/components/ui/EmptyState'

interface StaysListProps {
  countries: Country[]
  onStaysChange: () => void
  onEditStay?: (stay: Stay) => void
}

export default function StaysList({ countries, onStaysChange, onEditStay }: StaysListProps) {
  const theme = useTheme()
  const [stays, setStays] = useState<Stay[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCountry, setSelectedCountry] = useState<string>('ALL')
  const [showAll, setShowAll] = useState(false)
  const [conflictSummary, setConflictSummary] = useState<string>('')
  const [autoResolved, setAutoResolved] = useState(false)
  const [editingStay, setEditingStay] = useState<Stay | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [alertDismissed, setAlertDismissed] = useState(false)

  useEffect(() => {
    loadStays()
  }, [])

  const loadStays = async () => {
    setLoading(true)
    try {
      let data: Stay[] = []
      
      // Try Supabase first for most up-to-date data
      try {
        console.log('📡 Loading from Supabase...')
        data = await getStays()
        
        if (data.length > 0) {
          console.log(`✅ Loaded ${data.length} stays from Supabase`)
          // Save to localStorage as backup
          localStorage.setItem('dino-stays-data', JSON.stringify({
            version: '1.0',
            stays: data,
            lastUpdated: new Date().toISOString()
          }))
        } else {
          console.log('📊 No data in Supabase, checking localStorage...')
          // If Supabase is empty, check localStorage
          data = loadStaysFromStorage()
          if (data.length > 0) {
            console.log(`💾 Using ${data.length} stays from localStorage backup`)
          }
        }
      } catch (supabaseError) {
        console.warn('⚠️ Supabase unavailable, using localStorage:', supabaseError)
        data = loadStaysFromStorage()
        if (data.length > 0) {
          console.log(`💾 Using ${data.length} stays from localStorage`)
        }
      }
      
      // Clean up corrupted data
      data = data.filter(stay => {
        // Remove stays with invalid dates
        if (!stay.entryDate || stay.entryDate === '' || stay.entryDate === 'undefined') {
          console.warn('Removing stay with invalid entry date:', stay)
          return false
        }
        
        const entryDate = new Date(stay.entryDate)
        if (isNaN(entryDate.getTime())) {
          console.warn('Removing stay with corrupted entry date:', stay)
          return false
        }
        
        // Check exit date if provided
        if (stay.exitDate && stay.exitDate !== '' && stay.exitDate !== 'undefined') {
          const exitDate = new Date(stay.exitDate)
          if (isNaN(exitDate.getTime())) {
            console.warn('Removing stay with corrupted exit date:', stay)
            return false
          }
        }
        
        return true
      })
      
      // Save cleaned data back to storage
      if (data.length > 0) {
        localStorage.setItem('dino-stays-data', JSON.stringify({
          version: '1.0',
          stays: data,
          lastUpdated: new Date().toISOString()
        }))
      }
      
      // Check for date conflicts
      const conflicts = detectDateConflicts(data)
      const conflictMsg = generateConflictSummary(conflicts)
      setConflictSummary(conflictMsg)

      // Auto-resolve critical conflicts if any exist
      let finalStays = data
      if (conflicts.some(c => c.severity === 'critical')) {
        const resolvedStays = autoResolveConflicts(data)
        finalStays = resolvedStays
        setAutoResolved(true)
        
        // Update localStorage with resolved data
        localStorage.setItem('dino-v5-stays', JSON.stringify(finalStays))
        
        console.log('🔧 Auto-resolved date conflicts:', conflicts.length, 'conflicts found')
      }
      
      // Sort by entry date (newest first)
      const sortedStays = finalStays.sort((a, b) => 
        new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime()
      )
      setStays(sortedStays)
    } catch (error) {
      console.error('Failed to load stays:', error)
      setStays([])
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (stayId: string) => {
    if (!confirm('Are you sure you want to delete this stay record?')) {
      return
    }

    try {
      // Delete from localStorage first
      const success = deleteStayFromStorage(stayId)
      
      if (success) {
        setStays(prev => prev.filter(stay => stay.id !== stayId))
        
        // Try to sync with Supabase in background
        try {
          await deleteStay(stayId)
        } catch (supabaseError) {
          console.warn('Failed to sync deletion with Supabase:', supabaseError)
        }
        
        onStaysChange()
      } else {
        throw new Error('Failed to delete stay from localStorage')
      }
    } catch (error) {
      console.error('Failed to delete stay:', error)
      alert('Failed to delete stay. Please try again.')
    }
  }

  const handleEditClose = () => {
    setShowEditModal(false)
    setEditingStay(null)
  }

  const handleEditUpdated = () => {
    loadStays() // Reload stays after update
    onStaysChange() // Notify parent component
  }

  const calculateDays = (stay: Stay) => {
    try {
      // Validate dates first
      if (!stay.entryDate || stay.entryDate === '' || stay.entryDate === 'undefined') {
        return 0
      }
      
      const entryDate = new Date(stay.entryDate)
      if (isNaN(entryDate.getTime())) {
        return 0
      }
      
      // Check exit date if provided
      if (stay.exitDate && stay.exitDate !== '' && stay.exitDate !== 'undefined') {
        const exitDate = new Date(stay.exitDate)
        if (isNaN(exitDate.getTime())) {
          return 0
        }
      }
      
      return calculateStayDuration(stay)
    } catch (error) {
      console.error('Error calculating stay duration:', error, stay)
      return 0
    }
  }
  
  const formatStayPeriod = (stay: Stay) => {
    if (isOngoingStay(stay)) {
      return `${formatDate(stay.entryDate)} → Present`
    }
    return `${formatDate(stay.entryDate)} → ${formatDate(stay.exitDate!)}`
  }

  const formatDate = (dateString: string) => {
    if (!dateString || dateString === '' || dateString === 'undefined') {
      return 'Invalid Date'
    }
    
    const date = new Date(dateString)
    if (isNaN(date.getTime())) {
      return 'Invalid Date'
    }
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    })
  }

  const filteredStays = selectedCountry === 'ALL' 
    ? stays 
    : stays.filter(stay => stay.countryCode === selectedCountry)

  const displayedStays = showAll ? filteredStays : filteredStays.slice(0, 5)

  if (loading) {
    return (
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Skeleton variant="text" width={150} height={32} />
          <Skeleton variant="text" width={100} height={24} />
        </Box>
        {Array.from({ length: 5 }).map((_, i) => (
          <Box key={i} sx={{ mb: 2, p: 2 }}>
            <Skeleton variant="text" width="75%" height={24} sx={{ mb: 1 }} />
            <Skeleton variant="text" width="50%" height={20} />
          </Box>
        ))}
      </Paper>
    )
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
      {/* Ultra Minimal Header with Filter */}
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
          Recent Activity
        </Typography>
        
        <Stack direction="row" spacing={2} alignItems="center">
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Filter Country</InputLabel>
            <Select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              label="Filter Country"
            >
              <MenuItem value="ALL">All Countries</MenuItem>
              {countries.map(country => (
                <MenuItem key={country.code} value={country.code}>
                  {country.flag} {country.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <Typography 
            variant="caption" 
            sx={{ 
              color: theme.palette.text.secondary,
              fontSize: '12px'
            }}
          >
            {filteredStays.length} entries
          </Typography>
        </Stack>
      </Box>

      {/* Conflict Alert with Dismiss */}
      {conflictSummary && !conflictSummary.includes('No date conflicts') && !alertDismissed && (
        <Box sx={{ px: 3, pb: 2 }}>
          <Alert 
            severity={autoResolved ? "success" : "warning"}
            variant="outlined"
            onClose={() => setAlertDismissed(true)}
            sx={{ 
              borderRadius: 2,
              '& .MuiAlert-message': { width: '100%' }
            }}
          >
            <AlertTitle sx={{ fontWeight: 500, fontSize: '0.875rem' }}>
              {autoResolved ? '✅ Date Conflicts Auto-Resolved' : '⚠️ Date Conflicts Detected'}
            </AlertTitle>
            <Typography variant="body2" sx={{ mt: 1 }}>
              {conflictSummary}
            </Typography>
            {autoResolved && (
              <Typography variant="caption" sx={{ display: 'block', mt: 1, fontStyle: 'italic' }}>
                Multiple ongoing stays were automatically adjusted to create a logical travel sequence.
              </Typography>
            )}
          </Alert>
        </Box>
      )}

      {/* Stays List */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', px: 3, pb: 3 }}>
        <List disablePadding sx={{ flex: 1 }}>
          {displayedStays.length === 0 ? (
            <EmptyState 
              variant={selectedCountry === 'ALL' ? 'no-stays' : 'no-results'}
              onAction={selectedCountry !== 'ALL' ? () => setSelectedCountry('ALL') : undefined}
              actionLabel="Clear Filter"
            />
          ) : (
          displayedStays.map((stay, index) => {
            const country = countries.find(c => c.code === stay.countryCode)
            const days = calculateDays(stay)
            const isOngoing = isOngoingStay(stay)
            const resolvedStay = stay as ResolvedStay
            const wasAutoResolved = resolvedStay.autoResolved
            
            return (
              <ListItem
                key={stay.id}
                divider={index < displayedStays.length - 1}
                sx={{
                  px: 2,
                  py: 1.5,
                  '&:hover': {
                    backgroundColor: 'action.hover'
                  }
                }}
                secondaryAction={
                  <Stack direction="row" spacing={{ xs: 0, sm: 1 }}>
                    <IconButton
                      edge="end"
                      onClick={() => {
                        setEditingStay(stay)
                        setShowEditModal(true)
                      }}
                      color="primary"
                      size="small"
                      sx={{ 
                        padding: { xs: '4px', sm: '8px' }
                      }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      edge="end"
                      onClick={() => handleDelete(stay.id)}
                      color="error"
                      size="small"
                      sx={{ 
                        padding: { xs: '4px', sm: '8px' }
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                }
              >
                <ListItemText
                  primary={
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 1, sm: 2 }} alignItems={{ xs: 'flex-start', sm: 'center' }}>
                      <Typography variant="body1" fontWeight="medium" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                        {formatStayPeriod(stay)}
                      </Typography>
                      <Stack direction="row" spacing={1}>
                        <Chip
                          label={isOngoing ? `${days} days (ongoing)` : `${days} days`}
                          color={isOngoing ? "warning" : "primary"}
                          size="small"
                          variant={isOngoing ? "filled" : "outlined"}
                          sx={{ fontSize: { xs: '0.625rem', sm: '0.75rem' } }}
                        />
                        {wasAutoResolved && (
                          <Chip
                            label="Auto-fixed"
                            color="success"
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: { xs: '0.625rem', sm: '0.6875rem' } }}
                          />
                        )}
                      </Stack>
                    </Stack>
                  }
                  secondary={
                    <>
                      {/* Travel Route: From → To */}
                      {stay.fromCountry ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                          {/* From Country */}
                          <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                            <span style={{ fontSize: '16px' }}>
                              {countries.find(c => c.code === stay.fromCountry)?.flag || '🌍'}
                            </span>
                            <span style={{ color: '#6b7280', fontSize: '14px' }}>
                              {countries.find(c => c.code === stay.fromCountry)?.name || stay.fromCountry}
                            </span>
                            {stay.exitCity && (
                              <span style={{ color: '#9ca3af', fontSize: '11px' }}>
                                {stay.exitCity}
                              </span>
                            )}
                          </span>
                          
                          {/* Arrow */}
                          <span style={{ color: '#9ca3af', fontWeight: 'bold', margin: '0 4px' }}>
                            →
                          </span>
                          
                          {/* To Country */}
                          <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                            <span style={{ fontSize: '16px' }}>
                              {country?.flag}
                            </span>
                            <span style={{ color: '#6b7280', fontSize: '14px' }}>
                              {country?.name}
                            </span>
                            {stay.entryCity && (
                              <span style={{ color: '#9ca3af', fontSize: '11px' }}>
                                {stay.entryCity}
                              </span>
                            )}
                          </span>
                        </span>
                      ) : (
                        /* Only To Country if no From info */
                        <span style={{ display: 'flex', alignItems: 'center', gap: '2px', marginTop: '4px' }}>
                          <span style={{ fontSize: '16px' }}>
                            {country?.flag}
                          </span>
                          <span style={{ color: '#6b7280', fontSize: '14px' }}>
                            {country?.name}
                          </span>
                          {stay.entryCity && (
                            <span style={{ color: '#9ca3af', fontSize: '11px' }}>
                              {stay.entryCity}
                            </span>
                          )}
                        </span>
                      )}
                      
                      {/* Additional Info */}
                      {resolvedStay.resolutionReason && (
                        <div style={{ marginTop: '4px' }}>
                          <span style={{ color: '#16a34a', fontStyle: 'italic', fontSize: '11px' }}>
                            {resolvedStay.resolutionReason}
                          </span>
                        </div>
                      )}
                    </>
                  }
                />
              </ListItem>
            )
          })
        )}
        </List>
      </Box>

      {/* View All / Show Less */}
      {filteredStays.length > 5 && (
        <Box sx={{ mt: 3, pt: 2, borderTop: 1, borderColor: 'divider', textAlign: 'center' }}>
          <Button
            onClick={() => setShowAll(!showAll)}
            variant="text"
            endIcon={showAll ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            sx={{ fontWeight: 'medium' }}
          >
            {showAll ? 'Show Less' : 'View All Stays'}
          </Button>
        </Box>
      )}

      {/* Edit Modal */}
      <EditStayModalEnhanced
        open={showEditModal}
        stay={editingStay}
        countries={countries}
        onClose={handleEditClose}
        onUpdated={handleEditUpdated}
      />
    </Box>
  )
}