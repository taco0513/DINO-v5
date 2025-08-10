'use client'

import { 
  Paper, 
  Typography, 
  Box, 
  useTheme,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  TablePagination
} from '@mui/material'
import { 
  MoreVert as MoreIcon,
  FlightTakeoff as DepartureIcon,
  FlightLand as ArrivalIcon
} from '@mui/icons-material'
import { Stay } from '@/lib/types'
import { countries } from '@/lib/data/countries-and-airports'
import { format } from 'date-fns'
import { useState, useMemo } from 'react'

interface TableWidgetProps {
  stays: Stay[]
  height?: number
  title?: string
}

export default function TableWidget({ stays, height = 320, title }: TableWidgetProps) {
  const theme = useTheme()
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(5)
  
  // Sort stays by entry date (most recent first)
  const sortedStays = useMemo(() => {
    return [...stays].sort((a, b) => 
      new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime()
    )
  }, [stays])
  
  // Paginated stays
  const paginatedStays = useMemo(() => {
    return sortedStays.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
  }, [sortedStays, page, rowsPerPage])
  
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage)
  }
  
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }
  
  const getCountryName = (code: string) => {
    const country = countries.find(c => c.code === code)
    return country ? `${country.flag} ${country.name}` : code
  }
  
  const calculateDuration = (stay: Stay) => {
    if (!stay.entryDate) return 0
    
    const entry = new Date(stay.entryDate)
    if (isNaN(entry.getTime())) return 0
    
    const exit = stay.exitDate ? new Date(stay.exitDate) : new Date()
    if (isNaN(exit.getTime())) return 0
    
    const days = Math.ceil((exit.getTime() - entry.getTime()) / (1000 * 60 * 60 * 24)) + 1
    return Math.max(0, days) // Ensure non-negative
  }
  
  const getVisaTypeColor = (type?: string): "default" | "primary" | "secondary" | "success" | "warning" => {
    switch (type) {
      case 'visa-free': return 'success'
      case 'e-visa': return 'primary'
      case 'visa-on-arrival': return 'warning'
      case 'tourist-visa': return 'secondary'
      case 'long-term-resident': return 'primary'
      default: return 'default'
    }
  }
  
  return (
    <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ p: 2, pb: 0 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h6" sx={{ fontWeight: 500, fontSize: '1rem' }}>
            {title || 'Recent Stays'}
          </Typography>
          
          <IconButton size="small">
            <MoreIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Box>
      
      {/* Table */}
      <TableContainer sx={{ flex: 1, minHeight: 0 }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Destination</TableCell>
              <TableCell>From</TableCell>
              <TableCell>Entry</TableCell>
              <TableCell>Exit</TableCell>
              <TableCell align="center">Days</TableCell>
              <TableCell>Visa</TableCell>
              <TableCell align="center">Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedStays.length > 0 ? (
              paginatedStays.map((stay, index) => {
                const isOngoing = !stay.exitDate
                const duration = calculateDuration(stay)
                
                return (
                  <TableRow 
                    key={index}
                    sx={{ 
                      '&:last-child td, &:last-child th': { border: 0 },
                      backgroundColor: isOngoing ? `${theme.palette.primary.main}08` : 'transparent'
                    }}
                  >
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        {stay.entryCity && (
                          <ArrivalIcon sx={{ fontSize: 14, color: theme.palette.text.secondary }} />
                        )}
                        <Typography variant="body2">
                          {getCountryName(stay.countryCode)}
                        </Typography>
                        {stay.entryCity && (
                          <Typography variant="caption" color="text.secondary">
                            ({stay.entryCity})
                          </Typography>
                        )}
                      </Stack>
                    </TableCell>
                    <TableCell>
                      {stay.fromCountry ? (
                        <Stack direction="row" spacing={1} alignItems="center">
                          <DepartureIcon sx={{ fontSize: 14, color: theme.palette.text.secondary }} />
                          <Typography variant="body2">
                            {getCountryName(stay.fromCountry)}
                          </Typography>
                        </Stack>
                      ) : (
                        <Typography variant="body2" color="text.secondary">—</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {stay.entryDate && !isNaN(new Date(stay.entryDate).getTime())
                          ? format(new Date(stay.entryDate), 'MMM d, yyyy')
                          : '—'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {stay.exitDate && !isNaN(new Date(stay.exitDate).getTime()) ? (
                        <Typography variant="body2">
                          {format(new Date(stay.exitDate), 'MMM d, yyyy')}
                        </Typography>
                      ) : (
                        <Typography variant="body2" color="text.secondary">Ongoing</Typography>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {duration > 0 ? duration : '—'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {stay.visaType && (
                        <Chip
                          label={stay.visaType.replace(/-/g, ' ')}
                          size="small"
                          color={getVisaTypeColor(stay.visaType)}
                          sx={{ 
                            height: 20,
                            fontSize: '0.7rem',
                            textTransform: 'capitalize'
                          }}
                        />
                      )}
                    </TableCell>
                    <TableCell align="center">
                      {isOngoing ? (
                        <Chip
                          label="Current"
                          size="small"
                          color="primary"
                          variant="filled"
                          sx={{ 
                            height: 20,
                            fontSize: '0.7rem',
                            fontWeight: 600
                          }}
                        />
                      ) : (
                        <Chip
                          label="Complete"
                          size="small"
                          variant="outlined"
                          sx={{ 
                            height: 20,
                            fontSize: '0.7rem'
                          }}
                        />
                      )}
                    </TableCell>
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                    No travel records yet
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      {/* Pagination */}
      {stays.length > 0 && (
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={sortedStays.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{ borderTop: `1px solid ${theme.palette.divider}` }}
        />
      )}
    </Paper>
  )
}