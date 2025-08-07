'use client'

import { useState, useEffect } from 'react'
import { Country, VisaRule, Stay } from '@/lib/types'
import AddStayModalEnhanced from '@/components/stays/AddStayModalEnhanced'
import { getStays, addStay } from '@/lib/supabase/stays'
import { countries } from '@/lib/data/countries-and-airports'

interface CalendarViewProps {
  country: Country
  visaRule: VisaRule
}

export default function CalendarView({ country, visaRule }: CalendarViewProps) {
  const [stays, setStays] = useState<Stay[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  
  // Load stays from Supabase
  useEffect(() => {
    loadStays()
  }, [country.code])
  
  const loadStays = async () => {
    setLoading(true)
    try {
      const data = await getStays(country.code)
      setStays(data)
    } catch (error) {
      console.error('Failed to load stays:', error)
      // Use sample data as fallback
      setStays([
        {
          id: '1',
          countryCode: country.code,
          entryDate: '2024-10-15',
          exitDate: '2024-11-10',
          notes: 'tourism'
        },
        {
          id: '2',
          countryCode: country.code,
          entryDate: '2024-12-20',
          exitDate: '2025-01-15',
          notes: 'tourism'
        }
      ])
    } finally {
      setLoading(false)
    }
  }
  
  const handleAddStay = async (newStay: Omit<Stay, 'id'>) => {
    try {
      const added = await addStay(newStay)
      setStays([added, ...stays])
    } catch (error) {
      console.error('Failed to add stay:', error)
      alert('Failed to add stay. Please try again.')
    }
  }

  // 체류 일수 계산
  const calculateDaysUsed = () => {
    const today = new Date()
    let totalDays = 0
    
    if (visaRule.resetType === 'rolling') {
      // 롤링 윈도우 계산 (예: 일본)
      const windowStart = new Date()
      windowStart.setDate(windowStart.getDate() - visaRule.periodDays)
      
      stays.filter(s => s.countryCode === country.code).forEach(stay => {
        const entry = new Date(stay.entryDate)
        const exit = stay.exitDate ? new Date(stay.exitDate) : new Date() // Use today for ongoing stays
        
        // 윈도우 내의 체류만 계산
        if (exit >= windowStart && entry <= today) {
          const overlapStart = entry > windowStart ? entry : windowStart
          const overlapEnd = exit < today ? exit : today
          const days = Math.ceil((overlapEnd.getTime() - overlapStart.getTime()) / (1000 * 60 * 60 * 24)) + 1
          totalDays += Math.max(0, days)
        }
      })
    } else {
      // 단순 리셋 계산 (예: 한국, 베트남, 태국)
      // 가장 최근 입국부터 계산
      const countryStays = stays.filter(s => s.countryCode === country.code)
      const lastStay = countryStays[countryStays.length - 1]
      if (lastStay) {
        const entry = new Date(lastStay.entryDate)
        const exit = lastStay.exitDate ? new Date(lastStay.exitDate) : new Date() // Use today for ongoing stays
        const effectiveExit = exit < today ? exit : today
        totalDays = Math.ceil((effectiveExit.getTime() - entry.getTime()) / (1000 * 60 * 60 * 24)) + 1
      }
    }
    
    return totalDays
  }

  const daysUsed = calculateDaysUsed()
  const daysRemaining = visaRule.maxDays - daysUsed
  const percentage = (daysUsed / visaRule.maxDays) * 100

  return (
    <div className="space-y-6">
      {/* Status Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{country.flag}</span>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">{country.name}</h3>
              <p className="text-sm text-gray-500">
                {visaRule.resetType === 'rolling' 
                  ? `${visaRule.maxDays} days in ${visaRule.periodDays} days (rolling)`
                  : `${visaRule.maxDays} days per entry`}
              </p>
            </div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Days Used</span>
            <span className="font-medium">{daysUsed} / {visaRule.maxDays} days</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all ${
                percentage > 80 ? 'bg-red-500' : percentage > 60 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(100, percentage)}%` }}
            />
          </div>
          <p className={`text-sm ${daysRemaining < 30 ? 'text-red-600' : 'text-gray-600'}`}>
            {daysRemaining > 0 
              ? `${daysRemaining} days remaining`
              : 'Visa limit reached!'}
          </p>
        </div>
      </div>

      {/* Recent Stays */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Stays</h3>
        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : (
        <div className="space-y-3">
          {stays.filter(s => s.countryCode === country.code).map(stay => (
            <div key={stay.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">
                  {new Date(stay.entryDate).toLocaleDateString()} - {stay.exitDate ? new Date(stay.exitDate).toLocaleDateString() : 'Present'}
                </p>
                <p className="text-sm text-gray-500">
                  {stay.exitDate ? Math.ceil((new Date(stay.exitDate).getTime() - new Date(stay.entryDate).getTime()) / (1000 * 60 * 60 * 24)) + 1 : Math.ceil((new Date().getTime() - new Date(stay.entryDate).getTime()) / (1000 * 60 * 60 * 24)) + 1} days
                </p>
              </div>
              <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded">
                {stay.notes || 'tourism'}
              </span>
            </div>
          ))}
        </div>
        )}
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="mt-4 w-full py-2 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
          Add New Stay
        </button>
      </div>

      {/* Calendar Grid (Placeholder) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Calendar View</h3>
        <p className="text-gray-500">Calendar implementation coming soon...</p>
      </div>
      
      {/* Add Stay Modal */}
      <AddStayModalEnhanced
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdded={loadStays}
        countries={countries}
        defaultCountry={country.code}
      />
    </div>
  )
}