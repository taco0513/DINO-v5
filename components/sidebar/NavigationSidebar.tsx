'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { 
  Drawer,
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Typography,
  Divider,
  useTheme,
  Fab
} from '@mui/material'
import {
  Dashboard as DashboardIcon,
  Event as EventIcon,
  Map as MapIcon,
  Settings as SettingsIcon,
  AdminPanelSettings as AdminIcon,
  Person,
  Menu as MenuIcon,
  Add as AddIcon,
  Feedback as FeedbackIcon
} from '@mui/icons-material'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'

const drawerWidth = 280

export default function NavigationSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [userEmail, setUserEmail] = useState<string>('')
  const pathname = usePathname()
  const router = useRouter()
  const theme = useTheme()
  const supabase = createClient()

  useEffect(() => {
    loadUser()
  }, [])

  const loadUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      setUser(user)
      setUserEmail(user.email || '')
    }
  }

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const isAdminUser = userEmail === 'zbrianjin@gmail.com'

  const menuItems = [
    { 
      text: 'Dashboard', 
      icon: <DashboardIcon />, 
      path: '/',
      visible: true
    },
    { 
      text: 'Calendar', 
      icon: <EventIcon />, 
      path: '/calendar',
      visible: true
    },
    { 
      text: 'Profile', 
      icon: <Person />, 
      path: '/profile',
      visible: true
    },
    { 
      text: 'Settings', 
      icon: <SettingsIcon />, 
      path: '/settings',
      visible: true
    },
    { 
      text: 'Admin', 
      icon: <AdminIcon />, 
      path: '/admin',
      visible: isAdminUser
    },
    { 
      text: 'Test Feedback', 
      icon: <FeedbackIcon />, 
      path: '/test-feedback',
      visible: isAdminUser
    }
  ]

  const drawer = (
    <Box>
      {/* Logo/Title Section */}
      <Box sx={{ 
        p: 3, 
        borderBottom: `1px solid ${theme.palette.divider}`,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <Typography 
          variant="h5" 
          sx={{ 
            fontWeight: 'bold',
            color: 'white',
            textAlign: 'center',
            letterSpacing: '0.5px'
          }}
        >
          🦕 DINO
        </Typography>
        <Typography 
          variant="caption" 
          sx={{ 
            color: 'rgba(255,255,255,0.8)',
            textAlign: 'center',
            display: 'block',
            mt: 0.5
          }}
        >
          Digital Nomad Visa Tracker
        </Typography>
      </Box>

      {/* Navigation Items */}
      <List sx={{ px: 2, py: 2 }}>
        {menuItems.filter(item => item.visible).map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              component={Link}
              href={item.path}
              selected={pathname === item.path}
              sx={{
                borderRadius: 2,
                '&.Mui-selected': {
                  backgroundColor: theme.palette.primary.main + '15',
                  '&:hover': {
                    backgroundColor: theme.palette.primary.main + '25',
                  },
                  '& .MuiListItemIcon-root': {
                    color: theme.palette.primary.main,
                  },
                  '& .MuiListItemText-primary': {
                    color: theme.palette.primary.main,
                    fontWeight: 600,
                  }
                },
                '&:hover': {
                  backgroundColor: theme.palette.action.hover,
                }
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text}
                primaryTypographyProps={{
                  fontSize: '0.875rem',
                  fontWeight: pathname === item.path ? 600 : 400
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider sx={{ mx: 2 }} />

      {/* User Info Section */}
      {user && (
        <Box sx={{ p: 2, mt: 'auto' }}>
          <Box sx={{ 
            p: 2, 
            bgcolor: theme.palette.grey[100],
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            <Person sx={{ color: theme.palette.text.secondary }} />
            <Box sx={{ overflow: 'hidden' }}>
              <Typography 
                variant="caption" 
                sx={{ 
                  display: 'block',
                  color: theme.palette.text.secondary
                }}
              >
                Logged in as
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  fontWeight: 500,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {user.email}
              </Typography>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  )

  return (
    <>
      {/* Mobile menu button */}
      <IconButton
        aria-label="open drawer"
        edge="start"
        onClick={handleDrawerToggle}
        sx={{ 
          display: { lg: 'none' },
          position: 'fixed',
          top: 16,
          left: 16,
          zIndex: theme.zIndex.drawer + 2,
          bgcolor: 'background.paper',
          boxShadow: 2
        }}
      >
        <MenuIcon />
      </IconButton>

      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', lg: 'none' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: drawerWidth,
            borderRight: `1px solid ${theme.palette.divider}`
          },
        }}
      >
        {drawer}
      </Drawer>

      {/* Desktop drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', lg: 'block' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: drawerWidth,
            borderRight: `1px solid ${theme.palette.divider}`,
            position: 'fixed',
            height: '100vh',
            overflowY: 'auto'
          },
        }}
        open
      >
        {drawer}
      </Drawer>
    </>
  )
}