'use client'

import { useState, useEffect } from 'react'
import { saveStaysToStorage } from '@/lib/storage/stays-storage'
import { Stay } from '@/lib/types'

export default function RecoverDataPage() {
  const [backupData, setBackupData] = useState<any>(null)
  const [recoveredStays, setRecoveredStays] = useState<Stay[]>([])
  
  useEffect(() => {
    checkAllStorage()
  }, [])
  
  const checkAllStorage = () => {
    if (typeof window === 'undefined') return
    
    // Check all localStorage keys
    const allKeys = Object.keys(localStorage)
    const stayRelatedKeys = allKeys.filter(key => 
      key.includes('stay') || key.includes('dino') || key.includes('travel')
    )
    
    const data: any = {}
    stayRelatedKeys.forEach(key => {
      try {
        const value = localStorage.getItem(key)
        if (value) {
          data[key] = JSON.parse(value)
        }
      } catch {
        data[key] = localStorage.getItem(key)
      }
    })
    
    setBackupData(data)
    
    // Try to recover stays
    const recovered: Stay[] = []
    
    // Check main storage
    const mainData = data['dino-stays-data']
    if (mainData?.stays) {
      mainData.stays.forEach((stay: any) => {
        if (stay && stay.id && stay.countryCode && stay.entryDate) {
          recovered.push(stay)
        }
      })
    }
    
    setRecoveredStays(recovered)
  }
  
  const createSampleData = () => {
    const sampleStays: Stay[] = [
      {
        id: 'sample_kr_' + Date.now(),
        countryCode: 'KR',
        entryDate: '2024-07-01',
        exitDate: '2024-07-10',
        visaType: 'visa-free',
        notes: 'Sample Korea trip'
      },
      {
        id: 'sample_vn_' + Date.now() + 1,
        countryCode: 'VN',
        entryDate: '2024-07-10',
        exitDate: '2024-07-20',
        visaType: 'visa-free',
        notes: 'Sample Vietnam trip'
      },
      {
        id: 'sample_jp_' + Date.now() + 2,
        countryCode: 'JP',
        entryDate: '2024-08-01',
        exitDate: '2024-08-15',
        visaType: 'visa-free',
        notes: 'Sample Japan trip'
      }
    ]
    
    saveStaysToStorage(sampleStays)
    alert('Sample data created! Refresh the page to see it.')
    checkAllStorage()
  }
  
  const restoreData = () => {
    if (recoveredStays.length > 0) {
      saveStaysToStorage(recoveredStays)
      alert(`Restored ${recoveredStays.length} travel records!`)
    }
  }
  
  const clearBadData = () => {
    if (typeof window === 'undefined') return
    
    // Get current data
    const stored = localStorage.getItem('dino-stays-data')
    if (!stored) return
    
    try {
      const data = JSON.parse(stored)
      const validStays = (data.stays || []).filter((stay: any) => 
        stay && 
        stay.id && 
        stay.countryCode && 
        stay.entryDate &&
        stay.countryCode !== 'MISSING' &&
        stay.entryDate !== 'MISSING'
      )
      
      saveStaysToStorage(validStays)
      alert(`Cleaned data. ${validStays.length} valid records remain.`)
      checkAllStorage()
    } catch (error) {
      console.error('Error cleaning data:', error)
    }
  }
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">🔧 Data Recovery Tool</h1>
      
      <div className="bg-yellow-50 border border-yellow-400 rounded p-4 mb-4">
        <p className="text-yellow-800">
          This tool helps you recover lost travel records or create sample data for testing.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <button 
          onClick={checkAllStorage}
          className="px-4 py-3 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          🔍 Check All Storage
        </button>
        
        <button 
          onClick={createSampleData}
          className="px-4 py-3 bg-green-500 text-white rounded hover:bg-green-600"
        >
          ➕ Create Sample Data
        </button>
        
        <button 
          onClick={restoreData}
          disabled={recoveredStays.length === 0}
          className="px-4 py-3 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
        >
          💾 Restore {recoveredStays.length} Records
        </button>
        
        <button 
          onClick={clearBadData}
          className="px-4 py-3 bg-orange-500 text-white rounded hover:bg-orange-600"
        >
          🧹 Clean Invalid Data
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h2 className="text-xl font-semibold mb-2">
            Recovered Stays ({recoveredStays.length})
          </h2>
          <div className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
            {recoveredStays.length > 0 ? (
              <div className="space-y-2">
                {recoveredStays.map((stay, index) => (
                  <div key={index} className="p-2 bg-white rounded border">
                    <div className="text-sm">
                      <strong>{stay.countryCode}</strong> | 
                      {stay.entryDate} to {stay.exitDate || 'ongoing'}
                    </div>
                    {stay.notes && (
                      <div className="text-xs text-gray-600">{stay.notes}</div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No recoverable stays found</p>
            )}
          </div>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-2">All Storage Data</h2>
          <div className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
            <pre className="text-xs">
              {JSON.stringify(backupData, null, 2)}
            </pre>
          </div>
        </div>
      </div>
      
      <div className="mt-6 p-4 bg-blue-50 rounded">
        <h3 className="font-semibold mb-2">💡 Quick Recovery Steps:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>Click "Check All Storage" to scan for any existing data</li>
          <li>If data is found, click "Restore X Records" to recover it</li>
          <li>If no data found, click "Create Sample Data" to start fresh</li>
          <li>Go back to the calendar to see your recovered/new records</li>
        </ol>
      </div>
    </div>
  )
}