/**
 * Date Conflict Resolution System
 * Automatically detects and resolves overlapping travel dates
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

  // Check for temporal overlap
  const hasOverlap = (entry1 <= exit2 && entry2 <= exit1)
  
  if (!hasOverlap) return null

  // Determine conflict type and severity
  const isOngoing1 = !stay1.exitDate
  const isOngoing2 = !stay2.exitDate
  const samePeriod = entry1.getTime() === entry2.getTime()
  const sameCountry = stay1.countryCode === stay2.countryCode

  if (isOngoing1 && isOngoing2) {
    return {
      type: 'impossible',
      stays: [stay1, stay2],
      severity: 'critical',
      description: 'Multiple ongoing stays detected - physically impossible',
      suggestedResolution: 'End the earlier stay when the later one begins'
    }
  }

  if (samePeriod && sameCountry) {
    return {
      type: 'overlap',
      stays: [stay1, stay2],
      severity: 'high',
      description: 'Duplicate stays in same country and period',
      suggestedResolution: 'Merge duplicate entries or remove one'
    }
  }

  if (hasOverlap && !sameCountry) {
    return {
      type: 'sequence',
      stays: [stay1, stay2],
      severity: 'medium',
      description: 'Travel between countries without gap',
      suggestedResolution: 'Adjust exit/entry dates to show travel sequence'
    }
  }

  return {
    type: 'overlap',
    stays: [stay1, stay2],
    severity: 'low',
    description: 'Minor date overlap detected',
    suggestedResolution: 'Review and adjust dates for accuracy'
  }
}

/**
 * Automatically resolve date conflicts using intelligent algorithms
 */
export function autoResolveConflicts(stays: Stay[]): ResolvedStay[] {
  if (stays.length === 0) return []
  
  let resolvedStays = [...stays] as ResolvedStay[]
  let iterations = 0
  const maxIterations = 10 // Prevent infinite loops
  
  while (iterations < maxIterations) {
    const conflicts = detectDateConflicts(resolvedStays)
    if (conflicts.length === 0) break
    
    // Process one conflict at a time, highest severity first
    const criticalConflicts = conflicts.filter(c => c.severity === 'critical')
    const highConflicts = conflicts.filter(c => c.severity === 'high')
    const mediumConflicts = conflicts.filter(c => c.severity === 'medium')
    
    const nextConflict = criticalConflicts[0] || highConflicts[0] || mediumConflicts[0] || conflicts[0]
    
    if (nextConflict) {
      resolvedStays = processConflict(resolvedStays, nextConflict)
    }
    
    iterations++
  }

  return resolvedStays
}

/**
 * Process a single conflict and return updated stays
 */
function processConflict(stays: ResolvedStay[], conflict: DateConflict): ResolvedStay[] {
  const updatedStays = [...stays]
  
  switch (conflict.type) {
    case 'impossible':
      return resolveImpossibleConflictNew(updatedStays, conflict)
    case 'overlap':
      return resolveOverlapConflictNew(updatedStays, conflict)
    case 'sequence':
      return resolveSequenceConflictNew(updatedStays, conflict)
    default:
      return updatedStays
  }
}

/**
 * New improved impossible conflict resolution
 */
function resolveImpossibleConflictNew(stays: ResolvedStay[], conflict: DateConflict): ResolvedStay[] {
  const [earlier, later] = conflict.stays.sort((a, b) => 
    new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime()
  )

  return stays.map(stay => {
    if (stay.id === earlier.id) {
      // End the earlier stay one day before the later one begins
      const laterEntryDate = new Date(later.entryDate)
      const adjustedExitDate = new Date(laterEntryDate)
      adjustedExitDate.setDate(adjustedExitDate.getDate() - 1)

      return {
        ...stay,
        originalExitDate: stay.exitDate,
        exitDate: adjustedExitDate.toISOString().split('T')[0],
        autoResolved: true,
        resolutionReason: `Auto-ended to resolve impossible conflict with ${later.countryCode}`
      }
    }
    return stay
  })
}

/**
 * New improved overlap conflict resolution
 */
function resolveOverlapConflictNew(stays: ResolvedStay[], conflict: DateConflict): ResolvedStay[] {
  const [stay1, stay2] = conflict.stays

  // If same country, merge them
  if (stay1.countryCode === stay2.countryCode) {
    const earlierStay = new Date(stay1.entryDate) <= new Date(stay2.entryDate) ? stay1 : stay2
    const laterStay = earlierStay === stay1 ? stay2 : stay1
    
    // Keep the stay with more information (notes, airports, etc.)
    const keepStay = stay1.notes || stay1.entryCity || stay1.exitCity ? stay1 : stay2
    const removeStay = keepStay === stay1 ? stay2 : stay1

    return stays.filter(stay => stay.id !== removeStay.id).map(stay => {
      if (stay.id === keepStay.id) {
        return {
          ...stay,
          entryDate: earlierStay.entryDate, // Use earlier entry date
          exitDate: laterStay.exitDate || stay.exitDate, // Use later exit date or keep current
          notes: [earlierStay.notes, laterStay.notes].filter(Boolean).join(' | '),
          autoResolved: true,
          resolutionReason: 'Merged duplicate stays in same country'
        }
      }
      return stay
    })
  } else {
    // Different countries - treat as sequence conflict
    return resolveSequenceConflictNew(stays, conflict)
  }
}

/**
 * New improved sequence conflict resolution
 */
function resolveSequenceConflictNew(stays: ResolvedStay[], conflict: DateConflict): ResolvedStay[] {
  const [earlier, later] = conflict.stays.sort((a, b) => 
    new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime()
  )

  return stays.map(stay => {
    if (stay.id === earlier.id) {
      // If the earlier stay doesn't have an exit date or overlaps, set it to one day before later entry
      const shouldAdjust = !stay.exitDate || 
        (stay.exitDate && new Date(stay.exitDate) >= new Date(later.entryDate))

      if (shouldAdjust) {
        const laterEntryDate = new Date(later.entryDate)
        const adjustedExitDate = new Date(laterEntryDate)
        adjustedExitDate.setDate(adjustedExitDate.getDate() - 1)

        return {
          ...stay,
          originalExitDate: stay.exitDate,
          exitDate: adjustedExitDate.toISOString().split('T')[0],
          autoResolved: true,
          resolutionReason: `Auto-adjusted exit date for travel sequence to ${later.countryCode}`
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

  const criticalCount = conflicts.filter(c => c.severity === 'critical').length
  const highCount = conflicts.filter(c => c.severity === 'high').length
  const mediumCount = conflicts.filter(c => c.severity === 'medium').length
  const lowCount = conflicts.filter(c => c.severity === 'low').length

  let summary = `Found ${conflicts.length} conflict(s): `
  const parts = []
  
  if (criticalCount > 0) parts.push(`${criticalCount} critical`)
  if (highCount > 0) parts.push(`${highCount} high`)
  if (mediumCount > 0) parts.push(`${mediumCount} medium`) 
  if (lowCount > 0) parts.push(`${lowCount} low`)

  return summary + parts.join(', ')
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

/**
 * Get suggestions for manual conflict resolution
 */
export function getManualResolutionSuggestions(conflicts: DateConflict[]): string[] {
  const suggestions: string[] = []

  for (const conflict of conflicts) {
    const stayDescriptions = conflict.stays.map(stay => 
      `${stay.countryCode} (${stay.entryDate}${stay.exitDate ? ` → ${stay.exitDate}` : ' → ongoing'})`
    ).join(' vs ')

    suggestions.push(`${conflict.severity.toUpperCase()}: ${stayDescriptions} - ${conflict.suggestedResolution}`)
  }

  return suggestions
}