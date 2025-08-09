'use client'

import { useState, useEffect } from 'react'
import {
  Paper,
  Typography,
  Box,
  Alert,
  AlertTitle,
  Chip,
  Stack,
  LinearProgress,
  Collapse,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  useTheme
} from '@mui/material'
import {
  Warning as WarningIcon,
  Error as ErrorIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Flag as FlagIcon
} from '@mui/icons-material'
import { Country, Stay } from '@/lib/types'
import { calculateAllVisaStatuses, type VisaStatus, type VisaCalculationContext } from '@/lib/visa-calculations/visa-engine'
import { getCurrentUserEmail } from '@/lib/context/user'
import { feedbackService } from '@/lib/services/feedback-service'
import FeedbackButton from '@/components/feedback/FeedbackButton'
// import { useSettings } from '@/lib/context/SettingsContext' // TODO: Create SettingsContext

interface VisaWarningsProps {
  countries: Country[]
  stays: Stay[]
}

export default function VisaWarnings({ countries, stays }: VisaWarningsProps) {
  const theme = useTheme()
  // Temporary fallback until SettingsContext is created
  const [settings] = useState({ nationality: 'US' })
  const [visaStatuses, setVisaStatuses] = useState<VisaStatus[]>([])
  const [expanded, setExpanded] = useState(true)
  const [loading, setLoading] = useState(true)
  const userEmail = getCurrentUserEmail()

  useEffect(() => {
    calculateStatuses()
  }, [stays, settings.nationality])

  const calculateStatuses = () => {
    setLoading(true)
    try {
      const context: VisaCalculationContext = {
        nationality: settings.nationality || 'US',
        referenceDate: new Date(),
        lookbackDays: 365
      }
      
      const statuses = calculateAllVisaStatuses(stays, context)
      setVisaStatuses(statuses.filter(status => status.rule !== null))
    } catch (error) {
      console.error('Failed to calculate visa statuses:', error)
      setVisaStatuses([])
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: VisaStatus['status']) => {
    switch (status) {
      case 'exceeded': return 'error'
      case 'critical': return 'error'
      case 'warning': return 'warning'
      case 'safe': return 'success'
      default: return 'info'
    }
  }

  const getStatusIcon = (status: VisaStatus['status']) => {
    switch (status) {
      case 'exceeded': return <ErrorIcon sx={{ fontSize: 20 }} />
      case 'critical': return <ErrorIcon sx={{ fontSize: 20 }} />
      case 'warning': return <WarningIcon sx={{ fontSize: 20 }} />
      case 'safe': return <CheckCircleIcon sx={{ fontSize: 20 }} />
      default: return <InfoIcon sx={{ fontSize: 20 }} />
    }
  }

  const getProgressValue = (visaStatus: VisaStatus) => {
    if (visaStatus.totalAllowedDays === 0) return 0
    return Math.min((visaStatus.daysUsed / visaStatus.totalAllowedDays) * 100, 100)
  }

  const handleFeedbackSubmit = async (report: any) => {
    try {
      await feedbackService.submitReport(report)
      console.log('Feedback submitted successfully')
    } catch (error) {
      console.error('Failed to submit feedback:', error)
      throw error
    }
  }

  const criticalStatuses = visaStatuses.filter(vs => vs.status === 'exceeded' || vs.status === 'critical')
  const warningStatuses = visaStatuses.filter(vs => vs.status === 'warning')
  const safeStatuses = visaStatuses.filter(vs => vs.status === 'safe')

  if (loading) {
    return (
      <Box sx={{
        p: 0,
        minHeight: 50,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'white',
        border: '1px solid',
        borderColor: theme.palette.divider,
        borderRadius: 2
      }}>
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" color="text.secondary">
            Calculating visa status...
          </Typography>
          <LinearProgress sx={{ mt: 2 }} />
        </Box>
      </Box>
    )
  }

  if (visaStatuses.length === 0) {
    return (
      <Box sx={{
        p: 0,
        minHeight: 50,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'white',
        border: '1px solid',
        borderColor: theme.palette.divider,
        borderRadius: 2
      }}>
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <InfoIcon sx={{ fontSize: '3rem', color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No Visa Data
          </Typography>
          <Typography variant="body2" color="text.disabled">
            Add travel records to see visa status warnings
          </Typography>
        </Box>
      </Box>
    )
  }

  return (
    <Box sx={{
      p: 0,
      minHeight: 50,
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: 'white',
      border: '1px solid',
      borderColor: theme.palette.divider,
      borderRadius: 2
    }}>
      {/* Header */}
      <Box sx={{ 
        mb: 3,
        pb: 2,
        px: 3,
        pt: 3,
        borderBottom: '1px solid',
        borderBottomColor: theme.palette.divider,
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between'
      }}>
        <Typography 
          variant="h6" 
          component="h2" 
          sx={{
            color: theme.palette.text.primary,
            fontFamily: 'Google Sans, Roboto, sans-serif',
            fontWeight: 400,
            fontSize: '1.125rem',
            mb: 0.5
          }}
        >
          Visa Status
        </Typography>
        
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography 
            variant="caption" 
            sx={{ 
              color: theme.palette.text.secondary,
              fontSize: '12px'
            }}
          >
            {settings.nationality || 'US'} Passport
          </Typography>
          <IconButton
            size="small"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Stack>
      </Box>

      <Collapse in={expanded}>
        <Box sx={{ px: 3, pb: 3 }}>
          {/* Critical Alerts */}
          {criticalStatuses.length > 0 && (
            <Stack spacing={2} sx={{ mb: 3 }}>
              {criticalStatuses.map((visaStatus) => {
                const country = countries.find(c => c.code === visaStatus.countryCode)
                return (
                  <Alert 
                    key={visaStatus.countryCode}
                    severity={getStatusColor(visaStatus.status)}
                    icon={getStatusIcon(visaStatus.status)}
                    sx={{ borderRadius: 2 }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <AlertTitle>
                        {country?.flag} {country?.name} - {visaStatus.status === 'exceeded' ? 'Visa Exceeded' : 'Critical'}
                      </AlertTitle>
                      {userEmail && country && (
                        <FeedbackButton
                          countryCode={country.code}
                          countryName={country.name}
                          currentVisaInfo={{
                            duration: visaStatus.totalAllowedDays,
                            visaRequired: true,
                            resetType: visaStatus.rule?.resetType || 'unknown'
                          }}
                          userEmail={userEmail}
                          onSubmit={handleFeedbackSubmit}
                        />
                      )}
                    </Box>
                    {visaStatus.warningMessage && (
                      <Typography variant="body2">
                        {visaStatus.warningMessage}
                      </Typography>
                    )}
                    <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={getProgressValue(visaStatus)}
                        color={getStatusColor(visaStatus.status)}
                        sx={{ flex: 1, height: 6, borderRadius: 1 }}
                      />
                      <Typography variant="caption">
                        {visaStatus.daysUsed}/{visaStatus.totalAllowedDays} days
                      </Typography>
                    </Box>
                  </Alert>
                )
              })}
            </Stack>
          )}

          {/* Warning Alerts */}
          {warningStatuses.length > 0 && (
            <Stack spacing={2} sx={{ mb: 3 }}>
              {warningStatuses.map((visaStatus) => {
                const country = countries.find(c => c.code === visaStatus.countryCode)
                return (
                  <Alert 
                    key={visaStatus.countryCode}
                    severity={getStatusColor(visaStatus.status)}
                    icon={getStatusIcon(visaStatus.status)}
                    sx={{ borderRadius: 2 }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <AlertTitle>
                        {country?.flag} {country?.name} - Warning
                      </AlertTitle>
                      {userEmail && country && (
                        <FeedbackButton
                          countryCode={country.code}
                          countryName={country.name}
                          currentVisaInfo={{
                            duration: visaStatus.totalAllowedDays,
                            visaRequired: true,
                            resetType: visaStatus.rule?.resetType || 'unknown'
                          }}
                          userEmail={userEmail}
                          onSubmit={handleFeedbackSubmit}
                        />
                      )}
                    </Box>
                    {visaStatus.warningMessage && (
                      <Typography variant="body2">
                        {visaStatus.warningMessage}
                      </Typography>
                    )}
                    <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={getProgressValue(visaStatus)}
                        color={getStatusColor(visaStatus.status)}
                        sx={{ flex: 1, height: 6, borderRadius: 1 }}
                      />
                      <Typography variant="caption">
                        {visaStatus.daysUsed}/{visaStatus.totalAllowedDays} days
                      </Typography>
                    </Box>
                  </Alert>
                )
              })}
            </Stack>
          )}

          {/* Safe Status Summary */}
          {safeStatuses.length > 0 && (
            <List dense>
              {safeStatuses.map((visaStatus) => {
                const country = countries.find(c => c.code === visaStatus.countryCode)
                return (
                  <ListItem key={visaStatus.countryCode} divider>
                    <ListItemIcon>
                      <CheckCircleIcon color="success" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography variant="body2">
                            {country?.flag} {country?.name}
                          </Typography>
                          <Chip
                            label={`${visaStatus.daysRemaining} days left`}
                            color="success"
                            size="small"
                            variant="outlined"
                          />
                          {userEmail && country && (
                            <FeedbackButton
                              countryCode={country.code}
                              countryName={country.name}
                              currentVisaInfo={{
                                duration: visaStatus.totalAllowedDays,
                                visaRequired: true,
                                resetType: visaStatus.rule?.resetType || 'unknown'
                              }}
                              userEmail={userEmail}
                              onSubmit={handleFeedbackSubmit}
                            />
                          )}
                        </Stack>
                      }
                      secondary={
                        <span style={{ 
                          display: 'flex', 
                          flexDirection: 'row', 
                          alignItems: 'center', 
                          gap: '16px', 
                          marginTop: '4px' 
                        }}>
                          <LinearProgress 
                            variant="determinate" 
                            value={getProgressValue(visaStatus)}
                            color="success"
                            sx={{ flex: 1, height: 4, borderRadius: 1 }}
                          />
                          <span style={{ 
                            fontSize: '12px', 
                            color: '#6b7280',
                            fontFamily: 'Roboto, sans-serif'
                          }}>
                            {visaStatus.daysUsed}/{visaStatus.totalAllowedDays}
                          </span>
                        </span>
                      }
                    />
                  </ListItem>
                )
              })}
            </List>
          )}
        </Box>
      </Collapse>
    </Box>
  )
}
