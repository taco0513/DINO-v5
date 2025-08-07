import {
  loadStaysFromStorage,
  saveStaysToStorage,
  addStayToStorage,
  updateStayInStorage,
  deleteStayFromStorage,
  clearStaysStorage
} from '../stays-storage'
import { Stay } from '@/lib/types'

describe('Stays Storage', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
    jest.clearAllMocks()
  })

  describe('loadStaysFromStorage', () => {
    it('should return empty array when no data exists', () => {
      const stays = loadStaysFromStorage()
      expect(stays).toEqual([])
    })

    it('should load stays from localStorage', () => {
      const mockStays: Stay[] = [
        {
          id: '1',
          countryCode: 'JP',
          entryDate: '2024-01-01',
          exitDate: '2024-01-10',
        }
      ]
      
      const storageData = {
        version: '1.0',
        stays: mockStays,
        lastUpdated: new Date().toISOString()
      }
      
      localStorage.setItem('dino-stays-data', JSON.stringify(storageData))
      
      const stays = loadStaysFromStorage()
      expect(stays).toEqual(mockStays)
    })

    it('should clear data and return empty array on version mismatch', () => {
      const storageData = {
        version: '0.9', // Old version
        stays: [{
          id: '1',
          countryCode: 'JP',
          entryDate: '2024-01-01',
          exitDate: '2024-01-10',
        }],
        lastUpdated: new Date().toISOString()
      }
      
      localStorage.setItem('dino-stays-data', JSON.stringify(storageData))
      
      const stays = loadStaysFromStorage()
      expect(stays).toEqual([])
      expect(localStorage.getItem('dino-stays-data')).toBeNull()
    })

    it('should handle corrupted data gracefully', () => {
      localStorage.setItem('dino-stays-data', 'invalid json')
      
      const stays = loadStaysFromStorage()
      expect(stays).toEqual([])
    })
  })

  describe('saveStaysToStorage', () => {
    it('should save stays to localStorage', () => {
      const mockStays: Stay[] = [
        {
          id: '1',
          countryCode: 'KR',
          entryDate: '2024-01-01',
          exitDate: '2024-01-30',
        }
      ]
      
      const result = saveStaysToStorage(mockStays)
      expect(result).toBe(true)
      
      const saved = localStorage.getItem('dino-stays-data')
      expect(saved).toBeTruthy()
      
      const parsed = JSON.parse(saved!)
      expect(parsed.version).toBe('1.0')
      expect(parsed.stays).toEqual(mockStays)
      expect(parsed.lastUpdated).toBeTruthy()
    })

    it('should handle save errors gracefully', () => {
      // Mock localStorage.setItem to throw an error
      const originalSetItem = localStorage.setItem
      localStorage.setItem = jest.fn().mockImplementation(() => {
        throw new Error('Storage full')
      })
      
      const result = saveStaysToStorage([])
      expect(result).toBe(false)
      
      // Restore original
      localStorage.setItem = originalSetItem
    })
  })

  describe('addStayToStorage', () => {
    it('should add a new stay with generated id', () => {
      const newStay = {
        countryCode: 'TH',
        entryDate: '2024-02-01',
        exitDate: '2024-02-15',
      }
      
      const added = addStayToStorage(newStay)
      
      expect(added.id).toBeTruthy()
      expect(added.countryCode).toBe('TH')
      expect(added.entryDate).toBe('2024-02-01')
      expect(added.exitDate).toBe('2024-02-15')
      
      const stays = loadStaysFromStorage()
      expect(stays).toHaveLength(1)
      expect(stays[0]).toEqual(added)
    })

    it('should add stay to existing stays', () => {
      // Add first stay
      const stay1 = addStayToStorage({
        countryCode: 'JP',
        entryDate: '2024-01-01',
        exitDate: '2024-01-10',
      })
      
      // Add second stay
      const stay2 = addStayToStorage({
        countryCode: 'KR',
        entryDate: '2024-02-01',
        exitDate: '2024-02-28',
      })
      
      const stays = loadStaysFromStorage()
      expect(stays).toHaveLength(2)
      expect(stays[0]).toEqual(stay2) // Most recent first
      expect(stays[1]).toEqual(stay1)
    })
  })

  describe('updateStayInStorage', () => {
    it('should update an existing stay', () => {
      const stay = addStayToStorage({
        countryCode: 'VN',
        entryDate: '2024-03-01',
        exitDate: '2024-03-15',
      })
      
      const updated = updateStayInStorage(stay.id, {
        exitDate: '2024-03-20',
        notes: 'Extended stay'
      })
      
      expect(updated).toBeTruthy()
      expect(updated?.id).toBe(stay.id)
      expect(updated?.exitDate).toBe('2024-03-20')
      expect(updated?.notes).toBe('Extended stay')
      
      const stays = loadStaysFromStorage()
      expect(stays[0]).toEqual(updated)
    })

    it('should return null if stay not found', () => {
      const updated = updateStayInStorage('non-existent', {
        exitDate: '2024-03-20',
      })
      
      expect(updated).toBeNull()
    })
  })

  describe('deleteStayFromStorage', () => {
    it('should delete an existing stay', () => {
      const stay1 = addStayToStorage({
        countryCode: 'JP',
        entryDate: '2024-01-01',
        exitDate: '2024-01-10',
      })
      
      const stay2 = addStayToStorage({
        countryCode: 'KR',
        entryDate: '2024-02-01',
        exitDate: '2024-02-28',
      })
      
      const result = deleteStayFromStorage(stay1.id)
      expect(result).toBe(true)
      
      const stays = loadStaysFromStorage()
      expect(stays).toHaveLength(1)
      expect(stays[0]).toEqual(stay2)
    })

    it('should return false if stay not found', () => {
      const result = deleteStayFromStorage('non-existent')
      expect(result).toBe(false)
    })
  })

  describe('clearStaysStorage', () => {
    it('should clear all stays from storage', () => {
      addStayToStorage({
        countryCode: 'JP',
        entryDate: '2024-01-01',
        exitDate: '2024-01-10',
      })
      
      const result = clearStaysStorage()
      expect(result).toBe(true)
      
      const stays = loadStaysFromStorage()
      expect(stays).toEqual([])
      expect(localStorage.getItem('dino-stays-data')).toBeNull()
    })

    it('should handle clear errors gracefully', () => {
      // Mock localStorage.removeItem to throw an error
      const originalRemoveItem = localStorage.removeItem
      localStorage.removeItem = jest.fn().mockImplementation(() => {
        throw new Error('Clear failed')
      })
      
      const result = clearStaysStorage()
      expect(result).toBe(false)
      
      // Restore original
      localStorage.removeItem = originalRemoveItem
    })
  })
})