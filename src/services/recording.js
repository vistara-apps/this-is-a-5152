import pinataService from './pinata.js'

class RecordingService {
  constructor() {
    this.mediaRecorder = null
    this.recordedChunks = []
    this.isRecording = false
    this.stream = null
    this.recordingStartTime = null
    this.currentLocation = null
  }

  /**
   * Get user's current location
   * @returns {Promise<Object>} - Location data
   */
  async getCurrentLocation() {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve({ error: 'Geolocation not supported' })
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date().toISOString(),
            address: null // Will be filled by reverse geocoding if needed
          }
          this.currentLocation = location
          resolve(location)
        },
        (error) => {
          console.error('Geolocation error:', error)
          resolve({ error: error.message })
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      )
    })
  }

  /**
   * Start recording audio/video
   * @param {Object} options - Recording options
   * @returns {Promise<boolean>} - Success status
   */
  async startRecording(options = {}) {
    try {
      const {
        audio = true,
        video = false,
        videoBitrate = 1000000,
        audioBitrate = 128000
      } = options

      // Get user media
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: audio ? {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } : false,
        video: video ? {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        } : false
      })

      // Set up MediaRecorder
      const mimeType = this.getSupportedMimeType()
      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType,
        audioBitsPerSecond: audioBitrate,
        videoBitsPerSecond: video ? videoBitrate : undefined
      })

      this.recordedChunks = []
      this.recordingStartTime = new Date()

      // Handle data available
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.recordedChunks.push(event.data)
        }
      }

      // Start recording
      this.mediaRecorder.start(1000) // Collect data every second
      this.isRecording = true

      // Get location
      await this.getCurrentLocation()

      return true
    } catch (error) {
      console.error('Failed to start recording:', error)
      this.cleanup()
      return false
    }
  }

  /**
   * Stop recording and return the recorded data
   * @returns {Promise<Object>} - Recording data
   */
  async stopRecording() {
    return new Promise((resolve) => {
      if (!this.mediaRecorder || !this.isRecording) {
        resolve({ success: false, error: 'No active recording' })
        return
      }

      this.mediaRecorder.onstop = () => {
        const recordingEndTime = new Date()
        const duration = recordingEndTime - this.recordingStartTime

        // Create blob from recorded chunks
        const mimeType = this.mediaRecorder.mimeType
        const blob = new Blob(this.recordedChunks, { type: mimeType })
        
        // Create file
        const extension = this.getFileExtension(mimeType)
        const filename = `recording-${Date.now()}.${extension}`
        const file = new File([blob], filename, { type: mimeType })

        const recordingData = {
          file,
          blob,
          filename,
          mimeType,
          size: blob.size,
          duration,
          startTime: this.recordingStartTime,
          endTime: recordingEndTime,
          location: this.currentLocation
        }

        this.cleanup()
        resolve({ success: true, data: recordingData })
      }

      this.mediaRecorder.stop()
      this.isRecording = false
    })
  }

  /**
   * Upload recording to IPFS and create incident report
   * @param {Object} recordingData - Recording data from stopRecording
   * @param {Object} incidentDetails - Additional incident information
   * @returns {Promise<Object>} - Upload result with IPFS hashes
   */
  async uploadRecording(recordingData, incidentDetails = {}) {
    try {
      const {
        state,
        userId,
        scriptUsed,
        incidentNotes,
        userRights,
        emergencyContacts
      } = incidentDetails

      // Upload recording file to IPFS
      const recordingMetadata = {
        type: 'police-encounter-recording',
        timestamp: recordingData.startTime.toISOString(),
        duration: recordingData.duration,
        location: recordingData.location,
        userId,
        state,
        mimeType: recordingData.mimeType,
        size: recordingData.size
      }

      const recordingUpload = await pinataService.uploadFile(
        recordingData.file,
        recordingMetadata
      )

      if (!recordingUpload.success) {
        return {
          success: false,
          error: 'Failed to upload recording: ' + recordingUpload.error
        }
      }

      // Create incident report
      const incidentData = {
        recordingHash: recordingUpload.ipfsHash,
        location: recordingData.location,
        timestamp: recordingData.startTime.toISOString(),
        state,
        userId,
        scriptUsed,
        incidentNotes,
        userRights,
        contacts: emergencyContacts
      }

      const reportUpload = await pinataService.createIncidentReport(incidentData)

      if (!reportUpload.success) {
        return {
          success: false,
          error: 'Failed to create incident report: ' + reportUpload.error
        }
      }

      return {
        success: true,
        recording: {
          ipfsHash: recordingUpload.ipfsHash,
          gatewayUrl: recordingUpload.gatewayUrl,
          size: recordingUpload.pinSize
        },
        report: {
          ipfsHash: reportUpload.ipfsHash,
          gatewayUrl: reportUpload.gatewayUrl,
          shareableLink: pinataService.generateShareableLink(reportUpload.ipfsHash)
        },
        metadata: {
          duration: recordingData.duration,
          location: recordingData.location,
          timestamp: recordingData.startTime.toISOString()
        }
      }
    } catch (error) {
      console.error('Upload recording error:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * Get supported MIME type for recording
   * @returns {string} - Supported MIME type
   */
  getSupportedMimeType() {
    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4',
      'audio/mpeg',
      'audio/wav'
    ]

    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type
      }
    }

    return 'audio/webm' // Fallback
  }

  /**
   * Get file extension from MIME type
   * @param {string} mimeType - MIME type
   * @returns {string} - File extension
   */
  getFileExtension(mimeType) {
    const extensions = {
      'audio/webm': 'webm',
      'audio/mp4': 'm4a',
      'audio/mpeg': 'mp3',
      'audio/wav': 'wav',
      'video/webm': 'webm',
      'video/mp4': 'mp4'
    }

    return extensions[mimeType] || 'webm'
  }

  /**
   * Check if recording is supported
   * @returns {boolean} - Support status
   */
  isRecordingSupported() {
    return !!(navigator.mediaDevices && 
              navigator.mediaDevices.getUserMedia && 
              window.MediaRecorder)
  }

  /**
   * Get recording permissions status
   * @returns {Promise<string>} - Permission status
   */
  async getPermissionStatus() {
    try {
      const audioPermission = await navigator.permissions.query({ name: 'microphone' })
      return audioPermission.state // 'granted', 'denied', or 'prompt'
    } catch (error) {
      console.error('Permission check error:', error)
      return 'unknown'
    }
  }

  /**
   * Clean up resources
   */
  cleanup() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop())
      this.stream = null
    }
    
    this.mediaRecorder = null
    this.recordedChunks = []
    this.isRecording = false
    this.recordingStartTime = null
  }

  /**
   * Get current recording status
   * @returns {Object} - Recording status
   */
  getStatus() {
    return {
      isRecording: this.isRecording,
      isSupported: this.isRecordingSupported(),
      startTime: this.recordingStartTime,
      duration: this.isRecording && this.recordingStartTime 
        ? Date.now() - this.recordingStartTime.getTime() 
        : 0,
      location: this.currentLocation
    }
  }
}

// Create singleton instance
const recordingService = new RecordingService()

export default recordingService
export { RecordingService }
