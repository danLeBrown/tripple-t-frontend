<template>
  <div>
    <DataTable
      title="Products"
      :columns="columns"
      :data="configStore.products"
      :loading="configStore.loading"
      :error="configStore.error"
      :get-row-id="(row) => row.id"
      @create="showCreateModal = true"
      @edit="handleEdit"
      @delete="handleDelete"
    />
    <Modal
      :is-open="showModal"
      :title="editingProduct ? 'Edit Product' : 'Create Product'"
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
            <option value="preform">Preform</option>
            <option value="cap">Cap</option>
            <option value="bottle">Bottle</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1"
            >Size</label
          >
          <input
            v-model.number="formData.size"
            type="number"
            required
            step="0.01"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1"
            >Colour</label
          >
          <input
            v-model="formData.colour"
            type="text"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1"
            >Unit</label
          >
          <input
            v-model="formData.unit"
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
          class="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          @click="handleSubmit"
          class="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
        >
          {{ editingProduct ? 'Update' : 'Create' }}
        </button>
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue';

import { useConfigurationStore } from '../../stores/configuration';
import type { Product, ProductType } from '../../types';
import DataTable from '../common/DataTable.vue';
import Modal from '../common/Modal.vue';

const configStore = useConfigurationStore();
const showModal = ref(false);
const showCreateModal = ref(false);
const editingProduct = ref<Product | null>(null);

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
  { key: 'slug', label: 'Slug' },
];

onMounted(() => {
  configStore.fetchProducts();
});

function handleEdit(product: Product) {
  editingProduct.value = product;
  formData.type = product.type;
  formData.size = product.size;
  formData.colour = product.colour;
  formData.unit = product.unit;
  showModal.value = true;
}

function handleDelete(product: Product) {
  if (confirm(`Are you sure you want to delete product "${product.slug}"?`)) {
    configStore.deleteProduct(product.id);
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
  try {
    if (editingProduct.value) {
      await configStore.updateProduct(editingProduct.value.id, formData);
    } else {
      await configStore.createProduct(formData);
    }
    closeModal();
  } catch (error) {
    console.error('Failed to save product:', error);
  }
}

// Watch for create modal trigger
watch(showCreateModal, (val) => {
  if (val) {
    showModal.value = true;
    editingProduct.value = null;
    formData.type = 'preform';
    formData.size = 0;
    formData.colour = '';
    formData.unit = '';
  }
});
</script>
