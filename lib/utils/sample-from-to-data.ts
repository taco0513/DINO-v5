/**
 * Sample data generator for testing From-To display functionality
 * This creates realistic travel records with From-To information
 */

import { Stay } from '../types'

export function generateSampleFromToData(): Stay[] {
  return [
    {
      id: 'sample-1',
      countryCode: 'VN', // To Vietnam
      fromCountry: 'TH', // From Thailand
      entryDate: '2025-07-10',
      exitDate: undefined, // Ongoing
      entryCity: 'SGN', // Ho Chi Minh City
      exitCity: 'BKK', // Bangkok (departure from Thailand)
      visaType: 'visa-free',
      notes: 'Vietnam ongoing stay - came from Thailand'
    },
    {
      id: 'sample-2',
      countryCode: 'TH', // To Thailand  
      fromCountry: 'KR', // From Korea
      entryDate: '2025-07-01',
      exitDate: '2025-07-09', // Auto-fixed end date
      entryCity: 'BKK', // Bangkok
      exitCity: 'ICN', // Incheon (departure from Korea)
      visaType: 'visa-free',
      notes: 'Thailand trip - came from Korea'
    },
    {
      id: 'sample-3', 
      countryCode: 'KR', // To Korea
      fromCountry: 'JP', // From Japan
      entryDate: '2025-06-15',
      exitDate: '2025-06-30',
      entryCity: 'ICN', // Incheon
      exitCity: 'NRT', // Narita (departure from Japan)
      visaType: 'visa-free',
      notes: 'Korea trip - came from Japan'
    },
    {
      id: 'sample-4',
      countryCode: 'JP', // To Japan
      fromCountry: undefined, // No origin country (started journey here)
      entryDate: '2025-06-01',
      exitDate: '2025-06-14',
      entryCity: 'NRT', // Narita
      exitCity: undefined, // No departure info
      visaType: 'visa-free',
      notes: 'Japan trip - journey starting point'
    }
  ]
}

/**
 * Add sample From-To data to localStorage for testing
 */
export function addSampleFromToData() {
  const existingStays = JSON.parse(localStorage.getItem('dino-v5-stays') || '[]')
  const sampleData = generateSampleFromToData()
  
  // Only add if no existing data to avoid overwriting user data
  if (existingStays.length === 0) {
    localStorage.setItem('dino-v5-stays', JSON.stringify(sampleData))
    console.log('📝 Added sample From-To data for testing:', sampleData.length, 'records')
    return sampleData
  }
  
  return existingStays
}

/**
 * Clear all data and reset with sample From-To data (for testing only)
 */
export function resetWithSampleFromToData() {
  const sampleData = generateSampleFromToData()
  localStorage.setItem('dino-v5-stays', JSON.stringify(sampleData))
  console.log('🔄 Reset with sample From-To data:', sampleData.length, 'records')
  return sampleData
}

// Browser console helpers
if (typeof window !== 'undefined') {
  (window as any).addSampleFromToData = addSampleFromToData
  (window as any).resetWithSampleFromToData = resetWithSampleFromToData
  console.log('💡 Run window.addSampleFromToData() or window.resetWithSampleFromToData() to test From-To display!')
}