// Location validation service for preventing cheating
class LocationService {
  constructor() {
    this.locationTolerance = 50 // meters - configurable tolerance
    this.maxAttempts = 3 // maximum location attempts per session
    this.locationHistory = new Map() // track location attempts
  }

  // Get current location with enhanced security and debugging
  // Based on best practices from: https://dev.to/choiruladamm/how-to-use-geolocation-api-using-reactjs-ndk
  async getCurrentLocation(options = {}) {
    const defaultOptions = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0, // Force fresh location
      ...options
    }

    // Check if we're in development mode and should use fallback
    const isDevelopment = process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost'
    
    return new Promise((resolve, reject) => {
      // Check if geolocation is supported (following article's pattern)
      if (!navigator.geolocation) {
        console.error('Geolocation is not supported by this browser.')
        if (isDevelopment) {
          console.warn('Using fallback location for development')
          resolve(this.getFallbackLocation())
          return
        }
        reject(new Error('Geolocation is not supported by this browser'))
        return
      }

      console.log('Requesting location with options:', defaultOptions)
      
      // Use getCurrentPosition as shown in the article
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('Location received:', position)
          
          // Extract coordinates following article's pattern: const { latitude, longitude } = position.coords;
          const { latitude, longitude, accuracy, altitude, heading, speed } = position.coords
          
          const location = {
            latitude,
            longitude,
            accuracy,
            timestamp: Date.now(),
            altitude,
            heading,
            speed
          }
          
          // Validate location quality (enhanced beyond article)
          if (location.accuracy > 100) {
            console.warn('Location accuracy too low:', location.accuracy)
            if (isDevelopment) {
              console.warn('Using fallback location due to low accuracy in development')
              resolve(this.getFallbackLocation())
              return
            }
            reject(new Error('Location accuracy is too low. Please move to an area with better GPS signal.'))
            return
          }
          
          console.log('Location validated successfully:', location)
          resolve(location)
        },
        (error) => {
          console.error('Error getting user location:', error)
          let errorMessage = 'Failed to get location. '
          let detailedMessage = ''
          
          // Enhanced error handling beyond the article's basic approach
          switch(error.code) {
            case error.PERMISSION_DENIED:
              errorMessage += 'Location access denied. Please allow location access in your browser settings.'
              detailedMessage = 'Go to your browser settings and enable location access for this site.'
              break
            case error.POSITION_UNAVAILABLE:
              errorMessage += 'Location information is unavailable. Please check your GPS settings.'
              detailedMessage = 'Make sure your device has GPS enabled and you have a clear view of the sky. Try moving to a different location or restarting your device.'
              break
            case error.TIMEOUT:
              errorMessage += 'Location request timed out. Please try again.'
              detailedMessage = 'The location request took too long. Try again in a few seconds.'
              break
            default:
              errorMessage += 'An unknown error occurred. Please try again.'
              detailedMessage = 'Please check your device settings and try again.'
              break
          }
          
          // In development, provide fallback
          if (isDevelopment) {
            console.warn('Using fallback location due to error in development')
            resolve(this.getFallbackLocation())
            return
          }
          
          reject(new Error(errorMessage + (detailedMessage ? ` ${detailedMessage}` : '')))
        },
        defaultOptions
      )
    })
  }

  // Get fallback location for development/testing
  getFallbackLocation() {
    console.log('Using fallback location for development')
    return {
      latitude: 40.7128, // New York City coordinates
      longitude: -74.0060,
      accuracy: 10,
      timestamp: Date.now(),
      altitude: null,
      heading: null,
      speed: null,
      isFallback: true
    }
  }

  // Check location service status
  checkLocationServiceStatus() {
    const status = {
      geolocationSupported: !!navigator.geolocation,
      permissions: 'unknown',
      lastError: null
    }

    if (navigator.geolocation && navigator.permissions) {
      navigator.permissions.query({ name: 'geolocation' }).then(result => {
        status.permissions = result.state
      }).catch(() => {
        status.permissions = 'unknown'
      })
    }

    return status
  }

  // Validate if student location matches session location
  validateLocation(studentLocation, sessionLocation, sessionId) {
    // Check if location is too old (prevent replay attacks)
    const maxAge = 5 * 60 * 1000 // 5 minutes
    if (Date.now() - studentLocation.timestamp > maxAge) {
      return {
        valid: false,
        reason: 'Location data is too old. Please get a fresh location.',
        distance: null
      }
    }

    // Check accuracy
    if (studentLocation.accuracy > 100) {
      return {
        valid: false,
        reason: 'Location accuracy is too low. Please move to an area with better GPS signal.',
        distance: null
      }
    }

    // Calculate distance
    const distance = this.calculateDistance(
      studentLocation.latitude,
      studentLocation.longitude,
      sessionLocation.latitude,
      sessionLocation.longitude
    )

    // Check if within tolerance
    const withinTolerance = distance <= this.locationTolerance

    // Track location attempts for security
    this.trackLocationAttempt(sessionId, studentLocation, withinTolerance)

    return {
      valid: withinTolerance,
      reason: withinTolerance 
        ? 'Location verified successfully!' 
        : `Location mismatch! You are ${Math.round(distance)}m away from the class location.`,
      distance: Math.round(distance)
    }
  }

  // Calculate distance between two points using Haversine formula
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3 // Earth's radius in meters
    const φ1 = lat1 * Math.PI/180
    const φ2 = lat2 * Math.PI/180
    const Δφ = (lat2-lat1) * Math.PI/180
    const Δλ = (lon2-lon1) * Math.PI/180

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))

    return R * c // Distance in meters
  }

  // Track location attempts for security monitoring
  trackLocationAttempt(sessionId, location, isValid) {
    if (!this.locationHistory.has(sessionId)) {
      this.locationHistory.set(sessionId, [])
    }
    
    const attempts = this.locationHistory.get(sessionId)
    attempts.push({
      location,
      isValid,
      timestamp: Date.now()
    })
    
    // Keep only last 10 attempts
    if (attempts.length > 10) {
      attempts.shift()
    }
  }

  // Check for suspicious location patterns
  checkSuspiciousActivity(sessionId) {
    const attempts = this.locationHistory.get(sessionId) || []
    
    if (attempts.length < 3) return null
    
    // Check for rapid location changes (impossible movement)
    const recentAttempts = attempts.slice(-3)
    for (let i = 1; i < recentAttempts.length; i++) {
      const prev = recentAttempts[i-1].location
      const curr = recentAttempts[i].location
      const distance = this.calculateDistance(
        prev.latitude, prev.longitude,
        curr.latitude, curr.longitude
      )
      const timeDiff = curr.timestamp - prev.timestamp
      
      // If moved more than 1km in less than 30 seconds, it's suspicious
      if (distance > 1000 && timeDiff < 30000) {
        return {
          suspicious: true,
          reason: 'Impossible movement detected. Location data appears to be manipulated.'
        }
      }
    }
    
    return { suspicious: false }
  }

  // Get location tolerance setting
  getLocationTolerance() {
    return this.locationTolerance
  }

  // Set location tolerance (for admin configuration)
  setLocationTolerance(tolerance) {
    this.locationTolerance = Math.max(10, Math.min(500, tolerance)) // Between 10-500 meters
  }

  // Generate location hash for session (prevents location spoofing)
  generateLocationHash(location, sessionId, secret = 'attendance-secret') {
    const data = `${location.latitude},${location.longitude},${sessionId},${secret}`
    // Simple hash function (in production, use crypto.subtle.digest)
    let hash = 0
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16)
  }
}

// Export singleton instance
export const locationService = new LocationService()

