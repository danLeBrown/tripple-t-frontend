<script setup lang="ts">
import { onMounted } from 'vue';
import { useRoute } from 'vue-router';

import Layout from './components/layout/Layout.vue';
import { useAuthStore } from './stores/auth';

const route = useRoute();
const authStore = useAuthStore();

onMounted(() => {
  // Initialize auth state from localStorage
  authStore.initializeAuth();
});
</script>

<template>
  <Layout v-if="authStore.isAuthenticated" :title="route.meta.title as string">
    <RouterView />
  </Layout>
  <RouterView v-else />
</template>
