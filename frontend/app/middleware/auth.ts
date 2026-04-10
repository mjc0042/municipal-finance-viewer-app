
import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware((to) => {
    const authStore = useAuthStore()
    
    // Allow access to auth pages
    if (to.path === '/login' || to.path === '/register') {
      return
    }
    
    // Redirect to login if not authenticated
    if (!authStore.isAuthenticated) {
      return navigateTo('/')
    }
  })