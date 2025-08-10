import { calculateStayDuration, Stay } from '@/lib/types'

describe('calculateStayDuration', () => {
  it('should calculate duration correctly', () => {
    const stay: Stay = {
      id: '1',
      countryCode: 'KR',
      entryDate: '2024-03-01',
      exitDate: '2024-03-10'
    }
    
    const duration = calculateStayDuration(stay)
    expect(duration).toBe(10) // March 1-10 = 10 days (inclusive)
  })
  
  it('should handle ongoing stays', () => {
    const stay: Stay = {
      id: '1', 
      countryCode: 'KR',
      entryDate: '2024-03-01',
      // no exitDate = ongoing
    }
    
    const referenceDate = new Date('2024-03-10T00:00:00.000Z')
    const duration = calculateStayDuration(stay, referenceDate)
    expect(duration).toBe(10)
  })
  
  it('should return 0 for invalid entry date', () => {
    const stay: Stay = {
      id: '1',
      countryCode: 'KR',
      entryDate: ''
    }
    
    const duration = calculateStayDuration(stay)
    expect(duration).toBe(0)
  })
})