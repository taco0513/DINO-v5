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
  visaType?: 'visa-free' | 'e-visa' | 'visa-on-arrival' | 'tourist-visa' | 'business-visa' | 'transit'
  notes?: string
}

// Helper to check if stay is ongoing
export function isOngoingStay(stay: Stay): boolean {
  return !stay.exitDate || stay.exitDate === ''
}

// Helper to calculate stay duration
export function calculateStayDuration(stay: Stay, endDate?: Date): number {
  const entryDate = new Date(stay.entryDate)
  const exitDate = stay.exitDate 
    ? new Date(stay.exitDate) 
    : endDate || new Date() // Use provided end date or today for ongoing stays
  
  const timeDiff = exitDate.getTime() - entryDate.getTime()
  return Math.ceil(timeDiff / (1000 * 60 * 60 * 24)) + 1
}