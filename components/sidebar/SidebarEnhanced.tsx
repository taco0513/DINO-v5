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
  Key,
  Menu as MenuIcon,
  Add as AddIcon
} from '@mui/icons-material'
import { Country } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import AddStayModalEnhanced from '@/components/stays/AddStayModalEnhanced'

interface SidebarProps {
  countries: Country[]
  selectedCountry: string
  onSelectCountry: (code: string) => void
  currentPage?: string
  onAddStay?: (stayData: any) => void
}

// Material Design 2 Navigation Drawer sizes
const drawerWidth = 240
const collapsedDrawerWidth = 72

export default function Sidebar({ countries, selectedCountry, onSelectCountry, currentPage, onAddStay }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const theme = useTheme()
  
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
  
  // Check if user is admin
  const isAdmin = user?.email === 'zbrianjin@gmail.com'
  
  // Material Design 2 Navigation menu structure
  const menuItems = [
    { href: '/', label: 'Dashboard', icon: DashboardIcon },
    { href: '/calendar', label: 'Calendar', icon: EventIcon },
    { href: '/guide', label: 'Travel Guide', icon: MapIcon },
  ]

  // Add admin menu for authorized users
  if (isAdmin) {
    menuItems.push({ href: '/admin', label: 'Admin', icon: AdminIcon })
  }

  const handleAuthToggle = async () => {
    if (user) {
      // Sign out
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push('/')
    } else {
      // Navigate to auth page
      router.push('/auth')
    }
  }

  const handleModalOpen = () => setModalOpen(true)
  const handleModalClose = () => setModalOpen(false)

  const handleStayAdded = () => {
    if (onAddStay) {
      onAddStay({}) // Call parent callback to refresh data
    }
  }

  return (
    <>
      <Drawer
        variant="permanent"
        sx={{
          width: isCollapsed ? collapsedDrawerWidth : drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: isCollapsed ? collapsedDrawerWidth : drawerWidth,
            boxSizing: 'border-box',
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.easeOut,
              duration: theme.transitions.duration.enteringScreen,
            }),
            backgroundColor: 'background.default',
            borderRight: 1,
            borderColor: 'divider',
          },
        }}
      >
        {/* Material Design 2 Header */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: isCollapsed ? 'center' : 'flex-start',
          p: 2,
          gap: 1
        }}>
          {/* App Logo/Title */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: isCollapsed ? 'center' : 'space-between',
            width: '100%',
            mb: 2
          }}>
            {!isCollapsed && (
              <Typography 
                variant="h6" 
                component="div" 
                sx={{ 
                  fontWeight: 500,
                  color: 'primary.main'
                }}
              >
                DINO
              </Typography>
            )}
            <IconButton
              onClick={() => setIsCollapsed(!isCollapsed)}
              size="small"
            >
              <MenuIcon />
            </IconButton>
          </Box>

          {/* Material Design 2 FAB */}
          <Fab
            size="medium"
            color="primary"
            onClick={handleModalOpen}
            sx={{
              alignSelf: 'center',
              mb: 2,
              width: isCollapsed ? 40 : 180,
              borderRadius: isCollapsed ? '50%' : 3,
              transition: theme.transitions.create(['width', 'border-radius'], {
                easing: theme.transitions.easing.easeOut,
                duration: theme.transitions.duration.enteringScreen,
              }),
            }}
          >
            <AddIcon sx={{ mr: isCollapsed ? 0 : 1 }} />
            {!isCollapsed && 'Add Stay'}
          </Fab>
        </Box>

        <Divider />

        {/* Navigation Menu */}
        <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
          <List>
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              
              return (
                <ListItem key={item.href} disablePadding>
                  <ListItemButton
                    component={Link}
                    href={item.href}
                    selected={isActive}
                    sx={{
                      minHeight: 48,
                      justifyContent: isCollapsed ? 'center' : 'flex-start',
                      px: isCollapsed ? 0 : 3,
                    }}
                  >
                    <ListItemIcon 
                      sx={{ 
                        minWidth: isCollapsed ? 'auto' : 56,
                        color: isActive ? 'primary.main' : 'text.secondary',
                        justifyContent: 'center'
                      }}
                    >
                      <Icon />
                    </ListItemIcon>
                    {!isCollapsed && (
                      <ListItemText 
                        primary={item.label}
                        sx={{
                          '& .MuiListItemText-primary': {
                            color: isActive ? 'primary.main' : 'text.primary',
                            fontWeight: isActive ? 500 : 400,
                          }
                        }}
                      />
                    )}
                  </ListItemButton>
                </ListItem>
              )
            })}
          </List>
        </Box>

        {/* Bottom Actions - Material Design 2 */}
        <Box sx={{ borderTop: 1, borderColor: 'divider' }}>
          <List>
            <ListItem disablePadding>
              <ListItemButton
                onClick={handleAuthToggle}
                sx={{
                  minHeight: 48,
                  justifyContent: isCollapsed ? 'center' : 'flex-start',
                  px: isCollapsed ? 0 : 3,
                }}
              >
                <ListItemIcon 
                  sx={{ 
                    minWidth: isCollapsed ? 'auto' : 56,
                    color: 'text.secondary',
                    justifyContent: 'center'
                  }}
                >
                  {user ? <Person /> : <Key />}
                </ListItemIcon>
                {!isCollapsed && (
                  <ListItemText 
                    primary={user ? 'Sign out' : 'Sign in'}
                  />
                )}
              </ListItemButton>
            </ListItem>
            
            <ListItem disablePadding>
              <ListItemButton
                component={Link}
                href="/settings"
                sx={{
                  minHeight: 48,
                  justifyContent: isCollapsed ? 'center' : 'flex-start',
                  px: isCollapsed ? 0 : 3,
                }}
              >
                <ListItemIcon 
                  sx={{ 
                    minWidth: isCollapsed ? 'auto' : 56,
                    color: 'text.secondary',
                    justifyContent: 'center'
                  }}
                >
                  <SettingsIcon />
                </ListItemIcon>
                {!isCollapsed && (
                  <ListItemText 
                    primary="Settings"
                  />
                )}
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
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