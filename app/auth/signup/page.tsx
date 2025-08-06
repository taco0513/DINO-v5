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
  Lock as LockIcon,
  Person as PersonIcon
} from '@mui/icons-material'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    // Validate password strength
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name
          }
        }
      })

      if (error) {
        setError(error.message)
      } else {
        setSuccess(true)
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignup = async () => {
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

  if (success) {
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
              borderRadius: 2,
              textAlign: 'center'
            }}
          >
            <Typography variant="h5" sx={{ mb: 2, color: '#188038' }}>
              ✓ Account Created Successfully!
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, color: '#5f6368' }}>
              Please check your email to verify your account.
            </Typography>
            <Button
              variant="contained"
              onClick={() => router.push('/auth/login')}
              sx={{
                textTransform: 'none',
                backgroundColor: '#1a73e8',
                '&:hover': {
                  backgroundColor: '#1557b0'
                }
              }}
            >
              Go to Login
            </Button>
          </Paper>
        </Container>
      </Box>
    )
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
                Create Account
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: '#5f6368' }}
              >
                Start tracking your visa status
              </Typography>
            </Box>

            {/* Error Alert */}
            {error && (
              <Alert severity="error" onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            {/* Google Signup */}
            <Button
              fullWidth
              variant="outlined"
              size="large"
              startIcon={<GoogleIcon />}
              onClick={handleGoogleSignup}
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
              Sign up with Google
            </Button>

            <Divider>
              <Typography variant="body2" sx={{ color: '#5f6368' }}>
                OR
              </Typography>
            </Divider>

            {/* Email Signup Form */}
            <Box component="form" onSubmit={handleEmailSignup}>
              <Stack spacing={2}>
                <TextField
                  fullWidth
                  label="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoComplete="name"
                  InputProps={{
                    startAdornment: <PersonIcon sx={{ mr: 1, color: '#5f6368' }} />
                  }}
                />

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
                  autoComplete="new-password"
                  helperText="At least 6 characters"
                  InputProps={{
                    startAdornment: <LockIcon sx={{ mr: 1, color: '#5f6368' }} />
                  }}
                />

                <TextField
                  fullWidth
                  label="Confirm Password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
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
                  Create Account
                </Button>
              </Stack>
            </Box>

            {/* Footer Links */}
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: '#5f6368' }}>
                Already have an account?{' '}
                <Link
                  href="/auth/login"
                  sx={{
                    color: '#1a73e8',
                    textDecoration: 'none',
                    '&:hover': {
                      textDecoration: 'underline'
                    }
                  }}
                >
                  Sign in
                </Link>
              </Typography>
            </Box>
          </Stack>
        </Paper>
      </Container>
    </Box>
  )
}