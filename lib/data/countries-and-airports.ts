/**
 * Comprehensive countries and airports database for digital nomads
 * Includes popular digital nomad destinations with major airports
 */

import { Country } from '../types'

export interface Airport {
  code: string
  name: string
  city: string
  countryCode: string
}

// Expanded country list for digital nomads
export const countries: Country[] = [
  // East Asia
  { code: 'KR', name: 'South Korea', flag: '🇰🇷' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵' },
  { code: 'CN', name: 'China', flag: '🇨🇳' },
  { code: 'HK', name: 'Hong Kong', flag: '🇭🇰' },
  { code: 'TW', name: 'Taiwan', flag: '🇹🇼' },
  { code: 'MO', name: 'Macau', flag: '🇲🇴' },

  // Southeast Asia  
  { code: 'TH', name: 'Thailand', flag: '🇹🇭' },
  { code: 'VN', name: 'Vietnam', flag: '🇻🇳' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬' },
  { code: 'MY', name: 'Malaysia', flag: '🇲🇾' },
  { code: 'ID', name: 'Indonesia', flag: '🇮🇩' },
  { code: 'PH', name: 'Philippines', flag: '🇵🇭' },
  { code: 'LA', name: 'Laos', flag: '🇱🇦' },
  { code: 'KH', name: 'Cambodia', flag: '🇰🇭' },
  { code: 'MM', name: 'Myanmar', flag: '🇲🇲' },

  // South Asia
  { code: 'IN', name: 'India', flag: '🇮🇳' },
  { code: 'LK', name: 'Sri Lanka', flag: '🇱🇰' },
  { code: 'NP', name: 'Nepal', flag: '🇳🇵' },
  { code: 'BD', name: 'Bangladesh', flag: '🇧🇩' },
  { code: 'PK', name: 'Pakistan', flag: '🇵🇰' },

  // Central Asia
  { code: 'UZ', name: 'Uzbekistan', flag: '🇺🇿' },
  { code: 'KZ', name: 'Kazakhstan', flag: '🇰🇿' },
  { code: 'KG', name: 'Kyrgyzstan', flag: '🇰🇬' },

  // Middle East
  { code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪' },
  { code: 'QA', name: 'Qatar', flag: '🇶🇦' },
  { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦' },
  { code: 'IL', name: 'Israel', flag: '🇮🇱' },
  { code: 'JO', name: 'Jordan', flag: '🇯🇴' },
  { code: 'TR', name: 'Turkey', flag: '🇹🇷' },

  // Europe
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸' },
  { code: 'PT', name: 'Portugal', flag: '🇵🇹' },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱' },
  { code: 'BE', name: 'Belgium', flag: '🇧🇪' },
  { code: 'CH', name: 'Switzerland', flag: '🇨🇭' },
  { code: 'AT', name: 'Austria', flag: '🇦🇹' },
  { code: 'CZ', name: 'Czech Republic', flag: '🇨🇿' },
  { code: 'PL', name: 'Poland', flag: '🇵🇱' },
  { code: 'HU', name: 'Hungary', flag: '🇭🇺' },
  { code: 'GR', name: 'Greece', flag: '🇬🇷' },
  { code: 'HR', name: 'Croatia', flag: '🇭🇷' },
  { code: 'RO', name: 'Romania', flag: '🇷🇴' },
  { code: 'BG', name: 'Bulgaria', flag: '🇧🇬' },
  { code: 'RS', name: 'Serbia', flag: '🇷🇸' },
  { code: 'UA', name: 'Ukraine', flag: '🇺🇦' },
  { code: 'RU', name: 'Russia', flag: '🇷🇺' },
  { code: 'EE', name: 'Estonia', flag: '🇪🇪' },
  { code: 'LV', name: 'Latvia', flag: '🇱🇻' },
  { code: 'LT', name: 'Lithuania', flag: '🇱🇹' },
  { code: 'FI', name: 'Finland', flag: '🇫🇮' },
  { code: 'SE', name: 'Sweden', flag: '🇸🇪' },
  { code: 'NO', name: 'Norway', flag: '🇳🇴' },
  { code: 'DK', name: 'Denmark', flag: '🇩🇰' },
  { code: 'IS', name: 'Iceland', flag: '🇮🇸' },

  // Americas
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽' },
  { code: 'GT', name: 'Guatemala', flag: '🇬🇹' },
  { code: 'CR', name: 'Costa Rica', flag: '🇨🇷' },
  { code: 'PA', name: 'Panama', flag: '🇵🇦' },
  { code: 'CO', name: 'Colombia', flag: '🇨🇴' },
  { code: 'EC', name: 'Ecuador', flag: '🇪🇨' },
  { code: 'PE', name: 'Peru', flag: '🇵🇪' },
  { code: 'BO', name: 'Bolivia', flag: '🇧🇴' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷' },
  { code: 'AR', name: 'Argentina', flag: '🇦🇷' },
  { code: 'CL', name: 'Chile', flag: '🇨🇱' },
  { code: 'UY', name: 'Uruguay', flag: '🇺🇾' },

  // Africa
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦' },
  { code: 'MA', name: 'Morocco', flag: '🇲🇦' },
  { code: 'EG', name: 'Egypt', flag: '🇪🇬' },
  { code: 'KE', name: 'Kenya', flag: '🇰🇪' },
  { code: 'TZ', name: 'Tanzania', flag: '🇹🇿' },
  { code: 'RW', name: 'Rwanda', flag: '🇷🇼' },
  { code: 'GH', name: 'Ghana', flag: '🇬🇭' },
  { code: 'NG', name: 'Nigeria', flag: '🇳🇬' },

  // Oceania
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'NZ', name: 'New Zealand', flag: '🇳🇿' },
  { code: 'FJ', name: 'Fiji', flag: '🇫🇯' },
]

// Major airports by country (focusing on digital nomad popular destinations)
export const airports: Airport[] = [
  // Korea
  { code: 'ICN', name: 'Incheon International Airport', city: 'Seoul', countryCode: 'KR' },
  { code: 'GMP', name: 'Gimpo Airport', city: 'Seoul', countryCode: 'KR' },
  { code: 'PUS', name: 'Busan Airport', city: 'Busan', countryCode: 'KR' },
  { code: 'CJU', name: 'Jeju Airport', city: 'Jeju', countryCode: 'KR' },

  // Japan
  { code: 'NRT', name: 'Narita International Airport', city: 'Tokyo', countryCode: 'JP' },
  { code: 'HND', name: 'Haneda Airport', city: 'Tokyo', countryCode: 'JP' },
  { code: 'KIX', name: 'Kansai International Airport', city: 'Osaka', countryCode: 'JP' },
  { code: 'ITM', name: 'Itami Airport', city: 'Osaka', countryCode: 'JP' },
  { code: 'NGO', name: 'Chubu Centrair Airport', city: 'Nagoya', countryCode: 'JP' },
  { code: 'FUK', name: 'Fukuoka Airport', city: 'Fukuoka', countryCode: 'JP' },
  { code: 'CTS', name: 'New Chitose Airport', city: 'Sapporo', countryCode: 'JP' },

  // Thailand
  { code: 'BKK', name: 'Suvarnabhumi Airport', city: 'Bangkok', countryCode: 'TH' },
  { code: 'DMK', name: 'Don Mueang Airport', city: 'Bangkok', countryCode: 'TH' },
  { code: 'CNX', name: 'Chiang Mai Airport', city: 'Chiang Mai', countryCode: 'TH' },
  { code: 'HKT', name: 'Phuket Airport', city: 'Phuket', countryCode: 'TH' },
  { code: 'USM', name: 'Koh Samui Airport', city: 'Koh Samui', countryCode: 'TH' },

  // Vietnam
  { code: 'SGN', name: 'Tan Son Nhat Airport', city: 'Ho Chi Minh City', countryCode: 'VN' },
  { code: 'HAN', name: 'Noi Bai Airport', city: 'Hanoi', countryCode: 'VN' },
  { code: 'DAD', name: 'Da Nang Airport', city: 'Da Nang', countryCode: 'VN' },

  // Singapore
  { code: 'SIN', name: 'Changi Airport', city: 'Singapore', countryCode: 'SG' },

  // Malaysia
  { code: 'KUL', name: 'Kuala Lumpur International Airport', city: 'Kuala Lumpur', countryCode: 'MY' },
  { code: 'SZB', name: 'Subang Airport', city: 'Kuala Lumpur', countryCode: 'MY' },
  { code: 'PEN', name: 'Penang Airport', city: 'Penang', countryCode: 'MY' },

  // Indonesia
  { code: 'CGK', name: 'Soekarno-Hatta Airport', city: 'Jakarta', countryCode: 'ID' },
  { code: 'DPS', name: 'Ngurah Rai Airport', city: 'Bali', countryCode: 'ID' },
  { code: 'JOG', name: 'Yogyakarta Airport', city: 'Yogyakarta', countryCode: 'ID' },

  // Philippines
  { code: 'MNL', name: 'Ninoy Aquino Airport', city: 'Manila', countryCode: 'PH' },
  { code: 'CEB', name: 'Mactan-Cebu Airport', city: 'Cebu', countryCode: 'PH' },

  // Hong Kong
  { code: 'HKG', name: 'Hong Kong International Airport', city: 'Hong Kong', countryCode: 'HK' },

  // Taiwan
  { code: 'TPE', name: 'Taiwan Taoyuan Airport', city: 'Taipei', countryCode: 'TW' },
  { code: 'TSA', name: 'Songshan Airport', city: 'Taipei', countryCode: 'TW' },

  // China
  { code: 'PEK', name: 'Beijing Capital Airport', city: 'Beijing', countryCode: 'CN' },
  { code: 'PVG', name: 'Shanghai Pudong Airport', city: 'Shanghai', countryCode: 'CN' },
  { code: 'CAN', name: 'Guangzhou Airport', city: 'Guangzhou', countryCode: 'CN' },

  // India
  { code: 'DEL', name: 'Indira Gandhi Airport', city: 'Delhi', countryCode: 'IN' },
  { code: 'BOM', name: 'Chhatrapati Shivaji Airport', city: 'Mumbai', countryCode: 'IN' },
  { code: 'BLR', name: 'Kempegowda Airport', city: 'Bangalore', countryCode: 'IN' },
  { code: 'GOI', name: 'Goa Airport', city: 'Goa', countryCode: 'IN' },

  // UAE
  { code: 'DXB', name: 'Dubai International Airport', city: 'Dubai', countryCode: 'AE' },
  { code: 'AUH', name: 'Abu Dhabi Airport', city: 'Abu Dhabi', countryCode: 'AE' },

  // Turkey
  { code: 'IST', name: 'Istanbul Airport', city: 'Istanbul', countryCode: 'TR' },
  { code: 'SAW', name: 'Sabiha Gokcen Airport', city: 'Istanbul', countryCode: 'TR' },

  // Europe - Major Hubs
  { code: 'LHR', name: 'Heathrow Airport', city: 'London', countryCode: 'GB' },
  { code: 'LGW', name: 'Gatwick Airport', city: 'London', countryCode: 'GB' },
  { code: 'CDG', name: 'Charles de Gaulle Airport', city: 'Paris', countryCode: 'FR' },
  { code: 'FRA', name: 'Frankfurt Airport', city: 'Frankfurt', countryCode: 'DE' },
  { code: 'AMS', name: 'Amsterdam Airport', city: 'Amsterdam', countryCode: 'NL' },
  { code: 'FCO', name: 'Rome Fiumicino Airport', city: 'Rome', countryCode: 'IT' },
  { code: 'MAD', name: 'Madrid Airport', city: 'Madrid', countryCode: 'ES' },
  { code: 'BCN', name: 'Barcelona Airport', city: 'Barcelona', countryCode: 'ES' },
  { code: 'LIS', name: 'Lisbon Airport', city: 'Lisbon', countryCode: 'PT' },
  { code: 'ZUR', name: 'Zurich Airport', city: 'Zurich', countryCode: 'CH' },

  // Americas
  { code: 'JFK', name: 'John F. Kennedy Airport', city: 'New York', countryCode: 'US' },
  { code: 'LAX', name: 'Los Angeles Airport', city: 'Los Angeles', countryCode: 'US' },
  { code: 'SFO', name: 'San Francisco Airport', city: 'San Francisco', countryCode: 'US' },
  { code: 'MIA', name: 'Miami Airport', city: 'Miami', countryCode: 'US' },
  { code: 'YYZ', name: 'Toronto Pearson Airport', city: 'Toronto', countryCode: 'CA' },
  { code: 'YVR', name: 'Vancouver Airport', city: 'Vancouver', countryCode: 'CA' },
  { code: 'MEX', name: 'Mexico City Airport', city: 'Mexico City', countryCode: 'MX' },
  { code: 'GRU', name: 'São Paulo Airport', city: 'São Paulo', countryCode: 'BR' },
  { code: 'EZE', name: 'Buenos Aires Airport', city: 'Buenos Aires', countryCode: 'AR' },

  // Oceania
  { code: 'SYD', name: 'Sydney Airport', city: 'Sydney', countryCode: 'AU' },
  { code: 'MEL', name: 'Melbourne Airport', city: 'Melbourne', countryCode: 'AU' },
  { code: 'AKL', name: 'Auckland Airport', city: 'Auckland', countryCode: 'NZ' },
]

// Helper functions
export function getAirportsByCountry(countryCode: string): Airport[] {
  return airports.filter(airport => airport.countryCode === countryCode)
}

export function getCountryByCode(code: string): Country | undefined {
  return countries.find(country => country.code === code)
}

export function getAirportByCode(code: string): Airport | undefined {
  return airports.find(airport => airport.code === code)
}

export function searchAirports(query: string, countryCode?: string): Airport[] {
  const searchTerm = query.toLowerCase()
  let filteredAirports = airports
  
  if (countryCode) {
    filteredAirports = airports.filter(airport => airport.countryCode === countryCode)
  }
  
  return filteredAirports.filter(airport =>
    airport.code.toLowerCase().includes(searchTerm) ||
    airport.name.toLowerCase().includes(searchTerm) ||
    airport.city.toLowerCase().includes(searchTerm)
  )
}