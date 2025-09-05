class AlertsService {
  constructor() {
    this.activeAlerts = new Map()
    this.notificationPermission = null
  }

  /**
   * Initialize the alerts service
   * @returns {Promise<boolean>} - Success status
   */
  async initialize() {
    try {
      // Request notification permission
      if ('Notification' in window) {
        this.notificationPermission = await Notification.requestPermission()
      }

      return true
    } catch (error) {
      console.error('Failed to initialize alerts service:', error)
      return false
    }
  }

  /**
   * Send emergency alert to contacts
   * @param {Object} alertData - Alert information
   * @returns {Promise<Object>} - Alert result
   */
  async sendEmergencyAlert(alertData) {
    const {
      contacts,
      location,
      message,
      incidentType = 'police-encounter',
      userId,
      recordingUrl = null
    } = alertData

    if (!contacts || contacts.length === 0) {
      return {
        success: false,
        error: 'No emergency contacts configured'
      }
    }

    try {
      const alertId = `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      const timestamp = new Date().toISOString()

      const alertMessage = this.formatAlertMessage({
        message,
        location,
        timestamp,
        incidentType,
        recordingUrl
      })

      const results = []

      // Send alerts to each contact
      for (const contact of contacts) {
        try {
          const result = await this.sendContactAlert(contact, alertMessage, alertId)
          results.push({
            contact: contact.name,
            method: contact.preferredMethod || 'sms',
            success: result.success,
            error: result.error
          })
        } catch (error) {
          results.push({
            contact: contact.name,
            method: contact.preferredMethod || 'sms',
            success: false,
            error: error.message
          })
        }
      }

      // Store alert in active alerts
      this.activeAlerts.set(alertId, {
        id: alertId,
        timestamp,
        contacts,
        message: alertMessage,
        location,
        incidentType,
        userId,
        results,
        status: 'sent'
      })

      // Send browser notification
      this.sendBrowserNotification('Emergency Alert Sent', 
        `Alert sent to ${contacts.length} contact(s)`)

      return {
        success: true,
        alertId,
        results,
        message: `Alert sent to ${results.filter(r => r.success).length} of ${contacts.length} contacts`
      }
    } catch (error) {
      console.error('Send emergency alert error:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * Send alert to individual contact
   * @param {Object} contact - Contact information
   * @param {string} message - Alert message
   * @param {string} alertId - Alert ID
   * @returns {Promise<Object>} - Send result
   */
  async sendContactAlert(contact, message, alertId) {
    const { name, phone, email, preferredMethod = 'sms' } = contact

    try {
      switch (preferredMethod) {
        case 'sms':
          return await this.sendSMS(phone, message, alertId)
        case 'email':
          return await this.sendEmail(email, 'Emergency Alert - Police Encounter', message, alertId)
        case 'call':
          return await this.initiateCall(phone, message, alertId)
        default:
          // Try SMS as fallback
          return await this.sendSMS(phone, message, alertId)
      }
    } catch (error) {
      console.error(`Failed to send alert to ${name}:`, error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * Send SMS (mock implementation)
   * @param {string} phone - Phone number
   * @param {string} message - Message content
   * @param {string} alertId - Alert ID
   * @returns {Promise<Object>} - Send result
   */
  async sendSMS(phone, message, alertId) {
    try {
      // In a real implementation, this would use a service like Twilio
      // For demo purposes, we'll simulate the SMS sending
      
      console.log(`[DEMO SMS] To: ${phone}`)
      console.log(`[DEMO SMS] Message: ${message}`)
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // For demo, always succeed
      return {
        success: true,
        method: 'sms',
        recipient: phone,
        messageId: `sms-${alertId}-${Date.now()}`
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * Send email (mock implementation)
   * @param {string} email - Email address
   * @param {string} subject - Email subject
   * @param {string} message - Email content
   * @param {string} alertId - Alert ID
   * @returns {Promise<Object>} - Send result
   */
  async sendEmail(email, subject, message, alertId) {
    try {
      // In a real implementation, this would use a service like SendGrid
      console.log(`[DEMO EMAIL] To: ${email}`)
      console.log(`[DEMO EMAIL] Subject: ${subject}`)
      console.log(`[DEMO EMAIL] Message: ${message}`)
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      return {
        success: true,
        method: 'email',
        recipient: email,
        messageId: `email-${alertId}-${Date.now()}`
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * Initiate phone call (mock implementation)
   * @param {string} phone - Phone number
   * @param {string} message - Message to deliver
   * @param {string} alertId - Alert ID
   * @returns {Promise<Object>} - Call result
   */
  async initiateCall(phone, message, alertId) {
    try {
      // In a real implementation, this would use a service like Twilio Voice
      console.log(`[DEMO CALL] To: ${phone}`)
      console.log(`[DEMO CALL] Message: ${message}`)
      
      // Simulate call initiation
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      return {
        success: true,
        method: 'call',
        recipient: phone,
        callId: `call-${alertId}-${Date.now()}`
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * Format alert message
   * @param {Object} data - Alert data
   * @returns {string} - Formatted message
   */
  formatAlertMessage(data) {
    const { message, location, timestamp, incidentType, recordingUrl } = data
    
    let alertText = `🚨 EMERGENCY ALERT 🚨\n\n`
    
    if (message) {
      alertText += `${message}\n\n`
    } else {
      alertText += `I am currently in a police encounter and need assistance.\n\n`
    }
    
    alertText += `Incident Type: ${incidentType.replace('-', ' ').toUpperCase()}\n`
    alertText += `Time: ${new Date(timestamp).toLocaleString()}\n`
    
    if (location) {
      if (location.address) {
        alertText += `Location: ${location.address}\n`
      } else if (location.latitude && location.longitude) {
        alertText += `Location: ${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}\n`
        alertText += `Maps: https://maps.google.com/?q=${location.latitude},${location.longitude}\n`
      }
    }
    
    if (recordingUrl) {
      alertText += `\nRecording: ${recordingUrl}\n`
    }
    
    alertText += `\nThis is an automated alert from Pocket Lawyer app.`
    alertText += `\nIf this is a real emergency, please contact 911 immediately.`
    
    return alertText
  }

  /**
   * Send browser notification
   * @param {string} title - Notification title
   * @param {string} body - Notification body
   * @param {Object} options - Additional options
   */
  sendBrowserNotification(title, body, options = {}) {
    if (this.notificationPermission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: 'pocket-lawyer-alert',
          requireInteraction: true,
          ...options
        })
      } catch (error) {
        console.error('Browser notification error:', error)
      }
    }
  }

  /**
   * Cancel active alert
   * @param {string} alertId - Alert ID to cancel
   * @returns {Promise<Object>} - Cancel result
   */
  async cancelAlert(alertId) {
    try {
      const alert = this.activeAlerts.get(alertId)
      
      if (!alert) {
        return {
          success: false,
          error: 'Alert not found'
        }
      }

      // Mark alert as cancelled
      alert.status = 'cancelled'
      alert.cancelledAt = new Date().toISOString()
      
      // Send cancellation message to contacts
      const cancelMessage = `🟢 ALERT CANCELLED 🟢\n\nThe previous emergency alert has been cancelled. The situation is now resolved.\n\nTime: ${new Date().toLocaleString()}\n\nThis is an automated message from Pocket Lawyer app.`
      
      const results = []
      for (const contact of alert.contacts) {
        try {
          const result = await this.sendContactAlert(contact, cancelMessage, `cancel-${alertId}`)
          results.push({
            contact: contact.name,
            success: result.success,
            error: result.error
          })
        } catch (error) {
          results.push({
            contact: contact.name,
            success: false,
            error: error.message
          })
        }
      }

      this.sendBrowserNotification('Alert Cancelled', 
        `Cancellation sent to ${alert.contacts.length} contact(s)`)

      return {
        success: true,
        alertId,
        results,
        message: 'Alert cancelled and contacts notified'
      }
    } catch (error) {
      console.error('Cancel alert error:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * Get active alerts
   * @returns {Array} - List of active alerts
   */
  getActiveAlerts() {
    return Array.from(this.activeAlerts.values())
      .filter(alert => alert.status === 'sent')
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
  }

  /**
   * Get alert history
   * @returns {Array} - List of all alerts
   */
  getAlertHistory() {
    return Array.from(this.activeAlerts.values())
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
  }

  /**
   * Clear alert history
   */
  clearHistory() {
    this.activeAlerts.clear()
  }

  /**
   * Test alert system
   * @param {Array} contacts - Test contacts
   * @returns {Promise<Object>} - Test result
   */
  async testAlertSystem(contacts) {
    const testMessage = `🧪 TEST ALERT 🧪\n\nThis is a test of the Pocket Lawyer emergency alert system.\n\nTime: ${new Date().toLocaleString()}\n\nIf you received this message, the alert system is working correctly.\n\nThis is a test message - no action required.`
    
    try {
      const results = []
      
      for (const contact of contacts) {
        const result = await this.sendContactAlert(contact, testMessage, 'test-alert')
        results.push({
          contact: contact.name,
          method: contact.preferredMethod || 'sms',
          success: result.success,
          error: result.error
        })
      }

      return {
        success: true,
        results,
        message: `Test completed for ${contacts.length} contact(s)`
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * Check if alerts are supported
   * @returns {boolean} - Support status
   */
  isSupported() {
    return 'Notification' in window
  }

  /**
   * Get notification permission status
   * @returns {string} - Permission status
   */
  getNotificationPermission() {
    return this.notificationPermission || 'default'
  }
}

// Create singleton instance
const alertsService = new AlertsService()

export default alertsService
export { AlertsService }
