import { apiClient } from '../api';
import type { User, RegisterData } from './types';


export const authApi = {
    register: async (data:RegisterData) => {
      const response = await apiClient.post('/register', data);
      return response.data;
    },
    getCurrentUser: async () => {
      const response = await apiClient.get<User>('/user');
      return response.data;
    },
    login: async (email:string, password:string) => {
      const response = await apiClient.post<{ access:string, refresh:string, user: User}>('/token/pair', { email, password });
      return response.data;
    },
    /*getCsrfToken: async() => {
      const response = await apiClient.get('/auth/get-csrf-token');
      return response.data;
    }, */
    // Unnecesary, handled by client state deleting the token
    /*logout: async () => {
      await apiClient.post('/auth/logout', {})
    },*/
    refreshToken: async (refresh: string): Promise<{ access:string, refresh:string }> => {
      const response = await apiClient.post('/token/refresh', { refresh });
      return response.data;
    }
  };