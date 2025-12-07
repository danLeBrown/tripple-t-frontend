<template>
  <div>
    <DataTable title="Units" :columns="columns" :data="configStore.units" :loading="configStore.loading"
      :error="configStore.error" :get-row-id="(row) => row.id" @create="showCreateModal = true" @edit="handleEdit"
      @delete="handleDelete" />
    <Modal :is-open="showModal" :title="editingUnit ? 'Edit Unit' : 'Create Unit'" :show-footer="true"
      @close="closeModal">
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input v-model="formData.name" type="text" required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Symbol</label>
          <input v-model="formData.symbol" type="text"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
        </div>
      </form>
      <template #footer>
        <button type="button" @click="closeModal"
          class="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors">
          Cancel
        </button>
        <button type="button" @click="handleSubmit"
          class="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors">
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
