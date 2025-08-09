/**
 * Comprehensive visa information types for DINO-v5
 * Supports multiple visa types and detailed application processes
 */

// Main visa information structure
export interface VisaInformation {
  id?: string
  countryCode: string
  visaType: VisaType
  data: VisaData
  lastUpdated: Date
  updatedBy?: string
  source: 'official' | 'community' | 'ai_generated'
  isVerified: boolean
  createdAt?: Date
}

// Visa types enum
export type VisaType = 
  | 'tourist'
  | 'digital_nomad'
  | 'business'
  | 'student'
  | 'working_holiday'
  | 'transit'
  | 'alerts'

// Base visa data structure
export interface VisaData {
  // For tourist visa
  visaRequired?: boolean
  duration?: number
  periodDays?: number // For rolling window visas
  resetType?: 'exit' | 'rolling' | 'calendar'
  extension?: ExtensionInfo
  fees?: VisaFees
  processingTime?: ProcessingTime
  notes?: string

  // For digital nomad and long-term visas
  available?: boolean
  officialName?: string
  renewable?: boolean
  requirements?: string[] | DetailedRequirements // Can be simple list or detailed
  benefits?: string[]
  restrictions?: string[]
  applicationProcess?: ApplicationStep[]

  // For alerts
  alerts?: VisaAlert[]
}

// Extension information
export interface ExtensionInfo {
  available: boolean
  duration?: number
  cost?: number
  requirements?: string[]
}

// Visa fees structure
export interface VisaFees {
  currency: string
  amount: number
  paymentMethods: string[]
}

// Processing time structure
export interface ProcessingTime {
  min: number // days
  max: number // days
  express?: number // days for expedited processing
}

// Detailed requirements for long-term visas
export interface DetailedRequirements {
  income?: {
    min: number
    currency: string
    period: 'annual' | 'monthly'
  }
  employment?: string[]
  insurance?: string[]
  background?: string[]
  other?: string[]
}

// Application step for visa process
export interface ApplicationStep {
  step: number
  title: string
  description: string
  documents: string[]
  estimatedTime: string
  tips?: string[]
  officialLink?: string
}

// Visa alerts and updates
export interface VisaAlert {
  type: 'warning' | 'info' | 'update'
  message: string
  validUntil?: Date | string
}

// Visa update log entry
export interface VisaUpdateLog {
  id?: string
  countryCode: string
  visaType?: string
  changeType: 'create' | 'update' | 'delete' | 'verify'
  oldData?: VisaData
  newData?: VisaData
  changedBy: string
  changedAt: Date
  notes?: string
}

// Response types for API calls
export interface VisaInfoResponse {
  data: VisaInformation[]
  error?: string
}

export interface SingleVisaResponse {
  data: VisaInformation | null
  error?: string
}

// Request types for visa operations
export interface CreateVisaRequest {
  countryCode: string
  visaType: VisaType
  data: VisaData
  source: 'official' | 'community' | 'ai_generated'
  updatedBy: string
}

export interface UpdateVisaRequest {
  data: Partial<VisaData>
  updatedBy: string
  notes?: string
}

// Helper type for visa summary display
export interface VisaSummary {
  countryCode: string
  countryName: string
  touristVisa?: {
    visaRequired: boolean
    duration: number
    extensible: boolean
  }
  digitalNomadVisa?: {
    available: boolean
    name: string
    duration: number
    minIncome?: number
  }
  hasAlerts: boolean
  lastUpdated: Date
}

// Admin-specific types
export interface VisaAdminData extends VisaInformation {
  updateHistory?: VisaUpdateLog[]
  verificationStatus?: {
    verifiedBy?: string
    verifiedAt?: Date
    notes?: string
  }
}

// Validation result type
export interface VisaValidationResult {
  isValid: boolean
  errors?: string[]
  warnings?: string[]
}

// Export utility functions types
export type VisaDataValidator = (data: VisaData, visaType: VisaType) => VisaValidationResult
export type VisaDataFormatter = (data: VisaData, locale?: string) => string