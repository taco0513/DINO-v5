'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { Responsive, WidthProvider, Layout } from 'react-grid-layout'
import { 
  Box, 
  Paper, 
  Typography, 
  IconButton, 
  Stack,
  Button,
  Menu,
  MenuItem,
  useTheme,
  Fab,
  Tooltip
} from '@mui/material'
import {
  Add as AddIcon,
  DragIndicator as DragIcon,
  Close as CloseIcon,
  Settings as SettingsIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Lock as LockIcon,
  LockOpen as UnlockIcon
} from '@mui/icons-material'
import { 
  DashboardWidget, 
  DEFAULT_WIDGETS, 
  DEFAULT_BREAKPOINTS, 
  DEFAULT_COLS,
  DEFAULT_ROW_HEIGHT,
  KPIData
} from '@/lib/types/dashboard'
import KPICard from './KPICard'
import ChartWidget from './ChartWidget'
import MapWidget from './MapWidget'
import TableWidget from './TableWidget'
import { Stay } from '@/lib/types'
import { getStays } from '@/lib/supabase/stays'
import { countries } from '@/lib/data/countries-and-airports'

// Import grid layout styles
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'

const ResponsiveGridLayout = WidthProvider(Responsive)

interface ModularDashboardProps {
  stays: Stay[]
  onLayoutChange?: (layout: Layout[]) => void
}

export default function ModularDashboard({ stays: initialStays, onLayoutChange }: ModularDashboardProps) {
  const theme = useTheme()
  const [widgets, setWidgets] = useState<DashboardWidget[]>(DEFAULT_WIDGETS)
  const [isLocked, setIsLocked] = useState(false)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [stays, setStays] = useState<Stay[]>(initialStays)
  
  // Create layouts from widgets
  const generateLayouts = (widgetList: DashboardWidget[]) => {
    return {
      lg: widgetList.map(w => ({
        i: w.id,
        x: w.x,
        y: w.y,
        w: w.w,
        h: w.h,
        minW: w.minW || 2,
        minH: w.minH || 2,
        maxW: w.maxW,
        maxH: w.maxH,
        static: isLocked
      })),
      md: widgetList.map(w => ({
        i: w.id,
        x: w.x % 8,
        y: w.y,
        w: Math.min(w.w, 8),
        h: w.h,
        minW: w.minW || 2,
        minH: w.minH || 2,
        static: isLocked
      })),
      sm: widgetList.map(w => ({
        i: w.id,
        x: w.x % 6,
        y: w.y,
        w: Math.min(w.w, 6),
        h: w.h,
        minW: w.minW || 2,
        minH: w.minH || 2,
        static: isLocked
      })),
      xs: widgetList.map(w => ({
        i: w.id,
        x: 0,
        y: w.y,
        w: 4,
        h: w.h,
        minW: 4,
        minH: w.minH || 2,
        static: isLocked
      }))
    }
  }
  
  const [layouts, setLayouts] = useState(() => generateLayouts(widgets))
  
  // Update layouts when lock state changes
  useEffect(() => {
    setLayouts(generateLayouts(widgets))
  }, [isLocked])
  
  // Load saved layout from localStorage
  useEffect(() => {
    const savedLayout = localStorage.getItem('dino-dashboard-layout')
    if (savedLayout) {
      try {
        const parsed = JSON.parse(savedLayout)
        if (parsed.widgets) {
          setWidgets(parsed.widgets)
          setLayouts(generateLayouts(parsed.widgets))
        }
      } catch (e) {
        console.error('Failed to parse saved layout:', e)
      }
    }
  }, [])
  
  // Calculate KPI data from stays
  const kpiData = useMemo(() => {
    const totalDays = stays.reduce((sum, stay) => {
      const days = stay.exitDate 
        ? Math.ceil((new Date(stay.exitDate).getTime() - new Date(stay.entryDate).getTime()) / (1000 * 60 * 60 * 24)) + 1
        : Math.ceil((new Date().getTime() - new Date(stay.entryDate).getTime()) / (1000 * 60 * 60 * 24)) + 1
      return sum + days
    }, 0)
    
    const uniqueCountries = new Set(stays.map(s => s.countryCode)).size
    
    // Find ongoing stay for visa days
    const ongoingStay = stays.find(s => !s.exitDate)
    const currentCountry = ongoingStay ? countries.find(c => c.code === ongoingStay.countryCode) : null
    
    // Calculate visa days remaining (simplified - you'd want real visa logic here)
    const visaDaysRemaining = ongoingStay ? '45 days' : 'N/A'
    
    // Next planned trip (placeholder)
    const nextTrip = 'Thailand - Feb 15'
    
    return {
      totalDays,
      uniqueCountries,
      visaDaysRemaining,
      nextTrip
    }
  }, [stays])
  
  const handleLayoutChange = (currentLayout: Layout[], allLayouts: any) => {
    setLayouts(allLayouts)
    
    // Update widget positions based on layout changes
    const updatedWidgets = widgets.map(widget => {
      const layoutItem = currentLayout.find(l => l.i === widget.id)
      if (layoutItem) {
        return {
          ...widget,
          x: layoutItem.x,
          y: layoutItem.y,
          w: layoutItem.w,
          h: layoutItem.h
        }
      }
      return widget
    })
    
    setWidgets(updatedWidgets)
    
    if (onLayoutChange) {
      onLayoutChange(currentLayout)
    }
  }
  
  const saveLayout = () => {
    const layoutData = {
      widgets,
      savedAt: new Date().toISOString()
    }
    localStorage.setItem('dino-dashboard-layout', JSON.stringify(layoutData))
  }
  
  const resetLayout = () => {
    setWidgets(DEFAULT_WIDGETS)
    setLayouts(generateLayouts(DEFAULT_WIDGETS))
    localStorage.removeItem('dino-dashboard-layout')
  }
  
  const removeWidget = (widgetId: string) => {
    const newWidgets = widgets.filter(w => w.id !== widgetId)
    setWidgets(newWidgets)
    setLayouts(generateLayouts(newWidgets))
  }
  
  const renderWidget = (widget: DashboardWidget) => {
    switch (widget.type) {
      case 'kpi':
        let kpiCardData: KPIData = {
          label: widget.title,
          value: 'N/A',
          color: 'primary'
        }
        
        // Map widget ID to actual data
        switch (widget.id) {
          case 'kpi-total-days':
            kpiCardData = {
              label: 'Total Travel Days',
              value: kpiData.totalDays,
              change: 12,
              changeLabel: 'vs last year',
              color: 'primary'
            }
            break
          case 'kpi-countries':
            kpiCardData = {
              label: 'Countries Visited',
              value: kpiData.uniqueCountries,
              change: 25,
              changeLabel: 'this year',
              color: 'success'
            }
            break
          case 'kpi-visa-days':
            kpiCardData = {
              label: 'Visa Days Remaining',
              value: kpiData.visaDaysRemaining,
              color: 'warning'
            }
            break
          case 'kpi-next-trip':
            kpiCardData = {
              label: 'Next Trip',
              value: kpiData.nextTrip,
              color: 'info'
            }
            break
        }
        
        return <KPICard data={kpiCardData} />
        
      case 'chart':
        // Determine chart type based on widget ID
        let chartType: 'monthly' | 'countries' | 'visa-usage' | 'travel-pattern' = 'monthly'
        if (widget.id === 'chart-monthly') {
          chartType = 'monthly'
        } else if (widget.id === 'chart-countries') {
          chartType = 'countries'
        } else if (widget.id === 'chart-visa') {
          chartType = 'visa-usage'
        }
        
        return (
          <ChartWidget 
            type={chartType}
            stays={stays}
            title={widget.title}
          />
        )
        
      case 'map':
        return (
          <MapWidget 
            stays={stays}
            title={widget.title}
          />
        )
        
      case 'table':
        return (
          <TableWidget 
            stays={stays}
            title={widget.title}
          />
        )
        
      default:
        return (
          <Paper sx={{ height: '100%', p: 2 }}>
            <Typography>{widget.title}</Typography>
          </Paper>
        )
    }
  }
  
  return (
    <Box sx={{ position: 'relative', width: '100%' }}>
      {/* Control Bar */}
      <Stack 
        direction="row" 
        spacing={1} 
        sx={{ 
          mb: 2,
          p: 2,
          backgroundColor: theme.palette.background.paper,
          borderRadius: 2,
          boxShadow: theme.shadows[1]
        }}
      >
        <Tooltip title={isLocked ? "Unlock Layout" : "Lock Layout"}>
          <IconButton onClick={() => setIsLocked(!isLocked)} color={isLocked ? "primary" : "default"}>
            {isLocked ? <LockIcon /> : <UnlockIcon />}
          </IconButton>
        </Tooltip>
        
        <Tooltip title="Save Layout">
          <IconButton onClick={saveLayout}>
            <SaveIcon />
          </IconButton>
        </Tooltip>
        
        <Tooltip title="Reset Layout">
          <IconButton onClick={resetLayout}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
        
        <Box sx={{ flex: 1 }} />
        
        <Typography 
          variant="caption" 
          sx={{ 
            display: 'flex', 
            alignItems: 'center',
            color: theme.palette.text.secondary
          }}
        >
          {isLocked ? 'Layout Locked' : 'Drag widgets to rearrange'}
        </Typography>
      </Stack>
      
      {/* Add custom styles for grid */}
      <style jsx global>{`
        .react-grid-layout {
          position: relative;
        }
        .react-grid-item {
          transition: all 200ms ease;
          transition-property: left, top, width, height;
        }
        .react-grid-item.cssTransforms {
          transition-property: transform, width, height;
        }
        .react-grid-item.resizing {
          transition: none;
          z-index: 1;
          will-change: width, height;
        }
        .react-grid-item.dragging {
          transition: none;
          z-index: 3;
          will-change: transform;
        }
        .react-grid-item.dropping {
          visibility: hidden;
        }
        .react-grid-placeholder {
          background: ${theme.palette.primary.main};
          opacity: 0.2;
          transition-duration: 100ms;
          z-index: 2;
          border-radius: 8px;
        }
      `}</style>
      
      {/* Grid Layout */}
      <ResponsiveGridLayout
        className="layout"
        layouts={layouts}
        onLayoutChange={handleLayoutChange}
        breakpoints={DEFAULT_BREAKPOINTS}
        cols={DEFAULT_COLS}
        rowHeight={DEFAULT_ROW_HEIGHT}
        isDraggable={!isLocked}
        isResizable={!isLocked}
        containerPadding={[0, 0]}
        margin={[16, 16]}
        useCSSTransforms={true}
        preventCollision={false}
        compactType="vertical"
      >
        {widgets.map(widget => (
          <div key={widget.id} style={{ display: 'flex' }}>
            {/* Widget Container */}
            <Box sx={{ 
              width: '100%', 
              height: '100%', 
              position: 'relative',
              display: 'flex',
              flexDirection: 'column'
            }}>
              {/* Drag Handle (only show when unlocked) */}
              {!isLocked && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 8,
                    left: 8,
                    zIndex: 10,
                    cursor: 'move',
                    opacity: 0.5,
                    transition: 'opacity 0.2s',
                    backgroundColor: theme.palette.background.paper,
                    borderRadius: 1,
                    p: 0.5,
                    display: 'flex',
                    '&:hover': {
                      opacity: 1
                    }
                  }}
                >
                  <DragIcon fontSize="small" />
                </Box>
              )}
              
              {/* Remove Button (only show when unlocked) */}
              {!isLocked && (
                <IconButton
                  size="small"
                  onClick={() => removeWidget(widget.id)}
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    zIndex: 10,
                    opacity: 0.5,
                    backgroundColor: theme.palette.background.paper,
                    transition: 'opacity 0.2s',
                    '&:hover': {
                      opacity: 1,
                      backgroundColor: theme.palette.action.hover
                    }
                  }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              )}
              
              {/* Widget Content */}
              <Box sx={{ width: '100%', height: '100%' }}>
                {renderWidget(widget)}
              </Box>
            </Box>
          </div>
        ))}
      </ResponsiveGridLayout>
      
      {/* Add Widget FAB */}
      {!isLocked && (
        <Fab
          color="primary"
          aria-label="add widget"
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24
          }}
          onClick={(e) => setAnchorEl(e.currentTarget)}
        >
          <AddIcon />
        </Fab>
      )}
      
      {/* Add Widget Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={() => {
          // Add logic to add new widget
          const newWidget: DashboardWidget = {
            id: `widget-${Date.now()}`,
            type: 'kpi',
            title: 'New KPI',
            x: 0,
            y: 0,
            w: 3,
            h: 2
          }
          const newWidgets = [...widgets, newWidget]
          setWidgets(newWidgets)
          setLayouts(generateLayouts(newWidgets))
          setAnchorEl(null)
        }}>
          Add KPI Card
        </MenuItem>
        <MenuItem onClick={() => {
          const newWidget: DashboardWidget = {
            id: `chart-${Date.now()}`,
            type: 'chart',
            title: 'Travel Stats',
            x: 0,
            y: 0,
            w: 6,
            h: 4,
            minW: 3,
            minH: 3
          }
          const newWidgets = [...widgets, newWidget]
          setWidgets(newWidgets)
          setLayouts(generateLayouts(newWidgets))
          setAnchorEl(null)
        }}>
          Add Chart
        </MenuItem>
        <MenuItem onClick={() => {
          const newWidget: DashboardWidget = {
            id: `table-${Date.now()}`,
            type: 'table',
            title: 'Travel Records',
            x: 0,
            y: 0,
            w: 12,
            h: 4,
            minW: 4,
            minH: 3
          }
          const newWidgets = [...widgets, newWidget]
          setWidgets(newWidgets)
          setLayouts(generateLayouts(newWidgets))
          setAnchorEl(null)
        }}>
          Add Table
        </MenuItem>
        <MenuItem onClick={() => {
          const newWidget: DashboardWidget = {
            id: `map-${Date.now()}`,
            type: 'map',
            title: 'Travel Map',
            x: 0,
            y: 0,
            w: 6,
            h: 4,
            minW: 3,
            minH: 3
          }
          const newWidgets = [...widgets, newWidget]
          setWidgets(newWidgets)
          setLayouts(generateLayouts(newWidgets))
          setAnchorEl(null)
        }}>
          Add Map
        </MenuItem>
      </Menu>
    </Box>
  )
}