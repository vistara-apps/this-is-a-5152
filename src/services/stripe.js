// Stripe service for handling payments and subscriptions
// Note: This is a client-side implementation. In production, sensitive operations
// should be handled by a backend server for security.

class StripeService {
  constructor() {
    this.publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
    this.stripe = null
    this.isLoaded = false
  }

  /**
   * Initialize Stripe
   * @returns {Promise<boolean>} - Success status
   */
  async initialize() {
    if (this.isLoaded) return true

    try {
      // Load Stripe.js dynamically
      if (!window.Stripe) {
        const script = document.createElement('script')
        script.src = 'https://js.stripe.com/v3/'
        script.async = true
        
        await new Promise((resolve, reject) => {
          script.onload = resolve
          script.onerror = reject
          document.head.appendChild(script)
        })
      }

      if (!this.publishableKey) {
        console.warn('Stripe publishable key not found')
        return false
      }

      this.stripe = window.Stripe(this.publishableKey)
      this.isLoaded = true
      return true
    } catch (error) {
      console.error('Failed to initialize Stripe:', error)
      return false
    }
  }

  /**
   * Create a checkout session for subscription
   * @param {string} priceId - Stripe price ID
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} - Checkout result
   */
  async createCheckoutSession(priceId, options = {}) {
    if (!await this.initialize()) {
      return { success: false, error: 'Stripe not initialized' }
    }

    try {
      // In a real implementation, this would call your backend API
      // For demo purposes, we'll simulate the flow
      const mockSessionId = 'cs_test_' + Math.random().toString(36).substr(2, 24)
      
      // Simulate API call to create checkout session
      const sessionData = {
        id: mockSessionId,
        url: `https://checkout.stripe.com/pay/${mockSessionId}`,
        priceId,
        customerId: options.customerId || null,
        successUrl: options.successUrl || `${window.location.origin}/success`,
        cancelUrl: options.cancelUrl || `${window.location.origin}/cancel`,
        metadata: options.metadata || {}
      }

      return {
        success: true,
        sessionId: sessionData.id,
        url: sessionData.url
      }
    } catch (error) {
      console.error('Checkout session creation failed:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * Redirect to Stripe Checkout
   * @param {string} sessionId - Checkout session ID
   * @returns {Promise<Object>} - Redirect result
   */
  async redirectToCheckout(sessionId) {
    if (!await this.initialize()) {
      return { success: false, error: 'Stripe not initialized' }
    }

    try {
      const result = await this.stripe.redirectToCheckout({
        sessionId: sessionId
      })

      if (result.error) {
        return {
          success: false,
          error: result.error.message
        }
      }

      return { success: true }
    } catch (error) {
      console.error('Redirect to checkout failed:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * Create subscription checkout for premium features
   * @param {Object} options - Subscription options
   * @returns {Promise<Object>} - Checkout result
   */
  async createSubscriptionCheckout(options = {}) {
    const {
      plan = 'premium',
      customerId = null,
      successUrl = `${window.location.origin}/subscription-success`,
      cancelUrl = `${window.location.origin}/subscription-cancel`
    } = options

    // Mock price IDs - in production these would be real Stripe price IDs
    const priceIds = {
      premium: 'price_premium_monthly_5usd',
      annual: 'price_premium_annual_50usd'
    }

    const priceId = priceIds[plan]
    if (!priceId) {
      return {
        success: false,
        error: 'Invalid subscription plan'
      }
    }

    const sessionResult = await this.createCheckoutSession(priceId, {
      customerId,
      successUrl,
      cancelUrl,
      metadata: {
        plan,
        type: 'subscription'
      }
    })

    if (!sessionResult.success) {
      return sessionResult
    }

    // For demo purposes, simulate successful subscription
    // In production, this would redirect to actual Stripe Checkout
    return {
      success: true,
      sessionId: sessionResult.sessionId,
      checkoutUrl: sessionResult.url,
      demo: true // Indicates this is a demo flow
    }
  }

  /**
   * Handle subscription success (mock implementation)
   * @param {string} sessionId - Checkout session ID
   * @returns {Promise<Object>} - Subscription details
   */
  async handleSubscriptionSuccess(sessionId) {
    try {
      // In production, this would verify the session with your backend
      // and retrieve the actual subscription details
      
      const mockSubscription = {
        id: 'sub_' + Math.random().toString(36).substr(2, 24),
        customerId: 'cus_' + Math.random().toString(36).substr(2, 24),
        status: 'active',
        plan: 'premium',
        currentPeriodStart: new Date().toISOString(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        cancelAtPeriodEnd: false,
        amount: 500, // $5.00 in cents
        currency: 'usd',
        interval: 'month'
      }

      return {
        success: true,
        subscription: mockSubscription
      }
    } catch (error) {
      console.error('Subscription success handling failed:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * Get subscription status (mock implementation)
   * @param {string} customerId - Stripe customer ID
   * @returns {Promise<Object>} - Subscription status
   */
  async getSubscriptionStatus(customerId) {
    try {
      // In production, this would call your backend API
      // to retrieve the actual subscription status
      
      // For demo, check localStorage for subscription status
      const savedSubscription = localStorage.getItem('pocketLawyerSubscription')
      
      if (savedSubscription) {
        const subscription = JSON.parse(savedSubscription)
        const now = new Date()
        const endDate = new Date(subscription.currentPeriodEnd)
        
        return {
          success: true,
          subscription: {
            ...subscription,
            isActive: now < endDate && subscription.status === 'active'
          }
        }
      }

      return {
        success: true,
        subscription: null
      }
    } catch (error) {
      console.error('Get subscription status failed:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * Cancel subscription (mock implementation)
   * @param {string} subscriptionId - Subscription ID
   * @returns {Promise<Object>} - Cancellation result
   */
  async cancelSubscription(subscriptionId) {
    try {
      // In production, this would call your backend API
      // to cancel the subscription via Stripe API
      
      const savedSubscription = localStorage.getItem('pocketLawyerSubscription')
      if (savedSubscription) {
        const subscription = JSON.parse(savedSubscription)
        subscription.cancelAtPeriodEnd = true
        subscription.status = 'canceled'
        localStorage.setItem('pocketLawyerSubscription', JSON.stringify(subscription))
      }

      return {
        success: true,
        message: 'Subscription will be canceled at the end of the current period'
      }
    } catch (error) {
      console.error('Cancel subscription failed:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * Create customer portal session (mock implementation)
   * @param {string} customerId - Stripe customer ID
   * @returns {Promise<Object>} - Portal session result
   */
  async createPortalSession(customerId) {
    try {
      // In production, this would create a real Stripe customer portal session
      const mockPortalUrl = `https://billing.stripe.com/p/session/test_${Math.random().toString(36).substr(2, 24)}`
      
      return {
        success: true,
        url: mockPortalUrl
      }
    } catch (error) {
      console.error('Create portal session failed:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * Validate webhook signature (for backend use)
   * @param {string} payload - Webhook payload
   * @param {string} signature - Stripe signature
   * @param {string} endpointSecret - Webhook endpoint secret
   * @returns {Object} - Validation result
   */
  validateWebhookSignature(payload, signature, endpointSecret) {
    // This would typically be implemented on the backend
    // using Stripe's webhook signature verification
    console.warn('Webhook signature validation should be implemented on the backend')
    return {
      success: false,
      error: 'Webhook validation not implemented on client side'
    }
  }

  /**
   * Get pricing information
   * @returns {Object} - Pricing details
   */
  getPricingInfo() {
    return {
      free: {
        name: 'Free',
        price: 0,
        currency: 'USD',
        interval: null,
        features: [
          'Basic rights guides',
          'Limited script generation (3 per month)',
          'Basic recording (local storage only)',
          'Emergency contacts'
        ]
      },
      premium: {
        name: 'Premium',
        price: 5,
        currency: 'USD',
        interval: 'month',
        priceId: 'price_premium_monthly_5usd',
        features: [
          'All free features',
          'Unlimited script generation',
          'Multi-language support (Spanish)',
          'IPFS storage for recordings',
          'Advanced documentation tools',
          'Incident report sharing',
          'Priority support'
        ]
      },
      annual: {
        name: 'Premium Annual',
        price: 50,
        currency: 'USD',
        interval: 'year',
        priceId: 'price_premium_annual_50usd',
        savings: 10,
        features: [
          'All premium features',
          'Save $10 per year',
          'Priority feature requests'
        ]
      }
    }
  }

  /**
   * Check if Stripe is available
   * @returns {boolean} - Availability status
   */
  isAvailable() {
    return !!this.publishableKey
  }
}

// Create singleton instance
const stripeService = new StripeService()

export default stripeService
export { StripeService }
