import { useState } from 'react'
import QRCode from 'react-qr-code'
import AttendanceDashboard from './AttendanceDashboard'
import { locationService } from '../services/locationService'
import LocationTroubleshooting from './LocationTroubleshooting'
import './LecturerView.css'

function LecturerView() {
  const [sessionData, setSessionData] = useState({
    course: '',
    time: '',
    location: null
  })
  const [qrGenerated, setQrGenerated] = useState(false)
  const [isLoadingLocation, setIsLoadingLocation] = useState(false)
  const [error, setError] = useState('')
  const [showTroubleshooting, setShowTroubleshooting] = useState(false)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setSessionData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const getCurrentLocation = async () => {
    setIsLoadingLocation(true)
    setError('')

    try {
      const location = await locationService.getCurrentLocation()
      setSessionData(prev => ({
        ...prev,
        location: location
      }))
      setError('')
    } catch (error) {
      setError(error.message)
      // Show troubleshooting for location errors
      if (error.message.includes('Failed to get location') || 
          error.message.includes('Location information is unavailable')) {
        setShowTroubleshooting(true)
      }
    } finally {
      setIsLoadingLocation(false)
    }
  }

  const generateQR = () => {
    if (!sessionData.course || !sessionData.time || !sessionData.location) {
      setError('Please fill in all fields and get your current location.')
      return
    }

    // Generate session ID and location hash for security
    const sessionId = Date.now().toString()
    const locationHash = locationService.generateLocationHash(sessionData.location, sessionId)
    
    setSessionData(prev => ({
      ...prev,
      sessionId: sessionId,
      locationHash: locationHash
    }))

    setQrGenerated(true)
    setError('')
  }

  const resetForm = () => {
    setSessionData({
      course: '',
      time: '',
      location: null
    })
    setQrGenerated(false)
    setError('')
  }

  return (
    <div className="lecturer-view">
      <h2>👨‍🏫 Lecturer Dashboard</h2>
      
      <div className="session-form">
        <h3>Create Class Session</h3>
        
        <div className="form-group">
          <label htmlFor="course">Course Name:</label>
          <input
            type="text"
            id="course"
            name="course"
            value={sessionData.course}
            onChange={handleInputChange}
            placeholder="e.g., Computer Science 101"
            disabled={qrGenerated}
          />
        </div>

        <div className="form-group">
          <label htmlFor="time">Session Time:</label>
          <input
            type="datetime-local"
            id="time"
            name="time"
            value={sessionData.time}
            onChange={handleInputChange}
            disabled={qrGenerated}
          />
        </div>

        <div className="form-group">
          <label>Current Location (Required for Security):</label>
          <div className="location-section">
            <div className="location-buttons">
              <button
                type="button"
                onClick={getCurrentLocation}
                disabled={isLoadingLocation || qrGenerated}
                className="location-btn primary"
              >
                {isLoadingLocation ? 'Getting Location...' : '📍 Get Current Location'}
              </button>
            </div>
            
            <div className="location-help">
              <p><strong>🔒 Security Note:</strong> Real location is required to prevent cheating and ensure students are physically present.</p>
              <p><strong>📍 Location Tolerance:</strong> Students must be within {locationService.getLocationTolerance()}m of this location.</p>
              <p><strong>⚠️ Important:</strong> Location data is validated and tracked for security purposes.</p>
            </div>
            
            {sessionData.location && (
              <div className="location-info">
                <p>📍 Location: {sessionData.location.latitude.toFixed(6)}, {sessionData.location.longitude.toFixed(6)}</p>
                <p>Accuracy: ±{Math.round(sessionData.location.accuracy)}m</p>
                {sessionData.location.latitude === 40.7128 && (
                  <p className="demo-note">🎭 Using demo location for testing</p>
                )}
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="error-message">
            {error}
            {(error.includes('Failed to get location') || error.includes('Location information is unavailable')) && (
              <button 
                onClick={() => setShowTroubleshooting(true)}
                className="troubleshoot-btn"
              >
                🔧 Troubleshoot Location Issues
              </button>
            )}
          </div>
        )}

        <div className="form-actions">
          {!qrGenerated ? (
            <button
              onClick={generateQR}
              className="generate-btn"
              disabled={!sessionData.course || !sessionData.time || !sessionData.location}
            >
              🔲 Generate QR Code
            </button>
          ) : (
            <button onClick={resetForm} className="reset-btn">
              🔄 Create New Session
            </button>
          )}
        </div>
      </div>

      {qrGenerated && (
        <div className="qr-section">
          <h3>📱 QR Code for Students</h3>
          <div className="qr-container">
            <QRCode
              value={JSON.stringify({
                course: sessionData.course,
                time: sessionData.time,
                location: sessionData.location,
                sessionId: sessionData.sessionId,
                locationHash: sessionData.locationHash,
                tolerance: locationService.getLocationTolerance(),
                timestamp: Date.now()
              })}
              size={256}
              level="M"
              includeMargin={true}
            />
          </div>
          <div className="session-info">
            <p><strong>Course:</strong> {sessionData.course}</p>
            <p><strong>Time:</strong> {new Date(sessionData.time).toLocaleString()}</p>
            <p><strong>Location:</strong> {sessionData.location.latitude.toFixed(6)}, {sessionData.location.longitude.toFixed(6)}</p>
          </div>
          <p className="instruction">Students should scan this QR code to mark their attendance.</p>
        </div>
      )}

      <AttendanceDashboard />

      {/* Location Troubleshooting Modal */}
      {showTroubleshooting && (
        <LocationTroubleshooting
          onLocationSuccess={(location) => {
            setShowTroubleshooting(false)
            setError('')
            setSessionData(prev => ({
              ...prev,
              location: location
            }))
          }}
          onClose={() => setShowTroubleshooting(false)}
        />
      )}
    </div>
  )
}

export default LecturerView
