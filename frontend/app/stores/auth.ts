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
        const response = await authApi.refreshToken(this.tokens.refresh)
        this.tokens = response
        return response
      } catch (error) {
        // Silent logout - clear state and redirect
        this.$reset()
        const router = useRouter()
        router.push('/login')
        throw error
      }
      /*try {
        const response = await authApi.refreshToken(this.tokens.refresh);
        this.tokens = response;
        apiClient.defaults.headers.common.Authorization = `Bearer ${response.access}`;
      } catch {
        this.logout();
      }*/
    },
    checkAuth() {
      if (!this.tokens?.access) return false
      
      try {
        const parsedToken:string[] = this.tokens.access.split('.')
        if (parsedToken.length < 2) return false

        const payload = parsedToken[1] ? JSON.parse(atob(parsedToken[1])) : null;
        if (!payload) return false;

        const now = Date.now() / 1000
        
        // Refresh if token expires within 5 minutes
        if (payload.exp - now < 300) {
          this.refreshToken().catch(() => {
            // Refresh failed, logout handled above
          })
        }
        
        return payload.exp > now
      } catch {
        return false
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
