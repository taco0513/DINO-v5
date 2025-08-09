'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  Box,
  Alert,
  CircularProgress,
  Stack,
  Chip
} from '@mui/material'
import { FeedbackDialogProps, ReportType, CreateUserReportRequest } from '@/lib/types/feedback'

const reportTypeOptions: { value: ReportType; label: string; description: string }[] = [
  {
    value: 'duration_different',
    label: '실제 받은 기간이 달라요',
    description: 'Got different duration than what the app shows'
  },
  {
    value: 'visa_free_changed',
    label: '비자 면제 상태가 변경됐어요',
    description: 'Visa-free status has changed'
  },
  {
    value: 'new_requirement',
    label: '새로운 요구사항이 생겼어요',
    description: 'New requirements were added'
  },
  {
    value: 'extension_info',
    label: '연장 정보가 틀려요',
    description: 'Extension information is incorrect'
  },
  {
    value: 'fee_changed',
    label: '수수료가 변경됐어요',
    description: 'Fees have changed'
  },
  {
    value: 'other',
    label: '기타',
    description: 'Other issues'
  }
]

export default function FeedbackDialog({
  open,
  onClose,
  onSubmit,
  countryCode,
  countryName,
  currentAppData,
  userEmail
}: FeedbackDialogProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    reportType: '' as ReportType | '',
    userExperience: '',
    entryDate: '',
    exitDate: '',
    entryAirport: '',
    exitAirport: '',
    visaType: '',
    additionalDetails: '',
    userNationality: 'US'
  })

  const handleClose = () => {
    if (!loading && !success) {
      resetForm()
      onClose()
    }
  }

  const resetForm = () => {
    setFormData({
      reportType: '',
      userExperience: '',
      entryDate: '',
      exitDate: '',
      entryAirport: '',
      exitAirport: '',
      visaType: '',
      additionalDetails: '',
      userNationality: 'US'
    })
    setError('')
    setSuccess(false)
  }

  const handleSubmit = async () => {
    if (!formData.reportType || !formData.userExperience.trim()) {
      setError('Please select an issue type and describe your experience')
      return
    }

    setLoading(true)
    setError('')

    try {
      const report: CreateUserReportRequest = {
        reportType: formData.reportType,
        countryCode,
        countryName,
        userExperience: formData.userExperience,
        currentAppData,
        entryDate: formData.entryDate ? new Date(formData.entryDate) : undefined,
        exitDate: formData.exitDate ? new Date(formData.exitDate) : undefined,
        entryAirport: formData.entryAirport || undefined,
        exitAirport: formData.exitAirport || undefined,
        visaType: formData.visaType || undefined,
        additionalDetails: formData.additionalDetails || undefined,
        userNationality: formData.userNationality,
        reportedBy: userEmail
      }

      await onSubmit(report)
      setSuccess(true)
      
      // Auto close after success
      setTimeout(() => {
        resetForm()
        onClose()
      }, 2000)

    } catch (err) {
      console.error('Failed to submit feedback:', err)
      setError('Failed to submit feedback. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h6" component="span">
            📝 Report Visa Information Issue
          </Typography>
          <Chip label={countryName} size="small" />
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Help us improve visa information accuracy for the community
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            <Typography variant="subtitle2">Thank you for your feedback!</Typography>
            <Typography variant="body2">
              Your report has been submitted and will be reviewed by our team.
            </Typography>
          </Alert>
        )}

        {!success && (
          <Stack spacing={3}>
            {/* Current App Information */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Current App Information for {countryName}:
              </Typography>
              <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  {currentAppData}
                </Typography>
              </Box>
            </Box>

            {/* Issue Type */}
            <FormControl component="fieldset" required>
              <FormLabel component="legend">
                What type of issue did you encounter?
              </FormLabel>
              <RadioGroup
                value={formData.reportType}
                onChange={(e) => setFormData(prev => ({ ...prev, reportType: e.target.value as ReportType }))}
              >
                {reportTypeOptions.map((option) => (
                  <FormControlLabel
                    key={option.value}
                    value={option.value}
                    control={<Radio />}
                    label={
                      <Box>
                        <Typography variant="body2">{option.label}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {option.description}
                        </Typography>
                      </Box>
                    }
                    sx={{ mb: 0.5 }}
                  />
                ))}
              </RadioGroup>
            </FormControl>

            {/* User Experience */}
            <TextField
              label="What actually happened? *"
              multiline
              rows={4}
              fullWidth
              required
              value={formData.userExperience}
              onChange={(e) => setFormData(prev => ({ ...prev, userExperience: e.target.value }))}
              placeholder="Please describe your actual experience in detail..."
              helperText="The more specific you are, the better we can help improve the information"
            />

            {/* Travel Details */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Travel Details (Optional)
              </Typography>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    label="Entry Date"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    value={formData.entryDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, entryDate: e.target.value }))}
                    sx={{ flex: 1 }}
                  />
                  <TextField
                    label="Exit Date"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    value={formData.exitDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, exitDate: e.target.value }))}
                    sx={{ flex: 1 }}
                  />
                </Box>

                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    label="Entry Airport/City"
                    value={formData.entryAirport}
                    onChange={(e) => setFormData(prev => ({ ...prev, entryAirport: e.target.value.toUpperCase() }))}
                    placeholder="e.g., ICN, NRT"
                    inputProps={{ maxLength: 5 }}
                    sx={{ flex: 1 }}
                  />
                  <TextField
                    label="Exit Airport/City"
                    value={formData.exitAirport}
                    onChange={(e) => setFormData(prev => ({ ...prev, exitAirport: e.target.value.toUpperCase() }))}
                    placeholder="e.g., BKK, SGN"
                    inputProps={{ maxLength: 5 }}
                    sx={{ flex: 1 }}
                  />
                </Box>

                <TextField
                  label="Visa Type Used"
                  value={formData.visaType}
                  onChange={(e) => setFormData(prev => ({ ...prev, visaType: e.target.value }))}
                  placeholder="e.g., Tourist, Business, Transit"
                />
              </Stack>
            </Box>

            {/* Additional Details */}
            <TextField
              label="Additional Details"
              multiline
              rows={3}
              fullWidth
              value={formData.additionalDetails}
              onChange={(e) => setFormData(prev => ({ ...prev, additionalDetails: e.target.value }))}
              placeholder="Any other relevant information, sources, or context..."
            />
          </Stack>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={handleClose} disabled={loading}>
          {success ? 'Close' : 'Cancel'}
        </Button>
        {!success && (
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading || !formData.reportType || !formData.userExperience.trim()}
          >
            {loading ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                Submitting...
              </>
            ) : (
              'Submit Report'
            )}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}