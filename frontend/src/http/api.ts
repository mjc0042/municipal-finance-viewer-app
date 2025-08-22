import axios from 'axios';
import { useAuthStore } from '@/store/auth';
import type { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

export const apiClient = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  //withCredentials: true,
});

// Request interceptor to add access token to headers
apiClient.interceptors.request.use(
  (config:InternalAxiosRequestConfig) => {
    const tokens = useAuthStore.getState().tokens;
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
    //toast({
    //  title: 'Error',
    //  description: message,
    //  variant: 'destructive',
    //});
    console.error('API Error:', error.response?.data)

    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/token/pair')) {
      // Unauthorized
      originalRequest._retry = true;
      
      try {
        await useAuthStore.getState().refreshToken();
        return apiClient(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    } else if (error.response?.status === 404) {
      // Not found
    }
    return Promise.reject(error);
  }
);