'use client'

import { useState } from 'react'
import {
  Box,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  Chip,
  Stack
} from '@mui/material'
import {
  Public as PublicIcon,
  Flag as FlagIcon
} from '@mui/icons-material'
import { Country, Stay } from '@/lib/types'

interface CalendarCountryFilterProps {
  countries: Country[]
  stays: Stay[]
  selectedCountry: string | null
  onCountryChange: (country: string | null) => void
}

// Visa rules for display
const visaInfo = {
  'KR': '90 days per entry',
  'JP': '90 days in 180-day window',
  'TH': '30 days per entry (+30 ext)',
  'VN': '45 days per entry'
}

export default function CalendarCountryFilter({ 
  countries, 
  stays,
  selectedCountry, 
  onCountryChange 
}: CalendarCountryFilterProps) {
  
  // Get countries that have actual stay records
  const countriesWithStays = Array.from(new Set(stays.map(stay => stay.countryCode)))
  const availableCountries = countries.filter(country => 
    countriesWithStays.includes(country.code)
  )

  // Don't show the filter if there are no stays
  if (stays.length === 0 || availableCountries.length === 0) {
    return null
  }

  return (
    <Box sx={{ 
      p: 2, 
      backgroundColor: 'white',
      border: '1px solid #e8eaed',
      borderRadius: 2,
      mb: 2
    }}>
      <Stack spacing={2}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 500, color: '#202124' }}>
            Visa Window Filter
          </Typography>
          {selectedCountry && (
            <Chip
              label={visaInfo[selectedCountry as keyof typeof visaInfo]}
              size="small"
              variant="outlined"
              sx={{ fontSize: '11px' }}
            />
          )}
        </Box>
        
        <ToggleButtonGroup
          value={selectedCountry}
          exclusive
          onChange={(e, newCountry) => onCountryChange(newCountry)}
          size="small"
          sx={{
            '& .MuiToggleButton-root': {
              textTransform: 'none',
              borderRadius: 2,
              px: 2,
              py: 0.75,
              border: '1px solid #dadce0',
              '&.Mui-selected': {
                backgroundColor: '#e8f0fe',
                borderColor: '#1a73e8',
                color: '#1967d2',
                '&:hover': {
                  backgroundColor: '#d2e3fc'
                }
              }
            }
          }}
        >
          <ToggleButton value={null} aria-label="all countries">
            <Stack direction="row" spacing={1} alignItems="center">
              <PublicIcon sx={{ fontSize: 18 }} />
              <Typography variant="body2">All Countries</Typography>
            </Stack>
          </ToggleButton>
          
          {availableCountries.map(country => (
            <ToggleButton key={country.code} value={country.code} aria-label={country.name}>
              <Stack direction="row" spacing={0.75} alignItems="center">
                <Typography component="span" sx={{ fontSize: '16px' }}>
                  {country.flag}
                </Typography>
                <Typography variant="body2">
                  {country.name}
                </Typography>
              </Stack>
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
        
        {selectedCountry && (
          <Typography variant="caption" sx={{ color: '#5f6368', fontStyle: 'italic' }}>
            Showing {availableCountries.find(c => c.code === selectedCountry)?.name} stays and visa window highlight
          </Typography>
        )}
      </Stack>
    </Box>
  )
}