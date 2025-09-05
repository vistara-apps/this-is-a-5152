import React, { useState, useRef, useEffect } from 'react'
import { 
  Mic, 
  MicOff, 
  Square, 
  Play, 
  Pause, 
  Download, 
  Share2, 
  MapPin, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Upload,
  FileText,
  Users
} from 'lucide-react'
import recordingService from '../services/recording.js'

const EnhancedRecordButton = ({ state, isPremium, onPremiumRequired, user }) => {
  const [recordingStatus, setRecordingStatus] = useState(recordingService.getStatus())
  const [recordedData, setRecordedData] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState(null)
  const [incidentNotes, setIncidentNotes] = useState('')
  const [error, setError] = useState(null)
  const [showIncidentForm, setShowIncidentForm] = useState(false)
  
  const audioRef = useRef(null)
  const timerRef = useRef(null)

  // Update recording status periodically
  useEffect(() => {
    const updateStatus = () => {
      setRecordingStatus(recordingService.getStatus())
    }

    if (recordingStatus.isRecording) {
      timerRef.current = setInterval(updateStatus, 1000)
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [recordingStatus.isRecording])

  const startRecording = async () => {
    setError(null)
    
    // Check if recording is supported
    if (!recordingService.isRecordingSupported()) {
      setError('Recording is not supported on this device')
      return
    }

    // Check permissions
    const permissionStatus = await recordingService.getPermissionStatus()
    if (permissionStatus === 'denied') {
      setError('Microphone permission denied. Please enable in browser settings.')
      return
    }

    const success = await recordingService.startRecording({
      audio: true,
      video: false // Can be made configurable for premium users
    })

    if (success) {
      setRecordingStatus(recordingService.getStatus())
      setRecordedData(null)
      setUploadResult(null)
    } else {
      setError('Failed to start recording. Please check microphone permissions.')
    }
  }

  const stopRecording = async () => {
    const result = await recordingService.stopRecording()
    
    if (result.success) {
      setRecordedData(result.data)
      setRecordingStatus(recordingService.getStatus())
      setShowIncidentForm(true)
    } else {
      setError(result.error || 'Failed to stop recording')
    }
  }

  const playRecording = () => {
    if (audioRef.current && recordedData) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const downloadRecording = () => {
    if (recordedData) {
      const a = document.createElement('a')
      a.href = URL.createObjectURL(recordedData.blob)
      a.download = recordedData.filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    }
  }

  const uploadRecording = async () => {
    if (!recordedData) return
    
    if (!isPremium) {
      onPremiumRequired('advanced-recording')
      return
    }

    setIsUploading(true)
    setError(null)

    try {
      const incidentDetails = {
        state,
        userId: user?.userId || 'anonymous',
        scriptUsed: null, // Could be passed from parent
        incidentNotes,
        userRights: [], // Could be fetched from state rights
        emergencyContacts: user?.savedContacts || []
      }

      const result = await recordingService.uploadRecording(recordedData, incidentDetails)
      
      if (result.success) {
        setUploadResult(result)
        setShowIncidentForm(false)
      } else {
        setError(result.error || 'Upload failed')
      }
    } catch (error) {
      console.error('Upload error:', error)
      setError('Upload failed. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  const shareRecording = async () => {
    if (!uploadResult) return

    const shareData = {
      title: 'Police Encounter Documentation',
      text: `Incident recorded on ${new Date(recordedData.startTime).toLocaleDateString()} in ${state}`,
      url: uploadResult.report.shareableLink
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (error) {
        console.error('Share error:', error)
        copyToClipboard(uploadResult.report.shareableLink)
      }
    } else {
      copyToClipboard(uploadResult.report.shareableLink)
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Link copied to clipboard!')
    }).catch(() => {
      alert('Unable to copy link')
    })
  }

  const formatTime = (milliseconds) => {
    const seconds = Math.floor(milliseconds / 1000)
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatDuration = (milliseconds) => {
    const seconds = Math.floor(milliseconds / 1000)
    if (seconds < 60) return `${seconds}s`
    const mins = Math.floor(seconds / 60)
    const remainingSecs = seconds % 60
    return `${mins}m ${remainingSecs}s`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-primary mb-2">
          Record & Document
        </h2>
        <p className="text-gray-600">
          Securely record and store your police encounter
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="card bg-red-50 border border-red-200">
          <div className="flex items-start space-x-2">
            <AlertTriangle size={16} className="text-red-600 mt-1 flex-shrink-0" />
            <div>
              <p className="text-sm text-red-800 font-medium">Error</p>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Location Status */}
      {recordingStatus.location && (
        <div className="card bg-blue-50 border border-blue-200">
          <div className="flex items-center space-x-2 text-blue-800">
            <MapPin size={16} />
            <span className="text-sm">
              Location captured: {recordingStatus.location.latitude.toFixed(4)}, {recordingStatus.location.longitude.toFixed(4)}
            </span>
          </div>
        </div>
      )}

      {/* Recording Controls */}
      <div className="card text-center">
        {!recordingStatus.isRecording && !recordedData && (
          <div className="space-y-4">
            <div className="w-24 h-24 mx-auto bg-accent rounded-full flex items-center justify-center">
              <Mic size={32} className="text-white" />
            </div>
            <button
              onClick={startRecording}
              className="btn-primary w-full"
              disabled={!recordingStatus.isSupported}
            >
              {recordingStatus.isSupported ? 'Start Recording' : 'Recording Not Supported'}
            </button>
            <p className="text-sm text-gray-600">
              Tap to begin recording your encounter
            </p>
          </div>
        )}

        {recordingStatus.isRecording && (
          <div className="space-y-4">
            <div className="w-24 h-24 mx-auto bg-red-500 rounded-full flex items-center justify-center animate-pulse">
              <MicOff size={32} className="text-white" />
            </div>
            <div className="flex items-center justify-center space-x-2 text-red-600">
              <Clock size={16} />
              <span className="font-mono text-lg">{formatTime(recordingStatus.duration)}</span>
            </div>
            <button
              onClick={stopRecording}
              className="bg-red-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-600 transition-colors w-full"
            >
              <Square size={20} className="inline mr-2" />
              Stop Recording
            </button>
          </div>
        )}

        {recordedData && (
          <div className="space-y-4">
            <div className="w-24 h-24 mx-auto bg-green-500 rounded-full flex items-center justify-center">
              <CheckCircle size={32} className="text-white" />
            </div>
            <p className="text-green-600 font-medium">
              Recording completed ({formatDuration(recordedData.duration)})
            </p>
            
            <audio
              ref={audioRef}
              src={URL.createObjectURL(recordedData.blob)}
              onEnded={() => setIsPlaying(false)}
              className="hidden"
            />
            
            <div className="flex space-x-2">
              <button
                onClick={playRecording}
                className="btn-secondary flex-1 flex items-center justify-center space-x-2"
              >
                {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                <span>{isPlaying ? 'Pause' : 'Play'}</span>
              </button>
              <button
                onClick={downloadRecording}
                className="btn-secondary flex-1 flex items-center justify-center space-x-2"
              >
                <Download size={16} />
                <span>Download</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Incident Notes Form */}
      {showIncidentForm && recordedData && !uploadResult && (
        <div className="card">
          <h3 className="text-lg font-semibold text-primary mb-4 flex items-center space-x-2">
            <FileText size={20} />
            <span>Incident Details</span>
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes (Optional)
              </label>
              <textarea
                value={incidentNotes}
                onChange={(e) => setIncidentNotes(e.target.value)}
                placeholder="Describe what happened, officer badge numbers, vehicle details, etc."
                className="input-field h-24 resize-none"
              />
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-800 mb-2">Recording Details:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Duration: {formatDuration(recordedData.duration)}</li>
                <li>• Size: {(recordedData.size / 1024 / 1024).toFixed(2)} MB</li>
                <li>• Format: {recordedData.mimeType}</li>
                {recordedData.location && (
                  <li>• Location: {recordedData.location.latitude.toFixed(4)}, {recordedData.location.longitude.toFixed(4)}</li>
                )}
              </ul>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowIncidentForm(false)}
                className="btn-secondary flex-1"
              >
                Skip Upload
              </button>
              <button
                onClick={uploadRecording}
                disabled={isUploading}
                className="btn-primary flex-1 flex items-center justify-center space-x-2"
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Upload size={16} />
                    <span>Upload to IPFS</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Premium Feature Notice */}
      {recordedData && !isPremium && !uploadResult && (
        <div className="card bg-yellow-50 border border-yellow-200">
          <div className="flex items-start space-x-2">
            <AlertTriangle size={16} className="text-yellow-600 mt-1 flex-shrink-0" />
            <div>
              <p className="text-sm text-yellow-800 font-medium">Premium Feature</p>
              <p className="text-sm text-yellow-700">
                IPFS storage and sharing requires a premium subscription.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Upload Result */}
      {uploadResult && (
        <div className="card bg-green-50 border border-green-200">
          <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center space-x-2">
            <CheckCircle size={20} />
            <span>Successfully Uploaded</span>
          </h3>
          
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-4 border border-green-200">
              <h4 className="font-medium text-green-800 mb-2">Recording</h4>
              <div className="text-sm space-y-1">
                <p><span className="font-medium">IPFS Hash:</span> <span className="font-mono text-xs">{uploadResult.recording.ipfsHash}</span></p>
                <p><span className="font-medium">Size:</span> {uploadResult.recording.size} bytes</p>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 border border-green-200">
              <h4 className="font-medium text-green-800 mb-2">Incident Report</h4>
              <div className="text-sm space-y-1">
                <p><span className="font-medium">Report Hash:</span> <span className="font-mono text-xs">{uploadResult.report.ipfsHash}</span></p>
                <p><span className="font-medium">Shareable Link:</span></p>
                <a 
                  href={uploadResult.report.shareableLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-xs break-all"
                >
                  {uploadResult.report.shareableLink}
                </a>
              </div>
            </div>
            
            <button
              onClick={shareRecording}
              className="btn-primary w-full flex items-center justify-center space-x-2"
            >
              <Share2 size={16} />
              <span>Share Incident Report</span>
            </button>
          </div>
        </div>
      )}

      {/* Important Notes */}
      <div className="card bg-gray-50">
        <h3 className="text-lg font-semibold text-primary mb-3">
          Important Recording Guidelines
        </h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start space-x-2">
            <CheckCircle size={14} className="text-green-500 mt-1 flex-shrink-0" />
            <span>Announce that you are recording for your safety</span>
          </li>
          <li className="flex items-start space-x-2">
            <CheckCircle size={14} className="text-green-500 mt-1 flex-shrink-0" />
            <span>Keep your phone visible and avoid sudden movements</span>
          </li>
          <li className="flex items-start space-x-2">
            <CheckCircle size={14} className="text-green-500 mt-1 flex-shrink-0" />
            <span>Record continuously - don't stop and start</span>
          </li>
          <li className="flex items-start space-x-2">
            <CheckCircle size={14} className="text-green-500 mt-1 flex-shrink-0" />
            <span>State the date, time, and location clearly</span>
          </li>
        </ul>
      </div>
    </div>
  )
}

export default EnhancedRecordButton
