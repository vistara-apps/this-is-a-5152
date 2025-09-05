import React, { useState } from 'react'
import { Shield, MapPin, Crown, Menu, X } from 'lucide-react'

const Header = ({ user, selectedState, onStateChange }) => {
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3">
            <div className="bg-accent p-2 rounded-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-primary">Pocket Lawyer</h1>
              <p className="text-xs text-gray-500 hidden sm:block">Your rights on demand</p>
            </div>
          </div>

          {/* State Indicator and Premium Badge */}
          <div className="flex items-center space-x-4">
            {selectedState && (
              <div className="flex items-center space-x-2 bg-surface px-3 py-2 rounded-lg">
                <MapPin size={16} className="text-accent" />
                <span className="text-sm font-medium text-primary">{selectedState}</span>
              </div>
            )}
            
            {user.subscriptionStatus === 'premium' && (
              <div className="flex items-center space-x-1 bg-gradient-to-r from-yellow-400 to-yellow-500 px-3 py-1 rounded-full">
                <Crown size={14} className="text-white" />
                <span className="text-xs font-medium text-white">Premium</span>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              className="sm:hidden p-2"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
            >
              {showMobileMenu ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {showMobileMenu && (
          <div className="sm:hidden mt-4 pb-4 border-t border-gray-100 pt-4">
            <div className="space-y-3">
              <div className="text-sm">
                <span className="text-gray-500">Status: </span>
                <span className={`font-medium ${user.subscriptionStatus === 'premium' ? 'text-yellow-600' : 'text-gray-700'}`}>
                  {user.subscriptionStatus === 'premium' ? 'Premium Member' : 'Free Account'}
                </span>
              </div>
              <div className="text-sm">
                <span className="text-gray-500">Language: </span>
                <span className="font-medium text-gray-700">
                  {user.preferredLanguage === 'en' ? 'English' : 'Spanish'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header