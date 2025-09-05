import axios from 'axios'

class PinataService {
  constructor() {
    this.apiKey = import.meta.env.VITE_PINATA_API_KEY
    this.secretKey = import.meta.env.VITE_PINATA_SECRET_KEY
    this.baseURL = 'https://api.pinata.cloud'
    
    // Create axios instance with default headers
    this.api = axios.create({
      baseURL: this.baseURL,
      headers: {
        'pinata_api_key': this.apiKey,
        'pinata_secret_api_key': this.secretKey,
      }
    })
  }

  /**
   * Upload a file to IPFS via Pinata
   * @param {File} file - The file to upload
   * @param {Object} metadata - Additional metadata for the file
   * @returns {Promise<Object>} - Upload result with IPFS hash
   */
  async uploadFile(file, metadata = {}) {
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      // Add metadata
      const pinataMetadata = {
        name: metadata.name || file.name,
        keyvalues: {
          type: metadata.type || 'recording',
          timestamp: metadata.timestamp || new Date().toISOString(),
          location: metadata.location || null,
          userId: metadata.userId || null,
          state: metadata.state || null,
          ...metadata.customData
        }
      }
      
      formData.append('pinataMetadata', JSON.stringify(pinataMetadata))
      
      const response = await this.api.post('/pinning/pinFileToIPFS', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      })

      return {
        success: true,
        ipfsHash: response.data.IpfsHash,
        pinSize: response.data.PinSize,
        timestamp: response.data.Timestamp,
        gatewayUrl: `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`,
        metadata: pinataMetadata
      }
    } catch (error) {
      console.error('Pinata upload error:', error)
      return {
        success: false,
        error: error.response?.data?.error || error.message
      }
    }
  }

  /**
   * Upload JSON data to IPFS
   * @param {Object} data - JSON data to upload
   * @param {Object} metadata - Additional metadata
   * @returns {Promise<Object>} - Upload result with IPFS hash
   */
  async uploadJSON(data, metadata = {}) {
    try {
      const pinataContent = {
        ...data,
        _metadata: {
          uploadedAt: new Date().toISOString(),
          type: metadata.type || 'json-data',
          ...metadata
        }
      }

      const response = await this.api.post('/pinning/pinJSONToIPFS', pinataContent, {
        headers: {
          'Content-Type': 'application/json',
        }
      })

      return {
        success: true,
        ipfsHash: response.data.IpfsHash,
        pinSize: response.data.PinSize,
        timestamp: response.data.Timestamp,
        gatewayUrl: `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`,
        data: pinataContent
      }
    } catch (error) {
      console.error('Pinata JSON upload error:', error)
      return {
        success: false,
        error: error.response?.data?.error || error.message
      }
    }
  }

  /**
   * Create and upload an incident report card
   * @param {Object} incidentData - Incident details
   * @returns {Promise<Object>} - Upload result for the incident report
   */
  async createIncidentReport(incidentData) {
    const {
      recordingHash,
      location,
      timestamp,
      state,
      userId,
      scriptUsed,
      incidentNotes,
      userRights,
      contacts
    } = incidentData

    const reportData = {
      type: 'incident-report',
      timestamp: timestamp || new Date().toISOString(),
      location: location || null,
      state: state || null,
      userId: userId || null,
      recording: {
        ipfsHash: recordingHash,
        url: recordingHash ? `https://gateway.pinata.cloud/ipfs/${recordingHash}` : null
      },
      script: scriptUsed || null,
      notes: incidentNotes || '',
      rights: userRights || [],
      emergencyContacts: contacts || [],
      reportId: `incident-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      shareableCard: {
        title: 'Police Encounter Documentation',
        summary: `Incident recorded on ${new Date(timestamp).toLocaleDateString()} in ${state}`,
        location: location?.address || 'Location recorded',
        timestamp: timestamp,
        hasRecording: !!recordingHash,
        rightsAsserted: userRights?.length || 0
      }
    }

    return await this.uploadJSON(reportData, {
      type: 'incident-report',
      state: state,
      timestamp: timestamp
    })
  }

  /**
   * Get file metadata from IPFS hash
   * @param {string} ipfsHash - The IPFS hash to query
   * @returns {Promise<Object>} - File metadata
   */
  async getFileMetadata(ipfsHash) {
    try {
      const response = await this.api.get(`/data/pinList?hashContains=${ipfsHash}`)
      
      if (response.data.rows && response.data.rows.length > 0) {
        return {
          success: true,
          metadata: response.data.rows[0].metadata,
          pinSize: response.data.rows[0].size,
          pinDate: response.data.rows[0].date_pinned
        }
      }
      
      return {
        success: false,
        error: 'File not found'
      }
    } catch (error) {
      console.error('Pinata metadata error:', error)
      return {
        success: false,
        error: error.response?.data?.error || error.message
      }
    }
  }

  /**
   * Test Pinata connection and authentication
   * @returns {Promise<boolean>} - Connection status
   */
  async testConnection() {
    try {
      const response = await this.api.get('/data/testAuthentication')
      return response.data.message === 'Congratulations! You are communicating with the Pinata API!'
    } catch (error) {
      console.error('Pinata connection test failed:', error)
      return false
    }
  }

  /**
   * Generate a shareable link for an incident report
   * @param {string} ipfsHash - The IPFS hash of the incident report
   * @returns {string} - Shareable URL
   */
  generateShareableLink(ipfsHash) {
    return `${window.location.origin}/incident/${ipfsHash}`
  }

  /**
   * Get usage statistics
   * @returns {Promise<Object>} - Usage stats
   */
  async getUsageStats() {
    try {
      const response = await this.api.get('/data/pinList?status=pinned&pageLimit=1')
      return {
        success: true,
        totalPins: response.data.count,
        totalSize: response.data.rows.reduce((sum, pin) => sum + parseInt(pin.size), 0)
      }
    } catch (error) {
      console.error('Pinata usage stats error:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }
}

// Create singleton instance
const pinataService = new PinataService()

export default pinataService
export { PinataService }
