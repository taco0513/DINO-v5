// Dashboard module types for Material Design 2 modular dashboard

export type WidgetType = 'kpi' | 'chart' | 'table' | 'map' | 'timeline' | 'list' | 'calendar'

export interface DashboardWidget {
  id: string
  type: WidgetType
  title: string
  // Grid layout properties
  x: number
  y: number
  w: number // width in grid columns (1-12)
  h: number // height in grid rows
  minW?: number
  maxW?: number
  minH?: number
  maxH?: number
  static?: boolean // prevent dragging
  isDraggable?: boolean
  isResizable?: boolean
  // Widget specific config
  config?: Record<string, any>
}

export interface DashboardLayout {
  id: string
  name: string
  widgets: DashboardWidget[]
  breakpoints?: {
    lg?: number
    md?: number
    sm?: number
    xs?: number
  }
  cols?: {
    lg?: number
    md?: number
    sm?: number
    xs?: number
  }
  rowHeight?: number
  createdAt?: Date
  updatedAt?: Date
}

// KPI Card data structure
export interface KPIData {
  label: string
  value: string | number
  change?: number // percentage change
  changeLabel?: string
  icon?: React.ReactNode
  color?: 'primary' | 'success' | 'warning' | 'error' | 'info'
}

// Chart data structure
export interface ChartData {
  type: 'line' | 'bar' | 'pie' | 'donut' | 'area'
  data: any[] // Chart.js data format
  options?: any // Chart.js options
}

// Default dashboard layouts
export const DEFAULT_BREAKPOINTS = { lg: 1200, md: 996, sm: 768, xs: 480 }
export const DEFAULT_COLS = { lg: 12, md: 8, sm: 6, xs: 4 }
export const DEFAULT_ROW_HEIGHT = 60 // Based on 8dp grid (60px ≈ 7.5 * 8dp)

// Default widgets for DINO dashboard
export const DEFAULT_WIDGETS: DashboardWidget[] = [
  // KPI Cards (top row, 4 cards)
  {
    id: 'kpi-total-days',
    type: 'kpi',
    title: 'Total Travel Days',
    x: 0,
    y: 0,
    w: 3,
    h: 2,
    minW: 2,
    minH: 2
  },
  {
    id: 'kpi-countries',
    type: 'kpi',
    title: 'Countries Visited',
    x: 3,
    y: 0,
    w: 3,
    h: 2,
    minW: 2,
    minH: 2
  },
  {
    id: 'kpi-visa-days',
    type: 'kpi',
    title: 'Visa Days Remaining',
    x: 6,
    y: 0,
    w: 3,
    h: 2,
    minW: 2,
    minH: 2
  },
  {
    id: 'kpi-next-trip',
    type: 'kpi',
    title: 'Next Trip',
    x: 9,
    y: 0,
    w: 3,
    h: 2,
    minW: 2,
    minH: 2
  },
  // Chart widgets (middle section)
  {
    id: 'chart-monthly',
    type: 'chart',
    title: 'Monthly Travel Stats',
    x: 0,
    y: 2,
    w: 6,
    h: 4,
    minW: 3,
    minH: 3
  },
  {
    id: 'map-travel',
    type: 'map',
    title: 'Travel Map',
    x: 6,
    y: 2,
    w: 6,
    h: 4,
    minW: 3,
    minH: 3
  },
  // Table/List (bottom section)
  {
    id: 'table-recent',
    type: 'table',
    title: 'Recent Stays',
    x: 0,
    y: 6,
    w: 12,
    h: 4,
    minW: 4,
    minH: 3
  }
]