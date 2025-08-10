'use client'

import { useEffect, useState } from 'react'
import { loadStaysFromStorage, clearStaysStorage } from '@/lib/storage/stays-storage'
import { Stay } from '@/lib/types'

export default function DebugStoragePage() {
  const [stays, setStays] = useState<Stay[]>([])
  const [rawData, setRawData] = useState<string>('')
  
  useEffect(() => {
    loadData()
  }, [])
  
  const loadData = () => {
    // Load from storage
    const loadedStays = loadStaysFromStorage()
    setStays(loadedStays)
    
    // Get raw localStorage data
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem('dino-stays-data')
      setRawData(raw || 'No data in localStorage')
    }
  }
  
  const clearStorage = () => {
    clearStaysStorage()
    loadData()
  }
  
  const fixInvalidStays = () => {
    // Filter out invalid stays and re-save
    const validStays = stays.filter(stay => 
      stay && 
      stay.countryCode && 
      stay.entryDate &&
      stay.countryCode !== 'MISSING' &&
      stay.entryDate !== 'MISSING' &&
      stay.id
    )
    
    console.log(`Fixing: Removing ${stays.length - validStays.length} invalid stays, keeping ${validStays.length} valid stays`)
    
    if (typeof window !== 'undefined') {
      const data = {
        version: '1.0',
        stays: validStays,
        lastUpdated: new Date().toISOString()
      }
      localStorage.setItem('dino-stays-data', JSON.stringify(data))
      loadData()
      alert(`Removed ${stays.length - validStays.length} invalid stays. ${validStays.length} valid stays remain.`)
    }
  }
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Debug Storage</h1>
      
      <div className="mb-4 space-x-2">
        <button 
          onClick={loadData}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Reload Data
        </button>
        <button 
          onClick={fixInvalidStays}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Fix Invalid Stays
        </button>
        <button 
          onClick={clearStorage}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Clear All Storage
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h2 className="text-xl font-semibold mb-2">Parsed Stays ({stays.length})</h2>
          <div className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
            <pre className="text-xs">
              {JSON.stringify(stays, null, 2)}
            </pre>
          </div>
          
          {/* Invalid stays detection */}
          {stays.some(stay => !stay?.entryDate || !stay?.countryCode) && (
            <div className="mt-2 p-2 bg-red-100 border border-red-400 rounded">
              <p className="text-red-700">⚠️ Found invalid stays without entry date or country code!</p>
              <p className="text-sm">Click "Fix Invalid Stays" to remove them.</p>
            </div>
          )}
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-2">Raw localStorage Data</h2>
          <div className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
            <pre className="text-xs">
              {rawData}
            </pre>
          </div>
        </div>
      </div>
      
      <div className="mt-4">
        <h2 className="text-xl font-semibold mb-2">Stay Details</h2>
        <div className="space-y-2">
          {stays.map((stay, index) => (
            <div key={index} className="p-3 bg-white border rounded">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><strong>Country:</strong> {stay?.countryCode || 'MISSING'}</div>
                <div><strong>Entry:</strong> {stay?.entryDate || 'MISSING'}</div>
                <div><strong>Exit:</strong> {stay?.exitDate || 'Ongoing'}</div>
                <div><strong>ID:</strong> {stay?.id || 'MISSING'}</div>
              </div>
              {(!stay?.entryDate || !stay?.countryCode) && (
                <div className="mt-1 text-red-600 text-xs">
                  ⚠️ Invalid stay record
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}