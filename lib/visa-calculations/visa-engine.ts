// Comprehensive visa calculation engine
import { Stay, isOngoingStay, calculateStayDuration, getTodayUTC } from '@/lib/types'
import { getVisaRules, type VisaRule } from '@/lib/visa-rules/nationality-rules'

export interface VisaStatus {
  countryCode: string
  nationality: string
  rule: VisaRule | null
  daysUsed: number
  daysRemaining: number
  totalAllowedDays: number
  status: 'safe' | 'warning' | 'critical' | 'exceeded'
  warningMessage?: string
  ongoingStays: Stay[]
  relevantStays: Stay[]
  nextResetDate?: Date
}

export interface VisaCalculationContext {
  nationality: string
  referenceDate?: Date // Default to today
  lookbackDays?: number // Default to 365 days
  userEmail?: string // For user-specific rules
}

// Calculate visa status for a specific country
export function calculateVisaStatus(
  countryCode: string, 
  stays: Stay[], 
  context: VisaCalculationContext,
  visaType?: string
): VisaStatus {
  const { nationality, referenceDate = new Date(), lookbackDays = 365, userEmail } = context
  const rule = getVisaRules(nationality, countryCode, visaType, userEmail)
  
  if (!rule) {
    return {
      countryCode,
      nationality,
      rule: null,
      daysUsed: 0,
      daysRemaining: 0,
      totalAllowedDays: 0,
      status: 'safe',
      warningMessage: `No visa rules found for ${nationality} → ${countryCode}`,
      ongoingStays: [],
      relevantStays: []
    }
  }

  // Filter relevant stays for this country
  const countryStays = stays.filter(stay => stay.countryCode === countryCode)
  const ongoingStays = countryStays.filter(isOngoingStay)
  
  let relevantStays: Stay[]
  let daysUsed: number
  let nextResetDate: Date | undefined

  if (rule.resetType === 'exit') {
    // Simple reset: only count stays since last exit from a different visit
    const lastExitBeforeNewEntry = getLastExitBeforeNewEntry(countryStays)
    if (lastExitBeforeNewEntry) {
      relevantStays = countryStays.filter(stay => {
        try {
          const entryDate = parseUTCDate(stay.entryDate)
          return entryDate && entryDate > lastExitBeforeNewEntry
        } catch (error) {
          console.error('Error filtering stays for exit reset:', error, stay)
          return false
        }
      })
    } else {
      // No qualifying exit found, count all stays as one session
      relevantStays = countryStays
    }
    daysUsed = relevantStays.reduce((total, stay) => 
      total + calculateStayDuration(stay, referenceDate), 0
    )
  } else {
    // Rolling window: count stays within the rolling period
    const windowStartDate = new Date(referenceDate)
    windowStartDate.setDate(windowStartDate.getDate() - rule.periodDays + 1) // Adjusted for inclusive calculation
    
    relevantStays = countryStays.filter(stay => {
      try {
        const entryDate = parseUTCDate(stay.entryDate)
        if (!entryDate) return false

        let exitDate: Date
        if (stay.exitDate && stay.exitDate.trim() !== '') {
          const parsed = parseUTCDate(stay.exitDate)
          if (!parsed) return false
          exitDate = parsed
        } else {
          // For ongoing stays, use reference date
          exitDate = referenceDate
        }

        // Include stays that overlap with the rolling window
        return exitDate >= windowStartDate && entryDate <= referenceDate
      } catch (error) {
        console.error('Error filtering stays for rolling window:', error, stay)
        return false
      }
    })
    
    daysUsed = calculateRollingWindowDays(relevantStays, windowStartDate, referenceDate)
    nextResetDate = calculateNextRollingReset(relevantStays, rule.periodDays)
  }

  const daysRemaining = Math.max(0, rule.maxDays - daysUsed)
  const status = getVisaStatus(daysUsed, rule.maxDays)

  return {
    countryCode,
    nationality,
    rule,
    daysUsed,
    daysRemaining,
    totalAllowedDays: rule.maxDays,
    status,
    warningMessage: generateWarningMessage(daysUsed, daysRemaining, rule),
    ongoingStays,
    relevantStays,
    nextResetDate
  }
}

// Calculate multiple countries at once
export function calculateAllVisaStatuses(
  stays: Stay[], 
  context: VisaCalculationContext
): VisaStatus[] {
  const { nationality } = context
  const countries = [...new Set(stays.map(stay => stay.countryCode))]
  
  return countries.map(countryCode => 
    calculateVisaStatus(countryCode, stays, context)
  )
}

// Helper functions
function getLastExitBeforeNewEntry(stays: Stay[]): Date | null {
  // For exit reset logic: find the most recent exit that's followed by a new entry
  // This identifies the reset point between separate visits
  
  if (stays.length <= 1) return null
  
  try {
    // Sort stays by entry date
    const sortedStays = stays
      .map(stay => ({
        stay,
        entryDate: parseUTCDate(stay.entryDate),
        exitDate: stay.exitDate ? parseUTCDate(stay.exitDate) : null
      }))
      .filter(item => item.entryDate !== null)
      .sort((a, b) => a.entryDate!.getTime() - b.entryDate!.getTime())

    // Look for the most recent exit that's followed by a gap and then a new entry
    for (let i = sortedStays.length - 2; i >= 0; i--) {
      const currentStay = sortedStays[i]
      const nextStay = sortedStays[i + 1]
      
      if (currentStay.exitDate && nextStay.entryDate) {
        // If there's a gap between exit and next entry, this is a reset point
        if (nextStay.entryDate > currentStay.exitDate) {
          return currentStay.exitDate
        }
      }
    }
    
    return null
  } catch (error) {
    console.error('Error finding last exit before new entry:', error)
    return null
  }
}

function getLastSeparateExitDate(allStays: Stay[], ongoingStays: Stay[]): Date | null {
  // Find the most recent exit that represents the end of a separate visit
  // (i.e., not part of the current stay session)
  
  if (ongoingStays.length > 0) {
    // If there are ongoing stays, find exits before the earliest ongoing stay
    const earliestOngoingEntry = ongoingStays
      .map(stay => parseUTCDate(stay.entryDate))
      .filter(date => date !== null)
      .sort((a, b) => a!.getTime() - b!.getTime())[0]
    
    if (!earliestOngoingEntry) return null
    
    const previousCompletedStays = allStays.filter(stay => {
      if (!stay.exitDate) return false
      const entryDate = parseUTCDate(stay.entryDate)
      const exitDate = parseUTCDate(stay.exitDate)
      return entryDate && exitDate && exitDate < earliestOngoingEntry
    })
    
    if (previousCompletedStays.length === 0) return null
    
    // Return the most recent exit from previous stays
    const validExits = previousCompletedStays
      .map(stay => parseUTCDate(stay.exitDate!))
      .filter(date => date !== null)
      .sort((a, b) => b!.getTime() - a!.getTime())
    
    return validExits.length > 0 ? validExits[0] : null
  } else {
    // No ongoing stays - for a single completed stay, there's no "separate" previous exit
    // This means we're counting a completed session, so no reset needed
    return null
  }
}

function getLastExitDate(stays: Stay[]): Date | null {
  const completedStays = stays.filter(stay => stay.exitDate && stay.exitDate.trim() !== '')
  if (completedStays.length === 0) return null
  
  try {
    const validExitDates = completedStays
      .map(stay => ({ stay, date: parseUTCDate(stay.exitDate!) }))
      .filter(item => item.date !== null)
    
    if (validExitDates.length === 0) return null
    
    const sortedStays = validExitDates.sort((a, b) => 
      b.date!.getTime() - a.date!.getTime()
    )
    
    return sortedStays[0].date
  } catch (error) {
    console.error('Error getting last exit date:', error)
    return null
  }
}

function calculateRollingWindowDays(
  stays: Stay[], 
  windowStart: Date, 
  windowEnd: Date
): number {
  let totalDays = 0
  
  for (const stay of stays) {
    try {
      // Use safe date parsing
      const entryDate = parseUTCDate(stay.entryDate)
      if (!entryDate) {
        console.warn('Invalid entry date in rolling window calculation:', stay.entryDate)
        continue
      }

      // For ongoing stays, use windowEnd as default exit date
      let exitDate: Date
      if (stay.exitDate && stay.exitDate.trim() !== '') {
        const parsed = parseUTCDate(stay.exitDate)
        if (!parsed) {
          console.warn('Invalid exit date in rolling window calculation:', stay.exitDate)
          continue
        }
        exitDate = parsed
      } else {
        exitDate = windowEnd
      }

      // Calculate overlap with window using UTC dates
      const overlapStart = new Date(Math.max(entryDate.getTime(), windowStart.getTime()))
      const overlapEnd = new Date(Math.min(exitDate.getTime(), windowEnd.getTime()))
      
      if (overlapStart <= overlapEnd) {
        // Use the same day calculation logic as the main duration function
        const overlapDays = calculateUTCDaysBetween(overlapStart, overlapEnd) + 1
        totalDays += Math.max(0, overlapDays)
      }
    } catch (error) {
      console.error('Error processing stay in rolling window:', error, stay)
      continue
    }
  }
  
  return totalDays
}

// Helper function for UTC date parsing (matches types.ts logic)
function parseUTCDate(dateString: string): Date | null {
  try {
    const date = new Date(dateString + 'T00:00:00.000Z')
    return isNaN(date.getTime()) ? null : date
  } catch {
    return null
  }
}

// Helper function for UTC day calculation (matches types.ts logic)
function calculateUTCDaysBetween(startDate: Date, endDate: Date): number {
  const start = new Date(Date.UTC(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()))
  const end = new Date(Date.UTC(endDate.getFullYear(), endDate.getMonth(), endDate.getDate()))
  
  const timeDiff = end.getTime() - start.getTime()
  return Math.max(0, Math.floor(timeDiff / (1000 * 60 * 60 * 24)))
}

function calculateNextRollingReset(stays: Stay[], periodDays: number): Date | undefined {
  const completedStays = stays.filter(stay => stay.exitDate)
  if (completedStays.length === 0) return undefined
  
  // Find the oldest relevant stay
  const oldestStay = completedStays.reduce((oldest, stay) => {
    const stayEntry = new Date(stay.entryDate)
    const oldestEntry = new Date(oldest.entryDate)
    return stayEntry < oldestEntry ? stay : oldest
  })
  
  const resetDate = new Date(oldestStay.entryDate)
  resetDate.setDate(resetDate.getDate() + periodDays + 1)
  
  return resetDate
}

function getVisaStatus(daysUsed: number, maxDays: number): 'safe' | 'warning' | 'critical' | 'exceeded' {
  const percentage = daysUsed / maxDays
  
  if (daysUsed > maxDays) return 'exceeded'
  if (percentage >= 0.9) return 'critical'  // 90%+
  if (percentage >= 0.7) return 'warning'   // 70%+
  return 'safe'
}

function generateWarningMessage(daysUsed: number, daysRemaining: number, rule: VisaRule): string | undefined {
  if (daysUsed > rule.maxDays) {
    const overstay = daysUsed - rule.maxDays
    return `Visa limit exceeded by ${overstay} days`
  }
  
  if (daysRemaining <= 7) {
    return `Only ${daysRemaining} days remaining`
  }
  
  if (daysRemaining <= 30) {
    return `${daysRemaining} days remaining - plan exit soon`
  }
  
  return undefined
}

// Check if a stay would violate visa rules
export function validateNewStay(
  newStay: Partial<Stay>,
  existingStays: Stay[],
  context: VisaCalculationContext
): { isValid: boolean; message?: string; projectedStatus?: VisaStatus } {
  if (!newStay.countryCode || !newStay.entryDate) {
    return { isValid: false, message: 'Country and entry date are required' }
  }

  // Create a temporary stay for validation
  const tempStay: Stay = {
    id: 'temp',
    countryCode: newStay.countryCode,
    entryDate: newStay.entryDate,
    exitDate: newStay.exitDate,
    fromCountry: newStay.fromCountry,
    entryCity: newStay.entryCity,
    exitCity: newStay.exitCity,
    visaType: newStay.visaType,
    notes: newStay.notes || 'Tourism validation'
  }

  const allStays = [...existingStays, tempStay]
  const projectedStatus = calculateVisaStatus(newStay.countryCode, allStays, context)

  if (projectedStatus.status === 'exceeded') {
    return {
      isValid: false,
      message: `This stay would exceed visa limit by ${Math.abs(projectedStatus.daysRemaining)} days`,
      projectedStatus
    }
  }

  if (projectedStatus.status === 'critical') {
    return {
      isValid: true,
      message: `Warning: This stay would use ${projectedStatus.daysUsed}/${projectedStatus.totalAllowedDays} days (${Math.round(projectedStatus.daysUsed/projectedStatus.totalAllowedDays*100)}%)`,
      projectedStatus
    }
  }

  return { isValid: true, projectedStatus }
}