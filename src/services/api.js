// API service for both local development and production
const API_BASE_URL = import.meta.env.DEV 
  ? 'http://localhost:3001'  // Local development with JSON server
  : '/api'                   // Production with Netlify Functions

export const api = {
  // User authentication
  async getUsers() {
    const response = await fetch(`${API_BASE_URL}/users`)
    if (!response.ok) {
      throw new Error('Failed to fetch users')
    }
    return response.json()
  },

  // Attendance recording
  async recordAttendance(attendanceData) {
    const response = await fetch(`${API_BASE_URL}/attendance`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(attendanceData)
    })
    
    if (!response.ok) {
      throw new Error('Failed to record attendance')
    }
    
    return response.json()
  },

  // Submit attendance (alias for recordAttendance)
  async submitAttendance(attendanceData) {
    return this.recordAttendance(attendanceData)
  },

  // Get attendance records
  async getAttendance() {
    const response = await fetch(`${API_BASE_URL}/attendance`)
    if (!response.ok) {
      throw new Error('Failed to fetch attendance records')
    }
    return response.json()
  },

  // Session management
  async createSession(sessionData) {
    const response = await fetch(`${API_BASE_URL}/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sessionData)
    })
    
    if (!response.ok) {
      throw new Error('Failed to create session')
    }
    
    return response.json()
  },

  async getSessions() {
    const response = await fetch(`${API_BASE_URL}/sessions`)
    if (!response.ok) {
      throw new Error('Failed to fetch sessions')
    }
    return response.json()
  }
}
