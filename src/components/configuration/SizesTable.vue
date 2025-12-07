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
      :show-footer="true"
      @close="closeModal"
    >
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1"
            >Value</label
          >
          <input
            v-model.number="formData.value"
            type="number"
            required
            step="0.01"
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
import { onMounted, reactive, ref, watch } from 'vue';

import { useAlertStore } from '../../stores/alert';
import { useConfigurationStore } from '../../stores/configuration';
import type { Size } from '../../types';
import DataTable from '../common/DataTable.vue';
import Modal from '../common/Modal.vue';

const configStore = useConfigurationStore();
const alertStore = useAlertStore();
const showModal = ref(false);
const showCreateModal = ref(false);
const editingSize = ref<Size | null>(null);

const formData = reactive({
  value: 0,
});

const columns = [{ key: 'value', label: 'Value' }];

onMounted(() => {
  configStore.fetchSizes();
});

function handleEdit(size: Size) {
  editingSize.value = size;
  formData.value = size.value;
  showModal.value = true;
}

function handleDelete(size: Size) {
  if (
    confirm(`Are you sure you want to delete size with value "${size.value}"?`)
  ) {
    configStore.deleteSize(size.id);
    alertStore.success('Size deleted successfully');
  }
}

function closeModal() {
  showModal.value = false;
  showCreateModal.value = false;
  editingSize.value = null;
  formData.value = 0;
}

async function handleSubmit() {
  try {
    if (editingSize.value) {
      await configStore.updateSize(editingSize.value.id, formData);
      alertStore.success('Size updated successfully');
    } else {
      await configStore.createSize(formData);
      alertStore.success('Size created successfully');
    }
    closeModal();
  } catch (error) {
    // Error alert is handled by API interceptor
    console.error('Failed to save size:', error);
  }
}

watch(showCreateModal, (val) => {
  if (val) {
    showModal.value = true;
    editingSize.value = null;
    formData.value = 0;
  }
});
</script>
