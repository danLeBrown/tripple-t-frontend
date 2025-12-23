<template>
  <div>
    <DataTable
      title="Bottle Production Records"
      :columns="columns"
      :data="records"
      :loading="loading"
      :error="error"
      :pagination="pagination"
      :search-query="searchQuery"
      :get-row-id="(row) => row.id"
      @update:search-query="handleSearch"
      @prev-page="handlePrevPage"
      @next-page="handleNextPage"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';

import DataTable from '../common/DataTable.vue';

const records = ref<any[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const pagination = ref<{
  total: number;
  limit: number;
  page: number;
} | null>(null);
const searchQuery = ref('');

const columns = [
  { key: 'id', label: 'ID' },
  { key: 'created_at', label: 'Created At' },
];

function handleSearch(query: string) {
  searchQuery.value = query;
  // TODO: Implement search
}

function handlePrevPage() {
  if (pagination.value && pagination.value.page > 0) {
    pagination.value.page--;
    // TODO: Fetch records
  }
}

function handleNextPage() {
  if (
    pagination.value &&
    (pagination.value.page + 1) * pagination.value.limit <
      pagination.value.total
  ) {
    pagination.value.page++;
    // TODO: Fetch records
  }
}

onMounted(() => {
  // TODO: Fetch initial records
});
</script>

