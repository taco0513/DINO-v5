'use client'

import { Button, Box, Typography } from '@mui/material'

export default function ClearSampleData() {
  const handleClearSampleData = () => {
    if (confirm('Clear sample data from localStorage?')) {
      localStorage.removeItem('dino-stays-data')
      alert('Sample data cleared! Page will reload.')
      window.location.reload()
    }
  }

  return (
    <Box sx={{ p: 2, border: '1px solid orange', borderRadius: 1, m: 2 }}>
      <Typography variant="h6" color="warning.main" gutterBottom>
        🧹 Clear Sample Data
      </Typography>
      <Typography variant="body2" sx={{ mb: 2 }}>
        Remove sample data and switch to Supabase-first data loading.
      </Typography>
      <Button 
        variant="contained" 
        color="warning" 
        onClick={handleClearSampleData}
        size="small"
      >
        Clear Sample Data
      </Button>
    </Box>
  )
}