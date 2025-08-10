import {
  detectDateConflicts,
  autoResolveConflicts,
  type DateConflict
} from '../date-conflict-resolver'
import { Stay } from '@/lib/types'

describe('Date Conflict Resolver', () => {
  describe('detectDateConflicts', () => {
    it('should detect overlapping stays in same country', () => {
      const stays: Stay[] = [
        {
          id: '1',
          countryCode: 'JP',
          entryDate: '2024-01-01',
          exitDate: '2024-01-10'
        },
        {
          id: '2',
          countryCode: 'JP',
          entryDate: '2024-01-05', // Overlaps with stay 1
          exitDate: '2024-01-15'
        }
      ]
      
      const conflicts = detectDateConflicts(stays)
      expect(conflicts).toHaveLength(1)
      expect(conflicts[0].type).toBe('overlap')
      expect(conflicts[0].severity).toBe('critical')
    })

    it('should detect impossible travel dates', () => {
      const stays: Stay[] = [
        {
          id: '1',
          countryCode: 'KR',
          entryDate: '2024-01-10',
          exitDate: '2024-01-05' // Exit before entry
        }
      ]
      
      const conflicts = detectDateConflicts(stays)
      expect(conflicts).toHaveLength(1)
      expect(conflicts[0].type).toBe('impossible')
      expect(conflicts[0].severity).toBe('critical')
    })

    it('should detect sequence issues', () => {
      const stays: Stay[] = [
        {
          id: '1',
          countryCode: 'JP',
          entryDate: '2024-01-01',
          exitDate: '2024-01-10'
        },
        {
          id: '2',
          countryCode: 'KR',
          entryDate: '2024-01-05', // Entry before previous exit
          exitDate: '2024-01-20'
        }
      ]
      
      const conflicts = detectDateConflicts(stays)
      expect(conflicts.length).toBeGreaterThan(0)
      const sequenceConflict = conflicts.find(c => c.type === 'sequence')
      expect(sequenceConflict).toBeDefined()
    })

    it('should not detect conflicts for non-overlapping stays', () => {
      const stays: Stay[] = [
        {
          id: '1',
          countryCode: 'JP',
          entryDate: '2024-01-01',
          exitDate: '2024-01-10'
        },
        {
          id: '2',
          countryCode: 'JP',
          entryDate: '2024-01-11', // Starts after stay 1 ends
          exitDate: '2024-01-20'
        }
      ]
      
      const conflicts = detectDateConflicts(stays)
      expect(conflicts).toHaveLength(0)
    })

    it('should handle ongoing stays', () => {
      const stays: Stay[] = [
        {
          id: '1',
          countryCode: 'JP',
          entryDate: '2024-01-01',
          exitDate: undefined // Ongoing
        },
        {
          id: '2',
          countryCode: 'JP',
          entryDate: '2024-01-15',
          exitDate: '2024-01-20'
        }
      ]
      
      const conflicts = detectDateConflicts(stays)
      // Should detect overlap since first stay is ongoing
      expect(conflicts.length).toBeGreaterThan(0)
    })
  })

  describe('autoResolveConflicts', () => {
    it('should fix impossible dates by swapping', () => {
      const stays: Stay[] = [
        {
          id: '1',
          countryCode: 'VN',
          entryDate: '2024-01-10',
          exitDate: '2024-01-05' // Exit before entry
        }
      ]
      
      const resolved = autoResolveConflicts(stays)
      expect(resolved[0].entryDate).toBe('2024-01-05')
      expect(resolved[0].exitDate).toBe('2024-01-10')
    })

    it('should merge overlapping stays in same country', () => {
      const stays: Stay[] = [
        {
          id: '1',
          countryCode: 'JP',
          entryDate: '2024-01-01',
          exitDate: '2024-01-10',
          notes: 'First trip'
        },
        {
          id: '2',
          countryCode: 'JP',
          entryDate: '2024-01-05', // Overlaps
          exitDate: '2024-01-15',
          notes: 'Second trip'
        }
      ]
      
      const resolved = autoResolveConflicts(stays)
      // Should merge into one stay
      expect(resolved).toHaveLength(1)
      expect(resolved[0].entryDate).toBe('2024-01-01')
      expect(resolved[0].exitDate).toBe('2024-01-15')
    })

    it('should handle multiple conflicts', () => {
      const stays: Stay[] = [
        {
          id: '1',
          countryCode: 'KR',
          entryDate: '2024-01-10',
          exitDate: '2024-01-05' // Impossible dates
        },
        {
          id: '2',
          countryCode: 'JP',
          entryDate: '2024-02-01',
          exitDate: '2024-02-10'
        },
        {
          id: '3',
          countryCode: 'JP',
          entryDate: '2024-02-05', // Overlaps with stay 2
          exitDate: '2024-02-15'
        }
      ]
      
      const resolved = autoResolveConflicts(stays)
      
      // First stay should have dates swapped
      const koreaStay = resolved.find(s => s.countryCode === 'KR')
      expect(koreaStay?.entryDate).toBe('2024-01-05')
      expect(koreaStay?.exitDate).toBe('2024-01-10')
      
      // Japan stays should be merged
      const japanStays = resolved.filter(s => s.countryCode === 'JP')
      expect(japanStays).toHaveLength(1)
    })

    it('should preserve non-conflicting stays', () => {
      const stays: Stay[] = [
        {
          id: '1',
          countryCode: 'TH',
          entryDate: '2024-01-01',
          exitDate: '2024-01-10'
        },
        {
          id: '2',
          countryCode: 'VN',
          entryDate: '2024-02-01',
          exitDate: '2024-02-10'
        }
      ]
      
      const resolved = autoResolveConflicts(stays)
      expect(resolved).toHaveLength(2)
      expect(resolved).toEqual(stays)
    })

    it('should handle ongoing stays correctly', () => {
      const stays: Stay[] = [
        {
          id: '1',
          countryCode: 'KR',
          entryDate: '2024-01-01',
          exitDate: undefined // Ongoing
        },
        {
          id: '2',
          countryCode: 'KR',
          entryDate: '2024-01-05',
          exitDate: '2024-01-15'
        }
      ]
      
      const resolved = autoResolveConflicts(stays)
      expect(resolved).toHaveLength(1)
      expect(resolved[0].entryDate).toBe('2024-01-01')
      expect(resolved[0].exitDate).toBeNull() // Should remain ongoing
    })
  })
})