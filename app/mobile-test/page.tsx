'use client'

import { useState, useEffect } from 'react'
import { Box, Typography, Chip, Stack } from '@mui/material'

export default function MobileTestPage() {
  const [screenInfo, setScreenInfo] = useState({
    width: 0,
    height: 0,
    orientation: '',
    isMobile: false,
    isTablet: false,
    isDesktop: false
  })

  useEffect(() => {
    const updateScreenInfo = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      
      setScreenInfo({
        width,
        height,
        orientation: width > height ? 'landscape' : 'portrait',
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024
      })
    }

    updateScreenInfo()
    window.addEventListener('resize', updateScreenInfo)
    return () => window.removeEventListener('resize', updateScreenInfo)
  }, [])

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>
        Mobile Optimization Test
      </Typography>
      
      <Stack spacing={2} sx={{ mt: 3 }}>
        <Box sx={{ 
          p: 2, 
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 1
        }}>
          <Typography variant="h6" gutterBottom>Screen Information</Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
            <Chip label={`${screenInfo.width} x ${screenInfo.height}`} color="primary" />
            <Chip label={screenInfo.orientation} color="secondary" />
            {screenInfo.isMobile && <Chip label="Mobile" color="success" />}
            {screenInfo.isTablet && <Chip label="Tablet" color="warning" />}
            {screenInfo.isDesktop && <Chip label="Desktop" color="info" />}
          </Stack>
        </Box>

        <Box sx={{ 
          p: 2, 
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 1
        }}>
          <Typography variant="h6" gutterBottom>Touch Test Area</Typography>
          <Box 
            sx={{ 
              height: 100, 
              bgcolor: 'primary.light',
              borderRadius: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              '&:active': {
                bgcolor: 'primary.dark'
              }
            }}
            onTouchStart={() => console.log('Touch start')}
            onTouchEnd={() => console.log('Touch end')}
            onClick={() => console.log('Click')}
          >
            <Typography color="white">Touch/Click Me</Typography>
          </Box>
        </Box>

        <Box sx={{ 
          p: 2, 
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 1
        }}>
          <Typography variant="h6" gutterBottom>Mobile Issues to Check</Typography>
          <ul>
            <li>Dashboard cards too wide on mobile</li>
            <li>Calendar view needs horizontal scroll</li>
            <li>Modal forms need better mobile layout</li>
            <li>Table views not optimized for small screens</li>
            <li>FAB button position on mobile</li>
          </ul>
        </Box>
      </Stack>
    </Box>
  )
}