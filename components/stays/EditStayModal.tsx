'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Grid,
  Box,
  Typography
} from '@mui/material'
import { Stay, Country } from '@/lib/types'
import { updateStayInStorage } from '@/lib/storage/stays-storage'
import { updateStay } from '@/lib/supabase/stays'
import { getAvailableVisaTypes } from '@/lib/visa-rules/visa-types'

interface EditStayModalProps {
  open: boolean
  stay: Stay | null
  countries: Country[]
  onClose: () => void
  onUpdated: () => void
}

export default function EditStayModal({ open, stay, countries, onClose, onUpdated }: EditStayModalProps) {
  const [nationality] = useState('US')
  const [formData, setFormData] = useState({
    countryCode: '',
    fromCountry: '',
    entryDate: '',
    exitDate: '',
    entryCity: '',
    exitCity: '',
    visaType: '',
    notes: ''
  })
  const [loading, setLoading] = useState(false)

  // Initialize form data when stay prop changes
  useEffect(() => {
    if (stay) {
      const visaTypes = getAvailableVisaTypes(stay.countryCode, nationality)
      setFormData({
        countryCode: stay.countryCode,
        fromCountry: stay.fromCountry || '',
        entryDate: stay.entryDate,
        exitDate: stay.exitDate || '',
        entryCity: stay.entryCity || '',
        exitCity: stay.exitCity || '',
        visaType: stay.visaType || (visaTypes.length > 0 ? visaTypes[0].value : ''),
        notes: stay.notes || ''
      })
    }
  }, [stay, nationality])

  // Get available visa types for selected country
  const availableVisaTypes = getAvailableVisaTypes(formData.countryCode, nationality)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!stay) return

    // Validation
    if (!formData.entryDate) {
      alert('Please fill in the entry date')
      return
    }

    // Only validate exit date if provided
    if (formData.exitDate && new Date(formData.exitDate) < new Date(formData.entryDate)) {
      alert('Exit date must be after entry date')
      return
    }

    setLoading(true)

    try {
      // Update in localStorage first
      const updatedStay = updateStayInStorage(stay.id, {
        countryCode: formData.countryCode,
        fromCountry: formData.fromCountry || undefined,
        entryDate: formData.entryDate,
        exitDate: formData.exitDate || undefined,
        entryCity: formData.entryCity || undefined,
        exitCity: formData.exitCity || undefined,
        visaType: formData.visaType,
        notes: formData.notes
      })

      if (!updatedStay) {
        throw new Error('Failed to update stay in localStorage')
      }

      // Try to sync with Supabase in background
      updateStay(stay.id, {
        countryCode: formData.countryCode,
        fromCountry: formData.fromCountry || undefined,
        entryDate: formData.entryDate,
        exitDate: formData.exitDate || undefined,
        entryCity: formData.entryCity || undefined,
        exitCity: formData.exitCity || undefined,
        visaType: formData.visaType,
        notes: formData.notes
      }).catch(supabaseError => {
        console.warn('Failed to sync update with Supabase (non-critical):', supabaseError)
      })

      onUpdated()
      onClose()
      alert('Stay updated successfully!')

    } catch (error) {
      console.error('Failed to update stay:', error)
      alert('Failed to update stay. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      onClose()
    }
  }

  const handleCountryChange = (newCountry: string) => {
    const visaTypes = getAvailableVisaTypes(newCountry, nationality)
    setFormData({ 
      ...formData, 
      countryCode: newCountry,
      visaType: visaTypes.length > 0 ? visaTypes[0].value : ''
    })
  }

  if (!stay) return null

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3 }
      }}
    >
      <DialogTitle sx={{ 
        pb: 1,
        fontFamily: 'Google Sans, Roboto, sans-serif',
        fontWeight: 500 
      }}>
        ✏️ Edit Travel Record
      </DialogTitle>

      <DialogContent dividers>
        <Box component="form" onSubmit={handleSubmit} id="edit-stay-form">
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                select
                label="From Country"
                value={formData.fromCountry}
                onChange={(e) => setFormData({ ...formData, fromCountry: e.target.value })}
                fullWidth
                size="small"
                helperText="Where did you travel from?"
              >
                <MenuItem value="">
                  <em>Select origin country</em>
                </MenuItem>
                {countries.map(country => (
                  <MenuItem key={country.code} value={country.code}>
                    {country.flag} {country.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Departure Airport/City"
                value={formData.exitCity}
                onChange={(e) => setFormData({ ...formData, exitCity: e.target.value.toUpperCase() })}
                placeholder="e.g., ICN, BKK"
                fullWidth
                size="small"
                inputProps={{ maxLength: 5 }}
                helperText="Where you departed"
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                select
                label="To Country"
                value={formData.countryCode}
                onChange={(e) => handleCountryChange(e.target.value)}
                required
                fullWidth
                size="small"
                helperText="Where did you travel to?"
              >
                {countries.map(country => (
                  <MenuItem key={country.code} value={country.code}>
                    {country.flag} {country.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Arrival Airport/City"
                value={formData.entryCity}
                onChange={(e) => setFormData({ ...formData, entryCity: e.target.value.toUpperCase() })}
                placeholder="e.g., ICN, BKK"
                fullWidth
                size="small"
                inputProps={{ maxLength: 5 }}
                helperText="Where you arrived"
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                select
                label="Visa Type"
                value={formData.visaType}
                onChange={(e) => setFormData({ ...formData, visaType: e.target.value })}
                fullWidth
                size="small"
                helperText={availableVisaTypes.find(v => v.value === formData.visaType)?.duration || ''}
              >
                {availableVisaTypes.map(visaType => (
                  <MenuItem key={visaType.value} value={visaType.value}>
                    {visaType.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Entry Date"
                type="date"
                value={formData.entryDate}
                onChange={(e) => setFormData({ ...formData, entryDate: e.target.value })}
                required
                fullWidth
                size="small"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Exit Date (Optional)"
                type="date"
                value={formData.exitDate}
                onChange={(e) => setFormData({ ...formData, exitDate: e.target.value })}
                fullWidth
                size="small"
                helperText="Leave empty if still in country"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                label="Notes (Optional)"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                multiline
                rows={3}
                fullWidth
                size="small"
                placeholder="Add any additional notes..."
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button 
          onClick={handleClose}
          disabled={loading}
          sx={{ 
            textTransform: 'none',
            fontWeight: 500 
          }}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          form="edit-stay-form"
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
          {loading ? 'Updating...' : 'Update Record'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}