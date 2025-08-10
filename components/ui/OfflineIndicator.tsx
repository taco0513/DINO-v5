'use client'

import { Alert, Snackbar, Slide } from '@mui/material'
import { useOnlineStatus } from '@/lib/hooks/useOnlineStatus'
import { useState, useEffect } from 'react'
import WifiOffIcon from '@mui/icons-material/WifiOff'
import WifiIcon from '@mui/icons-material/Wifi'

export default function OfflineIndicator() {
  const isOnline = useOnlineStatus()
  const [showOffline, setShowOffline] = useState(false)
  const [showBackOnline, setShowBackOnline] = useState(false)

  useEffect(() => {
    if (!isOnline) {
      setShowOffline(true)
      setShowBackOnline(false)
    } else if (showOffline) {
      // Was offline, now back online
      setShowOffline(false)
      setShowBackOnline(true)
      // Hide "back online" message after 3 seconds
      const timer = setTimeout(() => setShowBackOnline(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [isOnline, showOffline])

  return (
    <>
      <Snackbar
        open={showOffline}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        TransitionComponent={Slide}
      >
        <Alert 
          severity="warning" 
          icon={<WifiOffIcon />}
          sx={{ 
            width: '100%',
            '& .MuiAlert-message': {
              fontWeight: 500
            }
          }}
        >
          You're offline - Changes will be saved locally
        </Alert>
      </Snackbar>

      <Snackbar
        open={showBackOnline}
        autoHideDuration={3000}
        onClose={() => setShowBackOnline(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        TransitionComponent={Slide}
      >
        <Alert 
          severity="success" 
          icon={<WifiIcon />}
          sx={{ 
            width: '100%',
            '& .MuiAlert-message': {
              fontWeight: 500
            }
          }}
        >
          You're back online - Data synced
        </Alert>
      </Snackbar>
    </>
  )
}