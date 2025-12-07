<template>
  <div>
    <DataTable title="Colors" :columns="columns" :data="configStore.colors" :loading="configStore.loading"
      :error="configStore.error" :get-row-id="(row) => row.id" @create="showCreateModal = true" @edit="handleEdit"
      @delete="handleDelete" />
    <Modal :is-open="showModal" :title="editingColor ? 'Edit Color' : 'Create Color'" :show-footer="true"
      @close="closeModal">
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input v-model="formData.name" type="text" required
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
          {{ editingColor ? 'Update' : 'Create' }}
        </button>
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue';

import { useAlertStore } from '../../stores/alert';
import { useConfigurationStore } from '../../stores/configuration';
import type { Colour } from '../../types';
import DataTable from '../common/DataTable.vue';
import Modal from '../common/Modal.vue';

const configStore = useConfigurationStore();
const alertStore = useAlertStore();
const showModal = ref(false);
const showCreateModal = ref(false);
const editingColor = ref<Colour | null>(null);

const formData = reactive({
  name: '',
});

const columns = [{ key: 'name', label: 'Name' }];

onMounted(() => {
  configStore.fetchColors();
});

function handleEdit(colour: Colour) {
  editingColor.value = colour;
  formData.name = colour.name;
  showModal.value = true;
}

function handleDelete(colour: Colour) {
  if (confirm(`Are you sure you want to delete "${colour.name}"?`)) {
    configStore.deleteColor(colour.id);
    alertStore.success('Color deleted successfully');
  }
}

function closeModal() {
  showModal.value = false;
  showCreateModal.value = false;
  editingColor.value = null;
  formData.name = '';
}

async function handleSubmit() {
  try {
    if (editingColor.value) {
      await configStore.updateColor(editingColor.value.id, formData);
      alertStore.success('Color updated successfully');
    } else {
      await configStore.createColor(formData);
      alertStore.success('Color created successfully');
    }
    closeModal();
  } catch (error) {
    // Error alert is handled by API interceptor
    console.error('Failed to save color:', error);
  }
}

watch(showCreateModal, (val) => {
  if (val) {
    showModal.value = true;
    editingColor.value = null;
    formData.name = '';
  }
});
</script>
