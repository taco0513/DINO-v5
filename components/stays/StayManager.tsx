'use client'

import { useState, useEffect } from 'react'
import {
  Paper,
  Typography,
  Box,
  TextField,
  MenuItem,
  Button,
  Grid,
  Alert,
  useTheme
} from '@mui/material'
import dynamic from 'next/dynamic'

// Removed Material Web Components - using pure MUI
import { Country, Stay } from '@/lib/types'
import { getStays, addStay, updateStay, deleteStay } from '@/lib/supabase/stays'
import { 
  loadStaysFromStorage, 
  saveStaysToStorage,
  addStayToStorage,
  updateStayInStorage,
  deleteStayFromStorage 
} from '@/lib/storage/stays-storage'
import { getAvailableVisaTypes } from '@/lib/visa-rules/visa-types'
import { getCurrentUserEmail } from '@/lib/context/user'

interface StayManagerProps {
  countries: Country[]
  selectedCountries: string[]
  onStaysChange: () => void
}

export default function StayManager({ countries, selectedCountries, onStaysChange }: StayManagerProps) {
  const theme = useTheme()
  const [stays, setStays] = useState<Stay[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddMode, setIsAddMode] = useState(true) // Always show form
  const [editingStay, setEditingStay] = useState<Stay | null>(null)
  const [nationality] = useState('US') // TODO: Get from settings/context
  const [userEmail] = useState(getCurrentUserEmail())
  const [formData, setFormData] = useState({
    countryCode: selectedCountries[0] || '', // No default country selection
    fromCountry: '',
    entryDate: '',
    exitDate: '',
    entryCity: '',
    exitCity: '',
    visaType: '' as string,
    notes: ''
  })
  
  // Get available visa types for selected country
  const availableVisaTypes = formData.countryCode ? getAvailableVisaTypes(formData.countryCode, nationality, userEmail) : []
  
  // Set default visa type when country changes
  useEffect(() => {
    if (availableVisaTypes.length > 0 && !formData.visaType) {
      setFormData(prev => ({ ...prev, visaType: availableVisaTypes[0].value }))
    }
  }, [formData.countryCode])

  useEffect(() => {
    loadStays()
  }, [])

  const loadStays = async () => {
    setLoading(true)
    try {
      let data: Stay[] = []
      
      // Try Supabase first for most up-to-date data
      try {
        data = await getStays()
        if (data.length > 0) {
          // Save to localStorage as backup
          saveStaysToStorage(data)
        } else {
          // If Supabase is empty, use localStorage backup
          data = loadStaysFromStorage()
        }
      } catch (supabaseError) {
        console.warn('Supabase not available, using localStorage:', supabaseError)
        data = loadStaysFromStorage()
      }
      
      // Sort by entry date (newest first)
      const sortedStays = data.sort((a, b) => 
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

  const resetForm = () => {
    const defaultCountry = selectedCountries[0] || '' // No default country
    const defaultVisaTypes = defaultCountry ? getAvailableVisaTypes(defaultCountry, nationality, userEmail) : []
    setFormData({
      countryCode: defaultCountry,
      fromCountry: '',
      entryDate: '',
      exitDate: '',
      entryCity: '',
      exitCity: '',
      visaType: defaultVisaTypes.length > 0 ? defaultVisaTypes[0].value : '',
      notes: ''
    })
    setEditingStay(null) // Keep form visible but clear edit mode
  }

  // Remove unused handleAdd function since form is always visible

  const handleEdit = (stay: Stay) => {
    setEditingStay(stay)
    const visaTypes = getAvailableVisaTypes(stay.countryCode, nationality, userEmail)
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
    setIsAddMode(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

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

    try {
      if (editingStay) {
        // Update existing stay - try Supabase first
        try {
          const updated = await updateStay(editingStay.id, {
            countryCode: formData.countryCode,
            fromCountry: formData.fromCountry || undefined,
            entryDate: formData.entryDate,
            exitDate: formData.exitDate || undefined,
            entryCity: formData.entryCity || undefined,
            exitCity: formData.exitCity || undefined,
            visaType: formData.visaType as Stay['visaType'],
            notes: formData.notes
          })
          
          // Update localStorage as backup
          updateStayInStorage(editingStay.id, {
            countryCode: formData.countryCode,
            fromCountry: formData.fromCountry || undefined,
            entryDate: formData.entryDate,
            exitDate: formData.exitDate || undefined,
            entryCity: formData.entryCity || undefined,
            exitCity: formData.exitCity || undefined,
            visaType: formData.visaType as Stay['visaType'],
            notes: formData.notes
          })
          
          setStays(prev => prev.map(stay => 
            stay.id === editingStay.id ? updated : stay
          ))
        } catch (supabaseError) {
          console.warn('Supabase update failed, trying localStorage only:', supabaseError)
          const localUpdated = updateStayInStorage(editingStay.id, {
            countryCode: formData.countryCode,
            fromCountry: formData.fromCountry || undefined,
            entryDate: formData.entryDate,
            exitDate: formData.exitDate || undefined,
            entryCity: formData.entryCity || undefined,
            exitCity: formData.exitCity || undefined,
            visaType: formData.visaType as Stay['visaType'],
            notes: formData.notes
          })
          
          if (!localUpdated) {
            throw new Error('Failed to update stay')
          }
          
          setStays(prev => prev.map(stay => 
            stay.id === editingStay.id ? localUpdated : stay
          ))
        }
        
      } else {
        // Add new stay - try Supabase first
        try {
          const newStay = await addStay({
            countryCode: formData.countryCode,
            fromCountry: formData.fromCountry || undefined,
            entryDate: formData.entryDate,
            exitDate: formData.exitDate || undefined,
            entryCity: formData.entryCity || undefined,
            exitCity: formData.exitCity || undefined,
            visaType: formData.visaType as Stay['visaType'],
            notes: formData.notes
          })
          
          // Save to localStorage as backup
          addStayToStorage(newStay)
          setStays(prev => [newStay, ...prev])
        } catch (supabaseError) {
          console.warn('Supabase add failed, trying localStorage only:', supabaseError)
          const newStay = addStayToStorage({
            countryCode: formData.countryCode,
            fromCountry: formData.fromCountry || undefined,
            entryDate: formData.entryDate,
            exitDate: formData.exitDate || undefined,
            entryCity: formData.entryCity || undefined,
            exitCity: formData.exitCity || undefined,
            visaType: formData.visaType as Stay['visaType'],
            notes: formData.notes
          })
          
          setStays(prev => [newStay, ...prev])
        }
      }
      
      resetForm()
      onStaysChange() // Refresh calendar
      alert(editingStay ? 'Stay updated successfully!' : 'Stay added successfully!')
      
    } catch (error) {
      console.error('Failed to save stay:', error)
      alert('Failed to save stay. Please try again.')
    }
  }

  const handleDelete = async (stayId: string) => {
    if (!confirm('Are you sure you want to delete this stay record?')) {
      return
    }

    try {
      // Try Supabase first
      try {
        await deleteStay(stayId)
        
        // Also delete from localStorage backup
        deleteStayFromStorage(stayId)
        
        setStays(prev => prev.filter(stay => stay.id !== stayId))
        onStaysChange() // Refresh calendar
        alert('Stay deleted successfully!')
      } catch (supabaseError) {
        console.warn('Supabase delete failed, trying localStorage only:', supabaseError)
        const success = deleteStayFromStorage(stayId)
        
        if (success) {
          setStays(prev => prev.filter(stay => stay.id !== stayId))
          onStaysChange() // Refresh calendar
          alert('Stay deleted successfully!')
        } else {
          throw new Error('Failed to delete stay from localStorage')
        }
      }
    } catch (error) {
      console.error('Failed to delete stay:', error)
      alert('Failed to delete stay. Please try again.')
    }
  }

  const calculateDays = (entryDate: string, exitDate: string) => {
    const entry = new Date(entryDate)
    const exit = new Date(exitDate)
    return Math.ceil((exit.getTime() - entry.getTime()) / (1000 * 60 * 60 * 24)) + 1
  }

  const filteredStays = stays.filter(stay => 
    selectedCountries.length === 0 || selectedCountries.includes(stay.countryCode)
  )

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
        borderBottomColor: theme.palette.divider
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
          Entry/Exit Records
        </Typography>
        <Typography 
          variant="body2" 
          sx={{
            color: theme.palette.text.secondary,
            fontSize: '13px'
          }}
        >
          Add new records or manage existing ones
        </Typography>
      </Box>

      {/* Material Design Form Section */}
      <Box 
        sx={{ 
          p: 3, 
          backgroundColor: '#f8f9fa', 
          flex: 1, 
          mx: 3, 
          mb: 3, 
          borderRadius: 2,
          border: '1px dashed #dadce0'
        }}
      >
        <Typography 
          variant="subtitle2" 
          component="h3" 
          sx={{ 
            mb: 2,
            color: '#202124',
            fontWeight: 500,
            fontSize: '14px'
          }}
        >
          {editingStay ? 'Edit Record' : 'Add New Record'}
        </Typography>
        
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                select
                label="From Country"
                value={formData.fromCountry}
                onChange={(e) => setFormData({ ...formData, fromCountry: e.target.value })}
                fullWidth
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
                label="Departure Airport/City (Optional)"
                value={formData.exitCity}
                onChange={(e) => setFormData({ ...formData, exitCity: e.target.value.toUpperCase() })}
                placeholder="e.g., ICN, BKK, NRT"
                fullWidth
                inputProps={{ maxLength: 5 }}
                helperText="Where you departed from origin country"
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                select
                label="To Country *"
                value={formData.countryCode}
                onChange={(e) => {
                  const newCountry = e.target.value
                  const visaTypes = getAvailableVisaTypes(newCountry, nationality, userEmail)
                  setFormData({ 
                    ...formData, 
                    countryCode: newCountry,
                    visaType: visaTypes.length > 0 ? visaTypes[0].value : ''
                  })
                }}
                required
                fullWidth
                helperText="Where did you travel to?"
              >
                <MenuItem value="">
                  <em>Select destination country</em>
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
                label="Arrival Airport/City (Optional)"
                value={formData.entryCity}
                onChange={(e) => setFormData({ ...formData, entryCity: e.target.value.toUpperCase() })}
                placeholder="e.g., ICN, BKK, NRT"
                fullWidth
                inputProps={{ maxLength: 5 }}
                helperText="Where you arrived in destination country"
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                select
                label="Visa Type"
                value={formData.visaType}
                onChange={(e) => setFormData({ ...formData, visaType: e.target.value })}
                fullWidth
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
                label="Entry Date *"
                type="date"
                value={formData.entryDate}
                onChange={(e) => setFormData({ ...formData, entryDate: e.target.value })}
                required
                fullWidth
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
                InputLabelProps={{ shrink: true }}
                helperText={formData.exitDate ? undefined : "Leave empty if still in country"}
              />
            </Grid>


            <Grid size={{ xs: 12 }}>
              <TextField
                label="Notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Optional notes..."
                multiline
                rows={3}
                fullWidth
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  type="submit"
                  color="primary"
                >
                  {editingStay ? 'Update Record' : 'Add Record'}
                </Button>
                <Button
                  variant="outlined"
                  type="button"
                  onClick={resetForm}
                >
                  Cancel
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Box>
  )
}