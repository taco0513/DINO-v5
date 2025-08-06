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
  Stack
} from '@mui/material'
import {
  Done as DoneIcon,
  Clear as ClearIcon,
  FilterList as FilterListIcon
} from '@mui/icons-material'
import { Country, Stay } from '@/lib/types'
import { cardBoxStyle, cardHeaderStyle, cardTitleStyle, cardSubtitleStyle, googleColors } from '@/lib/styles/common'

interface CountryFilterProps {
  countries: Country[]
  stays: Stay[]
  selectedCountries: string[]
  onSelectionChange: (countries: string[]) => void
}

export default function CountryFilter({ countries, stays, selectedCountries, onSelectionChange }: CountryFilterProps) {
  // Don't show the filter if there are no stays
  if (stays.length === 0) {
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
    onSelectionChange(countries.map(country => country.code))
  }

  const isAllSelected = selectedCountries.length === countries.length

  return (
    <Box sx={cardBoxStyle}>
      {/* Header */}
      <Box sx={{ 
        ...cardHeaderStyle,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start'
      }}>
        <Box>
          <Typography 
            variant="h6" 
            component="h2" 
            sx={cardTitleStyle}
          >
            Country Filter
          </Typography>
          <Typography 
            variant="body2" 
            sx={cardSubtitleStyle}
          >
            {selectedCountries.length === 0 
              ? 'Showing all countries' 
              : `${selectedCountries.length} of ${countries.length} selected`
            }
          </Typography>
        </Box>
        <FilterListIcon sx={{ color: googleColors.textSecondary, fontSize: 20 }} />
      </Box>

      {/* Country Chips */}
      <Box sx={{ px: 3, pb: 3 }}>
        <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
          {countries.map((country) => {
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
                  backgroundColor: isSelected ? googleColors.primaryLight : 'transparent',
                  border: `1px solid ${isSelected ? googleColors.primary : googleColors.borderLight}`,
                  color: isSelected ? googleColors.primary : googleColors.textPrimary,
                  '& .MuiChip-deleteIcon': {
                    color: googleColors.primary,
                    fontSize: '18px'
                  },
                  '&:hover': {
                    backgroundColor: isSelected ? googleColors.primaryLight : googleColors.hoverLight,
                    borderColor: isSelected ? googleColors.primary : googleColors.borderLight
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
          borderTop: `1px solid ${googleColors.borderLighter}`
        }}>
          <Chip
            label={isAllSelected ? "Clear All" : "Select All"}
            onClick={isAllSelected ? handleClearAll : handleSelectAll}
            icon={isAllSelected ? <ClearIcon /> : <DoneIcon />}
            variant="outlined"
            size="small"
            sx={{
              borderColor: googleColors.primary,
              color: googleColors.primary,
              '&:hover': {
                backgroundColor: googleColors.primaryLight
              },
              '& .MuiChip-icon': {
                color: googleColors.primary
              }
            }}
          />
        </Box>
      </Box>
    </Box>
  )
}
