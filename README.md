# QR Code Attendance Record System

A modern, secure attendance tracking system using QR codes and GPS location verification.

## 🚀 Features

- **QR Code Generation** - Lecturers create session QR codes with location data
- **Automatic Attendance Recording** - Students scan QR codes for instant attendance
- **GPS Location Verification** - Prevents cheating with location-based validation
- **Real-time Dashboard** - Track attendance in real-time
- **Security Features** - Anti-cheating measures and suspicious activity detection
- **Responsive Design** - Works on desktop and mobile devices

## 🛠️ Tech Stack

- **Frontend:** React 19, Vite
- **Backend:** Netlify Functions (Serverless)
- **QR Code:** react-qr-code, react-qr-reader
- **Location:** Browser Geolocation API
- **Deployment:** Netlify

## 📱 How It Works

### For Lecturers:
1. Login to lecturer dashboard
2. Enter course details and get current location
3. Generate QR code for the session
4. Display QR code for students to scan

### For Students:
1. Enter student ID
2. Scan the QR code with camera
3. System automatically validates location and records attendance
4. Get instant success/failure feedback

## 🚀 Quick Start

### Local Development

```bash
# Install dependencies
npm install

# Start development server (frontend only)
npm run dev

# Start with backend (JSON server)
npm run dev:full
```

### Production Deployment

The app is configured for easy deployment to Netlify:

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Deploy to Netlify:**
   - Connect GitHub repository to Netlify
   - Or drag & drop the `dist` folder to Netlify dashboard

## 🌐 Live Demo

Visit: [Your Netlify URL]

## 📁 Project Structure

```
src/
├── components/
│   ├── LecturerView.jsx      # Lecturer dashboard
│   ├── StudentView.jsx       # Student scanning interface
│   ├── Login.jsx            # Authentication
│   ├── AttendanceDashboard.jsx
│   └── LocationTroubleshooting.jsx
├── services/
│   ├── api.js              # API service
│   └── locationService.js  # Location validation
├── contexts/
│   └── AuthContext.jsx     # Authentication context
└── App.jsx                 # Main app component

netlify/
└── functions/              # Serverless API functions
    ├── users.js
    ├── attendance.js
    └── sessions.js
```

## 🔒 Security Features

- **Location Validation** - Students must be within specified distance
- **Session Expiration** - QR codes expire after 2 hours
- **Suspicious Activity Detection** - Monitors for impossible location changes
- **Location Accuracy Requirements** - Requires GPS accuracy within 100m
- **Anti-Replay Protection** - Prevents reuse of old location data

## 🎯 Use Cases

- **University Classes** - Track student attendance
- **Corporate Training** - Monitor employee participation
- **Workshops & Seminars** - Verify physical presence
- **Events** - Check-in attendees

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Built with React and modern web technologies
- Deployed on Netlify for global accessibility
- Uses browser Geolocation API for location services