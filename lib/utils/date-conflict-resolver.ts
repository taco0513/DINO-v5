/**
 * Improved Date Conflict Resolution System
 * Fixed logic to properly handle overlapping travel dates
 */

import { Stay } from '../types'

export interface DateConflict {
  type: 'overlap' | 'impossible' | 'sequence'
  stays: Stay[]
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  suggestedResolution: string
}

export interface ResolvedStay extends Stay {
  originalExitDate?: string
  autoResolved?: boolean
  resolutionReason?: string
}

/**
 * Detect date conflicts in stay records
 */
export function detectDateConflicts(stays: Stay[]): DateConflict[] {
  const conflicts: DateConflict[] = []
  const sortedStays = [...stays].sort((a, b) => 
    new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime()
  )

  // Check each pair of stays for conflicts
  for (let i = 0; i < sortedStays.length - 1; i++) {
    for (let j = i + 1; j < sortedStays.length; j++) {
      const stay1 = sortedStays[i]
      const stay2 = sortedStays[j]
      
      const conflict = checkStayConflict(stay1, stay2)
      if (conflict) {
        conflicts.push(conflict)
      }
    }
  }

  return conflicts
}

/**
 * Check if two stays conflict with each other
 */
function checkStayConflict(stay1: Stay, stay2: Stay): DateConflict | null {
  const entry1 = new Date(stay1.entryDate)
  const entry2 = new Date(stay2.entryDate)
  
  const exit1 = stay1.exitDate ? new Date(stay1.exitDate) : new Date()
  const exit2 = stay2.exitDate ? new Date(stay2.exitDate) : new Date()

  // Check for temporal overlap (inclusive)
  // Note: For same-day travel, entry2 can equal exit1 (travel day)
  const hasOverlap = (entry1 < exit2 && entry2 < exit1) || 
                     (!stay1.exitDate && entry2 >= entry1) || 
                     (!stay2.exitDate && entry1 >= entry2)
  
  if (!hasOverlap) return null

  // Determine conflict type and severity
  const isOngoing1 = !stay1.exitDate
  const isOngoing2 = !stay2.exitDate
  const sameCountry = stay1.countryCode === stay2.countryCode

  // Critical: Multiple ongoing stays (physically impossible)
  if (isOngoing1 && isOngoing2) {
    return {
      type: 'impossible',
      stays: [stay1, stay2],
      severity: 'critical',
      description: 'Multiple ongoing stays detected',
      suggestedResolution: 'End the earlier stay on the travel day (same day as next country entry)'
    }
  }

  // High: Same country duplicate entries
  if (sameCountry && Math.abs(entry1.getTime() - entry2.getTime()) < 7 * 24 * 60 * 60 * 1000) { // Within 7 days
    return {
      type: 'overlap',
      stays: [stay1, stay2],
      severity: 'high',
      description: 'Duplicate stays in same country',
      suggestedResolution: 'Merge duplicate entries'
    }
  }

  // Medium: Travel sequence needs adjustment
  if (!sameCountry) {
    return {
      type: 'sequence',
      stays: [stay1, stay2],
      severity: 'medium',
      description: 'Travel sequence with overlapping dates',
      suggestedResolution: 'Set exit date to match travel day (same day as next country entry)'
    }
  }

  // Low: Minor overlap
  return {
    type: 'overlap',
    stays: [stay1, stay2],
    severity: 'low',
    description: 'Minor date overlap detected',
    suggestedResolution: 'Review and adjust dates for accuracy'
  }
}

/**
 * Automatically resolve date conflicts using improved logic
 */
export function autoResolveConflicts(stays: Stay[]): ResolvedStay[] {
  if (stays.length === 0) return []
  
  let resolvedStays = [...stays] as ResolvedStay[]
  let iteration = 0
  const maxIterations = 5

  while (iteration < maxIterations) {
    const conflicts = detectDateConflicts(resolvedStays)
    if (conflicts.length === 0) break

    // Process highest severity conflict first
    const sortedConflicts = conflicts.sort((a, b) => {
      const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
      return severityOrder[b.severity] - severityOrder[a.severity]
    })

    const conflict = sortedConflicts[0]
    resolvedStays = processConflict(resolvedStays, conflict)
    
    iteration++
  }

  return resolvedStays
}

/**
 * Process a single conflict and return updated stays
 */
function processConflict(stays: ResolvedStay[], conflict: DateConflict): ResolvedStay[] {
  switch (conflict.type) {
    case 'impossible':
      return resolveImpossibleConflict(stays, conflict)
    case 'overlap':
      return resolveOverlapConflict(stays, conflict)
    case 'sequence':
      return resolveSequenceConflict(stays, conflict)
    default:
      return stays
  }
}

/**
 * Resolve impossible conflicts (multiple ongoing stays)
 */
function resolveImpossibleConflict(stays: ResolvedStay[], conflict: DateConflict): ResolvedStay[] {
  const [earlier, later] = conflict.stays.sort((a, b) => 
    new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime()
  )

  return stays.map(stay => {
    if (stay.id === earlier.id) {
      // End earlier stay on the same day as later begins (travel day)
      const laterEntry = new Date(later.entryDate)
      const exitDate = laterEntry

      return {
        ...stay,
        originalExitDate: stay.exitDate,
        exitDate: exitDate.toISOString().split('T')[0],
        autoResolved: true,
        resolutionReason: `Travel to ${later.countryCode} on ${exitDate.toISOString().split('T')[0]}`
      }
    }
    return stay
  })
}

/**
 * Resolve overlap conflicts (same country duplicates)
 */
function resolveOverlapConflict(stays: ResolvedStay[], conflict: DateConflict): ResolvedStay[] {
  const [stay1, stay2] = conflict.stays

  // If same country, merge them
  if (stay1.countryCode === stay2.countryCode) {
    const earlierStay = new Date(stay1.entryDate) <= new Date(stay2.entryDate) ? stay1 : stay2
    const laterStay = earlierStay === stay1 ? stay2 : stay1
    
    // Keep the stay with more information
    const keepStay = (stay1.notes || stay1.entryCity || stay1.exitCity) ? stay1 : stay2
    const removeStay = keepStay === stay1 ? stay2 : stay1

    return stays
      .filter(stay => stay.id !== removeStay.id)
      .map(stay => {
        if (stay.id === keepStay.id) {
          return {
            ...stay,
            entryDate: earlierStay.entryDate,
            exitDate: laterStay.exitDate || stay.exitDate,
            notes: [earlierStay.notes, laterStay.notes].filter(Boolean).join(' | '),
            autoResolved: true,
            resolutionReason: 'Merged duplicate stays'
          }
        }
        return stay
      })
  }
  
  // Different countries - treat as sequence
  return resolveSequenceConflict(stays, conflict)
}

/**
 * Resolve sequence conflicts (travel between countries)
 */
function resolveSequenceConflict(stays: ResolvedStay[], conflict: DateConflict): ResolvedStay[] {
  const [earlier, later] = conflict.stays.sort((a, b) => 
    new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime()
  )

  return stays.map(stay => {
    if (stay.id === earlier.id) {
      const shouldAdjust = !stay.exitDate || 
        (stay.exitDate && new Date(stay.exitDate) >= new Date(later.entryDate))

      if (shouldAdjust) {
        const laterEntry = new Date(later.entryDate)
        const exitDate = laterEntry // Exit on the same day as entry to next country

        return {
          ...stay,
          originalExitDate: stay.exitDate,
          exitDate: exitDate.toISOString().split('T')[0],
          autoResolved: true,
          resolutionReason: `Travel to ${later.countryCode} on ${exitDate.toISOString().split('T')[0]}`
        }
      }
    }
    return stay
  })
}

/**
 * Generate human-readable conflict summary
 */
export function generateConflictSummary(conflicts: DateConflict[]): string {
  if (conflicts.length === 0) {
    return 'No date conflicts detected ✅'
  }

  const counts = {
    critical: conflicts.filter(c => c.severity === 'critical').length,
    high: conflicts.filter(c => c.severity === 'high').length,
    medium: conflicts.filter(c => c.severity === 'medium').length,
    low: conflicts.filter(c => c.severity === 'low').length
  }

  const parts = []
  if (counts.critical > 0) parts.push(`${counts.critical} critical`)
  if (counts.high > 0) parts.push(`${counts.high} high`)
  if (counts.medium > 0) parts.push(`${counts.medium} medium`)
  if (counts.low > 0) parts.push(`${counts.low} low`)

  return `Found ${conflicts.length} conflict(s): ${parts.join(', ')}`
}

/**
 * Validate resolved stays for remaining conflicts
 */
export function validateResolution(resolvedStays: ResolvedStay[]): {
  isValid: boolean
  remainingConflicts: DateConflict[]
  summary: string
} {
  const remainingConflicts = detectDateConflicts(resolvedStays)
  const criticalConflicts = remainingConflicts.filter(c => c.severity === 'critical')
  
  return {
    isValid: criticalConflicts.length === 0,
    remainingConflicts,
    summary: generateConflictSummary(remainingConflicts)
  }
}