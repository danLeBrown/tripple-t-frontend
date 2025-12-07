<template>
  <div class="flex min-h-screen bg-gray-100">
    <Sidebar />
    <div class="flex-1 flex flex-col">
      <Header
        :title="title"
        :search-query="searchQuery"
        @update:search-query="searchQuery = $event"
      />
      <main class="flex-1 p-6">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Sidebar from './Sidebar.vue';
import Header from './Header.vue';

defineProps<{
  title?: string;
}>();

const searchQuery = ref('');
</script>

