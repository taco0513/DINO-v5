import {
  calculateVisaStatus,
  type VisaCalculationContext,
  type VisaStatus
} from '../visa-engine'
import { Stay } from '@/lib/types'

describe('Visa Engine', () => {
  const today = new Date('2024-03-15')
  
  // Mock Date.now() to return a fixed date
  beforeAll(() => {
    jest.useFakeTimers()
    jest.setSystemTime(today)
  })
  
  afterAll(() => {
    jest.useRealTimers()
  })

  describe('calculateVisaStatus', () => {
    it('should calculate visa status for Japan (90 days in 180-day rolling window)', () => {
      const stays: Stay[] = [
        {
          id: '1',
          countryCode: 'JP',
          entryDate: '2024-01-01',
          exitDate: '2024-01-30' // 30 days
        },
        {
          id: '2',
          countryCode: 'JP',
          entryDate: '2024-03-01',
          exitDate: '2024-03-10' // 10 days
        }
      ]
      
      const context: VisaCalculationContext = {
        nationality: 'US',
        referenceDate: today
      }
      
      const status = calculateVisaStatus('JP', stays, context)
      
      expect(status.countryCode).toBe('JP')
      expect(status.nationality).toBe('US')
      expect(status.daysUsed).toBe(40) // 30 + 10 days
      expect(status.daysRemaining).toBe(50) // 90 - 40
      expect(status.totalAllowedDays).toBe(90)
      expect(status.status).toBe('safe')
    })

    it('should calculate visa status for Korea with standard rules', () => {
      const stays: Stay[] = [
        {
          id: '1',
          countryCode: 'KR',
          entryDate: '2024-03-01',
          exitDate: '2024-03-10' // 10 days
        }
      ]
      
      const context: VisaCalculationContext = {
        nationality: 'US',
        referenceDate: today,
        userEmail: 'other@example.com'
      }
      
      const status = calculateVisaStatus('KR', stays, context)
      
      expect(status.daysUsed).toBe(10)
      expect(status.daysRemaining).toBe(80) // 90 - 10
      expect(status.totalAllowedDays).toBe(90)
      expect(status.status).toBe('safe')
    })

    it('should calculate visa status for Korea with user-specific 183-day rule', () => {
      const stays: Stay[] = [
        {
          id: '1',
          countryCode: 'KR',
          entryDate: '2024-01-01',
          exitDate: '2024-01-30' // 30 days
        }
      ]
      
      const context: VisaCalculationContext = {
        nationality: 'US',
        referenceDate: today,
        userEmail: 'zbrianjin@gmail.com'
      }
      
      const status = calculateVisaStatus('KR', stays, context, 'long-term-resident')
      
      expect(status.daysUsed).toBe(30)
      expect(status.daysRemaining).toBe(153) // 183 - 30
      expect(status.totalAllowedDays).toBe(183)
      expect(status.status).toBe('safe')
    })

    it('should handle ongoing stays', () => {
      const stays: Stay[] = [
        {
          id: '1',
          countryCode: 'JP',
          entryDate: '2024-03-01',
          exitDate: undefined // Ongoing stay
        }
      ]
      
      const context: VisaCalculationContext = {
        nationality: 'US',
        referenceDate: today
      }
      
      const status = calculateVisaStatus('JP', stays, context)
      
      expect(status.daysUsed).toBe(15) // March 1 to March 15
      expect(status.ongoingStays).toHaveLength(1)
      expect(status.status).toBe('safe')
    })

    it('should detect warning status when approaching limit', () => {
      const stays: Stay[] = [
        {
          id: '1',
          countryCode: 'JP',
          entryDate: '2024-01-01',
          exitDate: '2024-03-03' // 63 days (70% of 90 days)
        }
      ]
      
      const context: VisaCalculationContext = {
        nationality: 'US',
        referenceDate: today
      }
      
      const status = calculateVisaStatus('JP', stays, context)
      
      expect(status.daysUsed).toBe(63)
      expect(status.daysRemaining).toBe(27)
      expect(status.status).toBe('warning')
    })

    it('should detect critical status when near limit', () => {
      const stays: Stay[] = [
        {
          id: '1',
          countryCode: 'JP',
          entryDate: '2023-12-26',
          exitDate: '2024-03-21' // 81 days within 180-day rolling window (90% of 90 days)
        }
      ]
      
      const context: VisaCalculationContext = {
        nationality: 'US',
        referenceDate: today
      }
      
      const status = calculateVisaStatus('JP', stays, context)
      
      expect(status.daysUsed).toBe(81)
      expect(status.daysRemaining).toBe(9)
      expect(status.status).toBe('critical')
    })

    it('should detect exceeded status for overstay', () => {
      const stays: Stay[] = [
        {
          id: '1',
          countryCode: 'VN',
          entryDate: '2024-01-01',
          exitDate: '2024-03-01' // 61 days (exceeds 45-day limit)
        }
      ]
      
      const context: VisaCalculationContext = {
        nationality: 'US',
        referenceDate: today
      }
      
      const status = calculateVisaStatus('VN', stays, context)
      
      expect(status.daysUsed).toBe(61)
      expect(status.daysRemaining).toBe(0)
      expect(status.totalAllowedDays).toBe(45)
      expect(status.status).toBe('exceeded')
    })

    it('should handle Thailand simple reset rule', () => {
      const stays: Stay[] = [
        {
          id: '1',
          countryCode: 'TH',
          entryDate: '2024-01-01',
          exitDate: '2024-01-15' // Previous visit
        },
        {
          id: '2',
          countryCode: 'TH',
          entryDate: '2024-03-01',
          exitDate: '2024-03-10' // Current visit - 10 days
        }
      ]
      
      const context: VisaCalculationContext = {
        nationality: 'US',
        referenceDate: today
      }
      
      const status = calculateVisaStatus('TH', stays, context)
      
      // Thailand uses simple reset, so only current visit counts
      expect(status.daysUsed).toBe(10)
      expect(status.daysRemaining).toBe(20) // 30 - 10
      expect(status.totalAllowedDays).toBe(30)
      expect(status.status).toBe('safe')
    })

    it('should return no rule status for unsupported country', () => {
      const stays: Stay[] = []
      
      const context: VisaCalculationContext = {
        nationality: 'US',
        referenceDate: today
      }
      
      const status = calculateVisaStatus('XX', stays, context) // Invalid country code
      
      expect(status.rule).toBeNull()
      expect(status.daysUsed).toBe(0)
      expect(status.daysRemaining).toBe(0)
      expect(status.warningMessage).toContain('No visa rules found')
    })

    it('should filter stays by country code', () => {
      const stays: Stay[] = [
        {
          id: '1',
          countryCode: 'JP',
          entryDate: '2024-01-01',
          exitDate: '2024-01-10' // 10 days in Japan
        },
        {
          id: '2',
          countryCode: 'KR',
          entryDate: '2024-02-01',
          exitDate: '2024-02-10' // Should be ignored
        },
        {
          id: '3',
          countryCode: 'JP',
          entryDate: '2024-03-01',
          exitDate: '2024-03-05' // 5 days in Japan
        }
      ]
      
      const context: VisaCalculationContext = {
        nationality: 'US',
        referenceDate: today
      }
      
      const status = calculateVisaStatus('JP', stays, context)
      
      expect(status.relevantStays).toHaveLength(2)
      expect(status.daysUsed).toBe(15) // 10 + 5 days (only Japan stays)
    })
  })
})