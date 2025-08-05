# Healthcare Management System

A comprehensive healthcare management system with AI-powered insights, wearable device integration, and secure cloud synchronization.

## Features

### Core Features
- **User Management**: Family-based user management with roles (head/member)
- **Medication Management**: Track medications, dosages, and schedules
- **Vital Signs Monitoring**: Record and track health vitals
- **Prescription Management**: Upload and manage prescriptions with OCR
- **Emergency Contacts**: Manage emergency contact information
- **AI Health Assistant**: Chat with AI for health guidance
- **Notifications**: Real-time health alerts and reminders

### New Features

#### 🤖 AI-Powered Report Generation
- **Gemini AI Integration**: Generate comprehensive health reports using Google's Gemini AI
- **Multiple Report Types**:
  - Comprehensive Health Reports
  - Vital Signs Trends Analysis
  - Medication Effectiveness Reports
  - Health Summary Reports
- **PDF Export**: Download reports as professional PDF documents
- **Report Sharing**: Share reports with family members or healthcare providers
- **Historical Reports**: Access and manage previously generated reports

#### ⌚ Wearable Device Integration
- **Fitbit Integration**: Connect Fitbit devices for automatic data sync
- **Apple Health Support**: Sync data from Apple Health app
- **Garmin Support**: Connect Garmin fitness devices
- **Samsung Health**: Integrate with Samsung Health app
- **Data Types Supported**:
  - Steps and Activity
  - Heart Rate Monitoring
  - Sleep Quality Data
  - Weight Tracking
  - Calorie Burn
  - Blood Pressure (where available)
- **Automatic Sync**: Configurable sync frequencies (hourly, daily, weekly)
- **AI Insights**: Get AI-powered insights from wearable data

#### ☁️ Secure Cloud Sync
- **Multi-Provider Support**:
  - Google Drive Integration
  - Dropbox Support
  - OneDrive Integration
- **End-to-End Encryption**: All data encrypted before cloud storage
- **Cross-Device Sync**: Access your health data from any device
- **Selective Sync**: Choose which data types to sync
- **Automatic Backup**: Scheduled automatic backups
- **Conflict Resolution**: Smart conflict resolution for data synchronization
- **Storage Management**: Monitor cloud storage usage

## Technology Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Google Gemini AI** for intelligent insights
- **Cloudinary** for file storage
- **PDFKit** for report generation
- **Axios** for API integrations
- **Crypto** for data encryption

### Frontend
- **Next.js 15** with TypeScript
- **React 18** with modern hooks
- **Tailwind CSS** for styling
- **Radix UI** for accessible components
- **Lucide React** for icons
- **React Hook Form** with Zod validation
- **Recharts** for data visualization

## Installation

### Prerequisites
- Node.js 18+ 
- MongoDB
- npm or pnpm

### Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file with the following variables:
```env
# Database
MONGODB_URI=mongodb://localhost:27017/healthcare

# JWT Tokens
ACCESS_TOKEN_SECRET=your_access_token_secret_here
REFRESH_TOKEN_SECRET=your_refresh_token_secret_here

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Gemini AI
GEMINI_API_KEY=your_gemini_api_key_here

# Fitbit API
FITBIT_CLIENT_ID=your_fitbit_client_id
FITBIT_CLIENT_SECRET=your_fitbit_client_secret
FITBIT_REDIRECT_URI=http://localhost:3000/auth/fitbit/callback

# Google Drive API
GOOGLE_DRIVE_CLIENT_ID=your_google_drive_client_id
GOOGLE_DRIVE_CLIENT_SECRET=your_google_drive_client_secret
GOOGLE_DRIVE_REDIRECT_URI=http://localhost:3000/auth/google-drive/callback

# Server
PORT=8000
CORS_ORIGIN=http://localhost:3000
```

Start the backend:
```bash
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
```

Start the frontend:
```bash
npm run dev
```

## API Endpoints

### Reports
- `POST /api/v1/reports/generate` - Generate AI-powered health report
- `GET /api/v1/reports` - Get user's reports
- `GET /api/v1/reports/:id` - Get specific report
- `POST /api/v1/reports/share` - Share report with another user
- `DELETE /api/v1/reports/:id` - Delete report

### Wearables
- `POST /api/v1/wearables/connect/fitbit` - Connect Fitbit device
- `POST /api/v1/wearables/connect/apple-health` - Connect Apple Health
- `POST /api/v1/wearables/sync/:deviceType` - Sync wearable data
- `GET /api/v1/wearables` - Get connected wearables
- `GET /api/v1/wearables/sync-status` - Get sync status
- `DELETE /api/v1/wearables/:id` - Disconnect wearable

### Cloud Sync
- `POST /api/v1/cloud-sync/initialize` - Initialize cloud sync
- `POST /api/v1/cloud-sync/connect/google-drive` - Connect Google Drive
- `POST /api/v1/cloud-sync/sync-to-cloud` - Sync data to cloud
- `POST /api/v1/cloud-sync/sync-from-cloud` - Sync data from cloud
- `GET /api/v1/cloud-sync/status` - Get sync status
- `PUT /api/v1/cloud-sync/settings` - Update sync settings
- `GET /api/v1/cloud-sync/auth/google-drive` - Get Google Drive auth URL
- `GET /api/v1/cloud-sync/auth/fitbit` - Get Fitbit auth URL

## Usage

### Report Generation
1. Navigate to the Reports section
2. Select report type (Comprehensive, Health Summary, Vital Trends, Medication Analysis)
3. Optionally set a date range
4. Click "Generate AI Report"
5. View, download, or share the generated report

### Wearable Integration
1. Go to the Wearables section
2. Choose your device type (Fitbit, Apple Health, etc.)
3. Follow the OAuth flow to connect your device
4. Configure sync frequency and permissions
5. Monitor sync status and data

### Cloud Sync Setup
1. Visit the Cloud Sync section
2. Choose your cloud provider (Google Drive, Dropbox, OneDrive)
3. Authenticate with your cloud account
4. Select data types to sync
5. Set sync frequency
6. Monitor sync status and storage usage

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Data Encryption**: All sensitive data encrypted at rest and in transit
- **Cloud Encryption**: End-to-end encryption for cloud-stored data
- **Role-Based Access**: Family-based access control
- **Secure API**: Rate limiting and input validation
- **OAuth Integration**: Secure third-party authentication

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the GitHub repository.