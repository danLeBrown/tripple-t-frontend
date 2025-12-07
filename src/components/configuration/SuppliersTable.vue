<template>
  <div>
    <DataTable
      title="Suppliers"
      :columns="columns"
      :data="configStore.suppliers"
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
      :title="editingSupplier ? 'Edit Supplier' : 'Create Supplier'"
      :show-footer="true"
      @close="closeModal"
    >
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >First Name</label
            >
            <input
              v-model="formData.first_name"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >Last Name</label
            >
            <input
              v-model="formData.last_name"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1"
            >Email</label
          >
          <input
            v-model="formData.email"
            type="email"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1"
            >Phone Number</label
          >
          <input
            v-model="formData.phone_number"
            type="tel"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1"
            >Status</label
          >
          <select
            v-model="formData.status"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending">Pending</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1"
            >Address</label
          >
          <textarea
            v-model="formData.address"
            rows="3"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          ></textarea>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1"
            >State</label
          >
          <input
            v-model="formData.state"
            type="text"
            required
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
          {{ editingSupplier ? 'Update' : 'Create' }}
        </button>
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue';

import { useAlertStore } from '../../stores/alert';
import { useConfigurationStore } from '../../stores/configuration';
import type { Supplier, SupplierStatus } from '../../types';
import DataTable from '../common/DataTable.vue';
import Modal from '../common/Modal.vue';

const configStore = useConfigurationStore();
const alertStore = useAlertStore();
const showModal = ref(false);
const showCreateModal = ref(false);
const editingSupplier = ref<Supplier | null>(null);
const isSubmitting = ref(false);
const searchQuery = ref('');
const currentPage = ref(0);
let searchTimeout: ReturnType<typeof setTimeout> | null = null;

const formData = reactive({
  first_name: '',
  last_name: '',
  email: '',
  phone_number: '',
  status: 'active' as SupplierStatus,
  address: '',
  state: '',
});

const columns = [
  { key: 'first_name', label: 'First Name' },
  { key: 'last_name', label: 'Last Name' },
  { key: 'email', label: 'Email' },
  { key: 'phone_number', label: 'Phone' },
  { key: 'status', label: 'Status' },
  { key: 'state', label: 'State' },
];

onMounted(() => {
  configStore.fetchSuppliers();
});

function handleSearch(query: string) {
  searchQuery.value = query;
  currentPage.value = 0;

  // Debounce search
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }
  searchTimeout = setTimeout(() => {
    configStore.fetchSuppliers({
      query: query || undefined,
      page: 0,
    });
  }, 300);
}

function handlePrevPage() {
  if (currentPage.value > 0) {
    currentPage.value--;
    configStore.fetchSuppliers({
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
    configStore.fetchSuppliers({
      query: searchQuery.value || undefined,
      page: currentPage.value,
    });
  }
}

function handleEdit(supplier: Supplier) {
  editingSupplier.value = supplier;
  formData.first_name = supplier.first_name;
  formData.last_name = supplier.last_name;
  formData.email = supplier.email;
  formData.phone_number = supplier.phone_number;
  formData.status = supplier.status;
  formData.address = supplier.address;
  formData.state = supplier.state;
  showModal.value = true;
}

function handleDelete(supplier: Supplier) {
  if (
    confirm(
      `Are you sure you want to delete "${supplier.first_name} ${supplier.last_name}"?`,
    )
  ) {
    configStore.deleteSupplier(supplier.id);
    alertStore.success('Supplier deleted successfully');
  }
}

function closeModal() {
  showModal.value = false;
  showCreateModal.value = false;
  editingSupplier.value = null;
  formData.first_name = '';
  formData.last_name = '';
  formData.email = '';
  formData.phone_number = '';
  formData.status = 'active';
  formData.address = '';
  formData.state = '';
}

async function handleSubmit() {
  isSubmitting.value = true;
  try {
    if (editingSupplier.value) {
      await configStore.updateSupplier(editingSupplier.value.id, formData);
      alertStore.success('Supplier updated successfully');
    } else {
      await configStore.createSupplier(formData);
      alertStore.success('Supplier created successfully');
    }
    closeModal();
  } catch (error) {
    // Error alert is handled by API interceptor
    console.error('Failed to save supplier:', error);
  } finally {
    isSubmitting.value = false;
  }
}

watch(showCreateModal, (val) => {
  if (val) {
    showModal.value = true;
    editingSupplier.value = null;
    formData.first_name = '';
    formData.last_name = '';
    formData.email = '';
    formData.phone_number = '';
    formData.status = 'active';
    formData.address = '';
    formData.state = '';
  }
});
</script>
