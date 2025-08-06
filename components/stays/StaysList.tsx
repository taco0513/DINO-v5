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
  AlertTitle
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
import { cardBoxStyle, cardHeaderStyle, cardTitleStyle, googleColors } from '@/lib/styles/common'
import { 
  detectDateConflicts, 
  autoResolveConflicts, 
  generateConflictSummary,
  type ResolvedStay 
} from '@/lib/utils/date-conflict-resolver'
import EditStayModal from './EditStayModal'

interface StaysListProps {
  countries: Country[]
  onStaysChange: () => void
  onEditStay?: (stay: Stay) => void
}

export default function StaysList({ countries, onStaysChange, onEditStay }: StaysListProps) {
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
      // Load from localStorage first
      let data = loadStaysFromStorage()
      
      // If no local data, try Supabase
      if (data.length === 0) {
        try {
          data = await getStays()
        } catch (supabaseError) {
          console.warn('Supabase not available, using localStorage only:', supabaseError)
        }
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
    return calculateStayDuration(stay)
  }
  
  const formatStayPeriod = (stay: Stay) => {
    if (isOngoingStay(stay)) {
      return `${formatDate(stay.entryDate)} → Present`
    }
    return `${formatDate(stay.entryDate)} → ${formatDate(stay.exitDate!)}`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
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
    <Box sx={cardBoxStyle}>
      {/* Ultra Minimal Header with Filter */}
      <Box sx={{ 
        ...cardHeaderStyle,
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between'
      }}>
        <Typography 
          variant="h6" 
          component="h2" 
          sx={cardTitleStyle}
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
              color: '#70757a',
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
            <Box sx={{ 
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 31.25,
              textAlign: 'center',
              py: 8
            }}>
              <ListIcon sx={{ fontSize: '4rem', color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No stays found
              </Typography>
              <Typography variant="body2" color="text.disabled">
                No stays found for the selected country.
              </Typography>
            </Box>
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
                  <Stack direction="row" spacing={1}>
                    <IconButton
                      edge="end"
                      onClick={() => {
                        setEditingStay(stay)
                        setShowEditModal(true)
                      }}
                      color="primary"
                      size="small"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      edge="end"
                      onClick={() => handleDelete(stay.id)}
                      color="error"
                      size="small"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                }
              >
                <ListItemText
                  primary={
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Typography variant="body1" fontWeight="medium">
                        {formatStayPeriod(stay)}
                      </Typography>
                      <Chip
                        label={isOngoing ? `${days} days (ongoing)` : `${days} days`}
                        color={isOngoing ? "warning" : "primary"}
                        size="small"
                        variant={isOngoing ? "filled" : "outlined"}
                      />
                      {wasAutoResolved && (
                        <Chip
                          label="Auto-fixed"
                          color="success"
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: '0.6875rem' }}
                        />
                      )}
                      {/* From → To Travel Route Display */}
                      <Stack direction="row" spacing={1} alignItems="center">
                        {stay.fromCountry && (
                          <>
                            <Stack direction="row" spacing={0.5} alignItems="center">
                              <Typography variant="h6" component="span">
                                {countries.find(c => c.code === stay.fromCountry)?.flag || '🌍'}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                                {countries.find(c => c.code === stay.fromCountry)?.name || stay.fromCountry}
                              </Typography>
                              {stay.exitCity && (
                                <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.6875rem', ml: 0.5 }}>
                                  {stay.exitCity}
                                </Typography>
                              )}
                            </Stack>
                            <Typography variant="body2" color="text.disabled" sx={{ mx: 1 }}>
                              →
                            </Typography>
                          </>
                        )}
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <Typography variant="h6" component="span">
                            {country?.flag}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {country?.name}
                          </Typography>
                          {stay.entryCity && (
                            <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.6875rem', ml: 0.5 }}>
                              {stay.entryCity}
                            </Typography>
                          )}
                        </Stack>
                      </Stack>
                    </Stack>
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
      <EditStayModal
        open={showEditModal}
        stay={editingStay}
        countries={countries}
        onClose={handleEditClose}
        onUpdated={handleEditUpdated}
      />
    </Box>
  )
}