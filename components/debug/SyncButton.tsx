'use client'

import { useState } from 'react'
import { loadStaysFromStorage } from '@/lib/storage/stays-storage'

export default function SyncButton() {
  const [syncing, setSyncing] = useState(false)
  const [message, setMessage] = useState('')

  const syncToSupabase = async () => {
    setSyncing(true)
    setMessage('Syncing...')
    
    try {
      // Get stays from localStorage
      const stays = loadStaysFromStorage()
      
      if (stays.length === 0) {
        setMessage('No stays to sync')
        setSyncing(false)
        return
      }
      
      // Send to API endpoint
      const response = await fetch('/api/sync-to-supabase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ stays })
      })
      
      const result = await response.json()
      
      if (result.success) {
        setMessage(`✅ ${result.message}`)
        // Reload the page to show updated data
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      } else {
        setMessage(`❌ Error: ${result.error}`)
      }
    } catch (error) {
      setMessage(`❌ Failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div className="fixed bottom-20 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 z-[9998] max-w-sm">
      <h3 className="font-semibold text-sm mb-2">Sync LocalStorage to Supabase</h3>
      <p className="text-xs text-gray-600 mb-3">
        Push your local stays data to the cloud database
      </p>
      
      <button
        onClick={syncToSupabase}
        disabled={syncing}
        className="w-full px-3 py-2 bg-green-500 text-white rounded text-sm hover:bg-green-600 disabled:bg-gray-400"
      >
        {syncing ? 'Syncing...' : 'Sync to Supabase'}
      </button>
      
      {message && (
        <div className={`mt-2 text-xs ${message.includes('✅') ? 'text-green-600' : message.includes('❌') ? 'text-red-600' : 'text-gray-600'}`}>
          {message}
        </div>
      )}
    </div>
  )
}