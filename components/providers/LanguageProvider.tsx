'use client'

import { useState, useEffect } from 'react'
import { LanguageContext, translations, type Translations } from '@/lib/i18n/translations'

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState('en')

  useEffect(() => {
    // Load language from localStorage or settings
    const savedSettings = localStorage.getItem('dino-v5-settings')
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings)
        if (settings.language) {
          setLanguageState(settings.language)
        }
      } catch (error) {
        console.error('Failed to load language setting:', error)
      }
    }
  }, [])

  const setLanguage = (newLanguage: string) => {
    setLanguageState(newLanguage)
    
    // Update localStorage settings
    const savedSettings = localStorage.getItem('dino-v5-settings')
    let settings = {}
    
    if (savedSettings) {
      try {
        settings = JSON.parse(savedSettings)
      } catch (error) {
        console.error('Failed to parse settings:', error)
      }
    }
    
    const updatedSettings = { ...settings, language: newLanguage }
    localStorage.setItem('dino-v5-settings', JSON.stringify(updatedSettings))
  }

  const t = (key: keyof Translations): string => {
    const langTranslations = translations[language] || translations.en
    return langTranslations[key] || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}