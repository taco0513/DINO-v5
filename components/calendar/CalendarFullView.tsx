'use client'

import { useState } from 'react'
import { Country, Stay } from '@/lib/types'

interface CalendarFullViewProps {
  stays: Stay[]
  countries: Country[]
  loading: boolean
}

export default function CalendarFullView({ stays, countries, loading }: CalendarFullViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  
  // Get current month's first day and number of days
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
  const firstDayWeekday = firstDayOfMonth.getDay()
  const daysInMonth = lastDayOfMonth.getDate()
  
  // Generate calendar grid
  const calendarDays = []
  
  // Add empty cells for days before the first day of month
  for (let i = 0; i < firstDayWeekday; i++) {
    calendarDays.push(null)
  }
  
  // Add all days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day)
  }
  
  const getCountryColor = (countryCode: string) => {
    const colors: Record<string, string> = {
      KR: 'bg-red-100 border-red-300 text-red-700',
      JP: 'bg-blue-100 border-blue-300 text-blue-700',
      TH: 'bg-yellow-100 border-yellow-300 text-yellow-700',
      VN: 'bg-green-100 border-green-300 text-green-700'
    }
    return colors[countryCode] || 'bg-gray-100 border-gray-300 text-gray-700'
  }
  
  const getStaysForDate = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const date = new Date(dateStr)
    
    return stays.filter(stay => {
      const entryDate = new Date(stay.entryDate)
      const exitDate = new Date(stay.exitDate)
      return date >= entryDate && date <= exitDate
    })
  }
  
  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }
  
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-7 gap-4">
            {Array.from({ length: 35 }).map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Previous month"
          >
            ←
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Today
          </button>
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Next month"
          >
            →
          </button>
        </div>
      </div>
      
      {/* Weekday Headers */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {weekDays.map(day => (
          <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {calendarDays.map((day, index) => {
          if (day === null) {
            return <div key={index} className="h-24"></div>
          }
          
          const dayStays = getStaysForDate(day)
          const isToday = 
            currentDate.getFullYear() === new Date().getFullYear() &&
            currentDate.getMonth() === new Date().getMonth() &&
            day === new Date().getDate()
          
          return (
            <div
              key={day}
              className={`h-24 border border-gray-200 rounded-lg p-2 hover:bg-gray-50 transition-colors ${
                isToday ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
              }`}
            >
              <div className="text-sm font-medium text-gray-900 mb-1">
                {day}
              </div>
              <div className="space-y-1">
                {dayStays.map(stay => {
                  const country = countries.find(c => c.code === stay.countryCode)
                  return (
                    <div
                      key={stay.id}
                      className={`text-xs px-2 py-1 rounded border ${getCountryColor(stay.countryCode)}`}
                      title={`${country?.name} (${stay.purpose})`}
                    >
                      {country?.flag} {country?.name}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
      
      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Legend</h3>
        <div className="flex flex-wrap gap-4">
          {countries.map(country => (
            <div key={country.code} className="flex items-center gap-2">
              <div className={`w-4 h-4 border rounded ${getCountryColor(country.code)}`}></div>
              <span className="text-sm text-gray-600">
                {country.flag} {country.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}