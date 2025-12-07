<template>
  <div>
    <DataTable title="Customers" :columns="columns" :data="configStore.customers" :loading="configStore.loading"
      :error="configStore.error" :get-row-id="(row) => row.id" @create="showCreateModal = true" @edit="handleEdit"
      @delete="handleDelete" />
    <Modal :is-open="showModal" :title="editingCustomer ? 'Edit Customer' : 'Create Customer'" :show-footer="true"
      @close="closeModal">
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">First Name</label>
            <input v-model="formData.first_name" type="text" required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
            <input v-model="formData.last_name" type="text" required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input v-model="formData.email" type="email" required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
          <input v-model="formData.phone_number" type="tel" required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select v-model="formData.status" required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none">
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending">Pending</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Address</label>
          <textarea v-model="formData.address" rows="3" required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"></textarea>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">State</label>
          <input v-model="formData.state" type="text" required
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
          {{ editingCustomer ? 'Update' : 'Create' }}
        </button>
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue';

import { useAlertStore } from '../../stores/alert';
import { useConfigurationStore } from '../../stores/configuration';
import type { Customer, CustomerStatus } from '../../types';
import DataTable from '../common/DataTable.vue';
import Modal from '../common/Modal.vue';

const configStore = useConfigurationStore();
const alertStore = useAlertStore();
const showModal = ref(false);
const showCreateModal = ref(false);
const editingCustomer = ref<Customer | null>(null);

const formData = reactive({
  first_name: '',
  last_name: '',
  email: '',
  phone_number: '',
  status: 'active' as CustomerStatus,
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
  configStore.fetchCustomers();
});

function handleEdit(customer: Customer) {
  editingCustomer.value = customer;
  formData.first_name = customer.first_name;
  formData.last_name = customer.last_name;
  formData.email = customer.email;
  formData.phone_number = customer.phone_number;
  formData.status = customer.status;
  formData.address = customer.address;
  formData.state = customer.state;
  showModal.value = true;
}

function handleDelete(customer: Customer) {
  if (
    confirm(
      `Are you sure you want to delete "${customer.first_name} ${customer.last_name}"?`,
    )
  ) {
    configStore.deleteCustomer(customer.id);
    alertStore.success('Customer deleted successfully');
  }
}

function closeModal() {
  showModal.value = false;
  showCreateModal.value = false;
  editingCustomer.value = null;
  formData.first_name = '';
  formData.last_name = '';
  formData.email = '';
  formData.phone_number = '';
  formData.status = 'active';
  formData.address = '';
  formData.state = '';
}

async function handleSubmit() {
  try {
    if (editingCustomer.value) {
      await configStore.updateCustomer(editingCustomer.value.id, formData);
      alertStore.success('Customer updated successfully');
    } else {
      await configStore.createCustomer(formData);
      alertStore.success('Customer created successfully');
    }
    closeModal();
  } catch (error) {
    // Error alert is handled by API interceptor
    console.error('Failed to save customer:', error);
  }
}

watch(showCreateModal, (val) => {
  if (val) {
    showModal.value = true;
    editingCustomer.value = null;
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
