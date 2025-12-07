<template>
  <div>
    <DataTable
      title="Products"
      :columns="columns"
      :data="configStore.products"
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
      :title="editingProduct ? 'Edit Product' : 'Create Product'"
      :show-footer="true"
      @close="closeModal"
    >
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1"
            >Type</label
          >
          <select
            v-model="formData.type"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          >
            <option value="">Select a type</option>
            <option value="Bottle">Bottle</option>
            <option value="Cap">Cap</option>
            <option value="Preform">Preform</option>
            <option value="Nylon">Nylon</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1"
            >Size</label
          >
          <select
            v-model.number="formData.size"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            :disabled="loadingOptions"
          >
            <option value="">Select a size</option>
            <option
              v-for="size in sortedSizes"
              :key="size.id"
              :value="size.value"
            >
              {{ size.value }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1"
            >Colour</label
          >
          <select
            v-model="formData.colour"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            :disabled="loadingOptions"
          >
            <option value="">Select a colour</option>
            <option
              v-for="color in sortedColors"
              :key="color.id"
              :value="color.name"
            >
              {{ color.name }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1"
            >Unit</label
          >
          <select
            v-model="formData.unit"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            :disabled="loadingOptions"
          >
            <option value="">Select a unit</option>
            <option
              v-for="unit in sortedUnits"
              :key="unit.id"
              :value="unit.name"
            >
              {{ unit.name }} ({{ unit.symbol }})
            </option>
          </select>
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
          {{ editingProduct ? 'Update' : 'Create' }}
        </button>
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue';

import { useAlertStore } from '../../stores/alert';
import { useConfigurationStore } from '../../stores/configuration';
import type { Product, ProductType } from '../../types';
import DataTable from '../common/DataTable.vue';
import Modal from '../common/Modal.vue';

const configStore = useConfigurationStore();
const alertStore = useAlertStore();
const showModal = ref(false);
const showCreateModal = ref(false);
const editingProduct = ref<Product | null>(null);
const isSubmitting = ref(false);
const searchQuery = ref('');
const currentPage = ref(0);
const loadingOptions = ref(false);
let searchTimeout: ReturnType<typeof setTimeout> | null = null;

const formData = reactive({
  type: 'preform' as ProductType,
  size: 0,
  colour: '',
  unit: '',
});

const columns = [
  {
    key: 'type',
    label: 'Type',
    format: (value: ProductType) =>
      value.charAt(0).toUpperCase() + value.slice(1),
  },
  { key: 'size', label: 'Size' },
  { key: 'colour', label: 'Colour' },
  { key: 'unit', label: 'Unit' },
];

// Computed properties for sorted options
const sortedSizes = computed(() => {
  return [...configStore.sizes].sort((a, b) => a.value - b.value);
});

const sortedColors = computed(() => {
  return [...configStore.colors].sort((a, b) => a.name.localeCompare(b.name));
});

const sortedUnits = computed(() => {
  return [...configStore.units].sort((a, b) => a.name.localeCompare(b.name));
});

onMounted(async () => {
  await configStore.fetchProducts();
  // Fetch options for dropdowns
  await loadOptions();
});

async function loadOptions() {
  loadingOptions.value = true;
  try {
    await Promise.all([
      configStore.fetchSizes(),
      configStore.fetchColors(),
      configStore.fetchUnits(),
    ]);
  } catch (error) {
    console.error('Failed to load options:', error);
  } finally {
    loadingOptions.value = false;
  }
}

function handleSearch(query: string) {
  searchQuery.value = query;
  currentPage.value = 0;

  // Debounce search
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }
  searchTimeout = setTimeout(() => {
    configStore.fetchProducts({
      query: query || undefined,
      page: 0,
    });
  }, 300);
}

function handlePrevPage() {
  if (currentPage.value > 0) {
    currentPage.value--;
    configStore.fetchProducts({
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
    configStore.fetchProducts({
      query: searchQuery.value || undefined,
      page: currentPage.value,
    });
  }
}

function handleEdit(product: Product) {
  editingProduct.value = product;
  formData.type = product.type;
  formData.size = product.size;
  formData.colour = product.colour;
  formData.unit = product.unit;
  showModal.value = true;
}

function handleDelete(product: Product) {
  if (
    confirm(
      `Are you sure you want to delete product "${product.type} - ${product.size}${product.unit} (${product.colour})"?`,
    )
  ) {
    configStore.deleteProduct(product.id);
    alertStore.success('Product deleted successfully');
  }
}

function closeModal() {
  showModal.value = false;
  showCreateModal.value = false;
  editingProduct.value = null;
  formData.type = 'preform';
  formData.size = 0;
  formData.colour = '';
  formData.unit = '';
}

async function handleSubmit() {
  isSubmitting.value = true;
  try {
    if (editingProduct.value) {
      await configStore.updateProduct(editingProduct.value.id, formData);
      alertStore.success('Product updated successfully');
    } else {
      await configStore.createProduct(formData);
      alertStore.success('Product created successfully');
    }
    closeModal();
  } catch (error) {
    // Error alert is handled by API interceptor
    console.error('Failed to save product:', error);
  } finally {
    isSubmitting.value = false;
  }
}

// Watch for create modal trigger
watch(showCreateModal, async (val) => {
  if (val) {
    // Ensure options are loaded before showing modal
    if (
      configStore.sizes.length === 0 ||
      configStore.colors.length === 0 ||
      configStore.units.length === 0
    ) {
      await loadOptions();
    }
    showModal.value = true;
    editingProduct.value = null;
    formData.type = 'preform';
    formData.size = 0;
    formData.colour = '';
    formData.unit = '';
  }
});

// Also load options when edit modal opens
watch(showModal, async (val) => {
  if (val && editingProduct.value === null) {
    // This is for create, ensure options are loaded
    if (
      configStore.sizes.length === 0 ||
      configStore.colors.length === 0 ||
      configStore.units.length === 0
    ) {
      await loadOptions();
    }
  }
});
</script>
