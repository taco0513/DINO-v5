import { Box, Typography, Button, SvgIcon } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff'
import EventNoteIcon from '@mui/icons-material/EventNote'

interface EmptyStateProps {
  variant?: 'no-stays' | 'no-data' | 'no-results'
  onAction?: () => void
  actionLabel?: string
}

export default function EmptyState({ 
  variant = 'no-data', 
  onAction,
  actionLabel = 'Get Started'
}: EmptyStateProps) {
  const configs = {
    'no-stays': {
      icon: <FlightTakeoffIcon sx={{ fontSize: 64 }} />,
      title: 'No travel records yet',
      description: 'Start tracking your travels by adding your first stay',
      actionLabel: 'Add Your First Stay'
    },
    'no-data': {
      icon: <EventNoteIcon sx={{ fontSize: 64 }} />,
      title: 'No data available',
      description: 'There\'s nothing to show here yet',
      actionLabel: actionLabel
    },
    'no-results': {
      icon: <EventNoteIcon sx={{ fontSize: 64 }} />,
      title: 'No results found',
      description: 'Try adjusting your filters or search criteria',
      actionLabel: 'Clear Filters'
    }
  }

  const config = configs[variant]

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 8,
        px: 3,
        textAlign: 'center'
      }}
    >
      <Box
        sx={{
          color: 'text.disabled',
          mb: 3
        }}
      >
        {config.icon}
      </Box>
      <Typography 
        variant="h6" 
        gutterBottom
        sx={{ fontWeight: 500 }}
      >
        {config.title}
      </Typography>
      <Typography 
        variant="body2" 
        color="text.secondary"
        sx={{ mb: 3, maxWidth: 400 }}
      >
        {config.description}
      </Typography>
      {onAction && (
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onAction}
          sx={{ textTransform: 'none' }}
        >
          {config.actionLabel}
        </Button>
      )}
    </Box>
  )
}