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
  Fab,
  Modal,
  TextField,
  Button,
  Grid,
  MenuItem
} from '@mui/material'
import {
  Dashboard as DashboardIcon,
  Event as EventIcon,
  Settings as SettingsIcon,
  Person,
  Key,
  Menu as MenuIcon,
  Add as AddIcon,
  Map as MapIcon
} from '@mui/icons-material'
import { Country, Stay } from '@/lib/types'
import { addStayToStorage } from '@/lib/storage/stays-storage'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import { getAvailableVisaTypes } from '@/lib/visa-rules/visa-types'
import { getCurrentUserEmail } from '@/lib/context/user'
import AddStayModalEnhanced from '@/components/stays/AddStayModalEnhanced'

interface SidebarProps {
  countries: Country[]
  selectedCountry: string
  onSelectCountry: (code: string) => void
  currentPage?: string
  onAddStay?: (stayData: Partial<Stay>) => void
}

// Material Design 2 Navigation Drawer 크기
const drawerWidth = 240
const collapsedDrawerWidth = 72

export default function Sidebar({ countries, selectedCountry, onSelectCountry, currentPage, onAddStay }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const router = useRouter()
  // Default to US nationality - will be moved to user context in next iteration
  const [nationality] = useState('US')
  const [userEmail] = useState(getCurrentUserEmail())
  const [formData, setFormData] = useState<{
    countryCode: string
    fromCountry: string
    entryDate: string
    exitDate: string
    entryCity: string
    exitCity: string
    visaType: Stay['visaType'] | ''
    notes: string
  }>({
    countryCode: '', // No default country selection
    fromCountry: '',
    entryDate: '',
    exitDate: '',
    entryCity: '',
    exitCity: '',
    visaType: '',
    notes: ''
  })
  const pathname = usePathname()
  const theme = useTheme()
  
  // Get available visa types for selected country
  const availableVisaTypes = formData.countryCode ? getAvailableVisaTypes(formData.countryCode, nationality, userEmail) : []
  
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
  
  // Material Design 2 Navigation 메뉴 구조
  const menuItems = [
    { href: '/', label: 'Dashboard', icon: DashboardIcon },
    { href: '/calendar', label: 'Calendar', icon: EventIcon },
    { href: '/guide', label: 'Travel Guide', icon: MapIcon },
  ]

  const handleAuthToggle = async () => {
    if (user) {
      // Sign out
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push('/auth/login')
    } else {
      // Navigate to login
      router.push('/auth/login')
    }
  }

  const handleModalOpen = () => {
    setModalOpen(true)
  }

  const handleModalClose = () => {
    setModalOpen(false)
    setFormData({
      countryCode: '', // No default country selection
      fromCountry: '',
      entryDate: '',
      exitDate: '',
      entryCity: '',
      exitCity: '',
      visaType: '',
      notes: ''
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.entryDate) {
      alert('Please fill in the entry date')
      return
    }
    
    // Only validate exit date if provided
    if (formData.exitDate && new Date(formData.exitDate) < new Date(formData.entryDate)) {
      alert('Exit date must be after entry date')
      return
    }
    
    // Add stay to localStorage
    const newStay = addStayToStorage({
      countryCode: formData.countryCode,
      entryDate: formData.entryDate,
      exitDate: formData.exitDate || undefined,
      entryCity: formData.entryCity || undefined,
      exitCity: formData.exitCity || undefined,
      visaType: formData.visaType as Stay['visaType'],
      notes: formData.notes
    })
    
    if (onAddStay) {
      onAddStay({
        countryCode: formData.countryCode,
        fromCountry: formData.fromCountry || undefined,
        entryDate: formData.entryDate,
        exitDate: formData.exitDate || undefined,
        entryCity: formData.entryCity || undefined,
        exitCity: formData.exitCity || undefined,
        visaType: (formData.visaType || undefined) as Stay['visaType'],
        notes: formData.notes || undefined
      })
    }
    handleModalClose()
    alert('Stay added successfully!')
  }

  return (
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
            alignSelf: isCollapsed ? 'center' : 'flex-start',
            mb: 1,
            '&:hover': {
              transform: 'scale(1.05)'
            }
          }}
        >
          <AddIcon />
        </Fab>
      </Box>

      {/* Navigation Menu - Material Design 2 */}
      <Box sx={{ flexGrow: 1, px: isCollapsed ? 0 : 0 }}>
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

      {/* Enhanced Add Stay Modal */}
      <AddStayModalEnhanced
        isOpen={modalOpen}
        onClose={handleModalClose}
        onAdded={() => {
          if (onAddStay) {
            onAddStay({
              countryCode: formData.countryCode,
              fromCountry: formData.fromCountry || undefined,
              entryDate: formData.entryDate,
              exitDate: formData.exitDate || undefined,
              entryCity: formData.entryCity || undefined,
              exitCity: formData.exitCity || undefined,
              visaType: (formData.visaType || undefined) as Stay['visaType'],
              notes: formData.notes || undefined
            })
          }
        }}
        countries={countries}
      />
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 480,
            maxWidth: '90vw',
            backgroundColor: 'white',
            borderRadius: 3,
            boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
            p: 0,
            outline: 'none'
          }}
        >
          {/* Modal Header */}
          <Box sx={{ 
            px: 3, 
            py: 2.5, 
            borderBottom: '1px solid #e8eaed' 
          }}>
            <Typography 
              variant="h6" 
              sx={{
                color: '#202124',
                fontFamily: 'Google Sans, Roboto, sans-serif',
                fontWeight: 500,
                fontSize: '1.125rem'
              }}
            >
              Add new travel record
            </Typography>
          </Box>

          {/* Modal Content */}
          <Box sx={{ p: 3 }}>
            <Box component="form" onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    select
                    label="From Country"
                    value={formData.fromCountry}
                    onChange={(e) => setFormData({ ...formData, fromCountry: e.target.value })}
                    fullWidth
                    size="small"
                    helperText="Where did you travel from?"
                  >
                    <MenuItem value="">
                      <em>Select origin country</em>
                    </MenuItem>
                    {countries.map(country => (
                      <MenuItem key={country.code} value={country.code}>
                        {country.flag} {country.name}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    label="Departure Airport/City"
                    value={formData.exitCity}
                    onChange={(e) => setFormData({ ...formData, exitCity: e.target.value.toUpperCase() })}
                    placeholder="e.g., ICN, BKK"
                    fullWidth
                    size="small"
                    inputProps={{ maxLength: 5 }}
                    helperText="Where you departed"
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    select
                    label="To Country"
                    value={formData.countryCode}
                    onChange={(e) => {
                      const newCountry = e.target.value
                      const visaTypes = getAvailableVisaTypes(newCountry, nationality, userEmail)
                      setFormData({ 
                        ...formData, 
                        countryCode: newCountry,
                        visaType: visaTypes.length > 0 ? (visaTypes[0].value as Stay['visaType']) : ''
                      })
                    }}
                    required
                    fullWidth
                    size="small"
                    helperText="Where did you travel to?"
                  >
                    <MenuItem value="">
                      <em>Select destination country</em>
                    </MenuItem>
                    {countries.map(country => (
                      <MenuItem key={country.code} value={country.code}>
                        {country.flag} {country.name}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    label="Arrival Airport/City"
                    value={formData.entryCity}
                    onChange={(e) => setFormData({ ...formData, entryCity: e.target.value.toUpperCase() })}
                    placeholder="e.g., ICN, BKK"
                    fullWidth
                    size="small"
                    inputProps={{ maxLength: 5 }}
                    helperText="Where you arrived"
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    select
                    label="Visa Type"
                    value={formData.visaType}
                    onChange={(e) => setFormData({ ...formData, visaType: e.target.value as Stay['visaType'] | '' })}
                    fullWidth
                    size="small"
                    helperText={availableVisaTypes.find(v => v.value === formData.visaType)?.duration || ''}
                  >
                    {availableVisaTypes.map(visaType => (
                      <MenuItem key={visaType.value} value={visaType.value}>
                        {visaType.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    label="Entry Date"
                    type="date"
                    value={formData.entryDate}
                    onChange={(e) => setFormData({ ...formData, entryDate: e.target.value })}
                    required
                    fullWidth
                    size="small"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    label="Exit Date (Optional)"
                    type="date"
                    value={formData.exitDate}
                    onChange={(e) => setFormData({ ...formData, exitDate: e.target.value })}
                    fullWidth
                    helperText="Leave empty if still in country"
                    size="small"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>


                <Grid size={{ xs: 12 }}>
                  <TextField
                    label="Notes (Optional)"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    multiline
                    rows={2}
                    fullWidth
                    size="small"
                    placeholder="Add any additional notes..."
                  />
                </Grid>
              </Grid>

              {/* Modal Actions */}
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'flex-end', 
                gap: 1, 
                mt: 3,
                pt: 2,
                borderTop: '1px solid #e8eaed'
              }}>
                <Button
                  onClick={handleModalClose}
                  sx={{
                    color: '#5f6368',
                    textTransform: 'none',
                    fontWeight: 500,
                    px: 2
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  sx={{
                    backgroundColor: '#1a73e8',
                    textTransform: 'none',
                    fontWeight: 500,
                    px: 3,
                    borderRadius: 2,
                    '&:hover': {
                      backgroundColor: '#1557b0'
                    }
                  }}
                >
                  Add Record
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>
    </Drawer>
  )
}