<script setup lang="ts">
import { onMounted } from 'vue';
import { useRoute } from 'vue-router';

import Alert from './components/common/Alert.vue';
import Layout from './components/layout/Layout.vue';
import { useAuthStore } from './stores/auth';

const route = useRoute();
const authStore = useAuthStore();

onMounted(async () => {
  // Initialize auth state from localStorage
  await authStore.initializeAuth();
});
</script>

<template>
  <div class="overflow-x-hidden">
    <Alert />
    <Layout
      v-if="authStore.isAuthenticated"
      :title="route.meta.title as string"
    >
      <RouterView />
    </Layout>
    <RouterView v-else />
  </div>
</template>
