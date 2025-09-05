import React, { useState, useRef } from 'react'
import { 
  Mic, 
  Video, 
  Square, 
  MapPin, 
  Clock, 
  Share, 
  Upload,
  AlertTriangle,
  Lock
} from 'lucide-react'

const RecordButton = ({ state, isPremium, onPremiumRequired }) => {
  const [isRecording, setIsRecording] = useState(false)
  const [recordingType, setRecordingType] = useState('audio') // 'audio' or 'video'
  const [recordingData, setRecordingData] = useState(null)
  const [startTime, setStartTime] = useState(null)
  const [duration, setDuration] = useState(0)
  const [location, setLocation] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  
  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])
  const intervalRef = useRef(null)

  const startRecording = async () => {
    if (!isPremium && recordingType === 'video') {
      onPremiumRequired('advanced-recording')
      return
    }

    try {
      // Get location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              timestamp: new Date().toISOString()
            })
          },
          (error) => console.log('Location access denied')
        )
      }

      // Start media recording
      const constraints = recordingType === 'video' 
        ? { video: true, audio: true }
        : { audio: true }
        
      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      
      mediaRecorderRef.current = new MediaRecorder(stream)
      chunksRef.current = []
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }
      
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: recordingType === 'video' ? 'video/webm' : 'audio/webm'
        })
        setRecordingData({
          blob,
          url: URL.createObjectURL(blob),
          type: recordingType,
          duration,
          location,
          timestamp: startTime,
          state
        })
      }
      
      mediaRecorderRef.current.start()
      setIsRecording(true)
      setStartTime(new Date())
      setDuration(0)
      
      // Start duration counter
      intervalRef.current = setInterval(() => {
        setDuration(prev => prev + 1)
      }, 1000)
      
    } catch (error) {
      console.error('Recording failed:', error)
      alert('Failed to start recording. Please check your device permissions.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
      setIsRecording(false)
      clearInterval(intervalRef.current)
    }
  }

  const uploadToIPFS = async () => {
    if (!recordingData) return
    
    setIsUploading(true)
    
    try {
      // Mock IPFS upload (in real app, use Pinata API)
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const mockIPFSHash = `Qm${Math.random().toString(36).substring(2)}`
      const shareableData = {
        ipfsHash: mockIPFSHash,
        type: recordingData.type,
        duration: recordingData.duration,
        location: recordingData.location,
        timestamp: recordingData.timestamp,
        state: recordingData.state,
        url: `https://ipfs.io/ipfs/${mockIPFSHash}`
      }
      
      // Store in localStorage for demo
      const encounters = JSON.parse(localStorage.getItem('recordedEncounters') || '[]')
      encounters.push(shareableData)
      localStorage.setItem('recordedEncounters', JSON.stringify(encounters))
      
      alert('Recording uploaded successfully! Link copied to clipboard.')
      navigator.clipboard.writeText(shareableData.url)
      
    } catch (error) {
      console.error('Upload failed:', error)
      alert('Upload failed. Please try again.')
    }
    
    setIsUploading(false)
  }

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-primary mb-2">
          Record & Document
        </h2>
        <p className="text-gray-600">
          Securely document your police encounter
        </p>
      </div>

      {/* Recording Type Selection */}
      <div className="card">
        <h3 className="text-lg font-semibold text-primary mb-4">Recording Type</h3>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setRecordingType('audio')}
            className={`p-4 rounded-lg border-2 transition-all ${
              recordingType === 'audio'
                ? 'border-accent bg-accent/10'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <Mic className="w-8 h-8 mx-auto mb-2 text-accent" />
            <div className="text-sm font-medium">Audio Only</div>
            <div className="text-xs text-gray-500">Discreet recording</div>
          </button>
          
          <button
            onClick={() => {
              if (!isPremium) {
                onPremiumRequired('advanced-recording')
                return
              }
              setRecordingType('video')
            }}
            className={`p-4 rounded-lg border-2 transition-all relative ${
              recordingType === 'video'
                ? 'border-accent bg-accent/10'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            {!isPremium && (
              <Lock className="absolute top-2 right-2 w-4 h-4 text-gray-400" />
            )}
            <Video className="w-8 h-8 mx-auto mb-2 text-accent" />
            <div className="text-sm font-medium">Video + Audio</div>
            <div className="text-xs text-gray-500">
              {isPremium ? 'Complete documentation' : 'Premium only'}
            </div>
          </button>
        </div>
      </div>

      {/* Recording Controls */}
      <div className="card text-center">
        {!isRecording ? (
          <div className="space-y-4">
            <button
              onClick={startRecording}
              className="w-24 h-24 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center mx-auto transition-all"
            >
              {recordingType === 'video' ? (
                <Video className="w-8 h-8 text-white" />
              ) : (
                <Mic className="w-8 h-8 text-white" />
              )}
            </button>
            <p className="text-gray-600">Tap to start recording</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="w-24 h-24 bg-red-500 rounded-full flex items-center justify-center mx-auto animate-pulse-slow">
              <div className="w-6 h-6 bg-white rounded-full"></div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-center space-x-2 text-red-600">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="font-mono text-lg">{formatDuration(duration)}</span>
              </div>
              
              {location && (
                <div className="flex items-center justify-center space-x-1 text-sm text-gray-500">
                  <MapPin size={14} />
                  <span>Location captured</span>
                </div>
              )}
            </div>
            
            <button
              onClick={stopRecording}
              className="btn-secondary flex items-center space-x-2 mx-auto"
            >
              <Square size={16} />
              <span>Stop Recording</span>
            </button>
          </div>
        )}
      </div>

      {/* Recording Preview */}
      {recordingData && (
        <div className="card">
          <h3 className="text-lg font-semibold text-primary mb-4">Recording Complete</h3>
          
          <div className="space-y-4">
            {/* Recording Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Type:</span>
                  <span className="ml-2 font-medium capitalize">{recordingData.type}</span>
                </div>
                <div>
                  <span className="text-gray-500">Duration:</span>
                  <span className="ml-2 font-medium">{formatDuration(recordingData.duration)}</span>
                </div>
                <div>
                  <span className="text-gray-500">State:</span>
                  <span className="ml-2 font-medium">{recordingData.state}</span>
                </div>
                <div>
                  <span className="text-gray-500">Time:</span>
                  <span className="ml-2 font-medium">
                    {new Date(recordingData.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Media Preview */}
            <div className="bg-gray-100 rounded-lg p-4 text-center">
              {recordingData.type === 'video' ? (
                <video 
                  src={recordingData.url} 
                  controls 
                  className="max-w-full h-auto mx-auto rounded"
                />
              ) : (
                <audio 
                  src={recordingData.url} 
                  controls 
                  className="w-full"
                />
              )}
            </div>

            {/* Upload to IPFS */}
            <button
              onClick={uploadToIPFS}
              disabled={isUploading}
              className="btn-primary w-full flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Uploading to IPFS...</span>
                </>
              ) : (
                <>
                  <Upload size={20} />
                  <span>Upload & Share</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Important Notice */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          <AlertTriangle size={16} className="text-red-600 mt-1 flex-shrink-0" />
          <div className="text-sm text-red-800">
            <p className="font-medium mb-1">Important Recording Guidelines:</p>
            <ul className="space-y-1 text-xs">
              <li>• Only record in public spaces where legal</li>
              <li>• Keep your device visible during recording</li>
              <li>• Announce that you're recording if required by local law</li>
              <li>• Remain calm and avoid interfering with police duties</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Free User Limitations */}
      {!isPremium && (
        <div className="card border-dashed border-gray-300">
          <div className="text-center py-4">
            <Lock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <h3 className="font-semibold text-gray-700 mb-2">Premium Recording Features</h3>
            <ul className="text-sm text-gray-600 space-y-1 mb-4">
              <li>• Video recording capability</li>
              <li>• Unlimited recording duration</li>
              <li>• Cloud backup and sync</li>
              <li>• Advanced sharing options</li>
            </ul>
            <button
              onClick={() => onPremiumRequired('advanced-recording')}
              className="btn-primary"
            >
              Upgrade for Full Features
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default RecordButton