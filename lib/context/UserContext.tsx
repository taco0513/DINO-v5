'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

interface UserProfile {
  email?: string
  nationality: string
  preferredLanguage?: string
  customVisaRules?: Record<string, any>
}

interface UserContextType {
  profile: UserProfile
  userEmail?: string
  nationality: string
  setProfile: (profile: Partial<UserProfile>) => void
  setUserEmail: (email: string | undefined) => void
  setNationality: (nationality: string) => void
  isAuthenticated: boolean
}

const UserContext = createContext<UserContextType | undefined>(undefined)

const DEFAULT_PROFILE: UserProfile = {
  nationality: 'US',
  preferredLanguage: 'en'
}

export function UserProvider({ children }: { children: ReactNode }) {
  const [profile, setProfileState] = useState<UserProfile>(DEFAULT_PROFILE)

  useEffect(() => {
    // Load user profile from localStorage
    const savedSettings = localStorage.getItem('dino-v5-settings')
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings)
        if (settings.userProfile) {
          setProfileState(prev => ({ ...prev, ...settings.userProfile }))
        }
      } catch (error) {
        console.error('Failed to load user profile:', error)
      }
    }

    // For now, set the hardcoded email to maintain backward compatibility
    // In the future, this would come from authentication
    setProfileState(prev => ({ ...prev, email: 'zbrianjin@gmail.com' }))
  }, [])

  const setProfile = (updates: Partial<UserProfile>) => {
    const newProfile = { ...profile, ...updates }
    setProfileState(newProfile)
    
    // Persist to localStorage
    saveProfileToStorage(newProfile)
  }

  const setUserEmail = (email: string | undefined) => {
    const newProfile = { ...profile, email }
    setProfileState(newProfile)
    saveProfileToStorage(newProfile)
  }

  const setNationality = (nationality: string) => {
    const newProfile = { ...profile, nationality }
    setProfileState(newProfile)
    saveProfileToStorage(newProfile)
  }

  const saveProfileToStorage = (profile: UserProfile) => {
    try {
      const savedSettings = localStorage.getItem('dino-v5-settings')
      let settings = {}
      
      if (savedSettings) {
        settings = JSON.parse(savedSettings)
      }
      
      const updatedSettings = { ...settings, userProfile: profile }
      localStorage.setItem('dino-v5-settings', JSON.stringify(updatedSettings))
    } catch (error) {
      console.error('Failed to save user profile:', error)
    }
  }

  const isAuthenticated = Boolean(profile.email)

  return (
    <UserContext.Provider value={{
      profile,
      userEmail: profile.email,
      nationality: profile.nationality,
      setProfile,
      setUserEmail,
      setNationality,
      isAuthenticated
    }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}

// Backward compatibility functions
export function getCurrentUserEmail(): string | undefined {
  // This function maintains backward compatibility
  // In components using the new context, use useUser() hook instead
  const settings = typeof window !== 'undefined' ? localStorage.getItem('dino-v5-settings') : null
  if (settings) {
    try {
      const parsed = JSON.parse(settings)
      return parsed.userProfile?.email || 'zbrianjin@gmail.com'
    } catch {
      return 'zbrianjin@gmail.com'
    }
  }
  return 'zbrianjin@gmail.com'
}

export function isCurrentUser(email: string): boolean {
  return getCurrentUserEmail() === email
}