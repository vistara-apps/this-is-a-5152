import React, { useState, useEffect } from 'react'
import { X, Check, Crown, Shield, Zap, CreditCard, Loader, AlertTriangle } from 'lucide-react'
import stripeService from '../services/stripe.js'

const EnhancedSubscriptionModal = ({ onClose, onUpgrade }) => {
  const [selectedPlan, setSelectedPlan] = useState('premium')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [pricing, setPricing] = useState(null)

  useEffect(() => {
    setPricing(stripeService.getPricingInfo())
  }, [])

  const handleUpgrade = async () => {
    if (!pricing) return

    setIsLoading(true)
    setError(null)

    try {
      if (!stripeService.isAvailable()) {
        // Demo mode - simulate successful upgrade
        setTimeout(() => {
          // Create mock subscription
          const mockSubscription = {
            id: 'sub_demo_' + Math.random().toString(36).substr(2, 24),
            customerId: 'cus_demo_' + Math.random().toString(36).substr(2, 24),
            status: 'active',
            plan: selectedPlan,
            currentPeriodStart: new Date().toISOString(),
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            cancelAtPeriodEnd: false,
            amount: pricing[selectedPlan].price * 100,
            currency: 'usd',
            interval: pricing[selectedPlan].interval
          }
          
          localStorage.setItem('pocketLawyerSubscription', JSON.stringify(mockSubscription))
          onUpgrade()
          setIsLoading(false)
        }, 1500)
        return
      }

      const result = await stripeService.createSubscriptionCheckout({
        plan: selectedPlan,
        successUrl: `${window.location.origin}?subscription=success`,
        cancelUrl: `${window.location.origin}?subscription=cancel`
      })

      if (result.success) {
        if (result.demo) {
          // Demo mode - simulate successful subscription
          const subscription = await stripeService.handleSubscriptionSuccess(result.sessionId)
          if (subscription.success) {
            localStorage.setItem('pocketLawyerSubscription', JSON.stringify(subscription.subscription))
            onUpgrade()
          }
        } else {
          // Real Stripe checkout
          await stripeService.redirectToCheckout(result.sessionId)
        }
      } else {
        setError(result.error || 'Failed to create checkout session')
      }
    } catch (error) {
      console.error('Upgrade error:', error)
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!pricing) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-8">
          <div className="flex items-center space-x-2">
            <Loader className="animate-spin" size={20} />
            <span>Loading pricing...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
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
          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <AlertTriangle size={16} className="text-red-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm text-red-800 font-medium">Error</p>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Plan Selection */}
          <div className="space-y-4">
            <h3 className="font-semibold text-primary text-center">Choose Your Plan</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Monthly Plan */}
              <div 
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                  selectedPlan === 'premium' 
                    ? 'border-accent bg-accent/5' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedPlan('premium')}
              >
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Zap className="w-5 h-5 text-accent mr-2" />
                    <h4 className="font-semibold text-primary">Monthly</h4>
                  </div>
                  <div className="text-2xl font-bold text-primary mb-1">
                    ${pricing.premium.price}
                    <span className="text-sm font-normal text-gray-600">/month</span>
                  </div>
                  <p className="text-sm text-gray-600">Perfect for getting started</p>
                </div>
              </div>

              {/* Annual Plan */}
              <div 
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all relative ${
                  selectedPlan === 'annual' 
                    ? 'border-accent bg-accent/5' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedPlan('annual')}
              >
                <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                  Save ${pricing.annual.savings}
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Crown className="w-5 h-5 text-yellow-500 mr-2" />
                    <h4 className="font-semibold text-primary">Annual</h4>
                  </div>
                  <div className="text-2xl font-bold text-primary mb-1">
                    ${pricing.annual.price}
                    <span className="text-sm font-normal text-gray-600">/year</span>
                  </div>
                  <p className="text-sm text-gray-600">Best value - 2 months free!</p>
                </div>
              </div>
            </div>
          </div>

          {/* Features Comparison */}
          <div className="space-y-4">
            <h3 className="font-semibold text-primary">What's Included:</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Free Features */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-800 flex items-center">
                  <Shield size={16} className="mr-2 text-gray-600" />
                  Free Features
                </h4>
                <ul className="space-y-2">
                  {pricing.free.features.map((feature, index) => (
                    <li key={index} className="flex items-start space-x-2 text-sm">
                      <Check size={14} className="text-gray-400 mt-1 flex-shrink-0" />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Premium Features */}
              <div className="space-y-3">
                <h4 className="font-medium text-accent flex items-center">
                  <Crown size={16} className="mr-2 text-yellow-500" />
                  Premium Features
                </h4>
                <ul className="space-y-2">
                  {pricing.premium.features.slice(1).map((feature, index) => (
                    <li key={index} className="flex items-start space-x-2 text-sm">
                      <Check size={14} className="text-accent mt-1 flex-shrink-0" />
                      <span className="text-gray-800 font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Key Benefits */}
          <div className="bg-gradient-to-r from-accent/10 to-blue-50 rounded-lg p-4">
            <h4 className="font-semibold text-primary mb-3 flex items-center">
              <Zap size={16} className="mr-2 text-accent" />
              Why Upgrade?
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center mx-auto mb-2">
                  <Shield size={16} className="text-white" />
                </div>
                <p className="font-medium text-gray-800">Secure Storage</p>
                <p className="text-gray-600">IPFS backup for all recordings</p>
              </div>
              <div className="text-center">
                <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center mx-auto mb-2">
                  <Zap size={16} className="text-white" />
                </div>
                <p className="font-medium text-gray-800">Unlimited Access</p>
                <p className="text-gray-600">No limits on scripts or features</p>
              </div>
              <div className="text-center">
                <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center mx-auto mb-2">
                  <Crown size={16} className="text-white" />
                </div>
                <p className="font-medium text-gray-800">Priority Support</p>
                <p className="text-gray-600">Get help when you need it most</p>
              </div>
            </div>
          </div>

          {/* Demo Notice */}
          {!stripeService.isAvailable() && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <AlertTriangle size={16} className="text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm text-blue-800 font-medium">Demo Mode</p>
                  <p className="text-sm text-blue-700">
                    This is a demonstration. No actual payment will be processed.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              onClick={onClose}
              className="btn-secondary flex-1"
              disabled={isLoading}
            >
              Maybe Later
            </button>
            <button
              onClick={handleUpgrade}
              disabled={isLoading}
              className="btn-primary flex-1 flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <Loader className="animate-spin" size={16} />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <CreditCard size={16} />
                  <span>
                    Upgrade - ${pricing[selectedPlan].price}
                    {selectedPlan === 'annual' ? '/year' : '/month'}
                  </span>
                </>
              )}
            </button>
          </div>

          {/* Security Notice */}
          <div className="text-center text-xs text-gray-500 pt-2">
            <p>🔒 Secure payment processing powered by Stripe</p>
            <p>Cancel anytime • No hidden fees • 30-day money-back guarantee</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EnhancedSubscriptionModal
