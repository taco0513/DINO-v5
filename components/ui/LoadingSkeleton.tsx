import { Box, Skeleton, Stack, Paper } from '@mui/material'

interface LoadingSkeletonProps {
  variant?: 'dashboard' | 'list' | 'card' | 'table'
  count?: number
}

export default function LoadingSkeleton({ variant = 'list', count = 3 }: LoadingSkeletonProps) {
  if (variant === 'dashboard') {
    return (
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 2 }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Paper key={i} sx={{ p: 3 }}>
            <Skeleton variant="text" width="60%" height={24} sx={{ mb: 1 }} />
            <Skeleton variant="rectangular" height={60} />
            <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
              <Skeleton variant="circular" width={40} height={40} />
              <Box sx={{ flexGrow: 1 }}>
                <Skeleton variant="text" width="80%" />
                <Skeleton variant="text" width="60%" />
              </Box>
            </Stack>
          </Paper>
        ))}
      </Box>
    )
  }

  if (variant === 'card') {
    return (
      <Stack spacing={2}>
        {Array.from({ length: count }).map((_, i) => (
          <Paper key={i} sx={{ p: 2 }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Skeleton variant="circular" width={48} height={48} />
              <Box sx={{ flexGrow: 1 }}>
                <Skeleton variant="text" width="40%" height={24} />
                <Skeleton variant="text" width="60%" height={20} />
              </Box>
              <Skeleton variant="rectangular" width={80} height={36} />
            </Stack>
          </Paper>
        ))}
      </Stack>
    )
  }

  if (variant === 'table') {
    return (
      <Paper sx={{ p: 2 }}>
        <Skeleton variant="text" width="30%" height={32} sx={{ mb: 2 }} />
        <Box>
          {Array.from({ length: count }).map((_, i) => (
            <Stack key={i} direction="row" spacing={2} sx={{ mb: 1.5, alignItems: 'center' }}>
              <Skeleton variant="circular" width={40} height={40} />
              <Skeleton variant="text" width="25%" height={20} />
              <Skeleton variant="text" width="20%" height={20} />
              <Skeleton variant="text" width="15%" height={20} />
              <Box sx={{ flexGrow: 1 }} />
              <Skeleton variant="rectangular" width={60} height={30} />
            </Stack>
          ))}
        </Box>
      </Paper>
    )
  }

  // Default list variant
  return (
    <Stack spacing={1}>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} variant="rectangular" height={80} sx={{ borderRadius: 1 }} />
      ))}
    </Stack>
  )
}