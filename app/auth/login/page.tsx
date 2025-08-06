'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Container,
  Alert,
  Link,
  Divider,
  Stack
} from '@mui/material'
import {
  Google as GoogleIcon,
  Email as EmailIcon,
  Lock as LockIcon
} from '@mui/icons-material'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        setError(error.message)
      } else {
        router.push('/')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setError(null)
    setLoading(true)

    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) {
        setError(error.message)
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8f9fa'
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={0}
          sx={{
            p: 4,
            border: '1px solid #e8eaed',
            borderRadius: 2
          }}
        >
          <Stack spacing={3}>
            {/* Header */}
            <Box sx={{ textAlign: 'center' }}>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 500,
                  color: '#202124',
                  mb: 1
                }}
              >
                Welcome to DINO
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: '#5f6368' }}
              >
                Digital Nomad Visa Tracker
              </Typography>
            </Box>

            {/* Error Alert */}
            {error && (
              <Alert severity="error" onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            {/* Google Login */}
            <Button
              fullWidth
              variant="outlined"
              size="large"
              startIcon={<GoogleIcon />}
              onClick={handleGoogleLogin}
              disabled={loading}
              sx={{
                textTransform: 'none',
                py: 1.5,
                borderColor: '#dadce0',
                color: '#3c4043',
                '&:hover': {
                  backgroundColor: '#f8f9fa',
                  borderColor: '#dadce0'
                }
              }}
            >
              Continue with Google
            </Button>

            <Divider>
              <Typography variant="body2" sx={{ color: '#5f6368' }}>
                OR
              </Typography>
            </Divider>

            {/* Email Login Form */}
            <Box component="form" onSubmit={handleEmailLogin}>
              <Stack spacing={2}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  InputProps={{
                    startAdornment: <EmailIcon sx={{ mr: 1, color: '#5f6368' }} />
                  }}
                />

                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  InputProps={{
                    startAdornment: <LockIcon sx={{ mr: 1, color: '#5f6368' }} />
                  }}
                />

                <Button
                  fullWidth
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{
                    textTransform: 'none',
                    py: 1.5,
                    backgroundColor: '#1a73e8',
                    '&:hover': {
                      backgroundColor: '#1557b0'
                    }
                  }}
                >
                  Sign In
                </Button>
              </Stack>
            </Box>

            {/* Footer Links */}
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: '#5f6368' }}>
                Don't have an account?{' '}
                <Link
                  href="/auth/signup"
                  sx={{
                    color: '#1a73e8',
                    textDecoration: 'none',
                    '&:hover': {
                      textDecoration: 'underline'
                    }
                  }}
                >
                  Sign up
                </Link>
              </Typography>
            </Box>
          </Stack>
        </Paper>
      </Container>
    </Box>
  )
}