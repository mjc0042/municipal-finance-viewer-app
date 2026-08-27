import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  devServer: {
    port: 5173,
  },
  css: [
    './app/assets/css/main.css'
  ],
  vite: {
    plugins: [
      tailwindcss()
    ]
  },
  modules: [
    '@nuxt/eslint',
    '@nuxt/fonts',
    '@nuxt/icon',
    '@nuxt/test-utils',
    '@pinia/nuxt',
    'pinia-plugin-persistedstate/nuxt',
    'nuxt-security',
  ],
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:8000'
    }
  },
  nitro: {
    routeRules: {
      '/media/**': {
        proxy: `${process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:8000'}/media/**`
      }
    }
  },
  piniaPluginPersistedstate: {
    //key: 'prefix_%id_postfix',
    storage: 'cookies',
    cookieOptions: {
      sameSite: 'lax',
    },
    debug: true,
  },
  routeRules: {
    '/financial': { ssr: false }
  },
  security: {
    headers: {
      contentSecurityPolicy: {
        'default-src': ["'self'"],
        'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        'style-src': ["'self'", "'unsafe-inline'"],
        'img-src': ["'self'", "data:", "blob:", "https://*.arcgisonline.com", "https://*.tile.openstreetmap.org", "https://tile.openstreetmap.org", "https://*.openstreetmap.org", "https://*.basemaps.cartocdn.com"],
        'connect-src': ["'self'", "http://localhost:8000", "ws://localhost:5173"],
        'font-src': ["'self'", "data:"],
        'frame-src': ["'self'", "http://localhost:8000", "data:", "blob:"],
        'object-src': ["'self'", "http://localhost:8000", "data:", "blob:"]
      }
    }
  }
})