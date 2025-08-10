'use client'

import { useState } from 'react'
import AddStayModalEnhanced from '@/components/stays/AddStayModalEnhanced'
import { countries } from '@/lib/data/countries-and-airports'

export default function TestModalPage() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Modal Test Page</h1>
        
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Test Modal on Different Screen Sizes</h2>
          <p className="text-sm text-gray-600 mb-4">
            Resize your browser window to test input functionality
          </p>
          
          <button
            onClick={() => setIsOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Open Add Stay Modal
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Simple Test Input</h2>
          <input
            type="text"
            placeholder="Test if typing works here"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Browser Info</h2>
          <div className="text-sm space-y-1">
            <p>Screen Width: <span className="font-mono">{typeof window !== 'undefined' ? window.innerWidth : 'N/A'}</span>px</p>
            <p>Screen Height: <span className="font-mono">{typeof window !== 'undefined' ? window.innerHeight : 'N/A'}</span>px</p>
          </div>
        </div>
      </div>

      <AddStayModalEnhanced
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onAdded={() => {
          console.log('Stay added')
          setIsOpen(false)
        }}
        countries={countries}
      />
    </div>
  )
}