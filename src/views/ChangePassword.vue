<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8"
  >
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Change Your Password
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Please set a new password for your account
        </p>
      </div>
      <form class="mt-8 space-y-6" @submit.prevent="handleSubmit">
        <div class="space-y-4">
          <div>
            <label
              for="newPassword"
              class="block text-sm font-medium text-gray-700 mb-1"
            >
              New Password
            </label>
            <div class="relative">
              <input
                id="newPassword"
                v-model="formData.newPassword"
                :type="showNewPassword ? 'text' : 'password'"
                required
                minlength="8"
                class="appearance-none relative block w-full px-3 py-2 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Enter new password"
              />
              <button
                type="button"
                @click="showNewPassword = !showNewPassword"
                class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                <EyeIcon v-if="!showNewPassword" class="h-5 w-5" />
                <EyeSlashIcon v-else class="h-5 w-5" />
              </button>
            </div>
          </div>
          <div>
            <label
              for="confirmPassword"
              class="block text-sm font-medium text-gray-700 mb-1"
            >
              Confirm New Password
            </label>
            <div class="relative">
              <input
                id="confirmPassword"
                v-model="formData.confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                required
                minlength="8"
                class="appearance-none relative block w-full px-3 py-2 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Confirm new password"
              />
              <button
                type="button"
                @click="showConfirmPassword = !showConfirmPassword"
                class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                <EyeIcon v-if="!showConfirmPassword" class="h-5 w-5" />
                <EyeSlashIcon v-else class="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        <div v-if="error" class="rounded-md bg-red-50 p-4">
          <div class="flex">
            <ExclamationCircleIcon class="h-5 w-5 text-red-400" />
            <div class="ml-3">
              <p class="text-sm font-medium text-red-800">{{ error }}</p>
            </div>
          </div>
        </div>

        <div>
          <button
            type="submit"
            :disabled="loading || !isFormValid"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span
              v-if="loading"
              class="absolute left-0 inset-y-0 flex items-center pl-3"
            >
              <svg
                class="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                />
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </span>
            {{ loading ? 'Changing Password...' : 'Change Password' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
    ExclamationCircleIcon,
    EyeIcon,
    EyeSlashIcon,
} from '@heroicons/vue/24/outline';
import { computed, onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import baseApi from '../services/base.api';
import { useAlertStore } from '../stores/alert';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const alertStore = useAlertStore();

const formData = reactive({
  newPassword: '',
  confirmPassword: '',
});

const loading = ref(false);
const error = ref<string | null>(null);
const showNewPassword = ref(false);
const showConfirmPassword = ref(false);

const isFormValid = computed(() => {
  return (
    formData.newPassword.length >= 8 &&
    formData.newPassword === formData.confirmPassword
  );
});

onMounted(() => {
  // If user is not authenticated, redirect to login
  if (!authStore.isAuthenticated) {
    router.push({
      path: '/login',
      query: { redirect: route.fullPath },
    });
  }
});

async function handleSubmit() {
  if (!isFormValid.value) {
    error.value = 'Passwords must match and be at least 8 characters long.';
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    await baseApi.changePassword({
      new_password: formData.newPassword,
    });
    alertStore.success('Password changed successfully');

    // Redirect to the original destination or dashboard
    const redirectTo = (route.query.redirect as string) || '/';
    router.push(redirectTo);
  } catch (err: any) {
    console.error(err);
    error.value =
      err.response?.data?.message ||
      'Failed to change password. Please try again.';
  } finally {
    loading.value = false;
  }
}
</script>
