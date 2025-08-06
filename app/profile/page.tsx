'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
  Avatar,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material'
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Badge as BadgeIcon,
  CalendarMonth as CalendarIcon,
  Save as SaveIcon
} from '@mui/icons-material'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import Sidebar from '@/components/sidebar/Sidebar'
import { Country } from '@/lib/types'

const countries: Country[] = [
  { code: 'KR', name: '한국', flag: '🇰🇷' },
  { code: 'JP', name: '일본', flag: '🇯🇵' },
  { code: 'TH', name: '태국', flag: '🇹🇭' },
  { code: 'VN', name: '베트남', flag: '🇻🇳' },
]

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    created_at: ''
  })

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/auth/login')
        return
      }

      setUser(user)
      setProfile({
        name: user.user_metadata?.name || '',
        email: user.email || '',
        created_at: user.created_at
      })
    } catch (error) {
      console.error('Error loading profile:', error)
      setMessage({ type: 'error', text: 'Failed to load profile' })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!user) return
    
    setSaving(true)
    setMessage(null)
    
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({
        data: {
          name: profile.name
        }
      })

      if (error) {
        throw error
      }

      setMessage({ type: 'success', text: 'Profile updated successfully!' })
    } catch (error: any) {
      console.error('Error updating profile:', error)
      setMessage({ type: 'error', text: error.message || 'Failed to update profile' })
    } finally {
      setSaving(false)
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getUserInitial = () => {
    if (profile.name) {
      return profile.name[0].toUpperCase()
    }
    if (profile.email) {
      return profile.email[0].toUpperCase()
    }
    return 'U'
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: 'white' }}>
        <Sidebar 
          countries={countries}
          selectedCountry=""
          onSelectCountry={() => {}}
          currentPage="profile"
        />
        <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      </Box>
    )
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: 'white' }}>
      <Sidebar 
        countries={countries}
        selectedCountry=""
        onSelectCountry={() => {}}
        currentPage="profile"
      />
      
      <Box component="main" sx={{ flexGrow: 1, backgroundColor: '#f8f9fa' }}>
        <Container maxWidth="md" sx={{ py: 4 }}>
          <Typography 
            variant="h4" 
            component="h1" 
            sx={{ 
              mb: 4,
              color: '#202124',
              fontFamily: 'Google Sans, Roboto, sans-serif',
              fontWeight: 500
            }}
          >
            Profile
          </Typography>

          {message && (
            <Alert 
              severity={message.type} 
              onClose={() => setMessage(null)}
              sx={{ mb: 3 }}
            >
              {message.text}
            </Alert>
          )}

          <Paper
            elevation={0}
            sx={{
              p: 4,
              border: '1px solid #e8eaed',
              borderRadius: 2
            }}
          >
            <Stack spacing={4}>
              {/* Avatar Section */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    backgroundColor: '#1a73e8',
                    fontSize: '32px'
                  }}
                >
                  {getUserInitial()}
                </Avatar>
                <Box>
                  <Typography variant="h5" sx={{ color: '#202124', mb: 0.5 }}>
                    {profile.name || 'User'}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#5f6368' }}>
                    Member since {formatDate(profile.created_at)}
                  </Typography>
                </Box>
              </Box>

              <Divider />

              {/* Profile Form */}
              <Stack spacing={3}>
                <TextField
                  fullWidth
                  label="Name"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  InputProps={{
                    startAdornment: <PersonIcon sx={{ mr: 1, color: '#5f6368' }} />
                  }}
                />

                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={profile.email}
                  disabled
                  InputProps={{
                    startAdornment: <EmailIcon sx={{ mr: 1, color: '#5f6368' }} />
                  }}
                  helperText="Email cannot be changed"
                />

                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    onClick={() => router.push('/')}
                    sx={{
                      textTransform: 'none',
                      borderColor: '#dadce0',
                      color: '#5f6368',
                      '&:hover': {
                        backgroundColor: '#f8f9fa',
                        borderColor: '#dadce0'
                      }
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={handleSave}
                    disabled={saving}
                    sx={{
                      textTransform: 'none',
                      backgroundColor: '#1a73e8',
                      '&:hover': {
                        backgroundColor: '#1557b0'
                      }
                    }}
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </Box>
              </Stack>
            </Stack>
          </Paper>

          {/* Account Actions */}
          <Paper
            elevation={0}
            sx={{
              mt: 3,
              p: 4,
              border: '1px solid #e8eaed',
              borderRadius: 2
            }}
          >
            <Typography 
              variant="h6" 
              sx={{ 
                mb: 2,
                color: '#202124',
                fontWeight: 500
              }}
            >
              Account Settings
            </Typography>

            <Stack spacing={2}>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => router.push('/settings')}
                sx={{
                  textTransform: 'none',
                  justifyContent: 'flex-start',
                  borderColor: '#dadce0',
                  color: '#202124',
                  '&:hover': {
                    backgroundColor: '#f8f9fa',
                    borderColor: '#dadce0'
                  }
                }}
              >
                Manage Settings
              </Button>

              <Button
                variant="outlined"
                fullWidth
                color="error"
                onClick={async () => {
                  if (confirm('Are you sure you want to sign out?')) {
                    const supabase = createClient()
                    await supabase.auth.signOut()
                    router.push('/auth/login')
                  }
                }}
                sx={{
                  textTransform: 'none',
                  justifyContent: 'flex-start'
                }}
              >
                Sign Out
              </Button>
            </Stack>
          </Paper>
        </Container>
      </Box>
    </Box>
  )
}