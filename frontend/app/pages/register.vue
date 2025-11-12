<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { authApi } from '@/composables/api/authApi';

const router = useRouter();
const registerPending = ref(false);
const errorMessage = ref<string | null>(null);

const formData = reactive({
  email: '',
  first_name: '',
  last_name: '',
  organization: '',
  password: '',
  password_confirmation: ''
});

const errors = reactive({
  email: '',
  first_name: '',
  password: '',
  password_confirmation: ''
});

const hasErrors = computed(() => {
  return Object.values(errors).some((val) => val !== '');
});

const validatePasswords = () => {
  errors.password = '';
  errors.password_confirmation = '';

  const pw = formData.password;
  const confirm = formData.password_confirmation;

  if (pw.length < 8) errors.password = "Password must be at least 8 characters long.";
  else if (!/[a-z]/.test(pw)) errors.password = "Password must contain at least one lowercase letter.";
  else if (!/[A-Z]/.test(pw)) errors.password = "Password must contain at least one uppercase letter.";
  else if (!/[0-9]/.test(pw)) errors.password = "Password must contain at least one number.";
  else if (!/[^A-Za-z0-9]/.test(pw)) errors.password = "Password must contain at least one special character.";

  if (pw !== confirm) errors.password_confirmation = "Passwords do not match.";
};

const validateForm = () => {
  errors.email = formData.email ? '' : 'Email is required.';
  errors.first_name = formData.first_name ? '' : 'First Name is required.';
  validatePasswords();
  return !hasErrors.value;
};

const handleSubmit = async () => {
  errorMessage.value = null;
  if (!validateForm()) return;

  registerPending.value = true;
  try {
    await authApi.register(formData);
    router.push('/login');
  } catch (e: any) {
    errorMessage.value = e.response?.data?.message || e.message || 'Registration failed.';
  } finally {
    registerPending.value = false;
  }
};

const goToLogin = () => {
  router.push('/login');
};

const refreshPage = () => {
  window.location.reload();
};
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div class="w-full max-w-md bg-white shadow-md rounded-md p-6">
      <h2 class="text-2xl text-center font-semibold mb-6">Create Account</h2>

      <div v-if="errorMessage" class="text-sm mb-4 p-3 bg-red-100 text-red-700 rounded text-center">
        <p>{{ errorMessage }}</p>
        <button
          v-if="errorMessage.includes('refresh')"
          class="mt-2 px-3 py-1 border border-gray-400 rounded text-sm hover:bg-gray-100"
          @click="refreshPage"
        >
          Refresh Page
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <input
            v-model="formData.email"
            type="email"
            placeholder="Email *"
            required
            class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-teal-500 border-zinc-300"
          />
          <p v-if="errors.email" class="text-xs text-red-500 mt-1">{{ errors.email }}</p>
        </div>

        <div>
          <input
            v-model="formData.first_name"
            type="text"
            placeholder="First Name *"
            required
            class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-teal-500 border-zinc-300"
          />
          <p v-if="errors.first_name" class="text-xs text-red-500 mt-1">{{ errors.first_name }}</p>
        </div>

        <div>
          <input
            v-model="formData.last_name"
            type="text"
            placeholder="Last Name"
            class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-teal-500 border-zinc-300"
          />
        </div>

        <div>
          <input
            v-model="formData.organization"
            type="text"
            placeholder="Organization"
            class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-teal-500 border-zinc-300"
          />
        </div>

        <div>
          <input
            v-model="formData.password"
            type="password"
            placeholder="Password *"
            @input="validatePasswords"
            required
            class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-teal-500 border-zinc-300"
          />
          <p v-if="errors.password" class="text-xs text-red-500 mt-1">{{ errors.password }}</p>
        </div>

        <div>
          <input
            v-model="formData.password_confirmation"
            type="password"
            placeholder="Confirm Password *"
            @input="validatePasswords"
            required
            class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-teal-500 border-zinc-300"
          />
          <p v-if="errors.password_confirmation" class="text-xs text-red-500 mt-1">{{ errors.password_confirmation }}</p>
        </div>
        <BaseButton type="submit"
          :disabled="registerPending || hasErrors || !formData.password"
          intent="primary"
          class="w-full py-2"
        >
          {{ registerPending ? "Creating Account..." : "Register" }}
        </BaseButton>
      </form>

      <div class="text-center text-sm text-gray-600 mt-4">
        Already have an account?
        <button @click="goToLogin" class="text-blue-500 hover:underline ml-1">Login</button>
      </div>
    </div>
  </div>
</template>