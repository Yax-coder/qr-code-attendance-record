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
    const savedUser = localStorage.getItem('attendance_user')
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch (error) {
        console.error('Error parsing saved user:', error)
        localStorage.removeItem('attendance_user')
      }
    }
    setLoading(false)
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

      setUser(userData)
      localStorage.setItem('attendance_user', JSON.stringify(userData))
      return { success: true, user: userData }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: error.message }
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
