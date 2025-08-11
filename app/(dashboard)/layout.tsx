'use client'

import { useState, useEffect } from 'react'
import { Box } from '@mui/material'
import NavigationSidebar from '@/components/sidebar/NavigationSidebar'
import OfflineIndicator from '@/components/ui/OfflineIndicator'
import MobileFAB from '@/components/ui/MobileFAB'
import dynamic from 'next/dynamic'

// Debug components removed - using Supabase only now

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarWidth, setSidebarWidth] = useState(250)

  useEffect(() => {
    // Check localStorage for collapsed state
    const checkSidebarState = () => {
      const isCollapsed = localStorage.getItem('sidebar-collapsed') === 'true'
      setSidebarWidth(isCollapsed ? 72 : 250)
    }

    // Initial check
    checkSidebarState()

    // Listen for storage changes (when sidebar state changes)
    const handleStorageChange = () => {
      checkSidebarState()
    }

    window.addEventListener('storage', handleStorageChange)
    
    // Check less frequently for changes within the same tab
    const interval = setInterval(checkSidebarState, 2000) // Changed from 100ms to 2000ms

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(interval)
    }
  }, [])

  return (
    <Box sx={{ 
      display: 'flex', 
      minHeight: '100vh', 
      backgroundColor: '#f5f5f5',
      position: 'relative'
    }}>
      <NavigationSidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          overflow: 'auto',
          width: '100%',
          minWidth: 0, // Allow flex item to shrink below content size
          // Add margin to account for fixed sidebar
          ml: { xs: 0, lg: `${sidebarWidth}px` },
          // Add padding for mobile menu button on small screens
          pt: { xs: 8, lg: 0 }
        }}
      >
        {children}
      </Box>
      <OfflineIndicator />
      <MobileFAB />
    </Box>
  )
}