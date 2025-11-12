<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const formData = ref({
  email: '',
  password: ''
})
const errorMessage = ref('')
const loading = ref(false)

const onSubmit = async () => {
  errorMessage.value = ''
  loading.value = true
  try {
    await authStore.login(formData.value.email, formData.value.password)
    router.push('/')  // Redirect to home page or dashboard
  } catch (err) {
    errorMessage.value = err.response?.data?.detail || 'Login failed'
  } finally {
    loading.value = false
  }
}
</script>

<template>
    <div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div class="w-full max-w-md bg-white shadow-md rounded-md p-6">
        <form class="max-w-md mx-auto p-4">
            <div class="mb-4">
            <label for="email" class="block mb-1 font-medium">Email</label>
            <BaseInput
                v-model="formData.email"
                id="email"
                type="email"
                required
                class="w-full border rounded px-3 py-2"
            />
            </div>

            <div class="mb-4">
            <label for="password" class="block mb-1 font-medium">Password</label>
            <BaseInput
                v-model="formData.password"
                id="password"
                type="password"
                required
                class="w-full border rounded px-3 py-2"
            />
            </div>

            <div v-if="errorMessage" class="mb-4 text-red-600 font-normal">
            {{ errorMessage }}
            </div>

            <BaseButton
              type="submit"
              :disabled="loading || !formData.email || !formData.password"
              :loading="loading"
              defaultText="Login"
              loadingText="Logging in..."
              intent="primary"
              class="w-full py-2"
              @submit="onSubmit">
              Login
            </BaseButton>

            <p class="mt-4 text-center text-sm text-gray-600">
            Don't have an account?
            <router-link to="/register" class="text-blue-600 hover:underline">
                Sign up
            </router-link>
            </p>
        </form>
  </div>
  </div>
</template>
