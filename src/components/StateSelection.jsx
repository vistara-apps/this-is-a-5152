import React, { useState } from 'react'
import { MapPin, Search } from 'lucide-react'

const states = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware',
  'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky',
  'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi',
  'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico',
  'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania',
  'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
  'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
]

const StateSelection = ({ onStateSelect }) => {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredStates = states.filter(state =>
    state.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleLocationDetection = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // In a real app, you'd reverse geocode to get the state
          // For demo purposes, we'll just select California
          onStateSelect('California')
        },
        (error) => {
          console.error('Location detection failed:', error)
          alert('Unable to detect location. Please select your state manually.')
        }
      )
    } else {
      alert('Geolocation is not supported by this browser.')
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-4">
          Know Your Rights
        </h2>
        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
          Select your state to access specific legal rights and protections during police encounters.
        </p>
      </div>

      {/* Location Detection */}
      <div className="card text-center">
        <button
          onClick={handleLocationDetection}
          className="btn-primary w-full sm:w-auto flex items-center justify-center space-x-2"
        >
          <MapPin size={20} />
          <span>Use My Location</span>
        </button>
        <p className="text-sm text-gray-500 mt-2">
          We'll detect your state automatically
        </p>
      </div>

      {/* Manual State Selection */}
      <div className="card">
        <h3 className="text-lg font-semibold text-primary mb-4">Or choose manually:</h3>
        
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search for your state..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>

        {/* State Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-64 overflow-y-auto">
          {filteredStates.map(state => (
            <button
              key={state}
              onClick={() => onStateSelect(state)}
              className="text-left p-3 rounded-lg hover:bg-surface transition-colors border border-transparent hover:border-accent/20"
            >
              {state}
            </button>
          ))}
        </div>
      </div>

      {/* Important Notice */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-800">
          <strong>Important:</strong> This app provides general legal information and should not replace 
          professional legal advice. Laws may vary by jurisdiction and change over time.
        </p>
      </div>
    </div>
  )
}

export default StateSelection