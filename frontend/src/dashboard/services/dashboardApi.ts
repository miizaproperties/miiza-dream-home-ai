import { DASHBOARD_API_BASE_URL } from '../../config/api';

const API_BASE_URL = DASHBOARD_API_BASE_URL;

// Helper function for API calls
const apiCall = async (endpoint: string) => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'GET',
    credentials: 'include', // For session-based auth
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    // Don't throw for 403/401 - let the component handle it
    if (response.status === 403 || response.status === 401) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Authentication required');
    }
    throw new Error(`API error: ${response.statusText}`);
  }

  return response.json();
};

export const dashboardApi = {
  login: async (username: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/login/`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });
    return response.json();
  },
  logout: async () => {
    const response = await fetch(`${API_BASE_URL}/logout/`, {
      method: 'POST',
      credentials: 'include',
    });
    return response.json();
  },
  getCurrentUser: () => apiCall('/user/'),
  getStats: () => apiCall('/stats/'),
  getAnalytics: () => apiCall('/analytics/'),
  getRecentActivity: () => apiCall('/activity/'),
  getTopPerformers: () => apiCall('/top-performers/'),
  createProperty: async (formData: FormData) => {
    const response = await fetch(`${API_BASE_URL}/properties/create/`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to create property' }));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  },
  createUser: async (userData: any) => {
    const response = await fetch(`${API_BASE_URL}/users/create/`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    return response.json();
  },
  updateUser: async (userId: string, userData: any) => {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/update/`, {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    return response.json();
  },
  deleteUser: async (userId: string) => {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/delete/`, {
      method: 'DELETE',
      credentials: 'include',
    });
    return response.json();
  },
  changePassword: async (oldPassword: string | null, newPassword: string, confirmPassword: string) => {
    const response = await fetch(`${API_BASE_URL}/change-password/`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        old_password: oldPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      }),
    });
    return response.json();
  },
  getAgentAnalytics: () => apiCall('/agent-analytics/'),
  listProperties: () => apiCall('/properties/'),
  getProperty: (propertyId: number) => apiCall(`/properties/${propertyId}/`),
  updateProperty: async (propertyId: number, formData: FormData) => {
    const response = await fetch(`${API_BASE_URL}/properties/${propertyId}/update/`, {
      method: 'PATCH',
      credentials: 'include',
      body: formData,
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to update property' }));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  },
  deleteProperty: async (propertyId: number) => {
    const response = await fetch(`${API_BASE_URL}/properties/${propertyId}/delete/`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to delete property' }));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  },
};

