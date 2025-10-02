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
        body: JSON.stringify(data.sessions)
      }
    }

    if (event.httpMethod === 'POST') {
      const sessionData = JSON.parse(event.body)
      
      // Add ID and timestamp
      const newSession = {
        id: getNextId('sessions'),
        ...sessionData,
        createdAt: new Date().toISOString()
      }

      // Update data
      const updatedData = {
        ...data,
        sessions: [...data.sessions, newSession]
      }
      setData(updatedData)

      return {
        statusCode: 201,
        headers: corsHeaders,
        body: JSON.stringify(newSession)
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
