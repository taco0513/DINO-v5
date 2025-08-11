'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Box,
  Card,
  Typography,
  Button,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
  Badge,
  LinearProgress,
  Stack,
  Tooltip
} from '@mui/material'
import {
  Feedback as FeedbackIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  Notifications as NotificationsIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Schedule as ScheduleIcon,
  Flag as FlagIcon,
  Refresh as RefreshIcon,
  Visibility as ViewIcon,
  Check as CheckIcon,
  Close as CloseIcon
} from '@mui/icons-material'
import { createClient } from '@/lib/supabase/client'
import { UserReport, AdminNotification, FeedbackStats, ReportStatus, Priority } from '@/lib/types/feedback'
import { logger } from '@/lib/utils/logger'

// Helper component for TabPanel
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
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  )
}

export default function CommunityFeedbackDashboard() {
  const theme = useTheme()
  const router = useRouter()
  const supabase = createClient()
  
  // State management
  const [tabValue, setTabValue] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')
  
  // Data states
  const [reports, setReports] = useState<UserReport[]>([])
  const [notifications, setNotifications] = useState<AdminNotification[]>([])
  const [stats, setStats] = useState<FeedbackStats>({
    totalReports: 0,
    pendingReports: 0,
    verifiedReports: 0,
    topReportedCountries: [],
    recentActivity: []
  })
  
  // Dialog states
  const [selectedReport, setSelectedReport] = useState<UserReport | null>(null)
  const [viewDialog, setViewDialog] = useState(false)
  const [processDialog, setProcessDialog] = useState(false)
  const [adminNotes, setAdminNotes] = useState('')
  
  // User authentication
  const [userEmail, setUserEmail] = useState<string>('')
  const [isAdmin, setIsAdmin] = useState<boolean>(false)

  // Check admin access
  useEffect(() => {
    checkAdminAccess()
  }, [])

  // Load data when admin is verified
  useEffect(() => {
    if (isAdmin) {
      loadFeedbackData()
    }
  }, [isAdmin])

  const checkAdminAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/auth/login')
        return
      }
      
      setUserEmail(user.email || '')
      
      // Check if user is admin (for now, zbrianjin@gmail.com is admin)
      const adminEmails = ['zbrianjin@gmail.com']
      const isUserAdmin = adminEmails.includes(user.email || '')
      
      if (!isUserAdmin) {
        setError('You do not have admin access to this dashboard.')
        return
      }
      
      setIsAdmin(true)
    } catch (error) {
      logger.error('Error checking admin access:', error)
      setError('Failed to verify admin access')
    }
  }

  const loadFeedbackData = async () => {
    setLoading(true)
    try {
      await Promise.all([
        loadReports(),
        loadNotifications(),
        loadStats()
      ])
    } catch (error) {
      logger.error('Error loading feedback data:', error)
      setError('Failed to load feedback data')
    } finally {
      setLoading(false)
    }
  }

  const loadReports = async () => {
    try {
      const { data, error } = await supabase
        .from('user_reports')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)
      
      if (error) throw error
      
      const formattedReports: UserReport[] = data.map(report => ({
        id: report.id,
        reportType: report.report_type,
        countryCode: report.country_code,
        countryName: report.country_name,
        userExperience: report.user_experience,
        currentAppData: report.current_app_data,
        entryDate: report.entry_date ? new Date(report.entry_date) : undefined,
        exitDate: report.exit_date ? new Date(report.exit_date) : undefined,
        entryAirport: report.entry_airport,
        exitAirport: report.exit_airport,
        visaType: report.visa_type,
        additionalDetails: report.additional_details,
        evidenceUrls: report.evidence_urls || [],
        reportedBy: report.reported_by,
        userNationality: report.user_nationality,
        status: report.status,
        processedBy: report.processed_by,
        processedAt: report.processed_at ? new Date(report.processed_at) : undefined,
        adminNotes: report.admin_notes,
        verificationCount: report.verification_count || 1,
        confidenceScore: parseFloat(report.confidence_score) || 0.0,
        createdAt: new Date(report.created_at),
        updatedAt: new Date(report.updated_at)
      }))
      
      setReports(formattedReports)
    } catch (error) {
      logger.error('Error loading reports:', error)
      throw error
    }
  }

  const loadNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_notifications')
        .select('*')
        .eq('is_archived', false)
        .order('created_at', { ascending: false })
        .limit(20)
      
      if (error) throw error
      
      const formattedNotifications: AdminNotification[] = data.map(notif => ({
        id: notif.id,
        type: notif.type,
        title: notif.title,
        message: notif.message,
        priority: notif.priority,
        relatedReportId: notif.related_report_id,
        countryCode: notif.country_code,
        isRead: notif.is_read,
        isArchived: notif.is_archived,
        createdAt: new Date(notif.created_at),
        readAt: notif.read_at ? new Date(notif.read_at) : undefined,
        archivedAt: notif.archived_at ? new Date(notif.archived_at) : undefined
      }))
      
      setNotifications(formattedNotifications)
    } catch (error) {
      logger.error('Error loading notifications:', error)
      throw error
    }
  }

  const loadStats = async () => {
    try {
      // Get basic stats from reports
      const { data: reportStats, error: reportError } = await supabase
        .from('user_reports')
        .select('status, country_code, country_name')
      
      if (reportError) throw reportError
      
      const totalReports = reportStats.length
      const pendingReports = reportStats.filter(r => r.status === 'pending').length
      const verifiedReports = reportStats.filter(r => r.status === 'verified').length
      
      // Count reports by country
      const countryStats: { [key: string]: { name: string; count: number } } = {}
      reportStats.forEach(report => {
        if (!countryStats[report.country_code]) {
          countryStats[report.country_code] = {
            name: report.country_name,
            count: 0
          }
        }
        countryStats[report.country_code].count++
      })
      
      const topReportedCountries = Object.entries(countryStats)
        .map(([code, data]) => ({
          countryCode: code,
          countryName: data.name,
          reportCount: data.count,
          accuracyScore: Math.min(0.95, Math.max(0.5, data.count > 100 ? 0.85 : data.count / 100 * 0.8))
        }))
        .sort((a, b) => b.reportCount - a.reportCount)
        .slice(0, 5)
      
      setStats({
        totalReports,
        pendingReports,
        verifiedReports,
        topReportedCountries,
        recentActivity: [] // Activity tracking will be implemented with audit log system
      })
    } catch (error) {
      logger.error('Error loading stats:', error)
      throw error
    }
  }

  const handleProcessReport = async (reportId: string, action: 'verify' | 'reject' | 'investigate', notes?: string) => {
    try {
      const status: ReportStatus = action === 'verify' ? 'verified' : 
                                  action === 'reject' ? 'rejected' : 'investigating'
      
      const { error } = await supabase
        .from('user_reports')
        .update({
          status,
          processed_by: userEmail,
          processed_at: new Date().toISOString(),
          admin_notes: notes || adminNotes,
          updated_at: new Date().toISOString()
        })
        .eq('id', reportId)
      
      if (error) throw error
      
      // Reload data
      await loadFeedbackData()
      
      // Close dialogs
      setProcessDialog(false)
      setViewDialog(false)
      setSelectedReport(null)
      setAdminNotes('')
      
    } catch (error) {
      logger.error('Error processing report:', error)
      setError('Failed to process report')
    }
  }

  const handleMarkNotificationRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('admin_notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('id', notificationId)
      
      if (error) throw error
      
      await loadNotifications()
    } catch (error) {
      logger.error('Error marking notification as read:', error)
    }
  }

  const getStatusColor = (status: ReportStatus): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    switch (status) {
      case 'pending': return 'warning'
      case 'investigating': return 'info'
      case 'verified': return 'success'
      case 'applied': return 'primary'
      case 'rejected': return 'error'
      case 'duplicate': return 'default'
      default: return 'default'
    }
  }

  const getPriorityColor = (priority: Priority): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    switch (priority) {
      case 'low': return 'default'
      case 'medium': return 'info'
      case 'high': return 'warning'
      case 'urgent': return 'error'
      default: return 'default'
    }
  }

  if (!isAdmin && error) {
    return (
      <Box sx={{ p: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Alert severity="error" sx={{ maxWidth: 400 }}>
          <Typography variant="h6" gutterBottom>Access Denied</Typography>
          <Typography>{error}</Typography>
          <Button sx={{ mt: 2 }} onClick={() => router.push('/')} variant="contained">
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

  const unreadNotifications = notifications.filter(n => !n.isRead).length

  return (
    <Box component="main" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', backgroundColor: theme.palette.background.default }}>
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <FeedbackIcon sx={{ fontSize: 32, color: 'primary.main' }} />
            <Box>
              <Typography variant="h4" component="h1" fontWeight="bold">
                Community Feedback Dashboard
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                Manage visa information reports and user feedback • Logged in as: {userEmail}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Unread notifications">
              <IconButton>
                <Badge badgeContent={unreadNotifications} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={loadFeedbackData}
              sx={{ textTransform: 'none' }}
            >
              Refresh
            </Button>
          </Box>
        </Box>

        {/* Stats Overview */}
        <Box sx={{ 
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' },
          gap: 3,
          mb: 4
        }}>
          <Card sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="primary" fontWeight="bold">
              {stats.totalReports}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Reports
            </Typography>
          </Card>
          <Card sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="warning.main" fontWeight="bold">
              {stats.pendingReports}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Pending Review
            </Typography>
          </Card>
          <Card sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="success.main" fontWeight="bold">
              {stats.verifiedReports}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Verified Reports
            </Typography>
          </Card>
          <Card sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="info.main" fontWeight="bold">
              {stats.topReportedCountries.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Countries Reported
            </Typography>
          </Card>
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
                textTransform: 'none',
                color: theme.palette.text.secondary,
                minHeight: 48,
                '&.Mui-selected': {
                  color: theme.palette.primary.main
                }
              }
            }}
          >
            <Tab 
              label={
                <Badge badgeContent={stats.pendingReports} color="error" sx={{ '& .MuiBadge-badge': { fontSize: '0.6rem', minWidth: '16px', height: '16px' } }}>
                  Pending Reports
                </Badge>
              } 
            />
            <Tab label="All Reports" />
            <Tab 
              label={
                <Badge badgeContent={unreadNotifications} color="error" sx={{ '& .MuiBadge-badge': { fontSize: '0.6rem', minWidth: '16px', height: '16px' } }}>
                  Notifications
                </Badge>
              }
            />
            <Tab label="Analytics" />
          </Tabs>

          {/* Pending Reports Tab */}
          <TabPanel value={tabValue} index={0}>
            <Box sx={{ px: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Reports Pending Review ({stats.pendingReports})
              </Typography>
              
              <TableContainer sx={{ elevation: 1, borderRadius: 2 }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: theme.palette.grey[50] }}>
                      <TableCell sx={{ fontWeight: 500, fontSize: '0.75rem' }}>Country</TableCell>
                      <TableCell sx={{ fontWeight: 500, fontSize: '0.75rem' }}>Issue Type</TableCell>
                      <TableCell sx={{ fontWeight: 500, fontSize: '0.75rem' }}>User Experience</TableCell>
                      <TableCell sx={{ fontWeight: 500, fontSize: '0.75rem' }}>Reported</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 500, fontSize: '0.75rem' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {reports.filter(r => r.status === 'pending').map((report) => (
                      <TableRow key={report.id} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2" fontWeight="medium">
                              {report.countryName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {report.countryCode}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={report.reportType.replace('_', ' ')} 
                            size="small" 
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell sx={{ maxWidth: 300 }}>
                          <Typography variant="body2" noWrap>
                            {report.userExperience}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" color="text.secondary">
                            {report.createdAt.toLocaleDateString()}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedReport(report)
                              setViewDialog(true)
                            }}
                          >
                            <ViewIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => {
                              setSelectedReport(report)
                              setProcessDialog(true)
                            }}
                          >
                            <CheckIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                    {reports.filter(r => r.status === 'pending').length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          <Typography color="text.secondary" sx={{ py: 4 }}>
                            No pending reports
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </TabPanel>

          {/* All Reports Tab */}
          <TabPanel value={tabValue} index={1}>
            <Box sx={{ px: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                All Reports ({stats.totalReports})
              </Typography>
              
              <TableContainer sx={{ elevation: 1, borderRadius: 2 }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: theme.palette.grey[50] }}>
                      <TableCell sx={{ fontWeight: 500, fontSize: '0.75rem' }}>Country</TableCell>
                      <TableCell sx={{ fontWeight: 500, fontSize: '0.75rem' }}>Type</TableCell>
                      <TableCell sx={{ fontWeight: 500, fontSize: '0.75rem' }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 500, fontSize: '0.75rem' }}>User Experience</TableCell>
                      <TableCell sx={{ fontWeight: 500, fontSize: '0.75rem' }}>Reported</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 500, fontSize: '0.75rem' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {reports.map((report) => (
                      <TableRow key={report.id} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {report.countryName}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={report.reportType.replace('_', ' ')} 
                            size="small" 
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={report.status} 
                            size="small" 
                            color={getStatusColor(report.status)}
                          />
                        </TableCell>
                        <TableCell sx={{ maxWidth: 300 }}>
                          <Typography variant="body2" noWrap>
                            {report.userExperience}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" color="text.secondary">
                            {report.createdAt.toLocaleDateString()}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedReport(report)
                              setViewDialog(true)
                            }}
                          >
                            <ViewIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </TabPanel>

          {/* Notifications Tab */}
          <TabPanel value={tabValue} index={2}>
            <Box sx={{ px: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Admin Notifications ({notifications.length})
              </Typography>
              
              <Stack spacing={2}>
                {notifications.map((notification) => (
                  <Card 
                    key={notification.id}
                    sx={{ 
                      p: 2,
                      opacity: notification.isRead ? 0.7 : 1,
                      border: notification.isRead ? 'none' : `1px solid ${theme.palette.primary.main}`
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Chip 
                            label={notification.priority} 
                            size="small" 
                            color={getPriorityColor(notification.priority)}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {notification.createdAt.toLocaleString()}
                          </Typography>
                        </Box>
                        <Typography variant="subtitle2" fontWeight="medium">
                          {notification.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {notification.message}
                        </Typography>
                      </Box>
                      {!notification.isRead && (
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleMarkNotificationRead(notification.id)}
                        >
                          Mark Read
                        </Button>
                      )}
                    </Box>
                  </Card>
                ))}
                {notifications.length === 0 && (
                  <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                    No notifications
                  </Typography>
                )}
              </Stack>
            </Box>
          </TabPanel>

          {/* Analytics Tab */}
          <TabPanel value={tabValue} index={3}>
            <Box sx={{ px: 3 }}>
              <Typography variant="h6" sx={{ mb: 3 }}>
                Community Feedback Analytics
              </Typography>
              
              <Box sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                gap: 3
              }}>
                <Card sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Most Reported Countries
                  </Typography>
                  <Stack spacing={2}>
                    {stats.topReportedCountries.map((country, index) => (
                      <Box key={country.countryCode} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="body2" sx={{ minWidth: 20 }}>
                          #{index + 1}
                        </Typography>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" fontWeight="medium">
                            {country.countryName}
                          </Typography>
                          <LinearProgress 
                            variant="determinate" 
                            value={(country.reportCount / stats.totalReports) * 100} 
                            sx={{ mt: 0.5 }}
                          />
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {country.reportCount} reports
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </Card>
                
                <Card sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Report Processing Stats
                  </Typography>
                  <Stack spacing={2}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography>Verification Rate</Typography>
                      <Typography fontWeight="medium">
                        {stats.totalReports > 0 ? Math.round((stats.verifiedReports / stats.totalReports) * 100) : 0}%
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={stats.totalReports > 0 ? (stats.verifiedReports / stats.totalReports) * 100 : 0} 
                    />
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography>Pending Review</Typography>
                      <Typography fontWeight="medium">
                        {stats.pendingReports} reports
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={stats.totalReports > 0 ? (stats.pendingReports / stats.totalReports) * 100 : 0}
                      color="warning"
                    />
                  </Stack>
                </Card>
              </Box>
            </Box>
          </TabPanel>
        </Card>
        </Box>
      </Box>

      {/* Report Detail Dialog */}
      <Dialog open={viewDialog} onClose={() => setViewDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Report Details
        </DialogTitle>
        <DialogContent>
          {selectedReport && (
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <Chip 
                  label={selectedReport.status} 
                  color={getStatusColor(selectedReport.status)}
                />
                <Chip 
                  label={selectedReport.reportType.replace('_', ' ')} 
                  variant="outlined"
                />
              </Box>
              
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Country</Typography>
                <Typography>{selectedReport.countryName} ({selectedReport.countryCode})</Typography>
              </Box>
              
              <Box>
                <Typography variant="subtitle2" color="text.secondary">User Experience</Typography>
                <Typography>{selectedReport.userExperience}</Typography>
              </Box>
              
              {selectedReport.currentAppData && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Current App Data</Typography>
                  <Typography>{selectedReport.currentAppData}</Typography>
                </Box>
              )}
              
              {selectedReport.additionalDetails && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Additional Details</Typography>
                  <Typography>{selectedReport.additionalDetails}</Typography>
                </Box>
              )}
              
              <Box sx={{ display: 'flex', gap: 4 }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Reported By</Typography>
                  <Typography>{selectedReport.reportedBy}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Date</Typography>
                  <Typography>{selectedReport.createdAt.toLocaleDateString()}</Typography>
                </Box>
              </Box>
              
              {selectedReport.adminNotes && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Admin Notes</Typography>
                  <Typography>{selectedReport.adminNotes}</Typography>
                </Box>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialog(false)}>Close</Button>
          {selectedReport?.status === 'pending' && (
            <Button 
              variant="contained" 
              onClick={() => {
                setProcessDialog(true)
                setViewDialog(false)
              }}
            >
              Process Report
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Process Report Dialog */}
      <Dialog open={processDialog} onClose={() => setProcessDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Process Report
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Typography variant="body2">
              How would you like to process this report for {selectedReport?.countryName}?
            </Typography>
            
            <FormControl fullWidth>
              <InputLabel>Admin Notes</InputLabel>
              <Select
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                label="Admin Notes"
              >
                <MenuItem value="Verified through government website">Verified through government website</MenuItem>
                <MenuItem value="Multiple reports confirm this change">Multiple reports confirm this change</MenuItem>
                <MenuItem value="Needs further investigation">Needs further investigation</MenuItem>
                <MenuItem value="Duplicate report - already processed">Duplicate report - already processed</MenuItem>
                <MenuItem value="">Custom note...</MenuItem>
              </Select>
            </FormControl>
            
            {adminNotes === '' && (
              <Box>
                <Typography variant="body2" sx={{ mb: 1 }}>Custom Note:</Typography>
                <textarea
                  style={{
                    width: '100%',
                    minHeight: '80px',
                    padding: '8px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    fontFamily: 'inherit'
                  }}
                  placeholder="Enter custom admin notes..."
                  onChange={(e) => setAdminNotes(e.target.value)}
                />
              </Box>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProcessDialog(false)}>Cancel</Button>
          <Button 
            color="info"
            onClick={() => selectedReport && handleProcessReport(selectedReport.id, 'investigate', adminNotes)}
          >
            Investigate
          </Button>
          <Button 
            color="error"
            onClick={() => selectedReport && handleProcessReport(selectedReport.id, 'reject', adminNotes)}
          >
            Reject
          </Button>
          <Button 
            variant="contained"
            color="success"
            onClick={() => selectedReport && handleProcessReport(selectedReport.id, 'verify', adminNotes)}
          >
            Verify
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}