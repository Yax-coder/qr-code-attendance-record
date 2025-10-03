import { createContext, useContext, useState, useEffect } from 'react'
import { api } from '../services/api'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Check for existing session on app load
  useEffect(() => {
    const checkSavedUser = () => {
      try {
        const savedUser = localStorage.getItem('attendance_user')
        if (savedUser) {
          const userData = JSON.parse(savedUser)
          // Validate user data structure
          if (userData && userData.id && userData.email && userData.role) {
            setUser(userData)
          } else {
            // Invalid user data, remove it
            localStorage.removeItem('attendance_user')
          }
        }
      } catch (error) {
        console.error('Error parsing saved user:', error)
        localStorage.removeItem('attendance_user')
      } finally {
        setLoading(false)
      }
    }

    // Add small delay for mobile compatibility
    const timer = setTimeout(checkSavedUser, 100)
    return () => clearTimeout(timer)
  }, [])

  const login = async (email, password, role) => {
    try {
      // Use local JSON server for user authentication
      const users = await api.getUsers()
      
      // Find user by email and password
      const foundUser = users.find(u => u.email === email && u.password === password && u.role === role)
      
      if (!foundUser) {
        throw new Error('Invalid email, password, or role')
      }

      // Create user object with role
      const userData = {
        id: foundUser.id,
        name: foundUser.name,
        email: foundUser.email,
        username: foundUser.username,
        role: foundUser.role,
        loginTime: new Date().toISOString()
      }

      // Save to localStorage with error handling for mobile
      try {
        localStorage.setItem('attendance_user', JSON.stringify(userData))
      } catch (storageError) {
        console.warn('Could not save user to localStorage:', storageError)
        // Continue without saving - user can still use the app
      }

      setUser(userData)
      return { success: true, user: userData }
    } catch (error) {
      console.error('Login error:', error)
      
      // More specific error messages for mobile
      let errorMessage = error.message
      if (error.message.includes('Failed to fetch')) {
        errorMessage = 'Unable to connect to server. Please check your internet connection.'
      } else if (error.message.includes('NetworkError')) {
        errorMessage = 'Network error. Please try again.'
      }
      
      return { success: false, error: errorMessage }
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('attendance_user')
  }

  const value = {
    user,
    login,
    logout,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
