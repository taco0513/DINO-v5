'use client'

import { useState, useEffect } from 'react'
import AddStayModalEnhanced from '@/components/stays/AddStayModalEnhanced'
import EditStayModalEnhanced from '@/components/stays/EditStayModalEnhanced'
import { Country, Stay } from '@/lib/types'
import { countries } from '@/lib/data/countries-and-airports'
import { loadStaysFromStorage } from '@/lib/storage/stays-storage'

export default function FormDemoPage() {
  const [countriesList] = useState<Country[]>(countries)
  const [stays, setStays] = useState<Stay[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedStay, setSelectedStay] = useState<Stay | null>(null)
  const [loading, setLoading] = useState(true)

  // Load stays
  useEffect(() => {
    const loadData = () => {
      try {
        // Load stays from storage
        const staysData = loadStaysFromStorage()
        setStays(staysData)
      } catch (error) {
        console.error('Failed to load stays:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [])

  const handleStaysUpdate = () => {
    // Reload stays from storage
    const updatedStays = loadStaysFromStorage()
    setStays(updatedStays)
  }

  const handleEditStay = (stay: Stay) => {
    setSelectedStay(stay)
    setShowEditModal(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ✨ Enhanced Form UX Demo
          </h1>
          <p className="text-gray-600">
            Experience the improved form design with better UX patterns, accessibility, and mobile optimization
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="text-2xl mb-3">♿</div>
            <h3 className="font-semibold text-gray-900 mb-2">WCAG Compliant</h3>
            <p className="text-sm text-gray-600">
              Full ARIA labels, keyboard navigation, and screen reader support
            </p>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="text-2xl mb-3">✅</div>
            <h3 className="font-semibold text-gray-900 mb-2">Real-time Validation</h3>
            <p className="text-sm text-gray-600">
              Inline error messages with helpful feedback, no more alerts
            </p>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="text-2xl mb-3">⚡</div>
            <h3 className="font-semibold text-gray-900 mb-2">Micro-interactions</h3>
            <p className="text-sm text-gray-600">
              300-500ms animations for smooth feedback and loading states
            </p>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="text-2xl mb-3">📱</div>
            <h3 className="font-semibold text-gray-900 mb-2">Mobile Optimized</h3>
            <p className="text-sm text-gray-600">
              Touch-friendly 44px targets and responsive layouts
            </p>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="text-2xl mb-3">🎯</div>
            <h3 className="font-semibold text-gray-900 mb-2">Smart Defaults</h3>
            <p className="text-sm text-gray-600">
              Auto-suggestions based on travel history and visa types
            </p>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="text-2xl mb-3">🎨</div>
            <h3 className="font-semibold text-gray-900 mb-2">Visual Feedback</h3>
            <p className="text-sm text-gray-600">
              Success animations, progress indicators, and clear states
            </p>
          </div>
        </div>

        {/* Demo Actions */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Try the Enhanced Forms</h2>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-all duration-300 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add New Stay (Enhanced)
            </button>
            
            {stays.length > 0 && (
              <button
                onClick={() => handleEditStay(stays[0])}
                className="px-6 py-3 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-all duration-300 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Latest Stay (Enhanced)
              </button>
            )}
          </div>
        </div>

        {/* Recent Stays Preview */}
        {stays.length > 0 && (
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Stays</h2>
            <div className="space-y-3">
              {stays.slice(0, 5).map((stay) => {
                const country = countriesList.find(c => c.code === stay.countryCode)
                return (
                  <div 
                    key={stay.id} 
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => handleEditStay(stay)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{country?.flag || '🌍'}</span>
                      <div>
                        <p className="font-medium text-gray-900">
                          {country?.name || stay.countryCode}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(stay.entryDate).toLocaleDateString()} - {
                            stay.exitDate 
                              ? new Date(stay.exitDate).toLocaleDateString()
                              : 'Ongoing'
                          }
                        </p>
                      </div>
                    </div>
                    <button className="text-blue-600 hover:text-blue-700 p-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Key Improvements List */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6 border border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-3">🎯 Key Improvements Applied</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">✓</span>
              <span>Replaced alert() with inline error messages for better UX</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">✓</span>
              <span>Added real-time validation with field-level error states</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">✓</span>
              <span>Implemented 300-500ms micro-interactions for all actions</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">✓</span>
              <span>Full ARIA labels and keyboard navigation support</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">✓</span>
              <span>Mobile-optimized with 44px minimum touch targets</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">✓</span>
              <span>Smart defaults based on travel history</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">✓</span>
              <span>Success animations and loading states</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">✓</span>
              <span>Date suggestions based on visa duration</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Modals */}
      <AddStayModalEnhanced
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdded={handleStaysUpdate}
        countries={countriesList}
      />

      <EditStayModalEnhanced
        open={showEditModal}
        stay={selectedStay}
        countries={countriesList}
        onClose={() => {
          setShowEditModal(false)
          setSelectedStay(null)
        }}
        onUpdated={handleStaysUpdate}
      />
    </div>
  )
}