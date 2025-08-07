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
  CircularProgress,
  Fade,
  Collapse
} from '@mui/material'
import { Country, Stay } from '@/lib/types'
import { getStays, addStay, updateStay, deleteStay } from '@/lib/supabase/stays'
import { 
  loadStaysFromStorage, 
  saveStaysToStorage,
  addStayToStorage,
  updateStayInStorage,
  deleteStayFromStorage 
} from '@/lib/storage/stays-storage'
import { cardBoxStyle, cardHeaderStyle, cardTitleStyle, cardSubtitleStyle } from '@/lib/styles/common'
import { getAvailableVisaTypes } from '@/lib/visa-rules/visa-types'
import { getCurrentUserEmail } from '@/lib/context/user'

interface StayManagerProps {
  countries: Country[]
  selectedCountries: string[]
  onStaysChange: () => void
}

interface FormErrors {
  entryDate: string
  exitDate: string
  dateRange: string
  countryCode: string
  general: string
}

export default function StayManagerEnhanced({ countries, selectedCountries, onStaysChange }: StayManagerProps) {
  const [stays, setStays] = useState<Stay[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [editingStay, setEditingStay] = useState<Stay | null>(null)
  const [nationality] = useState('US')
  const [userEmail] = useState(getCurrentUserEmail())
  const [successMessage, setSuccessMessage] = useState('')
  
  // Form state
  const [formData, setFormData] = useState({
    countryCode: selectedCountries[0] || '',
    fromCountry: '',
    entryDate: '',
    exitDate: '',
    entryCity: '',
    exitCity: '',
    visaType: '' as string,
    notes: ''
  })
  
  // Error state
  const [errors, setErrors] = useState<FormErrors>({
    entryDate: '',
    exitDate: '',
    dateRange: '',
    countryCode: '',
    general: ''
  })

  // Field touch state for validation
  const [touched, setTouched] = useState({
    entryDate: false,
    exitDate: false,
    countryCode: false
  })
  
  // Get available visa types for selected country
  const availableVisaTypes = formData.countryCode ? getAvailableVisaTypes(formData.countryCode, nationality, userEmail) : []
  
  // Set default visa type when country changes
  useEffect(() => {
    if (availableVisaTypes.length > 0 && !formData.visaType) {
      setFormData(prev => ({ ...prev, visaType: availableVisaTypes[0].value }))
    }
  }, [formData.countryCode])

  // Auto-detect "From" country based on last stay
  useEffect(() => {
    if (stays.length > 0 && !formData.fromCountry && !editingStay) {
      const lastStay = stays[0] // Already sorted by date
      if (lastStay?.countryCode) {
        setFormData(prev => ({ 
          ...prev, 
          fromCountry: lastStay.countryCode 
        }))
      }
    }
  }, [stays, editingStay])

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
          saveStaysToStorage(data)
        } else {
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
    const defaultCountry = selectedCountries[0] || ''
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
    setEditingStay(null)
    setErrors({
      entryDate: '',
      exitDate: '',
      dateRange: '',
      countryCode: '',
      general: ''
    })
    setTouched({
      entryDate: false,
      exitDate: false,
      countryCode: false
    })
  }

  // Real-time validation
  const validateField = (field: string, value: string) => {
    const newErrors = { ...errors }
    
    switch (field) {
      case 'countryCode':
        newErrors.countryCode = !value ? 'Destination country is required' : ''
        break
      case 'entryDate':
        newErrors.entryDate = !value ? 'Entry date is required' : ''
        // Check date range if both dates exist
        if (value && formData.exitDate) {
          newErrors.dateRange = new Date(formData.exitDate) < new Date(value) 
            ? 'Exit date must be after entry date' 
            : ''
        }
        break
      case 'exitDate':
        // Exit date is optional, but validate range if provided
        if (value && formData.entryDate) {
          newErrors.dateRange = new Date(value) < new Date(formData.entryDate) 
            ? 'Exit date must be after entry date' 
            : ''
        } else {
          newErrors.dateRange = ''
        }
        break
    }
    
    setErrors(newErrors)
    return !newErrors[field as keyof FormErrors]
  }

  // Handle field blur for validation
  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }))
    validateField(field, formData[field as keyof typeof formData])
  }

  // Handle field change
  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear general error when user starts typing
    if (errors.general) {
      setErrors(prev => ({ ...prev, general: '' }))
    }
    
    // Clear success message when user starts typing
    if (successMessage) {
      setSuccessMessage('')
    }
    
    // Validate if field was touched
    if (touched[field as keyof typeof touched]) {
      validateField(field, value)
    }
  }

  // Smart date suggestion
  const suggestExitDate = () => {
    if (!formData.entryDate || !formData.visaType) return
    
    const visaType = availableVisaTypes.find(v => v.value === formData.visaType)
    if (!visaType) return
    
    // Extract days from duration string (e.g., "90 days" -> 90)
    if (!visaType.duration) return
    const daysMatch = visaType.duration.match(/(\d+)\s*days/)
    if (!daysMatch) return
    
    const days = parseInt(daysMatch[1])
    const entryDate = new Date(formData.entryDate)
    const suggestedExit = new Date(entryDate)
    suggestedExit.setDate(suggestedExit.getDate() + days - 1)
    
    handleChange('exitDate', suggestedExit.toISOString().split('T')[0])
    setErrors(prev => ({ ...prev, exitDate: '', dateRange: '' }))
  }

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
    // Reset validation state
    setTouched({ entryDate: false, exitDate: false, countryCode: false })
    setErrors({ entryDate: '', exitDate: '', dateRange: '', countryCode: '', general: '' })
    setSuccessMessage('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate all required fields
    const isValidCountry = validateField('countryCode', formData.countryCode)
    const isValidEntry = validateField('entryDate', formData.entryDate)
    
    if (!isValidCountry || !isValidEntry) {
      setTouched({ entryDate: true, exitDate: true, countryCode: true })
      return
    }
    
    // Check for date range errors
    if (errors.dateRange) {
      return
    }

    setSubmitting(true)
    setErrors(prev => ({ ...prev, general: '' }))

    try {
      if (editingStay) {
        // Update existing stay
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
        
        setSuccessMessage('Stay record updated successfully!')
        
      } else {
        // Add new stay
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
        
        setSuccessMessage('Stay record added successfully!')
      }
      
      resetForm()
      onStaysChange() // Refresh calendar
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('')
      }, 3000)
      
    } catch (error) {
      console.error('Failed to save stay:', error)
      setErrors(prev => ({ 
        ...prev, 
        general: 'Failed to save stay record. Please try again.' 
      }))
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (stayId: string) => {
    if (!confirm('Are you sure you want to delete this stay record?')) {
      return
    }

    try {
      await deleteStay(stayId)
      deleteStayFromStorage(stayId)
      setStays(prev => prev.filter(stay => stay.id !== stayId))
      onStaysChange()
      setSuccessMessage('Stay record deleted successfully!')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error) {
      console.error('Failed to delete stay:', error)
      setErrors(prev => ({ 
        ...prev, 
        general: 'Failed to delete stay record. Please try again.' 
      }))
    }
  }

  if (loading) {
    return (
      <Box sx={cardBoxStyle}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <CircularProgress />
        </Box>
      </Box>
    )
  }

  return (
    <Box sx={cardBoxStyle}>
      {/* Header */}
      <Box sx={cardHeaderStyle}>
        <Typography 
          variant="h6" 
          component="h2" 
          sx={cardTitleStyle}
        >
          Entry/Exit Records
        </Typography>
        <Typography 
          variant="body2" 
          sx={cardSubtitleStyle}
        >
          Add new records or manage existing ones
        </Typography>
      </Box>

      {/* Success Message */}
      <Collapse in={!!successMessage}>
        <Alert 
          severity="success" 
          sx={{ mx: 3, mb: 2 }}
          onClose={() => setSuccessMessage('')}
        >
          {successMessage}
        </Alert>
      </Collapse>

      {/* Error Message */}
      <Collapse in={!!errors.general}>
        <Alert 
          severity="error" 
          sx={{ mx: 3, mb: 2 }}
          onClose={() => setErrors(prev => ({ ...prev, general: '' }))}
        >
          {errors.general}
        </Alert>
      </Collapse>

      {/* Material Design Form Section */}
      <Box 
        sx={{ 
          p: 3, 
          backgroundColor: '#f8f9fa', 
          flex: 1, 
          mx: 3, 
          mb: 3, 
          borderRadius: 2,
          border: '1px dashed #dadce0',
          transition: 'all 0.3s ease'
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
            {/* From Country */}
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                select
                label="From Country"
                value={formData.fromCountry}
                onChange={(e) => handleChange('fromCountry', e.target.value)}
                fullWidth
                helperText="Where did you travel from?"
                sx={{ '& .MuiOutlinedInput-root': { transition: 'all 0.3s' } }}
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

            {/* Departure Airport */}
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Departure Airport/City (Optional)"
                value={formData.exitCity}
                onChange={(e) => handleChange('exitCity', e.target.value.toUpperCase())}
                placeholder="e.g., ICN, BKK, NRT"
                fullWidth
                inputProps={{ maxLength: 5 }}
                helperText="Where you departed from origin country"
                sx={{ '& .MuiOutlinedInput-root': { transition: 'all 0.3s' } }}
              />
            </Grid>

            {/* To Country */}
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                select
                label="To Country *"
                value={formData.countryCode}
                onChange={(e) => {
                  const newCountry = e.target.value
                  const visaTypes = getAvailableVisaTypes(newCountry, nationality, userEmail)
                  handleChange('countryCode', newCountry)
                  handleChange('visaType', visaTypes.length > 0 ? visaTypes[0].value : '')
                }}
                onBlur={() => handleBlur('countryCode')}
                required
                fullWidth
                error={touched.countryCode && !!errors.countryCode}
                helperText={touched.countryCode && errors.countryCode ? errors.countryCode : "Where did you travel to?"}
                sx={{ '& .MuiOutlinedInput-root': { transition: 'all 0.3s' } }}
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

            {/* Arrival Airport */}
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Arrival Airport/City (Optional)"
                value={formData.entryCity}
                onChange={(e) => handleChange('entryCity', e.target.value.toUpperCase())}
                placeholder="e.g., ICN, BKK, NRT"
                fullWidth
                inputProps={{ maxLength: 5 }}
                helperText="Where you arrived in destination country"
                sx={{ '& .MuiOutlinedInput-root': { transition: 'all 0.3s' } }}
              />
            </Grid>

            {/* Visa Type */}
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                select
                label="Visa Type"
                value={formData.visaType}
                onChange={(e) => handleChange('visaType', e.target.value)}
                fullWidth
                helperText={availableVisaTypes.find(v => v.value === formData.visaType)?.duration || ''}
                disabled={!formData.countryCode}
                sx={{ '& .MuiOutlinedInput-root': { transition: 'all 0.3s' } }}
              >
                {availableVisaTypes.length === 0 ? (
                  <MenuItem value="">
                    <em>Select a country first</em>
                  </MenuItem>
                ) : (
                  availableVisaTypes.map(visaType => (
                    <MenuItem key={visaType.value} value={visaType.value}>
                      {visaType.label}
                    </MenuItem>
                  ))
                )}
              </TextField>
            </Grid>

            {/* Empty space for alignment */}
            <Grid size={{ xs: 12, md: 6 }}></Grid>

            {/* Entry Date */}
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Entry Date *"
                type="date"
                value={formData.entryDate}
                onChange={(e) => handleChange('entryDate', e.target.value)}
                onBlur={() => handleBlur('entryDate')}
                required
                fullWidth
                error={touched.entryDate && (!!errors.entryDate || !!errors.dateRange)}
                helperText={
                  touched.entryDate && errors.entryDate ? errors.entryDate : 
                  errors.dateRange ? errors.dateRange : ''
                }
                InputLabelProps={{ shrink: true }}
                sx={{ '& .MuiOutlinedInput-root': { transition: 'all 0.3s' } }}
              />
            </Grid>

            {/* Exit Date */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ position: 'relative' }}>
                <TextField
                  label="Exit Date (Optional)"
                  type="date"
                  value={formData.exitDate}
                  onChange={(e) => handleChange('exitDate', e.target.value)}
                  onBlur={() => handleBlur('exitDate')}
                  fullWidth
                  error={!!errors.dateRange}
                  helperText={
                    errors.dateRange ? errors.dateRange : 
                    !formData.exitDate ? "Leave empty if still in country" : ''
                  }
                  InputLabelProps={{ shrink: true }}
                  sx={{ '& .MuiOutlinedInput-root': { transition: 'all 0.3s' } }}
                />
                {formData.entryDate && formData.visaType && !formData.exitDate && (
                  <Button
                    size="small"
                    onClick={suggestExitDate}
                    sx={{
                      position: 'absolute',
                      right: 8,
                      top: 8,
                      textTransform: 'none',
                      fontSize: '0.75rem'
                    }}
                  >
                    Suggest
                  </Button>
                )}
              </Box>
            </Grid>

            {/* Notes */}
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Notes"
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="Optional notes..."
                multiline
                rows={3}
                fullWidth
                sx={{ '& .MuiOutlinedInput-root': { transition: 'all 0.3s' } }}
              />
            </Grid>

            {/* Actions */}
            <Grid size={{ xs: 12 }}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  type="submit"
                  color="primary"
                  disabled={submitting}
                  sx={{
                    minWidth: 120,
                    transition: 'all 0.3s',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: 3
                    }
                  }}
                >
                  {submitting ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CircularProgress size={20} color="inherit" />
                      <span>Saving...</span>
                    </Box>
                  ) : (
                    editingStay ? 'Update Record' : 'Add Record'
                  )}
                </Button>
                <Button
                  variant="outlined"
                  type="button"
                  onClick={resetForm}
                  disabled={submitting}
                  sx={{
                    transition: 'all 0.3s',
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.04)'
                    }
                  }}
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