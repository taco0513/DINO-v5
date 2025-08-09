'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Box, 
  Typography, 
  Tab, 
  Tabs,
  Card,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress,
  useTheme,
  Tooltip,
  Stack
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Upload as UploadIcon,
  Download as DownloadIcon,
  History as HistoryIcon,
  Security as SecurityIcon
} from '@mui/icons-material'
import { countries } from '@/lib/data/countries-and-airports'
import { visaService } from '@/lib/services/visa-service'
import { VisaInformation, VisaType, VisaData, CreateVisaRequest } from '@/lib/types/visa'
import { createClient } from '@/lib/supabase/client'
import { logger } from '@/lib/utils/logger'
import Sidebar from '@/components/sidebar/SidebarEnhanced'
import VisaFormEditor from '@/components/admin/VisaFormEditor'
// Removed deprecated style imports

// Admin emails allowed to access this page
const ADMIN_EMAILS = ['zbrianjin@gmail.com']

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  )
}

export default function AdminPage() {
  const theme = useTheme()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [userEmail, setUserEmail] = useState<string>('')
  const [tabValue, setTabValue] = useState(0)
  
  // Visa data states
  const [visaData, setVisaData] = useState<VisaInformation[]>([])
  const [selectedCountry, setSelectedCountry] = useState<string>('')
  const [editDialog, setEditDialog] = useState(false)
  const [editingVisa, setEditingVisa] = useState<VisaInformation | null>(null)
  const [deleteDialog, setDeleteDialog] = useState(false)
  const [deletingVisa, setDeletingVisa] = useState<VisaInformation | null>(null)
  
  // Form states
  const [formData, setFormData] = useState<Partial<CreateVisaRequest>>({
    countryCode: '',
    visaType: 'tourist' as VisaType,
    data: {},
    source: 'official',
    updatedBy: ''
  })

  // Check admin access
  useEffect(() => {
    checkAdminAccess()
  }, [])

  // Load visa data
  useEffect(() => {
    if (isAdmin) {
      loadVisaData()
    }
  }, [isAdmin, selectedCountry])

  const checkAdminAccess = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user || !user.email) {
        router.push('/auth')
        return
      }

      const isAdminUser = ADMIN_EMAILS.includes(user.email)
      setIsAdmin(isAdminUser)
      setUserEmail(user.email)
      setFormData(prev => ({ ...prev, updatedBy: user.email }))

      if (!isAdminUser) {
        router.push('/')
      }
    } catch (error) {
      logger.error('Error checking admin access:', error)
      router.push('/')
    } finally {
      setLoading(false)
    }
  }

  const loadVisaData = async () => {
    try {
      setLoading(true)
      
      if (selectedCountry) {
        const response = await visaService.getCountryVisaInfo(selectedCountry)
        if (response.data) {
          setVisaData(response.data)
        }
      } else {
        // Load all visa data
        const allData: VisaInformation[] = []
        for (const country of countries.slice(0, 10)) { // Limit to first 10 for now
          const response = await visaService.getCountryVisaInfo(country.code)
          if (response.data) {
            allData.push(...response.data)
          }
        }
        setVisaData(allData)
      }
    } catch (error) {
      logger.error('Error loading visa data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (visa: VisaInformation) => {
    setEditingVisa(visa)
    setFormData({
      countryCode: visa.countryCode,
      visaType: visa.visaType,
      data: visa.data,
      source: visa.source,
      updatedBy: userEmail
    })
    setEditDialog(true)
  }

  const handleDelete = (visa: VisaInformation) => {
    setDeletingVisa(visa)
    setDeleteDialog(true)
  }

  const handleSave = async () => {
    try {
      if (!formData.countryCode || !formData.visaType || !formData.data) {
        alert('Please fill all required fields')
        return
      }

      const response = await visaService.upsertVisaInfo(formData as CreateVisaRequest)
      
      if (response.error) {
        alert(`Error: ${response.error}`)
        return
      }

      // Reload data
      await loadVisaData()
      
      // Close dialog
      setEditDialog(false)
      setEditingVisa(null)
      
      // Show success message
      alert('Visa information saved successfully!')
    } catch (error) {
      logger.error('Error saving visa data:', error)
      alert('Failed to save visa information')
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deletingVisa) return

    try {
      const success = await visaService.deleteVisaInfo(
        deletingVisa.countryCode,
        deletingVisa.visaType,
        userEmail
      )

      if (success) {
        // Reload data
        await loadVisaData()
        alert('Visa information deleted successfully!')
      } else {
        alert('Failed to delete visa information')
      }
    } catch (error) {
      logger.error('Error deleting visa data:', error)
      alert('Failed to delete visa information')
    } finally {
      setDeleteDialog(false)
      setDeletingVisa(null)
    }
  }

  const getVisaTypeColor = (type: VisaType) => {
    switch (type) {
      case 'tourist': return '#1a73e8'
      case 'digital_nomad': return '#34a853'
      case 'business': return '#fbbc04'
      case 'student': return '#ea4335'
      case 'alerts': return '#ff6d00'
      default: return '#5f6368'
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (!isAdmin) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Alert severity="error">
          You do not have permission to access this page.
        </Alert>
      </Box>
    )
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: theme.palette.background.default }}>
      <Sidebar 
        countries={countries}
        selectedCountry={selectedCountry}
        onSelectCountry={setSelectedCountry}
        currentPage="admin"
        onAddStay={() => {}}
      />
      
      <Box component="main" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', backgroundColor: theme.palette.background.default }}>
        <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
          <Box sx={{ p: 3 }}>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <SecurityIcon sx={{ color: theme.palette.primary.main, fontSize: 32 }} />
                <Typography 
                  sx={{
                    fontSize: '2rem',
                    fontWeight: 600,
                    color: theme.palette.text.primary
                  }}
                >
                  Admin Dashboard
                </Typography>
              </Box>
              <Typography sx={{ fontSize: '1rem', color: theme.palette.text.secondary }}>
                Manage visa information and system settings • Logged in as: {userEmail}
              </Typography>
            </Box>

            {/* Tabs */}
            <Card sx={{ p: 2, borderRadius: 2 }}>
              <Tabs 
                value={tabValue} 
                onChange={(e, v) => setTabValue(v)}
                sx={{ 
                  borderBottom: `1px solid ${theme.palette.divider}`,
                  px: 2,
                  '& .MuiTab-root': {
                    fontSize: '0.875rem',
                    textTransform: 'uppercase',
                    color: theme.palette.text.secondary,
                    minHeight: 48,
                    transition: theme.transitions.create(['color', 'background-color']),
                    '&:hover': {
                      backgroundColor: theme.palette.action.hover,
                    },
                    '&.Mui-selected': {
                      color: theme.palette.primary.main
                    }
                  },
                  '& .MuiTabs-indicator': {
                    backgroundColor: theme.palette.primary.main,
                    height: 3
                  }
                }}
              >
                <Tab label="Visa Information" />
                <Tab label="Update History" />
                <Tab label="Import/Export" />
              </Tabs>

              {/* Visa Information Tab */}
              <TabPanel value={tabValue} index={0}>
                <Box sx={{ px: 3 }}>
                  {/* Actions Bar */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <FormControl size="small" sx={{ minWidth: 200 }}>
                      <InputLabel>Filter by Country</InputLabel>
                      <Select
                        value={selectedCountry}
                        onChange={(e) => setSelectedCountry(e.target.value)}
                        label="Filter by Country"
                      >
                        <MenuItem value="">All Countries</MenuItem>
                        {countries.map(country => (
                          <MenuItem key={country.code} value={country.code}>
                            {country.flag} {country.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => {
                        setEditingVisa(null)
                        setFormData({
                          countryCode: '',
                          visaType: 'tourist' as VisaType,
                          data: {},
                          source: 'official',
                          updatedBy: userEmail
                        })
                        setEditDialog(true)
                      }}
                      sx={{ textTransform: 'none', fontWeight: 500 }}
                    >
                      Add Visa Info
                    </Button>
                  </Box>

                  {/* Data Table */}
                  <TableContainer sx={{ 
                    elevation: 1,
                    borderRadius: 2
                  }}>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ backgroundColor: theme.palette.grey[50] }}>
                          <TableCell sx={{ fontWeight: 500, fontSize: '0.75rem' }}>Country</TableCell>
                          <TableCell sx={{ fontWeight: 500, fontSize: '0.75rem' }}>Type</TableCell>
                          <TableCell sx={{ fontWeight: 500, fontSize: '0.75rem' }}>Status</TableCell>
                          <TableCell sx={{ fontWeight: 500, fontSize: '0.75rem' }}>Source</TableCell>
                          <TableCell sx={{ fontWeight: 500, fontSize: '0.75rem' }}>Last Updated</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 500, fontSize: '0.75rem' }}>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {loading ? (
                          <TableRow>
                            <TableCell colSpan={6} align="center">
                              <CircularProgress size={24} />
                            </TableCell>
                          </TableRow>
                        ) : visaData.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} align="center">
                              <Typography sx={{ color: theme.palette.text.secondary }}>
                                No visa information found
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ) : (
                          visaData.map((visa) => {
                            const country = countries.find(c => c.code === visa.countryCode)
                            return (
                              <TableRow 
                                key={`${visa.countryCode}-${visa.visaType}`}
                                sx={{
                                  transition: theme.transitions.create('background-color'),
                                  '&:hover': {
                                    backgroundColor: theme.palette.action.hover
                                  }
                                }}
                              >
                                <TableCell>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography>{country?.flag}</Typography>
                                    <Typography>{country?.name || visa.countryCode}</Typography>
                                  </Box>
                                </TableCell>
                                <TableCell>
                                  <Chip 
                                    label={visa.visaType.replace('_', ' ')}
                                    size="small"
                                    sx={{
                                      fontWeight: 500,
                                      backgroundColor: getVisaTypeColor(visa.visaType),
                                      color: '#ffffff',
                                      height: 28
                                    }}
                                  />
                                </TableCell>
                                <TableCell>
                                  {visa.isVerified ? (
                                    <Chip 
                                      icon={<CheckIcon sx={{ fontSize: 16 }} />}
                                      label="Verified"
                                      size="small"
                                      sx={{
                                        backgroundColor: '#e6f4ea',
                                        color: '#137333'
                                      }}
                                    />
                                  ) : (
                                    <Chip 
                                      label="Unverified"
                                      size="small"
                                      sx={{
                                        backgroundColor: '#fef7e0',
                                        color: '#ea8600'
                                      }}
                                    />
                                  )}
                                </TableCell>
                                <TableCell>{visa.source}</TableCell>
                                <TableCell>
                                  {new Date(visa.lastUpdated).toLocaleDateString()}
                                </TableCell>
                                <TableCell align="right">
                                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                                    <Tooltip title="View">
                                      <IconButton size="small">
                                        <ViewIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Edit">
                                      <IconButton 
                                        size="small"
                                        onClick={() => handleEdit(visa)}
                                      >
                                        <EditIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Delete">
                                      <IconButton 
                                        size="small"
                                        onClick={() => handleDelete(visa)}
                                      >
                                        <DeleteIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                  </Stack>
                                </TableCell>
                              </TableRow>
                            )
                          })
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              </TabPanel>

              {/* Update History Tab */}
              <TabPanel value={tabValue} index={1}>
                <Box sx={{ px: 3 }}>
                  <Alert severity="info">
                    Update history tracking will be implemented soon.
                  </Alert>
                </Box>
              </TabPanel>

              {/* Import/Export Tab */}
              <TabPanel value={tabValue} index={2}>
                <Box sx={{ px: 3 }}>
                  <Stack spacing={3}>
                    <Box>
                      <Typography variant="h6" sx={{ mb: 2 }}>
                        Export Data
                      </Typography>
                      <Button
                        variant="outlined"
                        startIcon={<DownloadIcon />}
                        onClick={async () => {
                          try {
                            // Load all visa data for export
                            const exportData: VisaInformation[] = []
                            for (const country of countries) {
                              const response = await visaService.getCountryVisaInfo(country.code)
                              if (response.data) {
                                exportData.push(...response.data)
                              }
                            }
                            
                            // Create JSON blob and download
                            const jsonData = JSON.stringify(exportData, null, 2)
                            const blob = new Blob([jsonData], { type: 'application/json' })
                            const url = URL.createObjectURL(blob)
                            const link = document.createElement('a')
                            link.href = url
                            link.download = `visa_data_export_${new Date().toISOString().split('T')[0]}.json`
                            document.body.appendChild(link)
                            link.click()
                            document.body.removeChild(link)
                            URL.revokeObjectURL(url)
                            
                            alert(`Exported ${exportData.length} visa records`)
                          } catch (error) {
                            logger.error('Export error:', error)
                            alert('Failed to export visa data')
                          }
                        }}
                        sx={{ textTransform: 'none', fontWeight: 500 }}
                      >
                        Export All Visa Data (JSON)
                      </Button>
                    </Box>
                    
                    <Box>
                      <Typography variant="h6" sx={{ mb: 2 }}>
                        Import Data
                      </Typography>
                      <input
                        type="file"
                        accept=".json"
                        style={{ display: 'none' }}
                        id="import-file-input"
                        onChange={async (e) => {
                          const file = e.target.files?.[0]
                          if (!file) return
                          
                          try {
                            const text = await file.text()
                            const data = JSON.parse(text) as VisaInformation[]
                            
                            if (!Array.isArray(data)) {
                              alert('Invalid file format. Expected array of visa records.')
                              return
                            }
                            
                            let successCount = 0
                            let errorCount = 0
                            
                            for (const visa of data) {
                              try {
                                const request: CreateVisaRequest = {
                                  countryCode: visa.countryCode,
                                  visaType: visa.visaType,
                                  data: visa.data,
                                  source: visa.source || 'official',
                                  updatedBy: userEmail
                                }
                                
                                const response = await visaService.upsertVisaInfo(request)
                                if (response.data) {
                                  successCount++
                                } else {
                                  errorCount++
                                }
                              } catch (error) {
                                errorCount++
                                logger.error('Import record error:', error)
                              }
                            }
                            
                            await loadVisaData()
                            alert(`Import complete! Success: ${successCount}, Failed: ${errorCount}`)
                          } catch (error) {
                            logger.error('Import error:', error)
                            alert('Failed to import visa data. Please check file format.')
                          }
                          
                          // Reset file input
                          e.target.value = ''
                        }}
                      />
                      <label htmlFor="import-file-input">
                        <Button
                          component="span"
                          variant="outlined"
                          startIcon={<UploadIcon />}
                          sx={{ textTransform: 'none', fontWeight: 500 }}
                        >
                          Import Visa Data (JSON)
                        </Button>
                      </label>
                    </Box>

                    <Alert severity="info">
                      Export creates a JSON backup of all visa data. Import will update or create visa records based on the uploaded file.
                    </Alert>
                  </Stack>
                </Box>
              </TabPanel>
            </Card>
          </Box>
        </Box>
      </Box>

      {/* Visa Form Editor */}
      <VisaFormEditor
        open={editDialog}
        onClose={() => {
          setEditDialog(false)
          setEditingVisa(null)
        }}
        onSave={async (data) => {
          const response = await visaService.upsertVisaInfo(data)
          if (response.error) {
            alert(`Error: ${response.error}`)
          } else {
            await loadVisaData()
            setEditDialog(false)
            setEditingVisa(null)
            alert('Visa information saved successfully!')
          }
        }}
        initialData={editingVisa}
        userEmail={userEmail}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete visa information for {deletingVisa?.countryCode} - {deletingVisa?.visaType}?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}