import { apiClient } from '@/composables/api/apiClient';
import { useAuthStore } from '@/stores/auth';
import type { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

let isRefreshing = false
let failedQueue: any[] = []

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error)
    } else {
      resolve(token)
    }
  })
  failedQueue = []
}

// Request interceptor to add access token to headers
apiClient.interceptors.request.use((config:InternalAxiosRequestConfig) => {
    const tokens = useAuthStore().tokens;
    if (tokens?.access && config.headers) {
      config.headers.Authorization = `Bearer ${tokens.access}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  (response:AxiosResponse) => response,
  async (error) => {
    //const message = error.response?.data?.message || error.message;
    const originalRequest = error.config;

    console.error('API Error:', error.response?.data)

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then(() => apiClient(originalRequest))
      }
    
      originalRequest._retry = true
      isRefreshing = true
    
      return new Promise((resolve, reject) => {
        useAuthStore().refreshToken()
          .then(() => {
            processQueue(null)
            resolve(apiClient(originalRequest))
          })
          .catch((err) => {
            processQueue(err)
            reject(err)
          })
          .finally(() => {
            isRefreshing = false
          })
      })
    } else if (error.response?.status === 404) {
      // Not found
    }
    return Promise.reject(error);
  }
);