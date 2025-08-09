'use client'

import { useState } from 'react'
import { Button } from '@mui/material'
import { Feedback as FeedbackIcon } from '@mui/icons-material'
import FeedbackDialog from './FeedbackDialog'
import { FeedbackButtonProps } from '@/lib/types/feedback'

export default function FeedbackButton({
  countryCode,
  countryName,
  currentVisaInfo,
  userEmail,
  onSubmit
}: FeedbackButtonProps) {
  const [dialogOpen, setDialogOpen] = useState(false)

  if (!userEmail) {
    return null // Don't show feedback button if user isn't logged in
  }

  const handleSubmit = async (report: any) => {
    if (onSubmit) {
      onSubmit(report)
    }
    setDialogOpen(false)
  }

  // Create current app data string for context
  const currentAppData = `Duration: ${currentVisaInfo.duration || 'Unknown'} days, Visa Required: ${currentVisaInfo.visaRequired ? 'Yes' : 'No'}, Reset Type: ${currentVisaInfo.resetType || 'Unknown'}`

  return (
    <>
      <Button
        variant="outlined"
        size="small"
        startIcon={<FeedbackIcon />}
        onClick={() => setDialogOpen(true)}
        sx={{
          textTransform: 'none',
          fontSize: '0.75rem',
          py: 0.5,
          px: 1.5,
          borderColor: 'grey.400',
          color: 'grey.600',
          '&:hover': {
            borderColor: 'grey.600',
            backgroundColor: 'grey.50'
          }
        }}
      >
        Report Issue
      </Button>

      <FeedbackDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleSubmit}
        countryCode={countryCode}
        countryName={countryName}
        currentAppData={currentAppData}
        userEmail={userEmail}
      />
    </>
  )
}