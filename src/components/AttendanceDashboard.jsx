import { useState, useEffect } from 'react'
import { api } from '../services/api'
import './AttendanceDashboard.css'

function AttendanceDashboard() {
  const [attendanceRecords, setAttendanceRecords] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchAttendanceRecords()
  }, [])

  const fetchAttendanceRecords = async () => {
    try {
      setIsLoading(true)
      const records = await api.getAttendance()
      setAttendanceRecords(records)
      setError('')
    } catch (err) {
      setError('Failed to fetch attendance records')
      console.error('Error fetching attendance:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString()
  }

  if (isLoading) {
    return (
      <div className="attendance-dashboard">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading attendance records...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="attendance-dashboard">
      <div className="dashboard-header">
        <h3>📊 Attendance Records</h3>
        <button onClick={fetchAttendanceRecords} className="refresh-btn">
          🔄 Refresh
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {attendanceRecords.length === 0 ? (
        <div className="empty-state">
          <p>No attendance records found.</p>
          <p>Students need to scan QR codes and submit attendance first.</p>
        </div>
      ) : (
        <div className="records-container">
          <div className="records-summary">
            <p><strong>Total Records:</strong> {attendanceRecords.length}</p>
            <p><strong>Unique Students:</strong> {new Set(attendanceRecords.map(r => r.studentId)).size}</p>
          </div>

          <div className="records-list">
            {attendanceRecords.map((record, index) => (
              <div key={record.id || index} className="record-card">
                <div className="record-header">
                  <h4>{record.studentName} ({record.studentId})</h4>
                  <span className="status-badge present">Present</span>
                </div>
                <div className="record-details">
                  <p><strong>Course:</strong> {record.course}</p>
                  <p><strong>Session Time:</strong> {formatDate(record.sessionTime)}</p>
                  <p><strong>Attendance Time:</strong> {formatDate(record.timestamp)}</p>
                  <p><strong>Location:</strong> {record.location.latitude.toFixed(6)}, {record.location.longitude.toFixed(6)}</p>
                  <p><strong>Record ID:</strong> {record.id}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default AttendanceDashboard

