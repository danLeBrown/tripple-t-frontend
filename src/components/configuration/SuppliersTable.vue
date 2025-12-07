<template>
  <div>
    <DataTable
      title="Suppliers"
      :columns="columns"
      :data="configStore.suppliers"
      :loading="configStore.loading"
      :error="configStore.error"
      :get-row-id="(row) => row.id"
      @create="showCreateModal = true"
      @edit="handleEdit"
      @delete="handleDelete"
    />
    <Modal
      :is-open="showModal"
      :title="editingSupplier ? 'Edit Supplier' : 'Create Supplier'"
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
          <label class="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
          <input
            v-model="formData.contact_person"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            v-model="formData.email"
            type="email"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Phone</label>
          <input
            v-model="formData.phone"
            type="tel"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Address</label>
          <textarea
            v-model="formData.address"
            rows="3"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          ></textarea>
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
          {{ editingSupplier ? 'Update' : 'Create' }}
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
import type { Supplier } from '../../types';

const configStore = useConfigurationStore();
const showModal = ref(false);
const showCreateModal = ref(false);
const editingSupplier = ref<Supplier | null>(null);

const formData = reactive({
  name: '',
  contact_person: '',
  email: '',
  phone: '',
  address: '',
});

const columns = [
  { key: 'name', label: 'Name' },
  { key: 'contact_person', label: 'Contact Person' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone' },
];

onMounted(() => {
  configStore.fetchSuppliers();
});

function handleEdit(supplier: Supplier) {
  editingSupplier.value = supplier;
  formData.name = supplier.name;
  formData.contact_person = supplier.contact_person || '';
  formData.email = supplier.email || '';
  formData.phone = supplier.phone || '';
  formData.address = supplier.address || '';
  showModal.value = true;
}

function handleDelete(supplier: Supplier) {
  if (confirm(`Are you sure you want to delete "${supplier.name}"?`)) {
    configStore.deleteSupplier(supplier.id);
  }
}

function closeModal() {
  showModal.value = false;
  showCreateModal.value = false;
  editingSupplier.value = null;
  formData.name = '';
  formData.contact_person = '';
  formData.email = '';
  formData.phone = '';
  formData.address = '';
}

async function handleSubmit() {
  try {
    if (editingSupplier.value) {
      await configStore.updateSupplier(editingSupplier.value.id, formData);
    } else {
      await configStore.createSupplier(formData);
    }
    closeModal();
  } catch (error) {
    console.error('Failed to save supplier:', error);
  }
}

watch(showCreateModal, (val) => {
  if (val) {
    showModal.value = true;
    editingSupplier.value = null;
    formData.name = '';
    formData.contact_person = '';
    formData.email = '';
    formData.phone = '';
    formData.address = '';
  }
});
</script>

