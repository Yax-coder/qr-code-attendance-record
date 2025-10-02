import { useAuth } from '../contexts/AuthContext'
import './UserProfile.css'

function UserProfile() {
  const { user, logout } = useAuth()

  if (!user) return null

  const handleLogout = () => {
    logout()
  }

  const formatLoginTime = (loginTime) => {
    return new Date(loginTime).toLocaleString()
  }

  return (
    <div className="user-profile">
      <div className="user-info">
        <div className="user-avatar">
          {user.role === 'lecturer' ? '👨‍🏫' : '👨‍🎓'}
        </div>
        <div className="user-details">
          <h3>{user.name}</h3>
          <p className="user-role">
            {user.role === 'lecturer' ? 'Lecturer' : 'Student'}
          </p>
          <p className="user-email">{user.email}</p>
          <p className="login-time">
            Logged in: {formatLoginTime(user.loginTime)}
          </p>
        </div>
      </div>
      <button onClick={handleLogout} className="logout-btn">
        🚪 Logout
      </button>
    </div>
  )
}

export default UserProfile

