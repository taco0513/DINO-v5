'use client'

import { 
  Paper, 
  Typography, 
  Box, 
  useTheme,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  IconButton
} from '@mui/material'
import { 
  MoreVert as MoreIcon,
  Refresh as RefreshIcon 
} from '@mui/icons-material'
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts'
import { useState, useMemo } from 'react'
import { Stay } from '@/lib/types'
import { format, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths } from 'date-fns'

interface ChartWidgetProps {
  type: 'monthly' | 'countries' | 'visa-usage' | 'travel-pattern'
  stays: Stay[]
  height?: number
  title?: string
}

export default function ChartWidget({ type, stays, height = 240, title }: ChartWidgetProps) {
  const theme = useTheme()
  const [viewType, setViewType] = useState<'bar' | 'line' | 'area'>('bar')
  
  // Process stays data for different chart types
  const chartData = useMemo(() => {
    if (!stays || stays.length === 0) return []
    
    switch (type) {
      case 'monthly': {
        // Get last 6 months of data
        const endDate = new Date()
        const startDate = subMonths(endDate, 5)
        const months = eachMonthOfInterval({ start: startDate, end: endDate })
        
        return months.map(month => {
          const monthStays = stays.filter(stay => {
            const entryDate = new Date(stay.entryDate)
            return entryDate.getMonth() === month.getMonth() && 
                   entryDate.getFullYear() === month.getFullYear()
          })
          
          const days = monthStays.reduce((sum, stay) => {
            const entry = new Date(stay.entryDate)
            const exit = stay.exitDate ? new Date(stay.exitDate) : new Date()
            const monthStart = startOfMonth(month)
            const monthEnd = endOfMonth(month)
            
            // Calculate overlap with the month
            const overlapStart = entry > monthStart ? entry : monthStart
            const overlapEnd = exit < monthEnd ? exit : monthEnd
            
            if (overlapEnd >= overlapStart) {
              const daysInMonth = Math.ceil((overlapEnd.getTime() - overlapStart.getTime()) / (1000 * 60 * 60 * 24)) + 1
              return sum + daysInMonth
            }
            return sum
          }, 0)
          
          return {
            month: format(month, 'MMM'),
            days,
            trips: monthStays.length
          }
        })
      }
      
      case 'countries': {
        // Count days per country
        const countryData = stays.reduce((acc, stay) => {
          const days = stay.exitDate 
            ? Math.ceil((new Date(stay.exitDate).getTime() - new Date(stay.entryDate).getTime()) / (1000 * 60 * 60 * 24)) + 1
            : Math.ceil((new Date().getTime() - new Date(stay.entryDate).getTime()) / (1000 * 60 * 60 * 24)) + 1
          
          if (!acc[stay.countryCode]) {
            acc[stay.countryCode] = { country: stay.countryCode, days: 0, trips: 0 }
          }
          acc[stay.countryCode].days += days
          acc[stay.countryCode].trips += 1
          
          return acc
        }, {} as Record<string, { country: string; days: number; trips: number }>)
        
        return Object.values(countryData).sort((a, b) => b.days - a.days).slice(0, 5)
      }
      
      case 'visa-usage': {
        // Pie chart of visa types used
        const visaTypes = stays.reduce((acc, stay) => {
          const type = stay.visaType || 'visa-free'
          if (!acc[type]) {
            acc[type] = { name: type.replace(/-/g, ' '), value: 0 }
          }
          acc[type].value += 1
          return acc
        }, {} as Record<string, { name: string; value: number }>)
        
        return Object.values(visaTypes)
      }
      
      default:
        return []
    }
  }, [type, stays])
  
  // Chart colors from Material Design palette
  const COLORS = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.error.main,
    theme.palette.info.main
  ]
  
  const renderChart = () => {
    if (chartData.length === 0) {
      return (
        <Box sx={{ 
          height: height - 64, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}>
          <Typography color="text.secondary">No data available</Typography>
        </Box>
      )
    }
    
    switch (type) {
      case 'monthly':
        if (viewType === 'line') {
          return (
            <ResponsiveContainer width="100%" height={height - 64}>
              <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                <XAxis 
                  dataKey="month" 
                  stroke={theme.palette.text.secondary}
                  style={{ fontSize: 12 }}
                />
                <YAxis 
                  stroke={theme.palette.text.secondary}
                  style={{ fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: theme.palette.background.paper,
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 4
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="days" 
                  stroke={theme.palette.primary.main} 
                  strokeWidth={2}
                  dot={{ fill: theme.palette.primary.main }}
                />
                <Line 
                  type="monotone" 
                  dataKey="trips" 
                  stroke={theme.palette.secondary.main} 
                  strokeWidth={2}
                  dot={{ fill: theme.palette.secondary.main }}
                />
              </LineChart>
            </ResponsiveContainer>
          )
        } else if (viewType === 'area') {
          return (
            <ResponsiveContainer width="100%" height={height - 64}>
              <AreaChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                <XAxis 
                  dataKey="month" 
                  stroke={theme.palette.text.secondary}
                  style={{ fontSize: 12 }}
                />
                <YAxis 
                  stroke={theme.palette.text.secondary}
                  style={{ fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: theme.palette.background.paper,
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 4
                  }}
                />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="days" 
                  stackId="1"
                  stroke={theme.palette.primary.main} 
                  fill={theme.palette.primary.light}
                />
              </AreaChart>
            </ResponsiveContainer>
          )
        } else {
          return (
            <ResponsiveContainer width="100%" height={height - 64}>
              <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                <XAxis 
                  dataKey="month" 
                  stroke={theme.palette.text.secondary}
                  style={{ fontSize: 12 }}
                />
                <YAxis 
                  stroke={theme.palette.text.secondary}
                  style={{ fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: theme.palette.background.paper,
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 4
                  }}
                />
                <Legend />
                <Bar dataKey="days" fill={theme.palette.primary.main} />
                <Bar dataKey="trips" fill={theme.palette.secondary.main} />
              </BarChart>
            </ResponsiveContainer>
          )
        }
        
      case 'countries':
        return (
          <ResponsiveContainer width="100%" height={height - 64}>
            <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
              <XAxis 
                dataKey="country" 
                stroke={theme.palette.text.secondary}
                style={{ fontSize: 12 }}
              />
              <YAxis 
                stroke={theme.palette.text.secondary}
                style={{ fontSize: 12 }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: theme.palette.background.paper,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 4
                }}
              />
              <Bar dataKey="days" fill={theme.palette.primary.main}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )
        
      case 'visa-usage':
        return (
          <ResponsiveContainer width="100%" height={height - 64}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent ? (percent * 100).toFixed(0) : 0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: theme.palette.background.paper,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 4
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        )
        
      default:
        return null
    }
  }
  
  return (
    <Paper sx={{ height: '100%', p: 2, display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 500, fontSize: '1rem' }}>
          {title || 'Chart'}
        </Typography>
        
        <Stack direction="row" spacing={1} alignItems="center">
          {type === 'monthly' && (
            <ToggleButtonGroup
              value={viewType}
              exclusive
              onChange={(e, value) => value && setViewType(value)}
              size="small"
              sx={{
                '& .MuiToggleButton-root': {
                  px: 1,
                  py: 0.5,
                  fontSize: '0.75rem'
                }
              }}
            >
              <ToggleButton value="bar">Bar</ToggleButton>
              <ToggleButton value="line">Line</ToggleButton>
              <ToggleButton value="area">Area</ToggleButton>
            </ToggleButtonGroup>
          )}
          
          <IconButton size="small">
            <RefreshIcon fontSize="small" />
          </IconButton>
          
          <IconButton size="small">
            <MoreIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Stack>
      
      {/* Chart */}
      <Box sx={{ flex: 1, minHeight: 0 }}>
        {renderChart()}
      </Box>
    </Paper>
  )
}