const API_BASE_URL = 'http://localhost:8000/api/v1';

interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  success: boolean;
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    const token = localStorage.getItem('accessToken');
    if (token) headers.Authorization = `Bearer ${token}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  async login(email: string, password: string) {
    return this.request('/users/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(userData: {
    name: string;
    email: string;
    password: string;
    role: string;
    familyId?: string;
    relation?: string;
  }) {
    return this.request('/users/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async logout() {
    return this.request('/users/logout', { method: 'POST' });
  }

  async getCurrentUser() {
    return this.request('/users/current-user');
  }

  async refreshToken() {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) return { success: false, error: 'No refresh token available' };

    return this.request('/users/refresh-token', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

export const handleTokenRefresh = async () => {
  const response = await apiClient.refreshToken();

  if (response.success && response.data) {
    const { accessToken, refreshToken } = response.data as {
      accessToken: string;
      refreshToken: string;
    };
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    return true;
  }

  localStorage.clear();
  window.location.href = '/login';
  return false;
};

export const getAuthHeaders = () => {
  const token = localStorage.getItem('accessToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// ✅ Add this at the bottom of api.ts
export const familyAPI = {
  getFamily: () => apiClient.get("/families"),
  updateEmergencyContacts: (contacts: any[]) =>
    apiClient.put("/families/emergency-contacts", { contacts }),
  addEmergencyContact: (contact: { name: string; relation: string; email: string; phone?: string }) =>
    apiClient.post("/families/emergency-contacts", contact),
  updateEmergencyContact: (contactId: string, contact: { name: string; relation: string; email: string; phone?: string }) =>
    apiClient.put(`/families/emergency-contacts/${contactId}`, contact),
  deleteEmergencyContact: (contactId: string) =>
    apiClient.delete(`/families/emergency-contacts/${contactId}`),
};

// Emergency API methods
export const emergencyAPI = {
  mailContacts: (contacts: any[]) =>
    apiClient.post("/emergency/mail-contacts", { contacts }),
  shareSummary: () =>
    apiClient.post("/emergency/share-summary", {}),
  shareWithContact: (contactId: string) =>
    apiClient.post(`/emergency/share/${contactId}`, {}),
  test: () =>
    apiClient.get("/emergency/test"),
};
