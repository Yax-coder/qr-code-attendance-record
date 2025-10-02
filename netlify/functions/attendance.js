import { getData, setData, getNextId, corsHeaders } from './shared.js'

export const handler = async (event, context) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: ''
    }
  }

  try {
    const data = getData()
    
    if (event.httpMethod === 'GET') {
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify(data.attendance)
      }
    }

    if (event.httpMethod === 'POST') {
      const attendanceData = JSON.parse(event.body)
      
      // Add ID and timestamp
      const newAttendance = {
        id: getNextId('attendance'),
        ...attendanceData,
        timestamp: new Date().toISOString()
      }

      // Update data
      const updatedData = {
        ...data,
        attendance: [...data.attendance, newAttendance]
      }
      setData(updatedData)

      return {
        statusCode: 201,
        headers: corsHeaders,
        body: JSON.stringify(newAttendance)
      }
    }

    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Method not allowed' })
    }
  } catch (error) {
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Internal server error' })
    }
  }
}
