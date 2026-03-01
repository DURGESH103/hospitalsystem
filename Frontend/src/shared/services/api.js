import { config } from '../../core/config';

class ApiService {
  constructor() {
    this.baseUrl = config.apiUrl;
  }

  getToken() {
    return localStorage.getItem('token');
  }

  async request(endpoint, options = {}) {
    const token = this.getToken();
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Request failed');
    return data;
  }

  register(userData) {
    return this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  login(credentials) {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  getProfile() {
    return this.request('/api/auth/profile');
  }

  getAppointments() {
    return this.request('/api/appointments');
  }

  createAppointment(data) {
    return this.request('/api/appointments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  updateAppointment(id, data) {
    return this.request(`/api/appointments/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  deleteAppointment(id) {
    return this.request(`/api/appointments/${id}`, {
      method: 'DELETE',
    });
  }
}

export const api = new ApiService();
