'use client'

import { useState } from 'react'

export default function SimpleStayManager() {
  const [showForm, setShowForm] = useState(false)

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Simple Stay Manager (Test)
        </h2>
        <button
          onClick={() => {
            console.log('Button clicked, current showForm:', showForm)
            setShowForm(true)
            console.log('showForm set to true')
          }}
          className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          Show Form (showForm: {showForm ? 'true' : 'false'})
        </button>
      </div>

      {showForm && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Test Form is Visible!
          </h3>
          <p>If you can see this, React state is working correctly.</p>
          <button
            onClick={() => setShowForm(false)}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg"
          >
            Hide Form
          </button>
        </div>
      )}
    </div>
  )
}