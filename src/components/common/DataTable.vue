<template>
  <div class="bg-white rounded-lg shadow overflow-hidden">
    <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
      <h3 class="text-lg font-semibold text-gray-900">{{ title }}</h3>
      <button @click="$emit('create')" :disabled="loading"
        class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Add New
      </button>
    </div>

    <!-- Search Input -->
    <div class="px-6 py-4 border-b border-gray-200">
      <div class="relative">
        <input :value="searchQuery" @input="
          $emit(
            'update:searchQuery',
            ($event.target as HTMLInputElement).value,
          )
          " type="text" placeholder="Search..."
          class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>
    </div>

    <div v-if="loading" class="p-8 text-center">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <p class="mt-2 text-gray-500">Loading...</p>
    </div>

    <div v-else-if="error" class="p-8 text-center">
      <p class="text-red-600">{{ error }}</p>
    </div>

    <div v-else class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th v-for="column in columns" :key="column.key"
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {{ column.label }}
            </th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="row in data" :key="getRowId(row)" class="hover:bg-gray-50">
            <td v-for="column in columns" :key="column.key" class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              <slot :name="`cell-${column.key}`" :row="row" :value="row[column.key]">
                {{ formatValue(row[column.key], column) }}
              </slot>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <button @click="$emit('edit', row)" :disabled="loading"
                class="text-blue-600 hover:text-blue-900 mr-4 disabled:opacity-50 disabled:cursor-not-allowed">
                Edit
              </button>
              <button @click="$emit('delete', row)" :disabled="loading"
                class="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed">
                Delete
              </button>
            </td>
          </tr>
          <tr v-if="data.length === 0">
            <td :colspan="columns.length + 1" class="px-6 py-8 text-center text-gray-500">
              No data available
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination Info -->
    <div v-if="pagination && pagination.total > 0"
      class="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
      <div class="text-sm text-gray-700">
        Showing
        <span class="font-medium">{{
          pagination.page * pagination.limit + 1
          }}</span>
        to
        <span class="font-medium">{{
          Math.min((pagination.page + 1) * pagination.limit, pagination.total)
          }}</span>
        of
        <span class="font-medium">{{ pagination.total }}</span>
        results
      </div>
      <div class="flex items-center gap-2">
        <button @click="$emit('prevPage')" :disabled="pagination.page === 0 || loading"
          class="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed">
          Previous
        </button>
        <span class="text-sm text-gray-700">
          Page {{ pagination.page + 1 }} of
          {{
            Math.max(
              1,
              Math.ceil(pagination.total / Math.max(1, pagination.limit || 10)),
            )
          }}
        </span>
        <button @click="$emit('nextPage')" :disabled="(pagination.page + 1) * pagination.limit >= pagination.total ||
          loading
          "
          class="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed">
          Next
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Column {
  key: string;
  label: string;
  format?: (value: any) => string;
}

defineProps<{
  title: string;
  columns: Column[];
  data: any[];
  loading?: boolean;
  error?: string | null;
  getRowId: (row: any) => string | number;
  pagination?: {
    total: number;
    limit: number;
    page: number;
  } | null;
  searchQuery?: string;
}>();

defineEmits<{
  create: [];
  edit: [row: any];
  delete: [row: any];
  'update:searchQuery': [value: string];
  prevPage: [];
  nextPage: [];
}>();

function formatValue(value: any, column: Column): string {
  if (value === null || value === undefined) return '-';
  if (column.format) return column.format(value);
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}
</script>
