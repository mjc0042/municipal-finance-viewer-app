import { defineStore } from 'pinia';
import { authApi } from '@/composables/api/authApi'; // adjust relative path
import { apiClient } from '@/composables/api/apiClient';
import type { User } from '@/types/http/auth';
import { useRouter } from 'vue-router';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    tokens: { access: null as string|null, refresh: null as string|null },
    user: null as User | null,
    isAuthenticated: false,
  }),
  actions: {
    async login(email: string, password: string) {
      const tokens = await authApi.login(email, password);
      this.tokens = tokens;
      const user = await authApi.getCurrentUser();
      this.user = user;
      this.isAuthenticated = true;
    },
    async logout() {
      this.tokens = { access: null, refresh: null };
      this.user = null;
      this.isAuthenticated = false;
      const router = useRouter();
      router.push('/');
    },
    async refreshToken() {
      if (!this.tokens.refresh) throw new Error("No refresh token");
      try {
        const response = await authApi.refreshToken(this.tokens.refresh);
        this.tokens = response;
        apiClient.defaults.headers.common.Authorization = `Bearer ${response.access}`;
      } catch {
        this.logout();
      }
    },
    async getUser() {
      if (this.user) return this.user;
      this.user = await authApi.getCurrentUser();
      return this.user;
    }
  },
  persist: {
    storage: piniaPluginPersistedstate.cookies({
      maxAge: 5 * 24 * 60 * 60,
    })
  },
});
