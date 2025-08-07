// Local storage management for stays data
import { Stay } from '@/lib/types'
import { logger } from '@/lib/utils/logger'

const STAYS_STORAGE_KEY = 'dino-stays-data'
const STORAGE_VERSION = '1.0'

interface StaysStorage {
  version: string
  stays: Stay[]
  lastUpdated: string
}

// Load stays from localStorage
export function loadStaysFromStorage(): Stay[] {
  if (typeof window === 'undefined') return []
  
  try {
    const stored = localStorage.getItem(STAYS_STORAGE_KEY)
    if (!stored) return []
    
    const data: StaysStorage = JSON.parse(stored)
    
    // Version check
    if (data.version !== STORAGE_VERSION) {
      logger.warn('Storage version mismatch, clearing data')
      clearStaysStorage()
      return []
    }
    
    return data.stays || []
  } catch (error) {
    logger.error('Failed to load stays from storage:', error)
    return []
  }
}

// Save stays to localStorage
export function saveStaysToStorage(stays: Stay[]): boolean {
  if (typeof window === 'undefined') return false
  
  try {
    const data: StaysStorage = {
      version: STORAGE_VERSION,
      stays,
      lastUpdated: new Date().toISOString()
    }
    
    localStorage.setItem(STAYS_STORAGE_KEY, JSON.stringify(data))
    return true
  } catch (error) {
    logger.error('Failed to save stays to storage:', error)
    return false
  }
}

// Add new stay
export function addStayToStorage(stay: Omit<Stay, 'id'>): Stay {
  const stays = loadStaysFromStorage()
  const newStay: Stay = {
    ...stay,
    id: generateStayId()
  }
  
  const updatedStays = [newStay, ...stays]
  saveStaysToStorage(updatedStays)
  
  return newStay
}

// Update existing stay
export function updateStayInStorage(stayId: string, updates: Partial<Omit<Stay, 'id'>>): Stay | null {
  const stays = loadStaysFromStorage()
  const stayIndex = stays.findIndex(stay => stay.id === stayId)
  
  if (stayIndex === -1) {
    logger.error('Stay not found:', stayId)
    return null
  }
  
  const updatedStay = { ...stays[stayIndex], ...updates }
  stays[stayIndex] = updatedStay
  
  saveStaysToStorage(stays)
  return updatedStay
}

// Delete stay
export function deleteStayFromStorage(stayId: string): boolean {
  const stays = loadStaysFromStorage()
  const filteredStays = stays.filter(stay => stay.id !== stayId)
  
  if (filteredStays.length === stays.length) {
    logger.error('Stay not found:', stayId)
    return false
  }
  
  saveStaysToStorage(filteredStays)
  return true
}

// Clear all stays
export function clearStaysStorage(): boolean {
  if (typeof window === 'undefined') return false
  
  try {
    localStorage.removeItem(STAYS_STORAGE_KEY)
    return true
  } catch (error) {
    logger.error('Failed to clear stays storage:', error)
    return false
  }
}

// Get stays by country
export function getStaysByCountry(countryCode: string): Stay[] {
  const stays = loadStaysFromStorage()
  return stays.filter(stay => stay.countryCode === countryCode)
}

// Get stays within date range
export function getStaysInDateRange(startDate: Date, endDate: Date): Stay[] {
  const stays = loadStaysFromStorage()
  return stays.filter(stay => {
    const entryDate = new Date(stay.entryDate)
    const exitDate = stay.exitDate ? new Date(stay.exitDate) : new Date()
    
    // Check if stay overlaps with date range
    return entryDate <= endDate && exitDate >= startDate
  })
}

// Generate unique stay ID
function generateStayId(): string {
  return `stay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Data validation
export function validateStay(stay: Partial<Stay>): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (!stay.countryCode) {
    errors.push('Country code is required')
  }
  
  if (!stay.entryDate) {
    errors.push('Entry date is required')
  } else if (isNaN(Date.parse(stay.entryDate))) {
    errors.push('Entry date is invalid')
  }
  
  if (stay.exitDate) {
    if (isNaN(Date.parse(stay.exitDate))) {
      errors.push('Exit date is invalid')
    } else if (stay.entryDate && new Date(stay.exitDate) < new Date(stay.entryDate)) {
      errors.push('Exit date must be after entry date')
    }
  }
  
  // Notes validation removed - can be any string
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// Storage statistics
export function getStorageStats() {
  const stays = loadStaysFromStorage()
  const countries = new Set(stays.map(stay => stay.countryCode))
  const ongoingStays = stays.filter(stay => !stay.exitDate || stay.exitDate === '')
  
  return {
    totalStays: stays.length,
    countries: countries.size,
    ongoingStays: ongoingStays.length,
    completedStays: stays.length - ongoingStays.length,
    lastUpdated: getLastUpdated()
  }
}

function getLastUpdated(): string | null {
  if (typeof window === 'undefined') return null
  
  try {
    const stored = localStorage.getItem(STAYS_STORAGE_KEY)
    if (!stored) return null
    
    const data: StaysStorage = JSON.parse(stored)
    return data.lastUpdated || null
  } catch {
    return null
  }
}
