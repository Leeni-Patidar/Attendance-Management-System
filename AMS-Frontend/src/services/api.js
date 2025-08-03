import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add device ID for student requests
    const deviceId = localStorage.getItem('deviceId');
    if (deviceId && config.url?.includes('/students/')) {
      config.headers['X-Device-ID'] = deviceId;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh and errors
api.interceptors.response.use(
  (response) => {
    // Check for new token in response headers
    const newToken = response.headers['x-new-token'];
    if (newToken) {
      localStorage.setItem('accessToken', newToken);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await api.post('/auth/refresh', {
            refreshToken: refreshToken,
          });

          const { accessToken } = response.data.data;
          localStorage.setItem('accessToken', accessToken);

          // Retry the original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userData');
        window.location.href = '/';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// API Service Class
class ApiService {
  // ===== AUTHENTICATION APIS =====
  
  async login(credentials) {
    try {
      const response = await api.post('/auth/login', {
        loginId: credentials.id,
        password: credentials.password,
        userType: credentials.userType,
      });
      
      const { user, accessToken, refreshToken } = response.data.data;
      
      // Store tokens
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('userData', JSON.stringify(user));
      
      return {
        success: true,
        user,
        redirectUrl: this.getRedirectUrl(user.role),
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Login failed',
      };
    }
  }

  async logout() {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userData');
      localStorage.removeItem('deviceId');
    }
  }

  async register(userData) {
    try {
      const response = await api.post('/auth/register', userData);
      return { success: true, data: response.data.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Registration failed',
      };
    }
  }

  async getProfile() {
    try {
      const response = await api.get('/auth/me');
      return { success: true, data: response.data.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to get profile',
      };
    }
  }

  async updateProfile(userData) {
    try {
      const response = await api.put('/auth/profile', userData);
      return { success: true, data: response.data.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Profile update failed',
      };
    }
  }

  async changePassword(passwordData) {
    try {
      const response = await api.put('/auth/change-password', passwordData);
      return { success: true, message: response.data.message };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Password change failed',
      };
    }
  }

  // ===== STUDENT APIS =====

  async scanQR(qrData, deviceInfo, location, capturedImage) {
    try {
      const response = await api.post('/students/scan-qr', {
        qrData,
        deviceInfo,
        location,
        capturedImage,
      });
      return { success: true, data: response.data.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'QR scan failed',
      };
    }
  }

  async getStudentAttendance(filters = {}) {
    try {
      const response = await api.get('/students/attendance', { params: filters });
      return { success: true, data: response.data.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to get attendance',
      };
    }
  }

  async submitMissedClass(sessionId, reason, supportingDocument) {
    try {
      const response = await api.post('/students/missed-class', {
        sessionId,
        reason,
        supportingDocument,
      });
      return { success: true, data: response.data.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to submit reason',
      };
    }
  }

  async getStudentDashboard(timeframe = 30) {
    try {
      const response = await api.get('/students/dashboard', {
        params: { timeframe },
      });
      return { success: true, data: response.data.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to get dashboard data',
      };
    }
  }

  async getAttendanceSummary(filters = {}) {
    try {
      const response = await api.get('/students/attendance/summary', {
        params: filters,
      });
      return { success: true, data: response.data.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to get summary',
      };
    }
  }

  // ===== FACULTY APIS =====

  async generateQR(sessionData) {
    try {
      const response = await api.post('/faculty/generate-qr', sessionData);
      return { success: true, data: response.data.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'QR generation failed',
      };
    }
  }

  async getFacultySessions(filters = {}) {
    try {
      const response = await api.get('/faculty/sessions', { params: filters });
      return { success: true, data: response.data.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to get sessions',
      };
    }
  }

  async getSessionAttendance(sessionId) {
    try {
      const response = await api.get(`/faculty/sessions/${sessionId}/attendance`);
      return { success: true, data: response.data.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to get attendance',
      };
    }
  }

  async manualOverride(overrideData) {
    try {
      const response = await api.post('/faculty/manual-override', overrideData);
      return { success: true, data: response.data.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Override failed',
      };
    }
  }

  async updateSession(sessionId, updateData) {
    try {
      const response = await api.put(`/faculty/sessions/${sessionId}`, updateData);
      return { success: true, data: response.data.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Session update failed',
      };
    }
  }

  async getFacultyDashboard(timeframe = 30) {
    try {
      const response = await api.get('/faculty/dashboard', {
        params: { timeframe },
      });
      return { success: true, data: response.data.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to get dashboard data',
      };
    }
  }

  async exportAttendanceCSV(sessionId) {
    try {
      const response = await api.get(`/faculty/export-csv/${sessionId}`, {
        responseType: 'blob',
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `attendance_${sessionId}_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Export failed',
      };
    }
  }

  // ===== ADMIN APIS =====

  async getUsers(filters = {}) {
    try {
      const response = await api.get('/admin/users', { params: filters });
      return { success: true, data: response.data.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to get users',
      };
    }
  }

  async getAnalytics(timeframe = 30) {
    try {
      const response = await api.get('/admin/analytics', {
        params: { timeframe },
      });
      return { success: true, data: response.data.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to get analytics',
      };
    }
  }

  async getOverrideLogs(filters = {}) {
    try {
      const response = await api.get('/admin/override-logs', { params: filters });
      return { success: true, data: response.data.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to get logs',
      };
    }
  }

  async getAdminDashboard(timeframe = 7) {
    try {
      const response = await api.get('/admin/dashboard', {
        params: { timeframe },
      });
      return { success: true, data: response.data.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to get dashboard data',
      };
    }
  }

  // ===== DEVICE MANAGEMENT =====

  async generateDeviceQR() {
    try {
      const response = await api.post('/auth/device-qr');
      return { success: true, data: response.data.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Device QR generation failed',
      };
    }
  }

  async registerDevice(deviceData) {
    try {
      const response = await api.post('/auth/register-device', deviceData);
      
      // Store device ID
      if (response.data.data.deviceBinding) {
        localStorage.setItem('deviceId', response.data.data.deviceBinding.deviceId);
      }
      
      return { success: true, data: response.data.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Device registration failed',
      };
    }
  }

  // ===== HELPER METHODS =====

  getRedirectUrl(role) {
    const redirectUrls = {
      student: '/student/dashboard',
      class_teacher: '/class-teacher/dashboard',
      subject_teacher: '/subject-teacher/dashboard',
      admin: '/admin/dashboard',
    };
    return redirectUrls[role] || '/dashboard';
  }

  generateDeviceFingerprint() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('Device fingerprint', 2, 2);
    
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      screenResolution: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
      hardwareConcurrency: navigator.hardwareConcurrency,
      maxTouchPoints: navigator.maxTouchPoints,
      colorDepth: screen.colorDepth,
      pixelRatio: window.devicePixelRatio,
      canvasFingerprint: canvas.toDataURL(),
    };
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!localStorage.getItem('accessToken');
  }

  // Get current user data
  getCurrentUser() {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  }
}

// Create and export singleton instance
const apiService = new ApiService();
export default apiService;