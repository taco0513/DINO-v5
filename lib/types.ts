export interface Country {
  code: string
  name: string
  flag: string
}

export interface VisaRule {
  maxDays: number        // 최대 체류 가능 일수
  periodDays: number     // 계산 기간 (롤링 윈도우 또는 단순 기간)
  resetType: 'exit' | 'rolling'  // 리셋 방식
  extensionDays?: number // 연장 가능 일수
}

export interface Stay {
  id: string
  countryCode: string    // Destination country (To Country)
  fromCountry?: string   // Origin country (From Country)
  entryDate: string      // ISO date string
  exitDate?: string      // ISO date string - optional for ongoing stays
  entryCity?: string     // Arrival airport/city code (e.g., ICN, BKK)
  exitCity?: string      // Departure airport/city code
  visaType?: 'visa-free' | 'e-visa' | 'visa-on-arrival' | 'tourist-visa' | 'business-visa' | 'transit' | 'long-term-resident'
  notes?: string
}

// Helper to check if stay is ongoing
export function isOngoingStay(stay: Stay): boolean {
  return !stay.exitDate || stay.exitDate === ''
}

// Enhanced duration calculation with validation and timezone safety
export function calculateStayDuration(stay: Stay, referenceDate?: Date): number {
  try {
    // Validate required fields - return 0 for invalid data instead of throwing
    if (!stay || !stay.entryDate) {
      console.warn('Missing entry date for stay:', stay)
      return 0
    }

    // Parse dates with validation
    const entryDate = parseDate(stay.entryDate)
    if (!entryDate) {
      console.warn(`Invalid entry date: ${stay.entryDate}`)
      return 0
    }

    let exitDate: Date
    if (stay.exitDate && stay.exitDate.trim() !== '') {
      const parsed = parseDate(stay.exitDate)
      if (!parsed) {
        throw new Error(`Invalid exit date: ${stay.exitDate}`)
      }
      exitDate = parsed
    } else {
      // For ongoing stays, use reference date (default: today)
      exitDate = referenceDate || new Date()
    }

    // Validate date logic
    if (exitDate < entryDate) {
      throw new Error('Exit date cannot be before entry date')
    }

    // Calculate days with timezone-safe method
    return calculateDaysBetween(entryDate, exitDate) + 1 // +1 to include both entry and exit days
  } catch (error) {
    console.error('Error calculating stay duration:', error, { stay })
    return 0 // Fallback to 0, but log the error for debugging
  }
}

// Timezone-safe date parsing
function parseDate(dateString: string): Date | null {
  try {
    // Handle ISO date strings and YYYY-MM-DD format
    const date = new Date(dateString + 'T00:00:00.000Z') // Force UTC to avoid timezone issues
    return isNaN(date.getTime()) ? null : date
  } catch {
    return null
  }
}

// Timezone-safe day calculation
function calculateDaysBetween(startDate: Date, endDate: Date): number {
  // Convert to UTC dates at midnight to avoid timezone issues
  const start = new Date(Date.UTC(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()))
  const end = new Date(Date.UTC(endDate.getFullYear(), endDate.getMonth(), endDate.getDate()))
  
  const timeDiff = end.getTime() - start.getTime()
  return Math.max(0, Math.floor(timeDiff / (1000 * 60 * 60 * 24)))
}

// Helper to get today in UTC for consistent calculations
export function getTodayUTC(): Date {
  const now = new Date()
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()))
}