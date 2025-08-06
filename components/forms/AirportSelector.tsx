'use client'

import { useState, useMemo } from 'react'
import {
  TextField,
  MenuItem,
  Autocomplete,
  Box,
  Typography,
  Chip
} from '@mui/material'
import {
  Flight as FlightIcon
} from '@mui/icons-material'
import { getAirportsByCountry, searchAirports, type Airport } from '@/lib/data/countries-and-airports'

interface AirportSelectorProps {
  label: string
  value: string
  onChange: (airportCode: string) => void
  countryCode?: string
  placeholder?: string
  helperText?: string
  required?: boolean
  size?: 'small' | 'medium'
  fullWidth?: boolean
}

export default function AirportSelector({ 
  label, 
  value, 
  onChange, 
  countryCode,
  placeholder = 'e.g., ICN, BKK, NRT',
  helperText,
  required = false,
  size = 'small',
  fullWidth = true
}: AirportSelectorProps) {
  const [inputValue, setInputValue] = useState('')

  // Get filtered airports based on selected country
  const availableAirports = useMemo(() => {
    if (countryCode) {
      return getAirportsByCountry(countryCode)
    }
    // If no country selected, return popular airports from major nomad destinations
    return getAirportsByCountry('KR')
      .concat(getAirportsByCountry('JP'))
      .concat(getAirportsByCountry('TH'))
      .concat(getAirportsByCountry('VN'))
      .concat(getAirportsByCountry('SG'))
      .concat(getAirportsByCountry('MY'))
      .concat(getAirportsByCountry('ID'))
      .concat(getAirportsByCountry('HK'))
      .concat(getAirportsByCountry('TW'))
      .slice(0, 20) // Limit to avoid overwhelming dropdown
  }, [countryCode])

  // Find current selected airport
  const selectedAirport = availableAirports.find(airport => airport.code === value)

  // Filter airports based on search input
  const filteredAirports = useMemo(() => {
    if (!inputValue) return availableAirports
    return searchAirports(inputValue, countryCode)
  }, [inputValue, availableAirports, countryCode])

  const handleChange = (event: any, newValue: Airport | string | null, reason?: string) => {
    if (typeof newValue === 'string') {
      // Free solo input - user typed something not in the list
      onChange(newValue.toUpperCase())
    } else {
      // Selected from list or cleared
      onChange(newValue?.code || '')
    }
  }

  const handleInputChange = (event: any, newInputValue: string) => {
    setInputValue(newInputValue)
  }

  // Handle blur to capture free solo input
  const handleBlur = () => {
    if (inputValue && !selectedAirport) {
      // User typed something but didn't select from list
      onChange(inputValue.toUpperCase())
    }
  }

  // If no airports available for country, show simple text field
  if (availableAirports.length === 0) {
    return (
      <TextField
        label={label}
        value={value}
        onChange={(e) => onChange(e.target.value.toUpperCase())}
        placeholder={placeholder}
        fullWidth={fullWidth}
        size={size}
        helperText={helperText || 'Enter 3-letter airport code'}
        required={required}
        inputProps={{ maxLength: 5 }}
        InputProps={{
          startAdornment: <FlightIcon sx={{ mr: 1, color: 'text.disabled', fontSize: '1rem' }} />
        }}
      />
    )
  }

  return (
    <Autocomplete
      value={selectedAirport || null}
      onChange={handleChange}
      inputValue={inputValue}
      onInputChange={handleInputChange}
      options={filteredAirports}
      getOptionLabel={(option) => typeof option === 'string' ? option : `${option.code} - ${option.name}`}
      isOptionEqualToValue={(option, value) => typeof option === 'string' ? option === value : (typeof value === 'string' ? false : option.code === value?.code)}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={countryCode ? 'Search airports...' : placeholder}
          fullWidth={fullWidth}
          size={size}
          helperText={helperText}
          required={required}
          onBlur={handleBlur}
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <>
                <FlightIcon sx={{ mr: 1, color: 'text.disabled', fontSize: '1rem' }} />
                {params.InputProps.startAdornment}
              </>
            ),
          }}
        />
      )}
      renderOption={(props, option) => (
        <Box component="li" {...props}>
          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            <FlightIcon sx={{ mr: 1.5, color: 'text.disabled', fontSize: '1rem' }} />
            <Box sx={{ flexGrow: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip
                  label={option.code}
                  size="small"
                  variant="outlined"
                  sx={{ 
                    minWidth: 50,
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    color: 'primary.main',
                    borderColor: 'primary.main'
                  }}
                />
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {option.name}
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary">
                {option.city}
              </Typography>
            </Box>
          </Box>
        </Box>
      )}
      freeSolo
      selectOnFocus
      clearOnBlur={false}
      handleHomeEndKeys
      sx={{
        '& .MuiAutocomplete-inputRoot': {
          paddingLeft: '8px !important'
        }
      }}
      componentsProps={{
        popper: {
          sx: {
            '& .MuiAutocomplete-listbox': {
              maxHeight: 200,
              '& .MuiAutocomplete-option': {
                padding: '8px 16px'
              }
            }
          }
        }
      }}
    />
  )
}