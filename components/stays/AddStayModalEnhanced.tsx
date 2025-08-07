'use client'

import { useState, useEffect, useMemo } from 'react'
import { Stay, Country } from '@/lib/types'
import { addStayToStorage } from '@/lib/storage/stays-storage'
import { addStay } from '@/lib/supabase/stays'
import { getAvailableVisaTypes } from '@/lib/visa-rules/visa-types'
import { getCurrentUserEmail } from '@/lib/context/user'
import { loadStaysFromStorage } from '@/lib/storage/stays-storage'
import { Autocomplete, TextField } from '@mui/material'

interface AddStayModalEnhancedProps {
  isOpen: boolean
  onClose: () => void
  onAdded: () => void
  countries: Country[]
  defaultCountry?: string
}

interface FormErrors {
  entryDate: string
  exitDate: string
  dateRange: string
  countryCode: string
  general: string
}

export default function AddStayModalEnhanced({ 
  isOpen, 
  onClose, 
  onAdded, 
  countries,
  defaultCountry 
}: AddStayModalEnhancedProps) {
  const [nationality] = useState('US')
  const [userEmail] = useState(getCurrentUserEmail())
  const [loading, setLoading] = useState(false)
  const [savedSuccess, setSavedSuccess] = useState(false)
  
  // Sort countries alphabetically
  const sortedCountries = useMemo(() => {
    return [...countries].sort((a, b) => a.name.localeCompare(b.name))
  }, [countries])
  
  // Form state
  const [formData, setFormData] = useState({
    countryCode: defaultCountry || '',
    fromCountry: '',
    entryDate: '',
    exitDate: '',
    entryCity: '',
    exitCity: '',
    visaType: '',
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

  // Auto-detect "From" country based on last stay
  useEffect(() => {
    if (!isOpen) return
    
    const stays = loadStaysFromStorage()
    if (stays.length > 0) {
      const lastStay = stays.sort((a, b) => 
        new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime()
      )[0]
      
      if (lastStay?.countryCode && !formData.fromCountry) {
        setFormData(prev => ({ 
          ...prev, 
          fromCountry: lastStay.countryCode 
        }))
      }
    }
  }, [isOpen])

  // Update visa type when country changes
  useEffect(() => {
    if (formData.countryCode) {
      const visaTypes = getAvailableVisaTypes(formData.countryCode, nationality, userEmail)
      if (visaTypes.length > 0 && !formData.visaType) {
        setFormData(prev => ({ ...prev, visaType: visaTypes[0].value }))
      }
    }
  }, [formData.countryCode, nationality, userEmail])

  // Get available visa types for selected country
  const availableVisaTypes = getAvailableVisaTypes(formData.countryCode, nationality, userEmail)

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
    
    setFormData(prev => ({ 
      ...prev, 
      exitDate: suggestedExit.toISOString().split('T')[0]
    }))
    setErrors(prev => ({ ...prev, exitDate: '', dateRange: '' }))
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

    setLoading(true)
    setErrors(prev => ({ ...prev, general: '' }))

    try {
      // Add to localStorage first
      const newStay = addStayToStorage({
        countryCode: formData.countryCode,
        fromCountry: formData.fromCountry || undefined,
        entryDate: formData.entryDate,
        exitDate: formData.exitDate || undefined,
        entryCity: formData.entryCity || undefined,
        exitCity: formData.exitCity || undefined,
        visaType: formData.visaType as Stay['visaType'],
        notes: formData.notes || undefined
      })

      if (!newStay) {
        throw new Error('Failed to save stay record')
      }

      // Try to sync with Supabase in background
      addStay({
        countryCode: formData.countryCode,
        fromCountry: formData.fromCountry || undefined,
        entryDate: formData.entryDate,
        exitDate: formData.exitDate || undefined,
        entryCity: formData.entryCity || undefined,
        exitCity: formData.exitCity || undefined,
        visaType: formData.visaType as Stay['visaType'],
        notes: formData.notes || undefined
      }).catch(supabaseError => {
        console.warn('Failed to sync with Supabase (non-critical):', supabaseError)
      })

      // Show success state
      setSavedSuccess(true)
      
      // Reset form
      setFormData({
        countryCode: defaultCountry || '',
        fromCountry: '',
        entryDate: '',
        exitDate: '',
        entryCity: '',
        exitCity: '',
        visaType: '',
        notes: ''
      })
      setTouched({ entryDate: false, exitDate: false, countryCode: false })
      setErrors({
        entryDate: '',
        exitDate: '',
        dateRange: '',
        countryCode: '',
        general: ''
      })

      // Notify parent and close after animation
      onAdded()
      setTimeout(() => {
        setSavedSuccess(false)
        onClose()
      }, 1500)

    } catch (error) {
      console.error('Failed to add stay:', error)
      setErrors(prev => ({ 
        ...prev, 
        general: 'Failed to save stay record. Please try again.' 
      }))
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      setSavedSuccess(false)
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-xl w-full max-w-md md:max-w-lg lg:max-w-xl animate-fade-in">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">✈️ Add Travel Record</h2>
          <p className="text-sm text-gray-500 mt-1">Track your stay duration and visa compliance</p>
        </div>

        {/* Success Message */}
        {savedSuccess && (
          <div className="mx-6 mt-4 p-3 bg-green-50 border border-green-200 rounded-lg animate-slide-down">
            <p className="text-green-700 font-medium flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Stay record saved successfully!
            </p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Error Message */}
          {errors.general && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg" role="alert">
              <p className="text-red-700 text-sm">{errors.general}</p>
            </div>
          )}

          {/* Travel Route Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <span className="text-lg">🗺️</span> Travel Route
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* From Country */}
              <div>
                <label htmlFor="from-country" className="block text-sm font-medium text-gray-700 mb-1">
                  From Country
                </label>
                <Autocomplete
                  id="from-country"
                  options={sortedCountries}
                  getOptionLabel={(option) => `${option.flag} ${option.name}`}
                  value={sortedCountries.find(c => c.code === formData.fromCountry) || null}
                  onChange={(_, newValue) => handleChange('fromCountry', newValue?.code || '')}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Type to search..."
                      size="small"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': {
                            borderColor: '#3b82f6',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#3b82f6',
                            borderWidth: '2px',
                          },
                        },
                      }}
                    />
                  )}
                  clearOnBlur={false}
                  aria-label="Origin country"
                />
              </div>

              {/* To Country */}
              <div>
                <label htmlFor="to-country" className="block text-sm font-medium text-gray-700 mb-1">
                  To Country <span className="text-red-500">*</span>
                </label>
                <Autocomplete
                  id="to-country"
                  options={sortedCountries}
                  getOptionLabel={(option) => `${option.flag} ${option.name}`}
                  value={sortedCountries.find(c => c.code === formData.countryCode) || null}
                  onChange={(_, newValue) => handleChange('countryCode', newValue?.code || '')}
                  onBlur={() => handleBlur('countryCode')}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Type to search..."
                      required
                      error={touched.countryCode && !!errors.countryCode}
                      size="small"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': {
                            borderColor: touched.countryCode && errors.countryCode ? '#ef4444' : '#3b82f6',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: touched.countryCode && errors.countryCode ? '#ef4444' : '#3b82f6',
                            borderWidth: '2px',
                          },
                          '&.Mui-error fieldset': {
                            borderColor: '#ef4444',
                          },
                        },
                      }}
                    />
                  )}
                  clearOnBlur={false}
                />
                {touched.countryCode && errors.countryCode && (
                  <p id="country-error" className="text-red-500 text-sm mt-1" role="alert">
                    {errors.countryCode}
                  </p>
                )}
              </div>

              {/* Entry City */}
              <div>
                <label htmlFor="entry-city" className="block text-sm font-medium text-gray-700 mb-1">
                  Arrival Airport/City
                </label>
                <input
                  id="entry-city"
                  type="text"
                  value={formData.entryCity}
                  onChange={(e) => handleChange('entryCity', e.target.value.toUpperCase())}
                  placeholder="e.g., ICN, BKK"
                  maxLength={5}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  aria-label="Arrival airport or city code"
                />
              </div>

              {/* Exit City */}
              <div>
                <label htmlFor="exit-city" className="block text-sm font-medium text-gray-700 mb-1">
                  Departure Airport/City
                </label>
                <input
                  id="exit-city"
                  type="text"
                  value={formData.exitCity}
                  onChange={(e) => handleChange('exitCity', e.target.value.toUpperCase())}
                  placeholder="e.g., NRT, SIN"
                  maxLength={5}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  aria-label="Departure airport or city code"
                />
              </div>
            </div>
          </div>

          {/* Dates & Visa Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <span className="text-lg">📅</span> Dates & Visa
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Entry Date */}
              <div>
                <label htmlFor="entry-date" className="block text-sm font-medium text-gray-700 mb-1">
                  Entry Date <span className="text-red-500">*</span>
                </label>
                <input
                  id="entry-date"
                  type="date"
                  required
                  value={formData.entryDate}
                  onChange={(e) => handleChange('entryDate', e.target.value)}
                  onBlur={() => handleBlur('entryDate')}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ${
                    touched.entryDate && errors.entryDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                  aria-label="Entry date"
                  aria-required="true"
                  aria-invalid={!!(errors.entryDate || errors.dateRange)}
                  aria-describedby={errors.entryDate ? 'entry-error' : errors.dateRange ? 'date-range-error' : undefined}
                />
                {touched.entryDate && errors.entryDate && (
                  <p id="entry-error" className="text-red-500 text-sm mt-1" role="alert">
                    {errors.entryDate}
                  </p>
                )}
              </div>

              {/* Exit Date */}
              <div>
                <label htmlFor="exit-date" className="block text-sm font-medium text-gray-700 mb-1">
                  Exit Date
                  {formData.entryDate && formData.visaType && (
                    <button
                      type="button"
                      onClick={suggestExitDate}
                      className="ml-2 text-xs text-blue-600 hover:text-blue-700 transition-colors"
                      aria-label="Suggest exit date based on visa duration"
                    >
                      (suggest)
                    </button>
                  )}
                </label>
                <input
                  id="exit-date"
                  type="date"
                  value={formData.exitDate}
                  onChange={(e) => handleChange('exitDate', e.target.value)}
                  onBlur={() => handleBlur('exitDate')}
                  min={formData.entryDate}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ${
                    errors.dateRange ? 'border-red-500' : 'border-gray-300'
                  }`}
                  aria-label="Exit date (optional)"
                  aria-invalid={!!errors.dateRange}
                  aria-describedby={errors.dateRange ? 'date-range-error' : undefined}
                />
                <p className="text-xs text-gray-500 mt-1">Leave empty if still in country</p>
              </div>

              {/* Visa Type */}
              <div className="md:col-span-2">
                <label htmlFor="visa-type" className="block text-sm font-medium text-gray-700 mb-1">
                  Visa Type
                </label>
                <select
                  id="visa-type"
                  value={formData.visaType}
                  onChange={(e) => handleChange('visaType', e.target.value)}
                  disabled={!formData.countryCode}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  aria-label="Visa type"
                  aria-describedby="visa-helper"
                >
                  {availableVisaTypes.length === 0 ? (
                    <option value="">Select a country first</option>
                  ) : (
                    availableVisaTypes.map(visaType => (
                      <option key={visaType.value} value={visaType.value}>
                        {visaType.label}
                      </option>
                    ))
                  )}
                </select>
                {formData.visaType && (
                  <p id="visa-helper" className="text-xs text-gray-500 mt-1">
                    {availableVisaTypes.find(v => v.value === formData.visaType)?.duration}
                  </p>
                )}
              </div>
            </div>

            {/* Date Range Error */}
            {errors.dateRange && (
              <div id="date-range-error" className="p-3 bg-red-50 border border-red-200 rounded-lg" role="alert">
                <p className="text-red-700 text-sm flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.dateRange}
                </p>
              </div>
            )}
          </div>

          {/* Notes Section */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 resize-none"
              placeholder="Add any additional notes about your stay..."
              aria-label="Additional notes (optional)"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 py-3 px-4 min-h-[44px] border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              aria-label="Cancel and close form"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || savedSuccess}
              className="flex-1 py-3 px-4 min-h-[44px] bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2"
              aria-label={loading ? 'Saving stay record' : 'Save stay record'}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Saving...
                </>
              ) : savedSuccess ? (
                <>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Saved!
                </>
              ) : (
                'Add Stay'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}