'use client'

import { useState, useEffect } from 'react'
import { Box } from '@mui/material'
import NavigationSidebar from '@/components/sidebar/NavigationSidebar'
import OfflineIndicator from '@/components/ui/OfflineIndicator'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarWidth, setSidebarWidth] = useState(280)

  useEffect(() => {
    // Check localStorage for collapsed state
    const checkSidebarState = () => {
      const isCollapsed = localStorage.getItem('sidebar-collapsed') === 'true'
      setSidebarWidth(isCollapsed ? 72 : 280)
    }

    // Initial check
    checkSidebarState()

    // Listen for storage changes (when sidebar state changes)
    const handleStorageChange = () => {
      checkSidebarState()
    }

    window.addEventListener('storage', handleStorageChange)
    
    // Also check periodically for changes within the same tab
    const interval = setInterval(checkSidebarState, 100)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(interval)
    }
  }, [])

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <NavigationSidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          overflow: 'auto',
          width: '100%',
        }}
      >
        {children}
      </Box>
      <OfflineIndicator />
    </Box>
  )
}