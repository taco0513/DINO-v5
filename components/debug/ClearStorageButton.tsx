'use client'

import { Button, Box, Typography } from '@mui/material'

export default function ClearStorageButton() {
  const handleClearStorage = () => {
    if (confirm('Are you sure you want to clear all stored data? This will delete all your stay records from localStorage.')) {
      // Clear all possible storage keys
      localStorage.removeItem('dino-stays-data')
      localStorage.removeItem('dino-v5-stays') // old key
      
      // Also clear any other potential keys
      const keys = Object.keys(localStorage)
      keys.forEach(key => {
        if (key.includes('dino') || key.includes('stay')) {
          localStorage.removeItem(key)
        }
      })
      
      alert('Storage cleared! Please refresh the page.')
      window.location.reload()
    }
  }

  return (
    <Box sx={{ p: 2, border: '1px solid red', borderRadius: 1, m: 2 }}>
      <Typography variant="h6" color="error" gutterBottom>
        Debug: Clear Storage
      </Typography>
      <Typography variant="body2" sx={{ mb: 2 }}>
        This will clear all corrupted data from localStorage. Use only if you're seeing "Invalid Date" errors.
      </Typography>
      <Button 
        variant="contained" 
        color="error" 
        onClick={handleClearStorage}
        size="small"
      >
        Clear All Storage Data
      </Button>
    </Box>
  )
}