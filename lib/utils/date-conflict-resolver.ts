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
  const conflicts = detectDateConflicts(stays)
  const resolvedStays = [...stays] as ResolvedStay[]

  // Sort conflicts by severity (critical first)
  const sortedConflicts = conflicts.sort((a, b) => {
    const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
    return severityOrder[b.severity] - severityOrder[a.severity]
  })

  for (const conflict of sortedConflicts) {
    switch (conflict.type) {
      case 'impossible':
        resolveImpossibleConflict(resolvedStays, conflict)
        break
      case 'overlap':
        resolveOverlapConflict(resolvedStays, conflict)
        break
      case 'sequence':
        resolveSequenceConflict(resolvedStays, conflict)
        break
    }
  }

  return resolvedStays
}

/**
 * Resolve impossible conflicts (multiple ongoing stays)
 */
function resolveImpossibleConflict(stays: ResolvedStay[], conflict: DateConflict) {
  const [earlier, later] = conflict.stays.sort((a, b) => 
    new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime()
  )

  // Find the stays in the resolved array
  const earlierIndex = stays.findIndex(s => s.id === earlier.id)
  const laterIndex = stays.findIndex(s => s.id === later.id)

  if (earlierIndex !== -1 && laterIndex !== -1) {
    // End the earlier stay one day before the later one begins
    const laterEntryDate = new Date(later.entryDate)
    const adjustedExitDate = new Date(laterEntryDate)
    adjustedExitDate.setDate(adjustedExitDate.getDate() - 1)

    stays[earlierIndex] = {
      ...stays[earlierIndex],
      originalExitDate: stays[earlierIndex].exitDate,
      exitDate: adjustedExitDate.toISOString().split('T')[0],
      autoResolved: true,
      resolutionReason: `Automatically ended stay to resolve conflict with ${later.countryCode} trip`
    }
  }
}

/**
 * Resolve overlap conflicts
 */
function resolveOverlapConflict(stays: ResolvedStay[], conflict: DateConflict) {
  const [stay1, stay2] = conflict.stays

  // If same country and similar dates, merge them
  if (stay1.countryCode === stay2.countryCode) {
    const earlierIndex = stays.findIndex(s => s.id === stay1.id)
    const laterIndex = stays.findIndex(s => s.id === stay2.id)

    if (earlierIndex !== -1 && laterIndex !== -1) {
      // Keep the longer/more complete record
      const keepIndex = stay1.notes ? earlierIndex : laterIndex
      const removeIndex = keepIndex === earlierIndex ? laterIndex : earlierIndex

      // Merge data from both stays
      const earlierStay = new Date(stay1.entryDate) <= new Date(stay2.entryDate) ? stay1 : stay2
      const laterStay = earlierStay === stay1 ? stay2 : stay1

      stays[keepIndex] = {
        ...stays[keepIndex],
        entryDate: earlierStay.entryDate,
        exitDate: laterStay.exitDate || stays[keepIndex].exitDate,
        notes: [earlierStay.notes, laterStay.notes].filter(Boolean).join(' | '),
        autoResolved: true,
        resolutionReason: 'Merged duplicate stays in same country'
      }

      // Mark the other stay for removal
      stays.splice(removeIndex, 1)
    }
  }
}

/**
 * Resolve sequence conflicts (travel between countries)
 */
function resolveSequenceConflict(stays: ResolvedStay[], conflict: DateConflict) {
  const [earlier, later] = conflict.stays.sort((a, b) => 
    new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime()
  )

  const earlierIndex = stays.findIndex(s => s.id === earlier.id)
  const laterIndex = stays.findIndex(s => s.id === later.id)

  if (earlierIndex !== -1 && laterIndex !== -1) {
    // If the earlier stay doesn't have an exit date, set it to the day before later entry
    if (!stays[earlierIndex].exitDate) {
      const laterEntryDate = new Date(later.entryDate)
      const adjustedExitDate = new Date(laterEntryDate)
      adjustedExitDate.setDate(adjustedExitDate.getDate() - 1)

      stays[earlierIndex] = {
        ...stays[earlierIndex],
        originalExitDate: undefined,
        exitDate: adjustedExitDate.toISOString().split('T')[0],
        autoResolved: true,
        resolutionReason: `Automatically set exit date based on travel to ${later.countryCode}`
      }
    }
  }
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