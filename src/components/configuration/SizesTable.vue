<template>
  <div>
    <DataTable
      title="Sizes"
      :columns="columns"
      :data="configStore.sizes"
      :loading="configStore.loading"
      :error="configStore.error"
      :get-row-id="(row) => row.id"
      @create="showCreateModal = true"
      @edit="handleEdit"
      @delete="handleDelete"
    />
    <Modal
      :is-open="showModal"
      :title="editingSize ? 'Edit Size' : 'Create Size'"
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
          <label class="block text-sm font-medium text-gray-700 mb-1">Value</label>
          <input
            v-model.number="formData.value"
            type="number"
            step="0.01"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Unit</label>
          <input
            v-model="formData.unit"
            type="text"
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
          {{ editingSize ? 'Update' : 'Create' }}
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
import type { Size } from '../../types';

const configStore = useConfigurationStore();
const showModal = ref(false);
const showCreateModal = ref(false);
const editingSize = ref<Size | null>(null);

const formData = reactive({
  name: '',
  value: undefined as number | undefined,
  unit: '',
});

const columns = [
  { key: 'name', label: 'Name' },
  { key: 'value', label: 'Value' },
  { key: 'unit', label: 'Unit' },
];

onMounted(() => {
  configStore.fetchSizes();
});

function handleEdit(size: Size) {
  editingSize.value = size;
  formData.name = size.name;
  formData.value = size.value;
  formData.unit = size.unit || '';
  showModal.value = true;
}

function handleDelete(size: Size) {
  if (confirm(`Are you sure you want to delete "${size.name}"?`)) {
    configStore.deleteSize(size.id);
  }
}

function closeModal() {
  showModal.value = false;
  showCreateModal.value = false;
  editingSize.value = null;
  formData.name = '';
  formData.value = undefined;
  formData.unit = '';
}

async function handleSubmit() {
  try {
    const payload: any = { name: formData.name };
    if (formData.value !== undefined) payload.value = formData.value;
    if (formData.unit) payload.unit = formData.unit;

    if (editingSize.value) {
      await configStore.updateSize(editingSize.value.id, payload);
    } else {
      await configStore.createSize(payload);
    }
    closeModal();
  } catch (error) {
    console.error('Failed to save size:', error);
  }
}

watch(showCreateModal, (val) => {
  if (val) {
    showModal.value = true;
    editingSize.value = null;
    formData.name = '';
    formData.value = undefined;
    formData.unit = '';
  }
});
</script>

