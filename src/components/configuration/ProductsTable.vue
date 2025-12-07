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
          <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input
            v-model="formData.name"
            type="text"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Type</label>
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
import { ref, reactive, onMounted, watch } from 'vue';
import DataTable from '../common/DataTable.vue';
import Modal from '../common/Modal.vue';
import { useConfigurationStore } from '../../stores/configuration';
import type { Product, ProductType } from '../../types';

const configStore = useConfigurationStore();
const showModal = ref(false);
const showCreateModal = ref(false);
const editingProduct = ref<Product | null>(null);

const formData = reactive({
  name: '',
  type: 'preform' as ProductType,
});

const columns = [
  { key: 'name', label: 'Name' },
  { key: 'type', label: 'Type', format: (value: ProductType) => value.charAt(0).toUpperCase() + value.slice(1) },
];

onMounted(() => {
  configStore.fetchProducts();
});

function handleEdit(product: Product) {
  editingProduct.value = product;
  formData.name = product.name;
  formData.type = product.type;
  showModal.value = true;
}

function handleDelete(product: Product) {
  if (confirm(`Are you sure you want to delete "${product.name}"?`)) {
    configStore.deleteProduct(product.id);
  }
}

function closeModal() {
  showModal.value = false;
  showCreateModal.value = false;
  editingProduct.value = null;
  formData.name = '';
  formData.type = 'preform';
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
    formData.name = '';
    formData.type = 'preform';
  }
});
</script>

