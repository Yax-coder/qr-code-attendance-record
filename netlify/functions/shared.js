// Shared data store for Netlify Functions
// In production, you'd want to use a real database like Supabase, PlanetScale, or MongoDB

let data = {
  users: [
    {
      id: 1,
      name: "John Doe",
      email: "john.doe@example.com",
      role: "lecturer",
      password: "password123",
      username: "johndoe"
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane.smith@example.com",
      role: "student",
      password: "password123",
      username: "janesmith"
    },
    {
      id: 3,
      name: "Mike Wilson",
      email: "mike.wilson@example.com",
      role: "student",
      password: "password123",
      username: "mikewilson"
    },
    {
      id: 4,
      name: "Sarah Johnson",
      email: "sarah.johnson@example.com",
      role: "lecturer",
      password: "password123",
      username: "sarahjohnson"
    },
    {
      id: 5,
      name: "David Brown",
      email: "david.brown@example.com",
      role: "student",
      password: "password123",
      username: "davidbrown"
    },
    {
      id: 6,
      name: "Emily Davis",
      email: "emily.davis@example.com",
      role: "lecturer",
      password: "password123",
      username: "emilydavis"
    }
  ],
  attendance: [],
  sessions: []
}

// Helper functions
export const getData = () => data
export const setData = (newData) => { data = newData }

// Generate next ID
export const getNextId = (collection) => {
  const items = data[collection]
  return items.length > 0 ? Math.max(...items.map(item => item.id)) + 1 : 1
}

// CORS headers
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
}
