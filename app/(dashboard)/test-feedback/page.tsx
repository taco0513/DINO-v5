'use client'

import { useState } from 'react'
import { Box, Typography, Button, Alert, Paper, useTheme } from '@mui/material'
import FeedbackButton from '@/components/feedback/FeedbackButton'
import { feedbackService } from '@/lib/services/feedback-service'

export default function TestFeedbackPage() {
  const [message, setMessage] = useState<string>('')
  const [error, setError] = useState<string>('')
  const theme = useTheme()

  const handleFeedbackSubmit = async (report: any) => {
    try {
      setError('')
      await feedbackService.submitReport(report)
      setMessage('Feedback submitted successfully!')
    } catch (err: any) {
      setError(err.message || 'Failed to submit feedback')
      throw err
    }
  }

  return (
    <Box component="main" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', backgroundColor: theme.palette.background.default }}>
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        <Box sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        🧪 Feedback System Test
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Test the community feedback system by reporting visa information issues.
      </Typography>

      {message && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setMessage('')}>
          {message}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          🇹🇭 Thailand Visa Information
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Current App Data: Duration: 30 days, Visa Required: No, Reset Type: exit
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
          <FeedbackButton
            countryCode="TH"
            countryName="Thailand"
            currentVisaInfo={{
              duration: 30,
              visaRequired: false,
              resetType: 'exit'
            }}
            userEmail="zbrianjin@gmail.com"
            onSubmit={handleFeedbackSubmit}
          />
        </Box>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          🇰🇷 South Korea Visa Information
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Current App Data: Duration: 183 days, Visa Required: No, Reset Type: rolling
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
          <FeedbackButton
            countryCode="KR"
            countryName="South Korea"
            currentVisaInfo={{
              duration: 183,
              visaRequired: false,
              resetType: 'rolling'
            }}
            userEmail="zbrianjin@gmail.com"
            onSubmit={handleFeedbackSubmit}
          />
        </Box>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          🇻🇳 Vietnam Visa Information
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Current App Data: Duration: 45 days, Visa Required: No, Reset Type: exit
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
          <FeedbackButton
            countryCode="VN"
            countryName="Vietnam"
            currentVisaInfo={{
              duration: 45,
              visaRequired: false,
              resetType: 'exit'
            }}
            userEmail="zbrianjin@gmail.com"
            onSubmit={handleFeedbackSubmit}
          />
        </Box>
      </Paper>
        </Box>
      </Box>
    </Box>
  )
}