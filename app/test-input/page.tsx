'use client'

import { useState } from 'react'

export default function TestInputPage() {
  const [testValue, setTestValue] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  })

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Input Field Test Page</h1>
      
      <div className="space-y-6 max-w-md">
        {/* Simple controlled input */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Simple Test Input:
          </label>
          <input
            type="text"
            value={testValue}
            onChange={(e) => setTestValue(e.target.value)}
            placeholder="Type here..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="mt-2 text-sm text-gray-600">
            Value: {testValue}
          </p>
        </div>

        {/* Form with multiple inputs */}
        <div className="space-y-4 p-4 border rounded-lg">
          <h2 className="font-semibold">Form Test</h2>
          
          <div>
            <label className="block text-sm font-medium mb-1">Name:</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Enter name..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email:</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="Enter email..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Message:</label>
            <textarea
              value={formData.message}
              onChange={(e) => handleChange('message', e.target.value)}
              placeholder="Enter message..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div className="p-3 bg-gray-100 rounded">
            <h3 className="font-medium mb-2">Form Data:</h3>
            <pre className="text-sm">{JSON.stringify(formData, null, 2)}</pre>
          </div>
        </div>

        {/* Native HTML input */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Native HTML Input (uncontrolled):
          </label>
          <input
            type="text"
            placeholder="Native input..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
        </div>
      </div>
    </div>
  )
}