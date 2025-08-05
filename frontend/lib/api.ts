import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Handle token refresh or redirect to login
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Types
export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  emergencyContacts?: EmergencyContact[];
}

export interface Vital {
  _id: string;
  user_id: string;
  type: 'blood_pressure' | 'heart_rate' | 'temperature' | 'weight' | 'blood_sugar' | 'oxygen_saturation';
  value: number;
  unit: string;
  recorded_at: string;
  notes?: string;
}

export interface Medication {
  _id: string;
  user_id: string;
  name: string;
  dosage: string;
  frequency: string;
  start_date: string;
  end_date?: string;
  is_active: boolean;
  last_taken?: string;
  next_dose?: string;
  instructions?: string;
  side_effects?: string[];
}

export interface Prescription {
  _id: string;
  user_id: string;
  image_url: string;
  processed: boolean;
  medications?: any[];
  created_at: string;
}

export interface FamilyMember {
  _id: string;
  user_id: string;
  name: string;
  relationship: string;
  date_of_birth?: string;
  phone?: string;
  email?: string;
  emergency_contact: boolean;
}

export interface EmergencyContact {
  _id: string;
  name: string;
  phone: string;
  relationship: string;
  is_primary: boolean;
}

export interface Notification {
  _id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'medication' | 'vital' | 'emergency' | 'general';
  read: boolean;
  created_at: string;
}

export interface Report {
  _id: string;
  user_id: string;
  title: string;
  type: 'health_summary' | 'vital_trends' | 'medication_report' | 'comprehensive';
  content: string;
  ai_generated: boolean;
  data_period: string;
  pdf_url?: string;
  generated_at: string;
  is_public: boolean;
  shared_with: string[];
}

export interface Wearable {
  _id: string;
  user_id: string;
  device_type: 'fitbit' | 'apple_health' | 'garmin' | 'samsung_health' | 'google_fit';
  device_name: string;
  is_active: boolean;
  last_sync?: string;
  sync_frequency: string;
  permissions: string[];
}

export interface CloudSync {
  _id: string;
  user_id: string;
  sync_type: 'google_drive' | 'dropbox' | 'onedrive';
  last_sync?: string;
  sync_status: 'idle' | 'syncing' | 'error';
  data_types: string[];
  cloud_provider: string;
  storage_used: number;
  storage_limit: number;
  sync_frequency: string;
  next_sync?: string;
}

// Auth API
export const authAPI = {
  register: (data: { name: string; email: string; password: string; phone?: string }) =>
    api.post('/users/register', data),
  
  login: (data: { email: string; password: string }) =>
    api.post('/users/login', data),
  
  logout: () => api.post('/users/logout'),
  
  refreshToken: () => api.post('/users/refresh-token'),
  
  changePassword: (data: { oldPassword: string; newPassword: string }) =>
    api.post('/users/change-password', data),
  
  getCurrentUser: () => api.get('/users/current-user'),
  
  updateUserDetails: (data: Partial<User>) =>
    api.patch('/users/update-details', data),
  
  getFamilyMembers: () => api.get('/users/family-members'),
};

// Vitals API
export const vitalsAPI = {
  recordVital: (data: Omit<Vital, '_id' | 'user_id'>) =>
    api.post('/vitals', data),
  
  getVitalHistory: (params?: { type?: string; startDate?: string; endDate?: string }) =>
    api.get('/vitals', { params }),
  
  getVitalStats: () => api.get('/vitals/stats'),
};

// Medications API
export const medicationsAPI = {
  addMedication: (data: Omit<Medication, '_id' | 'user_id'>) =>
    api.post('/medications', data),
  
  getMedications: (params?: { is_active?: boolean }) =>
    api.get('/medications', { params }),
  
  updateMedication: (id: string, data: Partial<Medication>) =>
    api.patch(`/medications/${id}`, data),
  
  deleteMedication: (id: string) => api.delete(`/medications/${id}`),
  
  recordMedicationTaken: (id: string) =>
    api.post(`/medications/${id}/taken`),
};

// Prescriptions API
export const prescriptionsAPI = {
  uploadPrescription: (file: File) => {
    const formData = new FormData();
    formData.append('prescription', file);
    return api.post('/prescriptions', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  
  processPrescription: (id: string) =>
    api.post(`/prescriptions/${id}/process`),
  
  createMedicationsFromPrescription: (id: string) =>
    api.post(`/prescriptions/${id}/create-medications`),
};

// Family API
export const familyAPI = {
  createFamily: (data: { name: string; description?: string }) =>
    api.post('/families', data),
  
  getFamilyDetails: () => api.get('/families'),
  
  addFamilyMember: (data: Omit<FamilyMember, '_id' | 'user_id'>) =>
    api.post('/families/members', data),
  
  updateEmergencyContacts: (data: { emergency_contacts: EmergencyContact[] }) =>
    api.put('/families/emergency-contacts', data),
};

// Emergency API
export const emergencyAPI = {
  getEmergencyInfo: () => api.get('/emergency'),
  
  shareEmergencyInfo: (contactId: string) =>
    api.post(`/emergency/share/${contactId}`),
};

// Notifications API
export const notificationsAPI = {
  getNotifications: (params?: { read?: boolean; type?: string }) =>
    api.get('/notifications', { params }),
  
  markAsRead: (id: string) => api.patch(`/notifications/${id}/read`),
  
  markAllAsRead: () => api.patch('/notifications/read-all'),
};

// AI Agent API
export const aiAgentAPI = {
  getAlerts: (params?: { acknowledged?: boolean }) =>
    api.get('/ai/alerts', { params }),
  
  acknowledgeAlert: (id: string) =>
    api.patch(`/ai/alerts/${id}/acknowledge`),
  
  getHealthSummary: () => api.get('/ai/health-summary'),
};

// Agent Management API
export const agentAPI = {
  runAgentsNow: () => api.post('/agent/run-now'),
};

// Reports API
export const reportsAPI = {
  generateReport: (data: {
    type: Report['type'];
    data_period: string;
    title?: string;
  }) => api.post('/reports/generate', data),
  
  getReports: (params?: { type?: string; is_public?: boolean }) =>
    api.get('/reports', { params }),
  
  getReportById: (reportId: string) => api.get(`/reports/${reportId}`),
  
  shareReport: (data: { reportId: string; email: string; permissions: string[] }) =>
    api.post('/reports/share', data),
  
  deleteReport: (reportId: string) => api.delete(`/reports/${reportId}`),
};

// Wearables API
export const wearablesAPI = {
  connectFitbit: (data: { authCode: string }) =>
    api.post('/wearables/connect/fitbit', data),
  
  connectAppleHealth: (data: { healthData: any }) =>
    api.post('/wearables/connect/apple-health', data),
  
  syncWearableData: (deviceType: string) =>
    api.post(`/wearables/sync/${deviceType}`),
  
  getUserWearables: () => api.get('/wearables'),
  
  getSyncStatus: () => api.get('/wearables/sync-status'),
  
  disconnectWearable: (wearableId: string) =>
    api.delete(`/wearables/${wearableId}`),
  
  processWearableData: (data: { wearableData: any }) =>
    api.post('/wearables/process-data', data),
};

// Cloud Sync API
export const cloudSyncAPI = {
  initializeCloudSync: (data: {
    sync_type: CloudSync['sync_type'];
    data_types: string[];
    sync_frequency: string;
  }) => api.post('/cloud-sync/initialize', data),
  
  connectGoogleDrive: (data: { authCode: string }) =>
    api.post('/cloud-sync/connect/google-drive', data),
  
  syncToCloud: () => api.post('/cloud-sync/sync-to-cloud'),
  
  syncFromCloud: () => api.post('/cloud-sync/sync-from-cloud'),
  
  getSyncStatus: () => api.get('/cloud-sync/status'),
  
  updateSyncSettings: (data: {
    sync_frequency?: string;
    data_types?: string[];
  }) => api.put('/cloud-sync/settings', data),
  
  getGoogleDriveAuthUrl: () => api.get('/cloud-sync/auth/google-drive'),
  
  getFitbitAuthUrl: () => api.get('/cloud-sync/auth/fitbit'),
};

// OCR API
export const ocrAPI = {
  processOCR: (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post('/ocr/ocr', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export default api; 