'use client'

import { useState, useRef, useEffect } from 'react'
import { Country } from '@/lib/types'

interface CountrySelectProps {
  id: string
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  countries: Country[]
  placeholder?: string
  required?: boolean
  error?: boolean
  className?: string
  label?: string
}

export default function CountrySelect({
  id,
  value,
  onChange,
  onBlur,
  countries,
  placeholder = 'Type to search...',
  required = false,
  error = false,
  className = '',
  label
}: CountrySelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  // Popular countries for digital nomads
  const popularCountries = ['KR', 'JP', 'TH', 'VN', 'US', 'SG', 'MY', 'ID']
  
  // Sort countries alphabetically
  const sortedCountries = [...countries].sort((a, b) => 
    a.name.localeCompare(b.name)
  )

  // Filter countries based on search term
  const filteredCountries = sortedCountries.filter(country =>
    country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    country.code.toLowerCase().includes(searchTerm.toLowerCase())
  )
  
  // If no search term, show popular countries at top
  const displayCountries = searchTerm 
    ? filteredCountries
    : [
        ...sortedCountries.filter(c => popularCountries.includes(c.code)),
        ...sortedCountries.filter(c => !popularCountries.includes(c.code))
      ]
  
  // Auto-highlight first result when searching
  useEffect(() => {
    if (searchTerm && displayCountries.length > 0) {
      setHighlightedIndex(0)
    } else if (!searchTerm) {
      setHighlightedIndex(-1)
    }
  }, [searchTerm, displayCountries.length])

  // Get selected country
  const selectedCountry = countries.find(c => c.code === value)

  // Display value - show search term when typing, selected country when not
  const displayValue = isOpen 
    ? searchTerm
    : selectedCountry 
      ? `${selectedCountry.flag} ${selectedCountry.name}`
      : ''

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearchTerm('')
        setHighlightedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen && (e.key === 'ArrowDown' || e.key === 'Enter')) {
      setIsOpen(true)
      setHighlightedIndex(0) // Start with first item highlighted
      return
    }

    if (!isOpen) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        if (highlightedIndex === -1) {
          setHighlightedIndex(0)
        } else {
          setHighlightedIndex(prev => 
            prev < displayCountries.length - 1 ? prev + 1 : prev
          )
        }
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1)
        break
      case 'Enter':
        e.preventDefault()
        if (highlightedIndex >= 0 && highlightedIndex < displayCountries.length) {
          selectCountry(displayCountries[highlightedIndex].code)
        } else if (displayCountries.length === 1) {
          // If only one result, select it
          selectCountry(displayCountries[0].code)
        }
        break
      case 'Escape':
        setIsOpen(false)
        setSearchTerm('')
        setHighlightedIndex(-1)
        break
    }
  }

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const highlightedElement = listRef.current.children[highlightedIndex] as HTMLElement
      if (highlightedElement) {
        highlightedElement.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth'
        })
      }
    }
  }, [highlightedIndex])

  const selectCountry = (countryCode: string) => {
    onChange(countryCode)
    setIsOpen(false)
    setSearchTerm('')
    setHighlightedIndex(-1)
  }

  return (
    <div className="relative" ref={containerRef}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      <div className="relative">
        <input
          ref={inputRef}
          id={id}
          type="text"
          value={displayValue}
          onChange={(e) => {
            setSearchTerm(e.target.value)
            if (!isOpen) setIsOpen(true)
          }}
          onFocus={() => {
            setIsOpen(true)
            setSearchTerm('')
          }}
          onBlur={onBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          required={required}
          className={`
            w-full px-3 py-2 pr-10 border rounded-lg 
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent 
            transition-all duration-300 pointer-events-auto
            ${error ? 'border-red-500' : 'border-gray-300'}
            ${className}
          `}
          autoComplete="off"
          style={{ pointerEvents: 'auto' }}
        />
        
        {/* Dropdown arrow */}
        <button
          type="button"
          onClick={() => {
            setIsOpen(!isOpen)
            if (!isOpen) {
              inputRef.current?.focus()
              setSearchTerm('')
            }
          }}
          className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700"
        >
          <svg 
            className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Dropdown list */}
      {isOpen && (
        <div className="absolute z-[10000] w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-hidden">
          {displayCountries.length > 0 ? (
            <ul 
              ref={listRef}
              className="py-1 overflow-y-auto max-h-60 scrollbar-thin scrollbar-thumb-gray-300"
            >
              {!searchTerm && popularCountries.some(code => sortedCountries.find(c => c.code === code)) && (
                <>
                  <li className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">
                    Popular Destinations
                  </li>
                  {displayCountries.slice(0, popularCountries.length).map((country, index) => (
                    <li
                      key={`popular-${country.code}`}
                      onClick={() => selectCountry(country.code)}
                      onMouseEnter={() => setHighlightedIndex(index)}
                      className={`
                        px-3 py-2 cursor-pointer flex items-center gap-2
                        transition-colors duration-150
                        ${highlightedIndex === index ? 'bg-blue-50 text-blue-700' : ''}
                        ${value === country.code ? 'bg-gray-50 font-medium' : ''}
                        hover:bg-blue-50 hover:text-blue-700
                      `}
                    >
                      <span className="text-lg">{country.flag}</span>
                      <span className="flex-1">{country.name}</span>
                      <span className="text-xs text-gray-400">⭐</span>
                      {value === country.code && (
                        <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </li>
                  ))}
                  <li className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">
                    All Countries
                  </li>
                </>
              )}
              {(searchTerm ? displayCountries : displayCountries.slice(popularCountries.length)).map((country, index) => {
                const actualIndex = searchTerm ? index : index + popularCountries.length
                return (
                  <li
                    key={country.code}
                    onClick={() => selectCountry(country.code)}
                    onMouseEnter={() => setHighlightedIndex(actualIndex)}
                    className={`
                      px-3 py-2 cursor-pointer flex items-center gap-2
                      transition-colors duration-150
                      ${highlightedIndex === actualIndex ? 'bg-blue-50 text-blue-700' : ''}
                      ${value === country.code ? 'bg-gray-50 font-medium' : ''}
                      hover:bg-blue-50 hover:text-blue-700
                    `}
                  >
                    <span className="text-lg">{country.flag}</span>
                    <span className="flex-1">{country.name}</span>
                    {value === country.code && (
                      <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </li>
                )
              })}
            </ul>
          ) : (
            <div className="px-3 py-4 text-center text-gray-500">
              No countries found matching "{searchTerm}"
            </div>
          )}
        </div>
      )}
    </div>
  )
}