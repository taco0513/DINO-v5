'use client'

import { useState } from 'react'
import { Button, Box, Typography, Alert, TextField } from '@mui/material'

export default function DataRecovery() {
  const [recoveryData, setRecoveryData] = useState('')
  const [analyzed, setAnalyzed] = useState(false)

  const analyzeLocalStorage = () => {
    const allKeys = Object.keys(localStorage)
    const dinoKeys = allKeys.filter(key => 
      key.includes('dino') || key.includes('stay') || key.includes('visa')
    )
    
    let analysis = 'Found localStorage keys:\n'
    
    dinoKeys.forEach(key => {
      const value = localStorage.getItem(key)
      analysis += `\n${key}:\n`
      try {
        const parsed = JSON.parse(value || '{}')
        analysis += JSON.stringify(parsed, null, 2)
      } catch {
        analysis += value
      }
      analysis += '\n---\n'
    })
    
    if (dinoKeys.length === 0) {
      analysis += 'No DINO-related data found in localStorage'
    }
    
    setRecoveryData(analysis)
    setAnalyzed(true)
  }

  const recoverFromBackup = () => {
    // Try to recover from old storage keys
    const oldKeys = ['dino-v5-stays', 'stays-data', 'travel-data']
    let recovered = false
    
    oldKeys.forEach(key => {
      const data = localStorage.getItem(key)
      if (data) {
        try {
          const parsed = JSON.parse(data)
          
          // Try to extract stays array from different formats
          let stays = []
          
          if (Array.isArray(parsed)) {
            stays = parsed
          } else if (parsed.stays && Array.isArray(parsed.stays)) {
            stays = parsed.stays
          } else if (parsed.data && Array.isArray(parsed.data)) {
            stays = parsed.data
          }
          
          if (stays.length > 0) {
            // Validate and clean the stays
            const validStays = stays.filter((stay: any) => {
              return stay.entryDate && 
                     stay.countryCode && 
                     !isNaN(new Date(stay.entryDate).getTime())
            })
            
            if (validStays.length > 0) {
              // Save to current storage format
              const newData = {
                version: '1.0',
                stays: validStays,
                lastUpdated: new Date().toISOString()
              }
              
              localStorage.setItem('dino-stays-data', JSON.stringify(newData))
              alert(`Recovered ${validStays.length} stays from ${key}!`)
              recovered = true
            }
          }
        } catch (error) {
          console.error(`Failed to parse data from ${key}:`, error)
        }
      }
    })
    
    if (!recovered) {
      alert('No recoverable data found. You may need to re-enter your stays.')
    } else {
      window.location.reload()
    }
  }

  const addSampleData = () => {
    const sampleStays = [
      {
        id: 'sample_1',
        countryCode: 'KR',
        fromCountry: 'US',
        entryDate: '2024-06-01',
        exitDate: '2024-08-31',
        entryCity: 'ICN',
        exitCity: 'ICN',
        visaType: 'long-term-resident',
        purpose: 'tourism',
        notes: 'Summer stay in Seoul - using 183-day rule'
      },
      {
        id: 'sample_2',
        countryCode: 'JP',
        fromCountry: 'KR',
        entryDate: '2024-09-01',
        exitDate: '2024-09-15',
        entryCity: 'NRT',
        exitCity: 'NRT',
        visaType: 'visa-free',
        purpose: 'tourism',
        notes: 'Quick Japan trip'
      },
      {
        id: 'sample_3',
        countryCode: 'KR',
        fromCountry: 'JP',
        entryDate: '2024-12-01',
        exitDate: '',
        entryCity: 'ICN',
        visaType: 'long-term-resident',
        purpose: 'tourism',
        notes: 'Currently in Korea - winter stay using 183-day rule'
      }
    ]
    
    const data = {
      version: '1.0',
      stays: sampleStays,
      lastUpdated: new Date().toISOString()
    }
    
    localStorage.setItem('dino-stays-data', JSON.stringify(data))
    alert('Added sample data! You can now test the app and replace with real data.')
    window.location.reload()
  }

  return (
    <Box sx={{ p: 2, border: '1px solid orange', borderRadius: 1, m: 2 }}>
      <Typography variant="h6" color="warning.main" gutterBottom>
        🔧 Data Recovery Tool
      </Typography>
      
      <Box sx={{ mb: 2 }}>
        <Button 
          variant="outlined" 
          onClick={analyzeLocalStorage}
          sx={{ mr: 1, mb: 1 }}
        >
          Analyze Storage
        </Button>
        
        <Button 
          variant="outlined" 
          onClick={recoverFromBackup}
          sx={{ mr: 1, mb: 1 }}
        >
          Try Recovery
        </Button>
        
        <Button 
          variant="contained" 
          color="success" 
          onClick={addSampleData}
          sx={{ mb: 1 }}
        >
          Add Sample Data
        </Button>
      </Box>

      {analyzed && (
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Storage Analysis:
          </Typography>
          <TextField
            multiline
            rows={10}
            fullWidth
            value={recoveryData}
            variant="outlined"
            size="small"
            InputProps={{
              style: { fontSize: '10px', fontFamily: 'monospace' }
            }}
          />
        </Box>
      )}
      
      <Alert severity="info" sx={{ mt: 2 }}>
        <strong>Recovery Options:</strong><br/>
        1. "Analyze Storage" - See what data exists<br/>
        2. "Try Recovery" - Attempt to recover from backup keys<br/>
        3. "Add Sample Data" - Create test data to verify the app works
      </Alert>
    </Box>
  )
}