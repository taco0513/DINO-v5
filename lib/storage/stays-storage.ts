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
    // Try current storage key first
    let stored = localStorage.getItem(STAYS_STORAGE_KEY)
    
    // Migration: Check old storage key if current key is empty
    if (!stored) {
      const oldStored = localStorage.getItem('dino-v5-stays')
      if (oldStored) {
        console.log('Migrating from old storage key...')
        try {
          const oldData = JSON.parse(oldStored)
          // Migrate old data to new format
          const migratedData: StaysStorage = {
            version: STORAGE_VERSION,
            stays: Array.isArray(oldData) ? oldData : [],
            lastUpdated: new Date().toISOString()
          }
          localStorage.setItem(STAYS_STORAGE_KEY, JSON.stringify(migratedData))
          localStorage.removeItem('dino-v5-stays') // Clean up old key
          stored = JSON.stringify(migratedData)
          console.log('Migration successful!')
        } catch (e) {
          console.error('Migration failed:', e)
        }
      }
    }
    
    if (!stored) return []
    
    const data: StaysStorage = JSON.parse(stored)
    
    // Version check - but don't clear data, just migrate if needed
    if (data.version !== STORAGE_VERSION) {
      logger.warn('Storage version mismatch, attempting migration')
      // For now, just use the data as is
      return data.stays || []
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
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('stays-updated'))
    
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
    console.error('Stay not found for update:', stayId)
    console.error('Available stay IDs:', stays.map(s => s.id))
    logger.error('Stay not found:', stayId)
    return null
  }
  
  const updatedStay = { ...stays[stayIndex], ...updates }
  
  // Validate the updated stay before saving
  const validation = validateStay(updatedStay)
  if (!validation.isValid) {
    console.error('Updated stay validation failed:', validation.errors)
    logger.error('Stay validation failed:', validation.errors)
    return null
  }
  
  stays[stayIndex] = updatedStay
  
  saveStaysToStorage(stays)
  console.log('Stay updated successfully:', updatedStay)
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

// Enhanced data validation with timezone safety
export function validateStay(stay: Partial<Stay>): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (!stay.countryCode) {
    errors.push('Country code is required')
  } else if (!/^[A-Z]{2}$/.test(stay.countryCode)) {
    errors.push('Country code must be a 2-letter uppercase code (e.g., KR, JP)')
  }
  
  if (!stay.entryDate) {
    errors.push('Entry date is required')
  } else {
    // Use safer date validation
    try {
      const entryDate = new Date(stay.entryDate + 'T00:00:00.000Z')
      if (isNaN(entryDate.getTime())) {
        errors.push('Entry date is invalid')
      }
    } catch {
      errors.push('Entry date format is invalid')
    }
  }
  
  if (stay.exitDate && stay.exitDate.trim() !== '') {
    try {
      const exitDate = new Date(stay.exitDate + 'T00:00:00.000Z')
      if (isNaN(exitDate.getTime())) {
        errors.push('Exit date is invalid')
      } else if (stay.entryDate) {
        const entryDate = new Date(stay.entryDate + 'T00:00:00.000Z')
        if (!isNaN(entryDate.getTime()) && exitDate < entryDate) {
          errors.push('Exit date must be after entry date')
        }
      }
    } catch {
      errors.push('Exit date format is invalid')
    }
  }
  
  // Validate optional fields
  if (stay.entryCity && stay.entryCity.length > 5) {
    errors.push('Entry city code should be 5 characters or less')
  }
  
  if (stay.exitCity && stay.exitCity.length > 5) {
    errors.push('Exit city code should be 5 characters or less')
  }
  
  if (stay.fromCountry && !/^[A-Z]{2}$/.test(stay.fromCountry)) {
    errors.push('From country code must be a 2-letter uppercase code')
  }
  
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
