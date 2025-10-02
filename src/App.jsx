import { useAuth } from './contexts/AuthContext'
import Login from './components/Login'
import LecturerView from './components/LecturerView'
import StudentView from './components/StudentView'
import UserProfile from './components/UserProfile'
import './App.css'

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="app">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      {!user ? (
        <Login />
      ) : (
        <>
          <header className="app-header">
            <div className="header-content">
              <div className="header-text">
                <h1>📚 Student Attendance System</h1>
                <p>QR Code & Location-Based Attendance Tracking</p>
              </div>
              <UserProfile />
            </div>
          </header>

          <main className="app-main">
            <div className="role-view">
              {user.role === 'lecturer' ? (
                <LecturerView />
              ) : (
                <StudentView />
              )}
            </div>
          </main>

          <footer className="app-footer">
            <p>Demo Application - Built with React & Vite</p>
          </footer>
        </>
      )}
    </div>
  )
}

export default App
