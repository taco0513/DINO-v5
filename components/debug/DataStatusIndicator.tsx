'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { loadStaysFromStorage } from '@/lib/storage/stays-storage'

export default function DataStatusIndicator() {
  const [status, setStatus] = useState({
    supabaseConnected: false,
    localStorageCount: 0,
    supabaseCount: 0,
    lastSync: null as Date | null,
    error: null as string | null
  })
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    checkDataStatus()
    const interval = setInterval(checkDataStatus, 30000) // Check every 30 seconds instead of 10
    return () => clearInterval(interval)
  }, [])

  const checkDataStatus = async () => {
    try {
      // Check localStorage
      const localStays = loadStaysFromStorage()
      
      // Check Supabase connection
      const supabase = createClient()
      const { data, error } = await supabase
        .from('stays')
        .select('id', { count: 'exact', head: true })
      
      if (error) {
        setStatus(prev => ({
          ...prev,
          supabaseConnected: false,
          localStorageCount: localStays.length,
          error: `Supabase: ${error.message}`,
          lastSync: new Date()
        }))
      } else {
        const { count } = await supabase
          .from('stays')
          .select('*', { count: 'exact', head: true })
        
        setStatus({
          supabaseConnected: true,
          localStorageCount: localStays.length,
          supabaseCount: count || 0,
          lastSync: new Date(),
          error: null
        })
      }
    } catch (err) {
      setStatus(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Unknown error',
        lastSync: new Date()
      }))
    }
  }

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-gray-800 text-white p-2 rounded-full shadow-lg z-[9999] hover:bg-gray-700"
        aria-label="Show data status"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      </button>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 z-[9999] max-w-sm">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-sm">Data Status</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-gray-600"
          aria-label="Hide data status"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div className="space-y-2 text-xs">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${status.supabaseConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span>Supabase: {status.supabaseConnected ? 'Connected' : 'Disconnected'}</span>
        </div>
        
        <div className="flex justify-between">
          <span>Local Storage:</span>
          <span className="font-mono">{status.localStorageCount} stays</span>
        </div>
        
        {status.supabaseConnected && (
          <div className="flex justify-between">
            <span>Cloud Storage:</span>
            <span className="font-mono">{status.supabaseCount} stays</span>
          </div>
        )}
        
        {status.error && (
          <div className="text-red-600 text-xs mt-2 p-2 bg-red-50 rounded">
            {status.error}
          </div>
        )}
        
        {status.lastSync && (
          <div className="text-gray-500 text-xs mt-2">
            Last checked: {status.lastSync.toLocaleTimeString()}
          </div>
        )}
        
        <div className="flex gap-2 mt-3">
          <button
            onClick={checkDataStatus}
            className="flex-1 px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
          >
            Refresh
          </button>
          <button
            onClick={() => window.location.reload()}
            className="flex-1 px-2 py-1 bg-gray-500 text-white rounded text-xs hover:bg-gray-600"
          >
            Reload Page
          </button>
        </div>
      </div>
    </div>
  )
}