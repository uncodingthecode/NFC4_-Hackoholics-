const API_BASE_URL = 'http://localhost:8000/api/v1'

interface ApiResponse<T = any> {
  data?: T
  error?: string
  success: boolean
}

class ApiClient {
  private baseURL: string

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`
    
    // Add default headers
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string> || {}),
    }

    // Add authorization header if token exists
    const token = localStorage.getItem('accessToken')
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    // Don't set Content-Type for FormData, let browser set it with boundary
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json'
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error: data.error || `HTTP ${response.status}: ${response.statusText}`,
        }
      }

      return {
        success: true,
        data,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      }
    }
  }

  // Authentication methods
  async login(email: string, password: string) {
    return this.request('/users/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  }

  async register(userData: {
    name: string
    email: string
    password: string
    role: string
    familyId?: string
    relation?: string
  }) {
    return this.request('/users/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  }

  async logout() {
    return this.request('/users/logout', {
      method: 'POST',
    })
  }

  async getCurrentUser() {
    return this.request('/users/current-user')
  }

  // Refresh token method
  async refreshToken() {
    const refreshToken = localStorage.getItem('refreshToken')
    if (!refreshToken) {
      return { success: false, error: 'No refresh token available' }
    }

    return this.request('/users/refresh-token', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    })
  }

  // Generic GET request
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  // Generic POST request
  async post<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // Generic PUT request
  async put<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  // Generic DELETE request
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }

  // Profile methods
  async getProfile() {
    return this.request('/profile')
  }

  async updateProfile(profileData: {
    DOB?: string
    height?: number
    weight?: number
    gender?: 'Male' | 'Female' | 'Other'
    blood_group?: string
    family_doctor_email?: string[]
    allergies?: string[]
    existing_conditions?: string[]
  }) {
    return this.request('/profile', {
      method: 'POST',
      body: JSON.stringify(profileData),
    })
  }

  async addFamilyDoctor(email: string) {
    return this.request('/profile/family-doctor', {
      method: 'POST',
      body: JSON.stringify({ email }),
    })
  }

  // Family methods
  async getFamily() {
    return this.request('/families')
  }

  async updateEmergencyContacts(contacts: Array<{
    name: string
    relation: string
    phone: string
  }>) {
    return this.request('/families/emergency-contacts', {
      method: 'PUT',
      body: JSON.stringify({ contacts }),
    })
  }

  // Medication methods
  async getMedications() {
    return this.request('/medications')
  }

  // Vital methods
  async getVitals() {
    return this.request('/vitals')
  }

  // Notification methods
  async getNotifications() {
    return this.request('/notifications')
  }

  // Prescription methods
  async uploadPrescription(formData: FormData) {
    return this.request('/prescriptions', {
      method: 'POST',
      body: formData,
      headers: {
        // Don't set Content-Type for FormData, let browser set it with boundary
      },
    })
  }

  async getPrescriptions() {
    return this.request('/prescriptions')
  }

  async processPrescriptionWithGemini(prescriptionId: string) {
    return this.request(`/prescriptions/${prescriptionId}/process-gemini`, {
      method: 'POST',
    })
  }

  // Chat methods
  async sendChatMessage(message: string) {
    return this.request('/chat', {
      method: 'POST',
      body: JSON.stringify({ message }),
    })
  }

  async generateHealthReportSummary(data: {
    vitals: any[]
    medications: any[]
    profile: any
    healthScoreData: any[]
  }) {
    return this.request('/emergency/generate-summary', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }
}

// Create and export the API client instance
export const apiClient = new ApiClient(API_BASE_URL)

// Helper function to handle token refresh
export const handleTokenRefresh = async () => {
  const response = await apiClient.refreshToken()
  
  if (response.success && response.data) {
    const data = response.data as { accessToken: string; refreshToken: string }
    localStorage.setItem('accessToken', data.accessToken)
    localStorage.setItem('refreshToken', data.refreshToken)
    return true
  }
  
  // If refresh fails, clear all tokens and redirect to login
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('user')
  window.location.href = '/login'
  return false
}

// Helper function to get auth headers
export const getAuthHeaders = () => {
  const token = localStorage.getItem('accessToken')
  return token ? { Authorization: `Bearer ${token}` } : {}
} 