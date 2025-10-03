import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import './Login.css'

function Login() {
  const { login } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'student'
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    setError('') // Clear error when user types
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    if (!formData.email || !formData.password) {
      setError('Please fill in all fields')
      setIsLoading(false)
      return
    }

    try {
      const result = await login(formData.email, formData.password, formData.role)
      
      if (result.success) {
        // Login successful, user state will be updated by context
        console.log('Login successful:', result.user)
      } else {
        setError(result.error || 'Login failed. Please try again.')
      }
    } catch (error) {
      console.error('Login submission error:', error)
      setError('An unexpected error occurred. Please try again.')
    }
    
    setIsLoading(false)
  }

  const demoUsers = [
    { email: 'john.doe@example.com', password: 'password123', role: 'lecturer', name: 'John Doe (Lecturer)' },
    { email: 'jane.smith@example.com', password: 'password123', role: 'student', name: 'Jane Smith (Student)' },
    { email: 'mike.wilson@example.com', password: 'password123', role: 'student', name: 'Mike Wilson (Student)' },
    { email: 'sarah.johnson@example.com', password: 'password123', role: 'lecturer', name: 'Sarah Johnson (Lecturer)' },
    { email: 'david.brown@example.com', password: 'password123', role: 'student', name: 'David Brown (Student)' },
    { email: 'emily.davis@example.com', password: 'password123', role: 'lecturer', name: 'Emily Davis (Lecturer)' }
  ]

  const fillDemoUser = (user) => {
    setFormData({
      email: user.email,
      password: user.password,
      role: user.role
    })
    setError('')
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>🔐 Login to Attendance System</h1>
          <p>Sign in to access your dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="role">Role:</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              disabled={isLoading}
            >
              <option value="student">👨‍🎓 Student</option>
              <option value="lecturer">👨‍🏫 Lecturer</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter your email"
              disabled={isLoading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Enter your password"
              disabled={isLoading}
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button
            type="submit"
            className="login-btn"
            disabled={isLoading}
          >
            {isLoading ? 'Signing In...' : '🔑 Sign In'}
          </button>
        </form>

        {/* <div className="demo-section">
          <h3>🎭 Demo Users</h3>
          <p>Click on any demo user to auto-fill the form:</p>
          <div className="demo-users">
            {demoUsers.map((user, index) => (
              <button
                key={index}
                className="demo-user-btn"
                onClick={() => fillDemoUser(user)}
                disabled={isLoading}
              >
                {user.name}
              </button>
            ))}
          </div>
          <div className="demo-info">
            <p><strong>Note:</strong> This demo uses a local JSON server for authentication and data storage.</p>
            <p>All demo users use the same password: <code>password123</code></p>
            <p>Make sure the JSON server is running on port 3001.</p>
            <p><strong>🔒 Security:</strong> Real location verification is required to prevent cheating and ensure physical presence.</p>
          </div>
        </div> */}
      </div>
    </div>
  )
}

export default Login
