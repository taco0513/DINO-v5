'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
  Typography,
  Box
} from '@mui/material'
import {
  Person as PersonIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  AccountCircle as AccountIcon
} from '@mui/icons-material'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'

export default function UserMenu() {
  const router = useRouter()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
  const open = Boolean(anchorEl)

  useEffect(() => {
    const supabase = createClient()
    
    // Get initial user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = async () => {
    setLoading(true)
    handleClose()
    
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push('/auth/login')
    } catch (error) {
      console.error('Error signing out:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSettings = () => {
    handleClose()
    router.push('/settings')
  }

  const handleProfile = () => {
    handleClose()
    router.push('/profile')
  }

  // Get user display info
  const getUserInitial = () => {
    if (user?.email) {
      return user.email[0].toUpperCase()
    }
    return 'U'
  }

  const getUserName = () => {
    if (user?.user_metadata?.name) {
      return user.user_metadata.name
    }
    return user?.email || 'User'
  }

  if (!user) {
    return (
      <IconButton
        onClick={() => router.push('/auth/login')}
        sx={{ color: '#5f6368' }}
      >
        <AccountIcon />
      </IconButton>
    )
  }

  return (
    <>
      <Avatar
        onClick={handleClick}
        sx={{
          width: 32,
          height: 32,
          backgroundColor: '#1a73e8',
          fontSize: '14px',
          cursor: 'pointer',
          '&:hover': {
            backgroundColor: '#1557b0'
          }
        }}
      >
        {getUserInitial()}
      </Avatar>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
            minWidth: 250,
            border: '1px solid #e8eaed',
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
              border: '1px solid #e8eaed',
              borderBottom: 'none',
              borderRight: 'none',
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {/* User Info Header */}
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="body2" sx={{ fontWeight: 500, color: '#202124' }}>
            {getUserName()}
          </Typography>
          <Typography variant="caption" sx={{ color: '#5f6368' }}>
            {user.email}
          </Typography>
        </Box>

        <Divider />

        {/* Menu Items */}
        <MenuItem onClick={handleProfile}>
          <ListItemIcon>
            <PersonIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Profile</ListItemText>
        </MenuItem>

        <MenuItem onClick={handleSettings}>
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Settings</ListItemText>
        </MenuItem>

        <Divider />

        <MenuItem onClick={handleLogout} disabled={loading}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Sign out</ListItemText>
        </MenuItem>
      </Menu>
    </>
  )
}