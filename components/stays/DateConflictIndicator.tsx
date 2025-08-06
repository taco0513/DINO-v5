'use client'

import { useState, useMemo } from 'react'
import {
  Button,
  Badge,
  Tooltip,
  IconButton
} from '@mui/material'
import {
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Build as BuildIcon
} from '@mui/icons-material'
import { detectDateConflicts } from '@/lib/utils/date-conflict-resolver'
import { Stay, Country } from '@/lib/types'
import ConflictResolver from './ConflictResolver'

interface DateConflictIndicatorProps {
  stays: Stay[]
  countries: Country[]
  onResolved: (resolvedStays: any[]) => void
}

export default function DateConflictIndicator({ stays, countries, onResolved }: DateConflictIndicatorProps) {
  const [showResolver, setShowResolver] = useState(false)

  const conflicts = useMemo(() => {
    return detectDateConflicts(stays)
  }, [stays])

  const criticalConflicts = conflicts.filter(c => c.severity === 'critical')
  const hasConflicts = conflicts.length > 0
  const hasCriticalConflicts = criticalConflicts.length > 0

  if (!hasConflicts) {
    return (
      <Tooltip title="No date conflicts detected">
        <IconButton size="small" disabled>
          <CheckIcon color="success" fontSize="small" />
        </IconButton>
      </Tooltip>
    )
  }

  return (
    <>
      <Tooltip 
        title={
          hasCriticalConflicts 
            ? `${criticalConflicts.length} critical date conflicts` 
            : `${conflicts.length} date conflicts detected`
        }
      >
        <Badge 
          badgeContent={conflicts.length} 
          color={hasCriticalConflicts ? "error" : "warning"}
          max={99}
        >
          <Button
            variant="outlined"
            size="small"
            startIcon={hasCriticalConflicts ? <WarningIcon /> : <BuildIcon />}
            onClick={() => setShowResolver(true)}
            color={hasCriticalConflicts ? "error" : "warning"}
            sx={{
              textTransform: 'none',
              fontSize: '0.75rem',
              py: 0.5,
              px: 1.5
            }}
          >
            Fix Conflicts
          </Button>
        </Badge>
      </Tooltip>

      <ConflictResolver
        open={showResolver}
        onClose={() => setShowResolver(false)}
        stays={stays}
        countries={countries}
        onResolved={onResolved}
      />
    </>
  )
}