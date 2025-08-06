'use client'

import { useState } from 'react'
import { Stay } from '@/lib/types'

interface AddStayModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (stay: Omit<Stay, 'id'>) => void
  countryCode: string
}

export default function AddStayModal({ isOpen, onClose, onAdd, countryCode }: AddStayModalProps) {
  const [formData, setFormData] = useState({
    entryDate: '',
    exitDate: '',
    notes: 'tourism'
  })

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!formData.entryDate || !formData.exitDate) {
      alert('Please fill in all required fields')
      return
    }
    
    if (new Date(formData.exitDate) < new Date(formData.entryDate)) {
      alert('Exit date must be after entry date')
      return
    }
    
    onAdd({
      countryCode,
      entryDate: formData.entryDate,
      exitDate: formData.exitDate,
      notes: formData.notes
    })
    
    // Reset form
    setFormData({
      entryDate: '',
      exitDate: '',
      notes: ''
    })
    
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Add Stay Record</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Entry Date *
            </label>
            <input
              type="date"
              required
              value={formData.entryDate}
              onChange={(e) => setFormData({ ...formData, entryDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Exit Date *
            </label>
            <input
              type="date"
              required
              value={formData.exitDate}
              onChange={(e) => setFormData({ ...formData, exitDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Purpose
            </label>
            <select
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="tourism">Tourism</option>
              <option value="business">Business</option>
              <option value="transit">Transit</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Optional notes..."
            />
          </div>
          
          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Stay
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}