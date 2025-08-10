import { renderHook, act } from '@testing-library/react'
import { ReactNode } from 'react'
import { UserProvider, useUser } from '../UserContext'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString()
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    }
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

// Test wrapper
const wrapper = ({ children }: { children: ReactNode }) => (
  <UserProvider>{children}</UserProvider>
)

describe('UserContext', () => {
  beforeEach(() => {
    localStorageMock.clear()
  })

  it('should provide default user profile', () => {
    const { result } = renderHook(() => useUser(), { wrapper })
    
    expect(result.current.nationality).toBe('US')
    expect(result.current.userEmail).toBe('zbrianjin@gmail.com') // Hardcoded for backward compatibility
    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.profile.preferredLanguage).toBe('en')
  })

  it('should update nationality', () => {
    const { result } = renderHook(() => useUser(), { wrapper })
    
    act(() => {
      result.current.setNationality('CA')
    })
    
    expect(result.current.nationality).toBe('CA')
    expect(result.current.profile.nationality).toBe('CA')
  })

  it('should update user email', () => {
    const { result } = renderHook(() => useUser(), { wrapper })
    
    act(() => {
      result.current.setUserEmail('test@example.com')
    })
    
    expect(result.current.userEmail).toBe('test@example.com')
    expect(result.current.profile.email).toBe('test@example.com')
  })

  it('should update profile', () => {
    const { result } = renderHook(() => useUser(), { wrapper })
    
    act(() => {
      result.current.setProfile({
        nationality: 'AU',
        preferredLanguage: 'fr'
      })
    })
    
    expect(result.current.profile.nationality).toBe('AU')
    expect(result.current.profile.preferredLanguage).toBe('fr')
  })

  it('should persist changes to localStorage', () => {
    const { result } = renderHook(() => useUser(), { wrapper })
    
    act(() => {
      result.current.setNationality('JP')
    })
    
    const savedSettings = localStorage.getItem('dino-v5-settings')
    expect(savedSettings).toBeTruthy()
    
    const settings = JSON.parse(savedSettings!)
    expect(settings.userProfile.nationality).toBe('JP')
  })

  it('should load profile from localStorage on mount', () => {
    // Pre-populate localStorage
    const testProfile = {
      nationality: 'DE',
      preferredLanguage: 'de',
      email: 'test@example.com'
    }
    localStorage.setItem('dino-v5-settings', JSON.stringify({
      userProfile: testProfile
    }))
    
    const { result } = renderHook(() => useUser(), { wrapper })
    
    // Should load from localStorage but email gets overridden to hardcoded value
    expect(result.current.profile.nationality).toBe('DE')
    expect(result.current.profile.preferredLanguage).toBe('de')
    expect(result.current.userEmail).toBe('zbrianjin@gmail.com') // Hardcoded override
  })
})