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
  AdminPanelSettings as AdminIcon,
  Person,
  Menu as MenuIcon,
  Add as AddIcon,
  Feedback as FeedbackIcon,
  ChevronLeft as ChevronLeftIcon,
  MenuBook as GuideIcon
} from '@mui/icons-material'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import AddStayModalEnhanced from '@/components/stays/AddStayModalEnhanced'
import { countries } from '@/lib/data/countries-and-airports'

const drawerWidth = 280
const collapsedDrawerWidth = 72

export default function NavigationSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [userEmail, setUserEmail] = useState<string>('')
  const pathname = usePathname()
  const router = useRouter()
  const theme = useTheme()
  const supabase = createClient()

  useEffect(() => {
    loadUser()
    // Load collapsed state from localStorage
    const savedCollapsed = localStorage.getItem('sidebar-collapsed')
    if (savedCollapsed === 'true') {
      setIsCollapsed(true)
    }
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

  const handleCollapseToggle = () => {
    const newState = !isCollapsed
    setIsCollapsed(newState)
    localStorage.setItem('sidebar-collapsed', newState.toString())
  }

  const handleModalOpen = () => setModalOpen(true)
  const handleModalClose = () => setModalOpen(false)

  const handleStayAdded = () => {
    // Reload the page to refresh data
    router.refresh()
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
      text: 'Travel Guide', 
      icon: <GuideIcon />, 
      path: '/guide',
      visible: true
    },
    { 
      text: 'Admin', 
      icon: <AdminIcon />, 
      path: '/admin',
      visible: isAdminUser
    },
    { 
      text: 'Debug Stays', 
      icon: <FeedbackIcon />, 
      path: '/debug-stays',
      visible: isAdminUser
    }
  ]

  const drawer = (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Logo/Title Section */}
      <Box sx={{ 
        p: isCollapsed ? 2 : 3,
        borderBottom: `1px solid ${theme.palette.divider}`,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: isCollapsed ? 'center' : 'space-between'
      }}>
        {!isCollapsed && (
          <Box>
            <Typography 
              variant="h5" 
              sx={{ 
                fontWeight: 'bold',
                color: 'white',
                letterSpacing: '0.5px'
              }}
            >
              🦕 DINO
            </Typography>
            <Typography 
              variant="caption" 
              sx={{ 
                color: 'rgba(255,255,255,0.8)',
                display: 'block',
                mt: 0.5
              }}
            >
              Digital Nomad Visa Tracker
            </Typography>
          </Box>
        )}
        <IconButton
          onClick={handleCollapseToggle}
          sx={{ 
            color: 'white',
            bgcolor: 'rgba(255,255,255,0.1)',
            '&:hover': {
              bgcolor: 'rgba(255,255,255,0.2)'
            }
          }}
          size="small"
        >
          {isCollapsed ? <MenuIcon /> : <ChevronLeftIcon />}
        </IconButton>
      </Box>

      {/* Add Stay Button */}
      <Box sx={{ 
        px: 2, 
        pt: 2,
        display: 'flex',
        justifyContent: isCollapsed ? 'center' : 'stretch'
      }}>
        <Fab
          color="primary"
          onClick={handleModalOpen}
          sx={{
            width: isCollapsed ? 48 : '100%',
            height: isCollapsed ? 48 : 48,
            minWidth: isCollapsed ? 48 : 'auto',
            borderRadius: isCollapsed ? '50%' : 2,
            boxShadow: 2,
            transition: theme.transitions.create(['width', 'height', 'border-radius'], {
              duration: theme.transitions.duration.short,
            }),
            '&:hover': {
              boxShadow: 4
            }
          }}
        >
          <AddIcon sx={{ mr: isCollapsed ? 0 : 1 }} />
          {!isCollapsed && (
            <Typography sx={{ fontWeight: 500 }}>
              Add Stay
            </Typography>
          )}
        </Fab>
      </Box>

      {/* Navigation Items */}
      <List sx={{ px: isCollapsed ? 1 : 2, py: 2, flexGrow: 1 }}>
        {menuItems.filter(item => item.visible).map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              component={Link}
              href={item.path}
              selected={pathname === item.path}
              sx={{
                borderRadius: 2,
                justifyContent: isCollapsed ? 'center' : 'flex-start',
                px: isCollapsed ? 0 : 2,
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
              <ListItemIcon sx={{ 
                minWidth: isCollapsed ? 'auto' : 40,
                justifyContent: 'center'
              }}>
                {item.icon}
              </ListItemIcon>
              {!isCollapsed && (
                <ListItemText 
                  primary={item.text}
                  primaryTypographyProps={{
                    fontSize: '0.875rem',
                    fontWeight: pathname === item.path ? 600 : 400
                  }}
                />
              )}
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider sx={{ mx: 2 }} />

      {/* User Info Section */}
      {user && (
        <Box sx={{ p: 2 }}>
          {isCollapsed ? (
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Person sx={{ color: theme.palette.text.secondary }} />
            </Box>
          ) : (
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
          )}
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
          width: isCollapsed ? collapsedDrawerWidth : drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: isCollapsed ? collapsedDrawerWidth : drawerWidth,
            borderRight: `1px solid ${theme.palette.divider}`,
            position: 'relative',  // Changed from 'fixed' to 'relative'
            height: '100vh',
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          },
        }}
        open
      >
        {drawer}
      </Drawer>

      {/* Enhanced Add Stay Modal */}
      <AddStayModalEnhanced
        isOpen={modalOpen}
        onClose={handleModalClose}
        onAdded={handleStayAdded}
        countries={countries}
      />
    </>
  )
}