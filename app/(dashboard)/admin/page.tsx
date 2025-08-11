'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Button,
  useTheme
} from '@mui/material'
import { createClient } from '@/lib/supabase/client'

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string>('')
  const router = useRouter()
  const theme = useTheme()
  const supabase = createClient()

  useEffect(() => {
    checkAdminAccess()
  }, [])

  const checkAdminAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/auth/login')
        return
      }

      setUserEmail(user.email || 'Unknown')

      // Check if user is admin
      const adminEmails = ['zbrianjin@gmail.com']
      if (!adminEmails.includes(user.email || '')) {
        setError('You do not have admin access to this dashboard.')
        return
      }

      setLoading(false)
    } catch (err) {
      console.error('Error checking admin access:', err)
      setError('Failed to verify admin access')
    }
  }

  if (error) {
    return (
      <Box sx={{ p: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Alert severity="error" sx={{ maxWidth: 600 }}>
          <Typography variant="h6" gutterBottom>Access Denied</Typography>
          <Typography>{error}</Typography>
          <Button 
            variant="contained" 
            sx={{ mt: 2 }}
            onClick={() => router.push('/')}
          >
            Return to Dashboard
          </Button>
        </Alert>
      </Box>
    )
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={40} />
      </Box>
    )
  }

  return (
    <Box component="main" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', backgroundColor: theme.palette.background.default }}>
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        <Box sx={{ p: 3 }}>
          <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
            Admin Dashboard
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            Logged in as: {userEmail}
          </Typography>
          
          <Alert severity="info" sx={{ mt: 3 }}>
            <Typography variant="body1">
              This is a simplified admin dashboard. The full feedback system is temporarily disabled for rebuild.
            </Typography>
          </Alert>

          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Button 
                variant="contained" 
                onClick={() => router.push('/')}
              >
                Go to Main Dashboard
              </Button>
              <Button 
                variant="outlined"
                onClick={() => router.push('/settings')}
              >
                Settings
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}