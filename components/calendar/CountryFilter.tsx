'use client'

import { useState } from 'react'
import {
  Paper,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  SelectChangeEvent,
  OutlinedInput,
  Chip,
  IconButton,
  Stack,
  useTheme
} from '@mui/material'
import {
  Done as DoneIcon,
  Clear as ClearIcon,
  FilterList as FilterListIcon
} from '@mui/icons-material'
import { Country, Stay } from '@/lib/types'

interface CountryFilterProps {
  countries: Country[]
  stays: Stay[]
  selectedCountries: string[]
  onSelectionChange: (countries: string[]) => void
}

export default function CountryFilter({ countries, stays, selectedCountries, onSelectionChange }: CountryFilterProps) {
  const theme = useTheme()
  // Don't show the filter if there are no stays
  if (stays.length === 0) {
    return null
  }
  
  // Only show countries that have actual stay records
  const countriesWithStays = Array.from(new Set(stays.map(stay => stay.countryCode)))
  const availableCountries = countries.filter(country => 
    countriesWithStays.includes(country.code)
  )
  
  // Don't show the filter if there are no countries with stays
  if (availableCountries.length === 0) {
    return null
  }
  
  const [isOpen, setIsOpen] = useState(false)

  const handleToggleCountry = (countryCode: string) => {
    if (selectedCountries.includes(countryCode)) {
      onSelectionChange(selectedCountries.filter(code => code !== countryCode))
    } else {
      onSelectionChange([...selectedCountries, countryCode])
    }
  }

  const handleClearAll = () => {
    onSelectionChange([])
  }

  const handleSelectAll = () => {
    onSelectionChange(availableCountries.map(country => country.code))
  }

  const isAllSelected = selectedCountries.length === availableCountries.length

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
      {/* Header */}
      <Box sx={{ 
        mb: 3,
        pb: 2,
        px: 3,
        pt: 3,
        borderBottom: '1px solid',
        borderBottomColor: theme.palette.divider,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start'
      }}>
        <Box>
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
            Country Filter
          </Typography>
          <Typography 
            variant="body2" 
            sx={{
              color: theme.palette.text.secondary,
              fontSize: '13px'
            }}
          >
            {selectedCountries.length === 0 
              ? 'Showing all countries' 
              : `${selectedCountries.length} of ${availableCountries.length} selected`
            }
          </Typography>
        </Box>
        <FilterListIcon sx={{ color: theme.palette.text.secondary, fontSize: 20 }} />
      </Box>

      {/* Country Chips */}
      <Box sx={{ px: 3, pb: 3 }}>
        <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
          {availableCountries.map((country) => {
            const isSelected = selectedCountries.includes(country.code)
            return (
              <Chip
                key={country.code}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Typography component="span" sx={{ fontSize: '16px' }}>
                      {country.flag}
                    </Typography>
                    <Typography component="span" sx={{ fontSize: '13px' }}>
                      {country.name}
                    </Typography>
                  </Box>
                }
                onClick={() => handleToggleCountry(country.code)}
                onDelete={isSelected ? () => handleToggleCountry(country.code) : undefined}
                deleteIcon={isSelected ? <DoneIcon /> : undefined}
                sx={{
                  backgroundColor: isSelected ? theme.palette.primary.light : 'transparent',
                  border: `1px solid ${isSelected ? theme.palette.primary.main : theme.palette.divider}`,
                  color: isSelected ? theme.palette.primary.main : theme.palette.text.primary,
                  '& .MuiChip-deleteIcon': {
                    color: theme.palette.primary.main,
                    fontSize: '18px'
                  },
                  '&:hover': {
                    backgroundColor: isSelected ? theme.palette.primary.light : theme.palette.action.hover,
                    borderColor: isSelected ? theme.palette.primary.main : theme.palette.divider
                  },
                  transition: 'all 0.2s ease',
                  fontWeight: isSelected ? 500 : 400
                }}
              />
            )
          })}
        </Stack>

        {/* Quick Actions */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: 2,
          pt: 2,
          borderTop: `1px solid ${theme.palette.divider}`
        }}>
          <Chip
            label={isAllSelected ? "Clear All" : "Select All"}
            onClick={isAllSelected ? handleClearAll : handleSelectAll}
            icon={isAllSelected ? <ClearIcon /> : <DoneIcon />}
            variant="outlined"
            size="small"
            sx={{
              borderColor: theme.palette.primary.main,
              color: theme.palette.primary.main,
              '&:hover': {
                backgroundColor: theme.palette.primary.light
              },
              '& .MuiChip-icon': {
                color: theme.palette.primary.main
              }
            }}
          />
        </Box>
      </Box>
    </Box>
  )
}
