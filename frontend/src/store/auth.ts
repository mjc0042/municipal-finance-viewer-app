import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useLocation } from 'wouter';
import { apiClient } from '@/http/api';
import { authApi } from '@/http/auth/api';
import type { User } from '@/http/auth/types'


interface AuthStore {
  tokens: {
    access: string | null;
    refresh: string | null;
  },
  user: User | null;
  isAuthenticated: boolean;

  login: (email:string, password:string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  getUser: () => Promise<User>;
}

export const useAuthStore = create(
  persist<AuthStore>(
    (set, get) => ({
      tokens: { access: null, refresh: null },
      user: null,
      isAuthenticated: false,

      login: async(email:string, password:string) => {
        try {
          const tokens = await authApi.login(email, password);
          set({ tokens: tokens });

          const user = await authApi.getCurrentUser();
          set({ user: user, isAuthenticated: true });
        } catch (error) {
          throw error;
        }
      },
      logout: async () => {
        try {
          set({ user: null, isAuthenticated: false, tokens: { access: null, refresh: null } });
          // Redirect to home page
          useLocation()[1]('/');
        } catch (error) {
          console.error('Logout failed:', error);
          throw error;
        }
      },
      refreshToken: async () => {
        const { tokens } = get();
        if (!tokens.refresh) throw new Error('No refresh token available');

        try {
          const response = await authApi.refreshToken(tokens.refresh);
          set({ tokens: response });
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${response.access}`;
        } catch (error) {
          console.error('Token refresh failed:', error);
          get().logout();
        }
      },
      getUser: async() => {

        const { user } = get();
        if (user) return user;

        try {
          const fetchedUser = await authApi.getCurrentUser();
          set({ user: fetchedUser });
          return fetchedUser;

        } catch (error) {
          console.error('Failed to fetch user:', error);
          throw error;
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated,
        user: state.user
      }),
    }
  )
);