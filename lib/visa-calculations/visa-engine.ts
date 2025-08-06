// Comprehensive visa calculation engine
import { Stay, isOngoingStay, calculateStayDuration } from '@/lib/types'
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
}

// Calculate visa status for a specific country
export function calculateVisaStatus(
  countryCode: string, 
  stays: Stay[], 
  context: VisaCalculationContext
): VisaStatus {
  const { nationality, referenceDate = new Date(), lookbackDays = 365 } = context
  const rule = getVisaRules(nationality, countryCode)
  
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
    // Simple reset: only count stays since last exit
    const lastExitDate = getLastExitDate(countryStays)
    if (lastExitDate) {
      relevantStays = countryStays.filter(stay => 
        new Date(stay.entryDate) > lastExitDate
      )
    } else {
      relevantStays = countryStays
    }
    daysUsed = relevantStays.reduce((total, stay) => 
      total + calculateStayDuration(stay, referenceDate), 0
    )
  } else {
    // Rolling window: count stays within the rolling period
    const windowStartDate = new Date(referenceDate)
    windowStartDate.setDate(windowStartDate.getDate() - rule.periodDays)
    
    relevantStays = countryStays.filter(stay => {
      const entryDate = new Date(stay.entryDate)
      const exitDate = stay.exitDate ? new Date(stay.exitDate) : referenceDate
      return exitDate >= windowStartDate && entryDate <= referenceDate
    })
    
    daysUsed = calculateRollingWindowDays(relevantStays, windowStartDate, referenceDate)
    nextResetDate = calculateNextRollingReset(relevantStays, rule.periodDays)
  }

  const daysRemaining = rule.maxDays - daysUsed
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
function getLastExitDate(stays: Stay[]): Date | null {
  const completedStays = stays.filter(stay => stay.exitDate)
  if (completedStays.length === 0) return null
  
  const sortedStays = completedStays.sort((a, b) => 
    new Date(b.exitDate!).getTime() - new Date(a.exitDate!).getTime()
  )
  
  return new Date(sortedStays[0].exitDate!)
}

function calculateRollingWindowDays(
  stays: Stay[], 
  windowStart: Date, 
  windowEnd: Date
): number {
  let totalDays = 0
  
  for (const stay of stays) {
    const entryDate = new Date(stay.entryDate)
    const exitDate = stay.exitDate ? new Date(stay.exitDate) : windowEnd
    
    // Calculate overlap with window
    const overlapStart = new Date(Math.max(entryDate.getTime(), windowStart.getTime()))
    const overlapEnd = new Date(Math.min(exitDate.getTime(), windowEnd.getTime()))
    
    if (overlapStart <= overlapEnd) {
      const overlapDays = Math.ceil((overlapEnd.getTime() - overlapStart.getTime()) / (1000 * 60 * 60 * 24)) + 1
      totalDays += Math.max(0, overlapDays)
    }
  }
  
  return totalDays
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
    purpose: newStay.purpose || 'tourism'
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