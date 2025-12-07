<template>
  <div class="flex min-h-screen bg-gray-100 overflow-x-hidden">
    <Sidebar />
    <div class="flex-1 flex flex-col min-w-0">
      <Header
        :title="title"
        :search-query="searchQuery"
        @update:search-query="searchQuery = $event"
      />
      <main class="flex-1 p-6 overflow-x-hidden min-w-0">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

import Header from './Header.vue';
import Sidebar from './Sidebar.vue';

defineProps<{
  title?: string;
}>();

const searchQuery = ref('');
</script>
