import { useState, useEffect } from 'react'
import { locationService } from '../services/locationService'
import './LocationTroubleshooting.css'

function LocationTroubleshooting({ onLocationSuccess, onClose }) {
  const [status, setStatus] = useState(null)
  const [isChecking, setIsChecking] = useState(false)
  const [error, setError] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)

  useEffect(() => {
    checkLocationStatus()
  }, [])

  const checkLocationStatus = async () => {
    setIsChecking(true)
    setError('')
    
    try {
      const serviceStatus = locationService.checkLocationServiceStatus()
      setStatus(serviceStatus)
      
      // Try to get location to test
      const location = await locationService.getCurrentLocation({ timeout: 5000 })
      setStatus(prev => ({ ...prev, lastTest: 'success', testLocation: location }))
    } catch (err) {
      setError(err.message)
      setStatus(prev => ({ ...prev, lastTest: 'failed', lastError: err.message }))
    } finally {
      setIsChecking(false)
    }
  }

  const handleRetryLocation = async () => {
    setIsChecking(true)
    setError('')
    
    try {
      const location = await locationService.getCurrentLocation()
      if (onLocationSuccess) {
        onLocationSuccess(location)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setIsChecking(false)
    }
  }

  const getBrowserInstructions = () => {
    const userAgent = navigator.userAgent.toLowerCase()
    
    if (userAgent.includes('chrome')) {
      return {
        browser: 'Chrome',
        steps: [
          'Click the lock icon in the address bar',
          'Set Location to "Allow"',
          'Refresh the page and try again'
        ]
      }
    } else if (userAgent.includes('firefox')) {
      return {
        browser: 'Firefox',
        steps: [
          'Click the shield icon in the address bar',
          'Click "Permissions"',
          'Set Location to "Allow"',
          'Refresh the page and try again'
        ]
      }
    } else if (userAgent.includes('safari')) {
      return {
        browser: 'Safari',
        steps: [
          'Go to Safari menu > Preferences',
          'Click "Websites" tab',
          'Find Location and set to "Allow"',
          'Refresh the page and try again'
        ]
      }
    } else {
      return {
        browser: 'Your Browser',
        steps: [
          'Look for location permission settings',
          'Allow location access for this site',
          'Refresh the page and try again'
        ]
      }
    }
  }

  const browserInstructions = getBrowserInstructions()

  return (
    <div className="location-troubleshooting">
      <div className="troubleshooting-header">
        <h3>📍 Location Troubleshooting</h3>
        <button onClick={onClose} className="close-btn">×</button>
      </div>

      <div className="troubleshooting-content">
        {/* Status Check */}
        <div className="status-section">
          <h4>Location Service Status</h4>
          <div className="status-grid">
            <div className="status-item">
              <span className="label">Geolocation API:</span>
              <span className={`value ${status?.geolocationSupported ? 'success' : 'error'}`}>
                {status?.geolocationSupported ? '✅ Supported' : '❌ Not Supported'}
              </span>
            </div>
            <div className="status-item">
              <span className="label">Permissions:</span>
              <span className={`value ${status?.permissions === 'granted' ? 'success' : 'warning'}`}>
                {status?.permissions === 'granted' ? '✅ Allowed' : 
                 status?.permissions === 'denied' ? '❌ Denied' : '⚠️ Unknown'}
              </span>
            </div>
            <div className="status-item">
              <span className="label">Last Test:</span>
              <span className={`value ${status?.lastTest === 'success' ? 'success' : 'error'}`}>
                {status?.lastTest === 'success' ? '✅ Success' : 
                 status?.lastTest === 'failed' ? '❌ Failed' : '⏳ Not Tested'}
              </span>
            </div>
          </div>
          
          <button 
            onClick={checkLocationStatus} 
            disabled={isChecking}
            className="check-status-btn"
          >
            {isChecking ? 'Checking...' : '🔄 Check Status'}
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="error-section">
            <h4>❌ Current Error</h4>
            <div className="error-message">{error}</div>
          </div>
        )}

        {/* Quick Fixes */}
        <div className="quick-fixes">
          <h4>🔧 Quick Fixes</h4>
          <div className="fix-list">
            <div className="fix-item">
              <strong>1. Check Browser Permissions</strong>
              <p>Make sure your browser allows location access for this site.</p>
            </div>
            <div className="fix-item">
              <strong>2. Enable GPS/Location Services</strong>
              <p>Ensure your device's location services are turned on.</p>
            </div>
            <div className="fix-item">
              <strong>3. Try a Different Location</strong>
              <p>Move to an area with better GPS signal (near windows, outdoors).</p>
            </div>
            <div className="fix-item">
              <strong>4. Refresh and Retry</strong>
              <p>Sometimes a simple refresh resolves temporary issues.</p>
            </div>
          </div>
        </div>

        {/* Browser-Specific Instructions */}
        <div className="browser-instructions">
          <h4>🌐 {browserInstructions.browser} Instructions</h4>
          <ol className="instruction-steps">
            {browserInstructions.steps.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ol>
        </div>

        {/* Advanced Options */}
        <div className="advanced-section">
          <button 
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="toggle-advanced"
          >
            {showAdvanced ? '▼' : '▶'} Advanced Options
          </button>
          
          {showAdvanced && (
            <div className="advanced-content">
              <div className="advanced-item">
                <h5>Development Mode</h5>
                <p>If you're testing locally, the app will use a fallback location in development mode.</p>
                <div className="dev-info">
                  <code>Fallback Location: New York City (40.7128, -74.0060)</code>
                </div>
              </div>
              
              <div className="advanced-item">
                <h5>Location Accuracy</h5>
                <p>The app requires location accuracy within 100 meters. Poor GPS signal can cause failures.</p>
              </div>
              
              <div className="advanced-item">
                <h5>Network Issues</h5>
                <p>Some location services require internet connection for assisted GPS.</p>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <button 
            onClick={handleRetryLocation}
            disabled={isChecking}
            className="retry-btn primary"
          >
            {isChecking ? 'Getting Location...' : '📍 Try Location Again'}
          </button>
          
          <button 
            onClick={() => window.location.reload()}
            className="refresh-btn"
          >
            🔄 Refresh Page
          </button>
        </div>
      </div>
    </div>
  )
}

export default LocationTroubleshooting
