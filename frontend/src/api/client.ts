import axios from 'axios';
import { reportServerDown } from './serverStatusBridge';

export const apiClient = axios.create({
  // baseURL: import.meta.env.PROD ? '/api' : 'http://localhost:3000/api',
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const sessionId = localStorage.getItem('sessionId');
  if (sessionId) {
    config.headers['x-session-id'] = sessionId;
  }
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (axios.isCancel(err) || err.code === 'ERR_CANCELED') {
      return Promise.reject(err);
    }
    const isNetworkError = !err.response;
    const status: number | undefined = err.response?.status;
    const is5xx = typeof status === 'number' && status >= 500 && status < 600;
    if (isNetworkError || is5xx) {
      reportServerDown();
    }
    return Promise.reject(err);
  },
);

export const handleApiError = (error: any): string => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  return error.message || 'An unknown error occurred';
};
