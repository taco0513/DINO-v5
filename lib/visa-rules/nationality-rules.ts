// Visa rules based on passport nationality
export interface VisaRule {
  maxDays: number
  periodDays: number
  resetType: 'exit' | 'rolling'
  extensionDays?: number
  description?: string
}

export interface NationalityVisaRules {
  [countryCode: string]: VisaRule
}

// Visa rules by nationality
export const visaRulesByNationality: { [nationality: string]: NationalityVisaRules } = {
  // United States passport holders
  'US': {
    'KR': {
      maxDays: 90,
      periodDays: 90,
      resetType: 'exit',
      description: '90 days visa-free, resets on exit'
    },
    'JP': {
      maxDays: 90,
      periodDays: 180,
      resetType: 'rolling',
      description: '90 days within any 180-day period'
    },
    'TH': {
      maxDays: 30,
      periodDays: 30,
      resetType: 'exit',
      extensionDays: 30,
      description: '30 days visa-free, extendable by 30 days'
    },
    'VN': {
      maxDays: 45,
      periodDays: 45,
      resetType: 'exit',
      description: '45 days visa-free, resets on exit'
    }
  },
  
  // South Korean passport holders
  'KR': {
    'US': {
      maxDays: 90,
      periodDays: 180,
      resetType: 'rolling',
      description: '90 days within any 180-day period (ESTA/VWP)'
    },
    'JP': {
      maxDays: 90,
      periodDays: 90,
      resetType: 'exit',
      description: '90 days visa-free, resets on exit'
    },
    'TH': {
      maxDays: 30,
      periodDays: 30,
      resetType: 'exit',
      extensionDays: 30,
      description: '30 days visa-free, extendable by 30 days'
    },
    'VN': {
      maxDays: 15,
      periodDays: 15,
      resetType: 'exit',
      description: '15 days visa-free, resets on exit'
    }
  },

  // Japanese passport holders
  'JP': {
    'US': {
      maxDays: 90,
      periodDays: 180,
      resetType: 'rolling',
      description: '90 days within any 180-day period (VWP)'
    },
    'KR': {
      maxDays: 90,
      periodDays: 90,
      resetType: 'exit',
      description: '90 days visa-free, resets on exit'
    },
    'TH': {
      maxDays: 30,
      periodDays: 30,
      resetType: 'exit',
      extensionDays: 30,
      description: '30 days visa-free, extendable by 30 days'
    },
    'VN': {
      maxDays: 15,
      periodDays: 15,
      resetType: 'exit',
      description: '15 days visa-free, resets on exit'
    }
  },

  // Chinese passport holders
  'CN': {
    'US': {
      maxDays: 90,
      periodDays: 180,
      resetType: 'rolling',
      description: '90 days with valid B1/B2 visa'
    },
    'KR': {
      maxDays: 30,
      periodDays: 30,
      resetType: 'exit',
      description: '30 days visa-free (Jeju Island), others need visa'
    },
    'JP': {
      maxDays: 15,
      periodDays: 15,
      resetType: 'exit',
      description: '15 days visa-free, resets on exit'
    },
    'TH': {
      maxDays: 30,
      periodDays: 30,
      resetType: 'exit',
      description: '30 days visa on arrival'
    },
    'VN': {
      maxDays: 15,
      periodDays: 15,
      resetType: 'exit',
      description: '15 days visa-free, resets on exit'
    }
  },

  // United Kingdom passport holders
  'GB': {
    'US': {
      maxDays: 90,
      periodDays: 180,
      resetType: 'rolling',
      description: '90 days within any 180-day period (ESTA/VWP)'
    },
    'KR': {
      maxDays: 90,
      periodDays: 90,
      resetType: 'exit',
      description: '90 days visa-free, resets on exit'
    },
    'JP': {
      maxDays: 90,
      periodDays: 90,
      resetType: 'exit',
      description: '90 days visa-free, resets on exit'
    },
    'TH': {
      maxDays: 30,
      periodDays: 30,
      resetType: 'exit',
      extensionDays: 30,
      description: '30 days visa-free, extendable by 30 days'
    },
    'VN': {
      maxDays: 15,
      periodDays: 15,
      resetType: 'exit',
      description: '15 days visa-free, resets on exit'
    }
  }
}

// Get visa rules for a specific nationality and destination
export function getVisaRules(nationality: string, destination: string, visaType?: string, userEmail?: string): VisaRule | null {
  // Special rule for zbrianjin@gmail.com's long-term resident status in Korea
  if (userEmail === 'zbrianjin@gmail.com' && destination === 'KR' && visaType === 'long-term-resident') {
    return {
      maxDays: 183,
      periodDays: 365,
      resetType: 'rolling',
      description: '183 days within any 365-day rolling window'
    }
  }
  
  const nationalityRules = visaRulesByNationality[nationality]
  if (!nationalityRules) return null
  
  return nationalityRules[destination] || null
}

// Get all destinations available for a nationality
export function getAvailableDestinations(nationality: string): string[] {
  const nationalityRules = visaRulesByNationality[nationality]
  if (!nationalityRules) return []
  
  return Object.keys(nationalityRules)
}

// Check if visa rules exist for a nationality
export function hasVisaRules(nationality: string): boolean {
  return nationality in visaRulesByNationality
}