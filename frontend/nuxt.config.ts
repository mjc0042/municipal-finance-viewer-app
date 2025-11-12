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
      tailwindcss(),
    ]
  },
  modules: [
    '@nuxt/eslint',
    '@nuxt/fonts',
    '@nuxt/icon',
    '@nuxt/test-utils',
    '@pinia/nuxt',
    'pinia-plugin-persistedstate/nuxt',
  ],
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
})