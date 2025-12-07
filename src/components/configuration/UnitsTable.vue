<template>
  <div>
    <DataTable
      title="Units"
      :columns="columns"
      :data="configStore.units"
      :loading="configStore.loading || isSubmitting"
      :error="configStore.error"
      :pagination="configStore.pagination"
      :search-query="searchQuery"
      :get-row-id="(row) => row.id"
      @create="showCreateModal = true"
      @edit="handleEdit"
      @delete="handleDelete"
      @update:search-query="handleSearch"
      @prev-page="handlePrevPage"
      @next-page="handleNextPage"
    />
    <Modal
      :is-open="showModal"
      :title="editingUnit ? 'Edit Unit' : 'Create Unit'"
      :show-footer="true"
      @close="closeModal"
    >
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1"
            >Name</label
          >
          <input
            v-model="formData.name"
            type="text"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1"
            >Symbol</label
          >
          <input
            v-model="formData.symbol"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>
      </form>
      <template #footer>
        <button
          type="button"
          @click="closeModal"
          :disabled="isSubmitting"
          class="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
        <button
          type="button"
          @click="handleSubmit"
          :disabled="isSubmitting"
          class="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <svg
            v-if="isSubmitting"
            class="animate-spin h-4 w-4"
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
          {{ editingUnit ? 'Update' : 'Create' }}
        </button>
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue';

import { useAlertStore } from '../../stores/alert';
import { useConfigurationStore } from '../../stores/configuration';
import type { Unit } from '../../types';
import DataTable from '../common/DataTable.vue';
import Modal from '../common/Modal.vue';

const configStore = useConfigurationStore();
const alertStore = useAlertStore();
const showModal = ref(false);
const showCreateModal = ref(false);
const editingUnit = ref<Unit | null>(null);
const isSubmitting = ref(false);
const searchQuery = ref('');
const currentPage = ref(0);
let searchTimeout: ReturnType<typeof setTimeout> | null = null;

const formData = reactive({
  name: '',
  symbol: '',
});

const columns = [
  { key: 'name', label: 'Name' },
  { key: 'symbol', label: 'Symbol' },
];

onMounted(() => {
  configStore.fetchUnits();
});

function handleSearch(query: string) {
  searchQuery.value = query;
  currentPage.value = 0;

  // Debounce search
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }
  searchTimeout = setTimeout(() => {
    configStore.fetchUnits({
      query: query || undefined,
      page: 0,
    });
  }, 300);
}

function handlePrevPage() {
  if (currentPage.value > 0) {
    currentPage.value--;
    configStore.fetchUnits({
      query: searchQuery.value || undefined,
      page: currentPage.value,
    });
  }
}

function handleNextPage() {
  const totalPages = Math.ceil(
    (configStore.pagination.total || 0) / (configStore.pagination.limit || 10),
  );
  if (currentPage.value < totalPages - 1) {
    currentPage.value++;
    configStore.fetchUnits({
      query: searchQuery.value || undefined,
      page: currentPage.value,
    });
  }
}

function handleEdit(unit: Unit) {
  editingUnit.value = unit;
  formData.name = unit.name;
  formData.symbol = unit.symbol || '';
  showModal.value = true;
}

function handleDelete(unit: Unit) {
  if (confirm(`Are you sure you want to delete "${unit.name}"?`)) {
    configStore.deleteUnit(unit.id);
    alertStore.success('Unit deleted successfully');
  }
}

function closeModal() {
  showModal.value = false;
  showCreateModal.value = false;
  editingUnit.value = null;
  formData.name = '';
  formData.symbol = '';
}

async function handleSubmit() {
  isSubmitting.value = true;
  try {
    if (editingUnit.value) {
      await configStore.updateUnit(editingUnit.value.id, formData);
      alertStore.success('Unit updated successfully');
    } else {
      await configStore.createUnit(formData);
      alertStore.success('Unit created successfully');
    }
    closeModal();
  } catch (error) {
    // Error alert is handled by API interceptor
    console.error('Failed to save unit:', error);
  } finally {
    isSubmitting.value = false;
  }
}

watch(showCreateModal, (val) => {
  if (val) {
    showModal.value = true;
    editingUnit.value = null;
    formData.name = '';
    formData.symbol = '';
  }
});
</script>
