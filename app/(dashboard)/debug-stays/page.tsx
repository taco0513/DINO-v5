'use client'

import { useState, useEffect } from 'react'
import { Box, Typography, Button, Card, Stack, Alert, Paper } from '@mui/material'
import { getStays, addStay } from '@/lib/supabase/stays'
import { loadStaysFromStorage, saveStaysToStorage, addStayToStorage } from '@/lib/storage/stays-storage'
import { createClient } from '@/lib/supabase/client'

export default function DebugStaysPage() {
  const [supabaseStays, setSupabaseStays] = useState<any[]>([])
  const [localStays, setLocalStays] = useState<any[]>([])
  const [authStatus, setAuthStatus] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState<string>('')
  const supabase = createClient()

  useEffect(() => {
    checkAuthAndLoadData()
  }, [])

  const checkAuthAndLoadData = async () => {
    // Check auth status
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      setAuthStatus(`Authenticated as: ${user.email}`)
    } else {
      setAuthStatus('Not authenticated')
    }

    // Load from localStorage
    const localData = loadStaysFromStorage()
    setLocalStays(localData)

    // Try to load from Supabase
    try {
      const supabaseData = await getStays()
      setSupabaseStays(supabaseData)
    } catch (err: any) {
      setError(`Failed to load from Supabase: ${err.message}`)
    }
  }

  const testAddToLocal = () => {
    try {
      const testStay = {
        countryCode: 'TH',
        entryDate: '2024-08-01',
        exitDate: '2024-08-10',
        visaType: 'visa-free' as const,
        notes: 'Test stay from debug page'
      }

      const newStay = addStayToStorage(testStay)
      if (newStay) {
        setSuccess('Successfully added to localStorage!')
        checkAuthAndLoadData()
      } else {
        setError('Failed to add to localStorage')
      }
    } catch (err: any) {
      setError(`Error: ${err.message}`)
    }
  }

  const testAddToSupabase = async () => {
    try {
      const testStay = {
        countryCode: 'VN',
        entryDate: '2024-08-15',
        exitDate: '2024-08-25',
        visaType: 'visa-free' as const,
        notes: 'Test stay from debug page - Supabase'
      }

      await addStay(testStay)
      setSuccess('Successfully added to Supabase!')
      checkAuthAndLoadData()
    } catch (err: any) {
      setError(`Failed to add to Supabase: ${err.message}`)
    }
  }

  const clearLocalStorage = () => {
    localStorage.removeItem('dino_stays')
    setLocalStays([])
    setSuccess('Cleared localStorage')
  }

  const syncToSupabase = async () => {
    try {
      let syncedCount = 0
      for (const stay of localStays) {
        // Debug: log what we're trying to sync
        console.log('Syncing stay:', stay)
        
        // Make sure countryCode exists
        if (!stay.countryCode) {
          console.error('Skipping stay with no countryCode:', stay)
          continue
        }
        
        await addStay(stay)
        syncedCount++
      }
      setSuccess(`Synced ${syncedCount} of ${localStays.length} stays to Supabase`)
      checkAuthAndLoadData()
    } catch (err: any) {
      setError(`Sync failed: ${err.message}`)
    }
  }

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        🔍 Debug Stays Storage
      </Typography>

      {/* Auth Status */}
      <Alert severity="info" sx={{ mb: 3 }}>
        {authStatus}
      </Alert>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Actions */}
      <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
        <Button variant="contained" onClick={testAddToLocal}>
          Add Test Stay (Local)
        </Button>
        <Button variant="contained" color="secondary" onClick={testAddToSupabase}>
          Add Test Stay (Supabase)
        </Button>
        <Button variant="outlined" onClick={checkAuthAndLoadData}>
          Refresh Data
        </Button>
        <Button variant="outlined" color="warning" onClick={clearLocalStorage}>
          Clear Local Storage
        </Button>
        <Button variant="outlined" color="success" onClick={syncToSupabase}>
          Sync Local → Supabase
        </Button>
      </Stack>

      {/* Data Display */}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
        <Card sx={{ flex: 1, p: 3 }}>
          <Typography variant="h6" gutterBottom>
            📱 LocalStorage ({localStays.length} stays)
          </Typography>
          <Paper sx={{ p: 2, bgcolor: 'grey.50', maxHeight: 400, overflow: 'auto' }}>
            <pre style={{ fontSize: '12px', margin: 0 }}>
              {JSON.stringify(localStays, null, 2)}
            </pre>
          </Paper>
        </Card>

        <Card sx={{ flex: 1, p: 3 }}>
          <Typography variant="h6" gutterBottom>
            ☁️ Supabase ({supabaseStays.length} stays)
          </Typography>
          <Paper sx={{ p: 2, bgcolor: 'grey.50', maxHeight: 400, overflow: 'auto' }}>
            <pre style={{ fontSize: '12px', margin: 0 }}>
              {JSON.stringify(supabaseStays, null, 2)}
            </pre>
          </Paper>
        </Card>
      </Stack>

      {/* Storage Info */}
      <Card sx={{ mt: 3, p: 2 }}>
        <Typography variant="subtitle2" color="text.secondary">
          Storage Priority: Supabase (primary) → LocalStorage (backup)
        </Typography>
        <Typography variant="caption" color="text.secondary">
          If Supabase fails, data is saved to localStorage. On next load, it tries Supabase first, then falls back to localStorage.
        </Typography>
      </Card>
    </Box>
  )
}