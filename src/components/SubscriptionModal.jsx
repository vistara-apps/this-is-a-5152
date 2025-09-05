import React from 'react'
import { X, Check, Crown, Zap } from 'lucide-react'

const SubscriptionModal = ({ onClose, onUpgrade }) => {
  const handleUpgrade = () => {
    // In a real app, this would integrate with Stripe
    alert('Payment integration would be implemented here. For demo purposes, upgrading to premium.')
    onUpgrade()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Crown className="w-6 h-6 text-yellow-500" />
            <h2 className="text-xl font-bold text-primary">Upgrade to Premium</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Pricing */}
          <div className="text-center">
            <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-white rounded-lg p-6 mb-4">
              <h3 className="text-2xl font-bold mb-2">$5/month</h3>
              <p className="text-yellow-100">Full access to all features</p>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-4">
            <h3 className="font-semibold text-primary">Premium Features:</h3>
            
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <Check className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-medium">Unlimited Script Generation</h4>
                  <p className="text-sm text-gray-600">Generate as many defense scripts as you need</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Check className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-medium">Multi-Language Support</h4>
                  <p className="text-sm text-gray-600">Scripts available in English and Spanish</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Check className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-medium">Video Recording</h4>
                  <p className="text-sm text-gray-600">Record both audio and video during encounters</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Check className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-medium">Advanced Documentation</h4>
                  <p className="text-sm text-gray-600">Enhanced sharing and storage options</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Check className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-medium">Priority Support</h4>
                  <p className="text-sm text-gray-600">Fast customer support and feature requests</p>
                </div>
              </div>
            </div>
          </div>

          {/* Free vs Premium Comparison */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-primary mb-3">What you're missing:</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Script generation</span>
                <span className="text-red-600">3/month limit</span>
              </div>
              <div className="flex justify-between">
                <span>Multi-language</span>
                <span className="text-red-600">English only</span>
              </div>
              <div className="flex justify-between">
                <span>Video recording</span>
                <span className="text-red-600">Audio only</span>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="space-y-3">
            <button
              onClick={handleUpgrade}
              className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-white font-semibold py-3 px-6 rounded-lg transition-all flex items-center justify-center space-x-2"
            >
              <Zap size={20} />
              <span>Upgrade Now - $5/month</span>
            </button>
            
            <button
              onClick={onClose}
              className="w-full btn-secondary"
            >
              Continue with Free
            </button>
          </div>

          {/* Trust signals */}
          <div className="text-center text-xs text-gray-500">
            <p>• Cancel anytime • Secure payment • 30-day money back guarantee</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SubscriptionModal