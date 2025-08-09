'use client'

import { Card, CardContent, Typography, Box, useTheme, Stack, Chip } from '@mui/material'
import { TrendingUp, TrendingDown, TrendingFlat } from '@mui/icons-material'
import { KPIData } from '@/lib/types/dashboard'

interface KPICardProps {
  data: KPIData
  height?: number
}

export default function KPICard({ data, height = 120 }: KPICardProps) {
  const theme = useTheme()
  
  const getTrendIcon = () => {
    if (!data.change) return <TrendingFlat sx={{ fontSize: 16 }} />
    if (data.change > 0) return <TrendingUp sx={{ fontSize: 16 }} />
    return <TrendingDown sx={{ fontSize: 16 }} />
  }
  
  const getTrendColor = () => {
    if (!data.change) return theme.palette.text.secondary
    if (data.change > 0) return theme.palette.success.main
    return theme.palette.error.main
  }
  
  const getCardColor = () => {
    switch (data.color) {
      case 'primary': return theme.palette.primary.main
      case 'success': return theme.palette.success.main
      case 'warning': return theme.palette.warning.main
      case 'error': return theme.palette.error.main
      case 'info': return theme.palette.info.main
      default: return theme.palette.primary.main
    }
  }

  return (
    <Card 
      sx={{ 
        height: '100%',
        minHeight: height,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: theme.shadows[1],
        transition: theme.transitions.create(['box-shadow', 'transform']),
        '&:hover': {
          boxShadow: theme.shadows[3],
          transform: 'translateY(-2px)'
        }
      }}
    >
      {/* Accent bar at top - Material Design pattern */}
      <Box
        sx={{
          height: 4,
          backgroundColor: getCardColor(),
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0
        }}
      />
      
      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', pt: 2.5 }}>
        {/* Label with icon */}
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
          {data.icon && (
            <Box sx={{ color: theme.palette.text.secondary, display: 'flex' }}>
              {data.icon}
            </Box>
          )}
          <Typography 
            variant="caption" 
            sx={{ 
              color: theme.palette.text.secondary,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              fontWeight: 500,
              fontSize: '0.75rem'
            }}
          >
            {data.label}
          </Typography>
        </Stack>
        
        {/* Main value */}
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 500,
            color: theme.palette.text.primary,
            mb: 'auto',
            fontSize: '2rem',
            lineHeight: 1.2
          }}
        >
          {data.value}
        </Typography>
        
        {/* Change indicator */}
        {data.change !== undefined && (
          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 1 }}>
            <Box sx={{ color: getTrendColor(), display: 'flex' }}>
              {getTrendIcon()}
            </Box>
            <Typography
              variant="body2"
              sx={{
                color: getTrendColor(),
                fontWeight: 500,
                fontSize: '0.875rem'
              }}
            >
              {data.change > 0 ? '+' : ''}{data.change}%
            </Typography>
            {data.changeLabel && (
              <Typography
                variant="caption"
                sx={{
                  color: theme.palette.text.secondary,
                  fontSize: '0.75rem'
                }}
              >
                {data.changeLabel}
              </Typography>
            )}
          </Stack>
        )}
      </CardContent>
    </Card>
  )
}