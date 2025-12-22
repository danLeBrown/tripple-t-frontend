<template>
  <div>
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Uploads</h1>
      <p class="text-gray-600">View and manage all uploaded documents</p>
    </div>

    <UploadsTable />
  </div>
</template>

<script setup lang="ts">
import UploadsTable from '../components/uploads/UploadsTable.vue';
</script>
