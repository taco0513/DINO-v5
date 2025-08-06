// Visa types available for each country based on nationality
export interface VisaTypeInfo {
  value: string
  label: string
  duration?: string
  description?: string
}

// Map of country code to available visa types for US passport holders
export const visaTypesByCountry: { [countryCode: string]: { [nationality: string]: VisaTypeInfo[] } } = {
  'KR': {
    'US': [
      { value: 'visa-free', label: 'Visa Free (K-ETA)', duration: '90 days', description: 'Electronic Travel Authorization required' },
      { value: 'tourist-visa', label: 'Tourist Visa (C-3)', duration: '90 days', description: 'Single entry tourist visa' },
      { value: 'business-visa', label: 'Business Visa (C-2)', duration: '90 days', description: 'Short-term business visa' },
      { value: 'transit', label: 'Transit', duration: '30 days', description: 'Transit without visa' }
    ],
    'KR': [], // Korean citizens don't need visa for Korea
    'JP': [
      { value: 'visa-free', label: 'Visa Free (K-ETA)', duration: '90 days', description: 'Electronic Travel Authorization required' },
      { value: 'tourist-visa', label: 'Tourist Visa (C-3)', duration: '90 days', description: 'Single entry tourist visa' },
      { value: 'transit', label: 'Transit', duration: '30 days', description: 'Transit without visa' }
    ],
    'CN': [
      { value: 'tourist-visa', label: 'Tourist Visa (C-3)', duration: '90 days', description: 'Single entry tourist visa required' },
      { value: 'business-visa', label: 'Business Visa (C-2)', duration: '90 days', description: 'Short-term business visa' },
      { value: 'visa-free', label: 'Visa Free (Jeju Only)', duration: '30 days', description: 'Jeju Island only, visa-free' }
    ]
  },
  'JP': {
    'US': [
      { value: 'visa-free', label: 'Visa Free', duration: '90 days', description: 'Temporary visitor status' },
      { value: 'transit', label: 'Transit', duration: '72 hours', description: 'Shore pass for transit' }
    ],
    'KR': [
      { value: 'visa-free', label: 'Visa Free', duration: '90 days', description: 'Temporary visitor status' },
      { value: 'transit', label: 'Transit', duration: '72 hours', description: 'Shore pass for transit' }
    ],
    'JP': [], // Japanese citizens don't need visa for Japan
    'CN': [
      { value: 'tourist-visa', label: 'Tourist Visa', duration: '15-90 days', description: 'Single/Multiple entry' },
      { value: 'business-visa', label: 'Business Visa', duration: '15-90 days', description: 'Business activities' },
      { value: 'transit', label: 'Transit', duration: '72 hours', description: 'Shore pass for transit' }
    ]
  },
  'TH': {
    'US': [
      { value: 'visa-free', label: 'Visa Exemption', duration: '30 days', description: 'Extendable by 30 days' },
      { value: 'tourist-visa', label: 'Tourist Visa (TR)', duration: '60 days', description: 'Single entry, extendable by 30 days' },
      { value: 'e-visa', label: 'E-Visa', duration: '30 days', description: 'Electronic visa' },
      { value: 'visa-on-arrival', label: 'Visa on Arrival', duration: '15 days', description: 'Not extendable' },
      { value: 'transit', label: 'Transit', duration: '24 hours', description: 'Airport transit' }
    ],
    'KR': [
      { value: 'visa-free', label: 'Visa Exemption', duration: '30 days', description: 'Extendable by 30 days' },
      { value: 'tourist-visa', label: 'Tourist Visa (TR)', duration: '60 days', description: 'Single entry, extendable by 30 days' },
      { value: 'e-visa', label: 'E-Visa', duration: '30 days', description: 'Electronic visa' },
      { value: 'transit', label: 'Transit', duration: '24 hours', description: 'Airport transit' }
    ],
    'JP': [
      { value: 'visa-free', label: 'Visa Exemption', duration: '30 days', description: 'Extendable by 30 days' },
      { value: 'tourist-visa', label: 'Tourist Visa (TR)', duration: '60 days', description: 'Single entry, extendable by 30 days' },
      { value: 'e-visa', label: 'E-Visa', duration: '30 days', description: 'Electronic visa' },
      { value: 'transit', label: 'Transit', duration: '24 hours', description: 'Airport transit' }
    ],
    'CN': [
      { value: 'visa-on-arrival', label: 'Visa on Arrival', duration: '30 days', description: 'Tourism only' },
      { value: 'tourist-visa', label: 'Tourist Visa (TR)', duration: '60 days', description: 'Single entry' },
      { value: 'e-visa', label: 'E-Visa', duration: '30 days', description: 'Electronic visa' },
      { value: 'transit', label: 'Transit', duration: '24 hours', description: 'Airport transit' }
    ]
  },
  'VN': {
    'US': [
      { value: 'e-visa', label: 'E-Visa', duration: '90 days', description: 'Single or multiple entry' },
      { value: 'visa-on-arrival', label: 'Visa on Arrival', duration: '90 days', description: 'Pre-approval letter required' },
      { value: 'tourist-visa', label: 'Tourist Visa (DL)', duration: '30-90 days', description: 'Embassy/Consulate visa' },
      { value: 'business-visa', label: 'Business Visa (DN)', duration: '30-90 days', description: 'Business activities' },
      { value: 'transit', label: 'Transit', duration: '24 hours', description: 'Airport transit' }
    ],
    'KR': [
      { value: 'visa-free', label: 'Visa Free', duration: '15 days', description: 'Tourism only' },
      { value: 'e-visa', label: 'E-Visa', duration: '30 days', description: 'Single entry' },
      { value: 'visa-on-arrival', label: 'Visa on Arrival', duration: '30 days', description: 'Pre-approval letter required' },
      { value: 'tourist-visa', label: 'Tourist Visa (DL)', duration: '30 days', description: 'Embassy/Consulate visa' }
    ],
    'JP': [
      { value: 'visa-free', label: 'Visa Free', duration: '15 days', description: 'Tourism only' },
      { value: 'e-visa', label: 'E-Visa', duration: '30 days', description: 'Single entry' },
      { value: 'visa-on-arrival', label: 'Visa on Arrival', duration: '30 days', description: 'Pre-approval letter required' },
      { value: 'tourist-visa', label: 'Tourist Visa (DL)', duration: '30 days', description: 'Embassy/Consulate visa' }
    ],
    'CN': [
      { value: 'visa-free', label: 'Visa Free', duration: '15 days', description: 'Tourism only' },
      { value: 'e-visa', label: 'E-Visa', duration: '30 days', description: 'Single entry' },
      { value: 'visa-on-arrival', label: 'Visa on Arrival', duration: '30 days', description: 'Pre-approval letter required' },
      { value: 'tourist-visa', label: 'Tourist Visa (DL)', duration: '30 days', description: 'Embassy/Consulate visa' }
    ]
  }
}

// Get available visa types for a specific country and nationality
export function getAvailableVisaTypes(countryCode: string, nationality: string = 'US', userEmail?: string): VisaTypeInfo[] {
  const countryVisaTypes = visaTypesByCountry[countryCode]
  if (!countryVisaTypes) {
    // Default visa types if country not found
    return [
      { value: 'visa-free', label: 'Visa Free' },
      { value: 'e-visa', label: 'E-Visa' },
      { value: 'visa-on-arrival', label: 'Visa on Arrival' },
      { value: 'tourist-visa', label: 'Tourist Visa' },
      { value: 'business-visa', label: 'Business Visa' },
      { value: 'transit', label: 'Transit' }
    ]
  }
  
  const nationalityVisaTypes = countryVisaTypes[nationality]
  if (!nationalityVisaTypes || nationalityVisaTypes.length === 0) {
    // Default visa types if nationality not found or it's home country
    if (countryCode === nationality) {
      return [{ value: 'citizen', label: 'Citizen (No visa required)' }]
    }
    return [
      { value: 'visa-free', label: 'Visa Free' },
      { value: 'e-visa', label: 'E-Visa' },
      { value: 'visa-on-arrival', label: 'Visa on Arrival' },
      { value: 'tourist-visa', label: 'Tourist Visa' },
      { value: 'business-visa', label: 'Business Visa' },
      { value: 'transit', label: 'Transit' }
    ]
  }
  
  let visaTypes = [...nationalityVisaTypes]
  
  // Add special visa types for specific users - insert at the beginning as default
  if (userEmail === 'zbrianjin@gmail.com' && countryCode === 'KR') {
    visaTypes.unshift({
      value: 'long-term-resident',
      label: 'Long-term Resident (183 days)',
      duration: '183 days within 365-day rolling window',
      description: 'Special long-term resident status'
    })
  }
  
  return visaTypes
}