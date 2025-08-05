# Complete API Routes Summary

## Backend Routes Structure

### Base URL: `http://localhost:8000/api/v1`

## 1. Authentication Routes (`/users`)
**File:** `backend/src/routes/user.route.js`

| Method | Endpoint | Description | Frontend API Call |
|--------|----------|-------------|-------------------|
| POST | `/users/register` | Register new user | `authAPI.register(data)` |
| POST | `/users/login` | Login user | `authAPI.login(data)` |
| POST | `/users/logout` | Logout user | `authAPI.logout()` |
| POST | `/users/refresh-token` | Refresh access token | `authAPI.refreshToken()` |
| POST | `/users/change-password` | Change password | `authAPI.changePassword(data)` |
| GET | `/users/current-user` | Get current user | `authAPI.getCurrentUser()` |
| PATCH | `/users/update-details` | Update user details | `authAPI.updateUserDetails(data)` |
| GET | `/users/family-members` | Get family members | `authAPI.getFamilyMembers()` |

## 2. Vitals Routes (`/vitals`)
**File:** `backend/src/routes/vital.route.js`

| Method | Endpoint | Description | Frontend API Call |
|--------|----------|-------------|-------------------|
| POST | `/vitals` | Record vital sign | `vitalsAPI.recordVital(data)` |
| GET | `/vitals` | Get vital history | `vitalsAPI.getVitalHistory(params)` |
| GET | `/vitals/stats` | Get vital statistics | `vitalsAPI.getVitalStats()` |

## 3. Medications Routes (`/medications`)
**File:** `backend/src/routes/medication.route.js`

| Method | Endpoint | Description | Frontend API Call |
|--------|----------|-------------|-------------------|
| POST | `/medications` | Add medication | `medicationsAPI.addMedication(data)` |
| GET | `/medications` | Get medications | `medicationsAPI.getMedications(params)` |
| PATCH | `/medications/:id` | Update medication | `medicationsAPI.updateMedication(id, data)` |
| DELETE | `/medications/:id` | Delete medication | `medicationsAPI.deleteMedication(id)` |
| POST | `/medications/:id/taken` | Record medication taken | `medicationsAPI.recordMedicationTaken(id)` |

## 4. Prescriptions Routes (`/prescriptions`)
**File:** `backend/src/routes/prescription.route.js`

| Method | Endpoint | Description | Frontend API Call |
|--------|----------|-------------|-------------------|
| POST | `/prescriptions` | Upload prescription | `prescriptionsAPI.uploadPrescription(file)` |
| POST | `/prescriptions/:id/process` | Process prescription | `prescriptionsAPI.processPrescription(id)` |
| POST | `/prescriptions/:id/create-medications` | Create medications from prescription | `prescriptionsAPI.createMedicationsFromPrescription(id)` |

## 5. Family Routes (`/families`)
**File:** `backend/src/routes/family.route.js`

| Method | Endpoint | Description | Frontend API Call |
|--------|----------|-------------|-------------------|
| POST | `/families` | Create family | `familyAPI.createFamily(data)` |
| GET | `/families` | Get family details | `familyAPI.getFamilyDetails()` |
| POST | `/families/members` | Add family member | `familyAPI.addFamilyMember(data)` |
| PUT | `/families/emergency-contacts` | Update emergency contacts | `familyAPI.updateEmergencyContacts(data)` |

## 6. Emergency Routes (`/emergency`)
**File:** `backend/src/routes/emergency.route.js`

| Method | Endpoint | Description | Frontend API Call |
|--------|----------|-------------|-------------------|
| GET | `/emergency` | Get emergency info | `emergencyAPI.getEmergencyInfo()` |
| POST | `/emergency/share/:contactId` | Share emergency info | `emergencyAPI.shareEmergencyInfo(contactId)` |

## 7. Notifications Routes (`/notifications`)
**File:** `backend/src/routes/notification.route.js`

| Method | Endpoint | Description | Frontend API Call |
|--------|----------|-------------|-------------------|
| GET | `/notifications` | Get notifications | `notificationsAPI.getNotifications(params)` |
| PATCH | `/notifications/:id/read` | Mark as read | `notificationsAPI.markAsRead(id)` |
| PATCH | `/notifications/read-all` | Mark all as read | `notificationsAPI.markAllAsRead()` |

## 8. AI Agent Routes (`/ai`)
**File:** `backend/src/routes/aiAgent.route.js`

| Method | Endpoint | Description | Frontend API Call |
|--------|----------|-------------|-------------------|
| GET | `/ai/alerts` | Get AI alerts | `aiAgentAPI.getAlerts(params)` |
| PATCH | `/ai/alerts/:id/acknowledge` | Acknowledge alert | `aiAgentAPI.acknowledgeAlert(id)` |
| GET | `/ai/health-summary` | Get health summary | `aiAgentAPI.getHealthSummary()` |

## 9. Agent Management Routes (`/agent`)
**File:** `backend/src/routes/agent.routes.js`

| Method | Endpoint | Description | Frontend API Call |
|--------|----------|-------------|-------------------|
| POST | `/agent/run-now` | Run agents manually | `agentAPI.runAgentsNow()` |

## 10. Reports Routes (`/reports`)
**File:** `backend/src/routes/report.routes.js`

| Method | Endpoint | Description | Frontend API Call |
|--------|----------|-------------|-------------------|
| POST | `/reports/generate` | Generate report | `reportsAPI.generateReport(data)` |
| GET | `/reports` | Get reports | `reportsAPI.getReports(params)` |
| GET | `/reports/:reportId` | Get report by ID | `reportsAPI.getReportById(reportId)` |
| POST | `/reports/share` | Share report | `reportsAPI.shareReport(data)` |
| DELETE | `/reports/:reportId` | Delete report | `reportsAPI.deleteReport(reportId)` |

## 11. Wearables Routes (`/wearables`)
**File:** `backend/src/routes/wearable.routes.js`

| Method | Endpoint | Description | Frontend API Call |
|--------|----------|-------------|-------------------|
| POST | `/wearables/connect/fitbit` | Connect Fitbit | `wearablesAPI.connectFitbit(data)` |
| POST | `/wearables/connect/apple-health` | Connect Apple Health | `wearablesAPI.connectAppleHealth(data)` |
| POST | `/wearables/sync/:deviceType` | Sync wearable data | `wearablesAPI.syncWearableData(deviceType)` |
| GET | `/wearables` | Get user wearables | `wearablesAPI.getUserWearables()` |
| GET | `/wearables/sync-status` | Get sync status | `wearablesAPI.getSyncStatus()` |
| DELETE | `/wearables/:wearableId` | Disconnect wearable | `wearablesAPI.disconnectWearable(wearableId)` |
| POST | `/wearables/process-data` | Process wearable data | `wearablesAPI.processWearableData(data)` |

## 12. Cloud Sync Routes (`/cloud-sync`)
**File:** `backend/src/routes/cloudSync.routes.js`

| Method | Endpoint | Description | Frontend API Call |
|--------|----------|-------------|-------------------|
| POST | `/cloud-sync/initialize` | Initialize cloud sync | `cloudSyncAPI.initializeCloudSync(data)` |
| POST | `/cloud-sync/connect/google-drive` | Connect Google Drive | `cloudSyncAPI.connectGoogleDrive(data)` |
| POST | `/cloud-sync/sync-to-cloud` | Sync to cloud | `cloudSyncAPI.syncToCloud()` |
| POST | `/cloud-sync/sync-from-cloud` | Sync from cloud | `cloudSyncAPI.syncFromCloud()` |
| GET | `/cloud-sync/status` | Get sync status | `cloudSyncAPI.getSyncStatus()` |
| PUT | `/cloud-sync/settings` | Update sync settings | `cloudSyncAPI.updateSyncSettings(data)` |
| GET | `/cloud-sync/auth/google-drive` | Get Google Drive auth URL | `cloudSyncAPI.getGoogleDriveAuthUrl()` |
| GET | `/cloud-sync/auth/fitbit` | Get Fitbit auth URL | `cloudSyncAPI.getFitbitAuthUrl()` |

## 13. OCR Routes (`/ocr`)
**File:** `backend/src/routes/ocr.route.js`

| Method | Endpoint | Description | Frontend API Call |
|--------|----------|-------------|-------------------|
| POST | `/ocr/ocr` | Process OCR | `ocrAPI.processOCR(file)` |

## Frontend API Service Structure

The frontend uses a centralized API service located at `frontend/lib/api.ts` that provides:

### Features:
- **Axios Instance**: Configured with base URL and interceptors
- **Authentication**: Automatic token handling and refresh
- **Error Handling**: Centralized error handling and 401 redirects
- **TypeScript Types**: Complete type definitions for all data structures
- **Modular Organization**: Separate API modules for each feature

### API Modules:
1. `authAPI` - Authentication and user management
2. `vitalsAPI` - Vital signs management
3. `medicationsAPI` - Medication management
4. `prescriptionsAPI` - Prescription upload and processing
5. `familyAPI` - Family and emergency contact management
6. `emergencyAPI` - Emergency information
7. `notificationsAPI` - Notification management
8. `aiAgentAPI` - AI agent interactions
9. `agentAPI` - Agent management
10. `reportsAPI` - Report generation and management
11. `wearablesAPI` - Wearable device integration
12. `cloudSyncAPI` - Cloud synchronization
13. `ocrAPI` - OCR processing

### Usage Example:
```typescript
import { vitalsAPI, medicationsAPI } from '@/lib/api';

// Record a vital sign
const vital = await vitalsAPI.recordVital({
  type: 'blood_pressure',
  value: 120,
  unit: 'mmHg',
  recorded_at: new Date().toISOString(),
  notes: 'Morning reading'
});

// Get medications
const medications = await medicationsAPI.getMedications({ is_active: true });
```

## Authentication Flow

1. **Login**: `authAPI.login()` returns access token
2. **Token Storage**: Token stored in localStorage as 'accessToken'
3. **Automatic Headers**: All API calls automatically include Authorization header
4. **Token Refresh**: 401 responses trigger automatic token refresh
5. **Logout**: `authAPI.logout()` clears token and redirects to login

## Error Handling

- **401 Unauthorized**: Automatic redirect to login page
- **Network Errors**: Toast notifications for user feedback
- **Validation Errors**: Form-level error handling
- **API Errors**: Structured error responses with messages

## Environment Configuration

### Backend (.env):
```env
MONGO_URI=mongodb://localhost:27017
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUNDNAME=your_cloudinary_name
CLOUDINARY_APIKEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
GEMINI_API_KEY=your_gemini_key
FITBIT_CLIENT_ID=your_fitbit_client_id
FITBIT_CLIENT_SECRET=your_fitbit_client_secret
PORT=8000
```

### Frontend (.env.local):
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

This comprehensive API structure provides a complete healthcare management system with authentication, data management, AI integration, wearable device support, and cloud synchronization capabilities. 