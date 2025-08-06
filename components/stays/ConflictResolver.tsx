'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  Chip,
  Alert,
  AlertTitle,
  Stack
} from '@mui/material'
import { 
  detectDateConflicts, 
  autoResolveConflicts,
  validateResolution,
  type DateConflict,
  type ResolvedStay
} from '@/lib/utils/date-conflict-resolver'
import { Stay, Country } from '@/lib/types'

interface ConflictResolverProps {
  stays: Stay[]
  countries: Country[]
  onResolved: (resolvedStays: ResolvedStay[]) => void
  onClose: () => void
  open: boolean
}

export default function ConflictResolver({ stays, countries, onResolved, onClose, open }: ConflictResolverProps) {
  const [conflicts, setConflicts] = useState<DateConflict[]>([])
  const [resolvedStays, setResolvedStays] = useState<ResolvedStay[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open && stays.length > 0) {
      const detectedConflicts = detectDateConflicts(stays)
      setConflicts(detectedConflicts)
    }
  }, [open, stays])

  const handleAutoResolve = async () => {
    setLoading(true)
    try {
      const resolved = autoResolveConflicts(stays)
      const validation = validateResolution(resolved)
      
      setResolvedStays(resolved)
      
      if (validation.isValid) {
        onResolved(resolved)
        onClose()
      }
    } catch (error) {
      console.error('Auto-resolution failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const getCountryName = (code: string) => {
    const country = countries.find(c => c.code === code)
    return country ? `${country.flag} ${country.name}` : code
  }

  const formatStayDisplay = (stay: Stay) => {
    const exitDisplay = stay.exitDate ? stay.exitDate : 'Present'
    return `${stay.entryDate} → ${exitDisplay}`
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'error'
      case 'high': return 'warning'
      case 'medium': return 'info'
      case 'low': return 'success'
      default: return 'default'
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3, maxHeight: '80vh' }
      }}
    >
      <DialogTitle sx={{ 
        pb: 1,
        fontFamily: 'Google Sans, Roboto, sans-serif',
        fontWeight: 500 
      }}>
        🔧 Date Conflict Resolution
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={3}>
          {/* Summary Alert */}
          <Alert 
            severity={conflicts.some(c => c.severity === 'critical') ? 'error' : 'warning'}
            variant="outlined"
          >
            <AlertTitle>
              {conflicts.length} conflict{conflicts.length !== 1 ? 's' : ''} detected
            </AlertTitle>
            <Typography variant="body2">
              Your travel records have overlapping dates that need to be resolved.
              The system can automatically fix these conflicts.
            </Typography>
          </Alert>

          {/* Conflict List */}
          <Box>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 500 }}>
              Detected Conflicts
            </Typography>
            <List dense>
              {conflicts.map((conflict, index) => (
                <ListItem key={index} divider>
                  <ListItemText
                    primary={
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                        <Chip 
                          label={conflict.severity.toUpperCase()}
                          color={getSeverityColor(conflict.severity) as any}
                          size="small"
                          variant="outlined"
                        />
                        <Typography variant="body2" fontWeight="medium">
                          {conflict.type} conflict
                        </Typography>
                      </Stack>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {conflict.description}
                        </Typography>
                        <Box sx={{ mb: 1 }}>
                          {conflict.stays.map((stay, stayIndex) => (
                            <Box key={stay.id} sx={{ ml: 2, mb: 0.5 }}>
                              <Typography variant="caption" color="text.secondary">
                                {getCountryName(stay.countryCode)}: {formatStayDisplay(stay)}
                              </Typography>
                            </Box>
                          ))}
                        </Box>
                        <Typography variant="caption" color="primary.main" fontStyle="italic">
                          💡 {conflict.suggestedResolution}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Box>

          {/* Auto-Resolution Preview */}
          <Box>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 500 }}>
              Automatic Resolution
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              The system will automatically:
            </Typography>
            <List dense sx={{ bgcolor: 'action.hover', borderRadius: 1, px: 1 }}>
              <ListItem>
                <ListItemText
                  primary="🔄 End overlapping ongoing stays when new trips begin"
                  primaryTypographyProps={{ variant: 'body2' }}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="🔀 Merge duplicate entries in the same country"
                  primaryTypographyProps={{ variant: 'body2' }}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="📅 Adjust dates to create logical travel sequences"
                  primaryTypographyProps={{ variant: 'body2' }}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="✅ Mark resolved entries with 'Auto-fixed' labels"
                  primaryTypographyProps={{ variant: 'body2' }}
                />
              </ListItem>
            </List>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button 
          onClick={onClose}
          sx={{ 
            textTransform: 'none',
            fontWeight: 500 
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleAutoResolve}
          variant="contained"
          disabled={loading}
          sx={{
            backgroundColor: '#1a73e8',
            textTransform: 'none',
            fontWeight: 500,
            px: 3,
            '&:hover': { backgroundColor: '#1557b0' }
          }}
        >
          {loading ? 'Resolving...' : 'Auto-Resolve Conflicts'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}