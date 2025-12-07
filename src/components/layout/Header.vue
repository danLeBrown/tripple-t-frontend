<template>
  <header class="bg-white border-b border-gray-200 px-6 py-4">
    <div class="flex items-center justify-between">
      <h2 class="text-xl font-semibold text-gray-900">{{ title }}</h2>
      <div class="flex items-center gap-4">
        <SearchBar
          :model-value="searchQuery"
          @update:model-value="$emit('update:searchQuery', $event)"
          placeholder="Search..."
        />
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import SearchBar from '../common/SearchBar.vue';

defineProps<{
  title?: string;
  searchQuery: string;
}>();

defineEmits<{
  'update:searchQuery': [value: string];
}>();
</script>

