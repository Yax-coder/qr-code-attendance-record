import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../services/api'
import { locationService } from '../services/locationService'
import LocationTroubleshooting from './LocationTroubleshooting'
import './StudentView.css'

function StudentView() {
  const { user } = useAuth()
  const [scannedData, setScannedData] = useState(null)
  const [studentId, setStudentId] = useState('')
  const [isScanning, setIsScanning] = useState(false)
  const [attendanceResult, setAttendanceResult] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')
  const [showTroubleshooting, setShowTroubleshooting] = useState(false)
  const videoRef = useRef(null)
  const qrScannerRef = useRef(null)

  const startScanning = async () => {
    try {
      const QrScanner = (await import('qr-scanner')).default
      
      if (!videoRef.current) return
      
      qrScannerRef.current = new QrScanner(
        videoRef.current,
        (result) => {
          if (result && !isProcessing) {
            try {
              const sessionData = JSON.parse(result.data)
        setScannedData(sessionData)
        setIsScanning(false)
        setError('')
              
              // Stop scanning
              if (qrScannerRef.current) {
                qrScannerRef.current.stop()
              }
              
              // Automatically process attendance
              processAttendance(sessionData)
      } catch (err) {
        setError('Invalid QR code format. Please scan a valid session QR code.')
              setIsScanning(false)
            }
          }
        },
        {
          highlightScanRegion: true,
          highlightCodeOutline: true,
        }
      )
      
      await qrScannerRef.current.start()
      setIsScanning(true)
      setError('')
    } catch (err) {
      console.error('QR Scanner Error:', err)
      setError('Camera access denied or QR scanner error. Please allow camera access.')
      setIsScanning(false)
    }
  }

  const stopScanning = () => {
    if (qrScannerRef.current) {
      qrScannerRef.current.stop()
      qrScannerRef.current = null
    }
    setIsScanning(false)
  }

  useEffect(() => {
    return () => {
      if (qrScannerRef.current) {
        qrScannerRef.current.stop()
      }
    }
  }, [])

  const processAttendance = async (sessionData) => {
    setIsProcessing(true)
    setAttendanceResult(null)
    setError('')

    try {
      // Step 1: Validate session data
      const sessionValidation = validateSession(sessionData)
      if (!sessionValidation.valid) {
        setAttendanceResult({
          success: false,
          reason: sessionValidation.reason,
          details: sessionValidation.details
        })
        return
      }

      // Step 2: Get current location
      const currentLocation = await locationService.getCurrentLocation()
      
      // Step 3: Validate location against session location
      const locationValidation = locationService.validateLocation(
        currentLocation, 
        sessionData.location, 
        sessionData.sessionId
      )
      
      if (!locationValidation.valid) {
        setAttendanceResult({
          success: false,
          reason: locationValidation.reason,
          details: `You are ${locationValidation.distance}m away from the class location. Required: within ${sessionData.tolerance || 50}m.`
        })
        return
      }

      // Step 4: Check for suspicious activity
      const suspiciousActivity = locationService.checkSuspiciousActivity(sessionData.sessionId)
      if (suspiciousActivity.suspicious) {
        setAttendanceResult({
          success: false,
          reason: 'Security Alert',
          details: suspiciousActivity.reason
        })
        return
      }

      // Step 5: Submit attendance
      const attendanceData = {
        studentId: studentId.trim(),
        sessionId: sessionData.sessionId,
        course: sessionData.course,
        timestamp: new Date().toISOString(),
        location: currentLocation,
        validated: true
      }

      await api.submitAttendance(attendanceData)
      
      setAttendanceResult({
        success: true,
        reason: 'Attendance Recorded Successfully!',
        details: `You are ${locationValidation.distance}m from the class location. Course: ${sessionData.course}`
      })

    } catch (error) {
      console.error('Attendance processing error:', error)
      
      if (error.message.includes('Failed to get location') || 
          error.message.includes('Location information is unavailable')) {
        setShowTroubleshooting(true)
        setAttendanceResult({
          success: false,
          reason: 'Location Error',
          details: error.message
        })
      } else {
        setAttendanceResult({
          success: false,
          reason: 'Attendance Failed',
          details: error.message
        })
      }
    } finally {
      setIsProcessing(false)
    }
  }

  const validateSession = (sessionData) => {
    // Check if session is not expired (within 2 hours)
    const sessionTime = new Date(sessionData.timestamp)
    const now = new Date()
    const timeDiff = now - sessionTime
    const maxAge = 2 * 60 * 60 * 1000 // 2 hours

    if (timeDiff > maxAge) {
      return {
        valid: false,
        reason: 'Session Expired',
        details: 'This QR code has expired. Please ask your lecturer for a new one.'
      }
    }

    // Check required fields
    if (!sessionData.course || !sessionData.location || !sessionData.sessionId) {
      return {
        valid: false,
        reason: 'Invalid Session Data',
        details: 'The QR code is missing required information.'
      }
    }

    // Check if student ID is provided
    if (!studentId.trim()) {
      return {
        valid: false,
        reason: 'Student ID Required',
        details: 'Please enter your student ID before scanning.'
      }
    }

    return { valid: true }
  }

  const resetScanner = () => {
    setScannedData(null)
    setStudentId('')
    setAttendanceResult(null)
    setError('')
    setIsScanning(false)
    setIsProcessing(false)
  }

  return (
    <div className="student-view">
      <h2>👨‍🎓 Student Dashboard</h2>
      
      {/* Student ID Input */}
      <div className="student-id-section">
        <div className="form-group">
          <label htmlFor="studentId">Student ID:</label>
          <input
            type="text"
            id="studentId"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            placeholder="Enter your student ID"
            disabled={isProcessing}
          />
        </div>
      </div>

      {/* QR Scanner Section */}
        <div className="scanner-section">
          <h3>📱 Scan QR Code</h3>
        <p>Scan the QR code provided by your lecturer to automatically mark attendance.</p>
          
          <div className="scanner-container">
            {isScanning ? (
              <div className="qr-scanner">
              <video 
                ref={videoRef}
                style={{ width: '100%', maxWidth: '400px', borderRadius: '10px' }}
                />
                <button 
                  className="stop-scan-btn"
                onClick={stopScanning}
                disabled={isProcessing}
                >
                  Stop Scanning
                </button>
              </div>
            ) : (
              <button 
                className="start-scan-btn"
              onClick={startScanning}
              disabled={isProcessing || !studentId.trim()}
              >
                📷 Start Camera Scanner
              </button>
            )}
          </div>

        {!studentId.trim() && (
          <p className="warning-text">⚠️ Please enter your Student ID before scanning.</p>
        )}
      </div>

      {/* Processing Status */}
      {isProcessing && (
        <div className="processing-section">
          <div className="processing-spinner">⏳</div>
          <h3>Processing Attendance...</h3>
          <p>Validating location and recording attendance...</p>
        </div>
      )}

      {/* Attendance Result */}
      {attendanceResult && (
        <div className={`attendance-result ${attendanceResult.success ? 'success' : 'error'}`}>
          <div className="result-icon">
            {attendanceResult.success ? '✅' : '❌'}
          </div>
          <div className="result-content">
            <h3>{attendanceResult.reason}</h3>
            <p>{attendanceResult.details}</p>
            
            {attendanceResult.success && scannedData && (
              <div className="session-info">
                <p><strong>Course:</strong> {scannedData.course}</p>
                <p><strong>Time:</strong> {new Date(scannedData.timestamp).toLocaleString()}</p>
                </div>
              )}
            </div>

          <div className="result-actions">
              <button
                onClick={resetScanner}
              className="scan-again-btn"
              >
              🔄 Scan Another QR Code
              </button>
          </div>
        </div>
      )}

      {/* Error Display */}
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

      {/* Location Troubleshooting Modal */}
      {showTroubleshooting && (
        <LocationTroubleshooting
          onLocationSuccess={(location) => {
            setShowTroubleshooting(false)
            setError('')
            // Retry attendance processing with the new location
            if (scannedData) {
              processAttendance(scannedData)
            }
          }}
          onClose={() => setShowTroubleshooting(false)}
        />
      )}
    </div>
  )
}

export default StudentView
