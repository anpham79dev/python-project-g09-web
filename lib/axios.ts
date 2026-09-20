import axios from 'axios';

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor: Tự động gắn Bearer token từ localStorage
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

import { clearAuthSession } from './auth';

// Response interceptor: Xử lý lỗi tập trung (ví dụ 401 Unauthorized)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      clearAuthSession();
      const pathname = window.location.pathname;
      const isPublic = pathname === '/login';
      if (!isPublic) {
        window.location.href = '/login?reason=unauthenticated';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
