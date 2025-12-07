<template>
  <div>
    <h1 class="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-2">Products</h3>
        <p class="text-3xl font-bold text-blue-600">{{ productCount }}</p>
      </div>
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-2">Suppliers</h3>
        <p class="text-3xl font-bold text-green-600">{{ supplierCount }}</p>
      </div>
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-2">Customers</h3>
        <p class="text-3xl font-bold text-purple-600">{{ customerCount }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import { useConfigurationStore } from '../stores/configuration';

const configStore = useConfigurationStore();

const productCount = computed(() => configStore.products.length);
const supplierCount = computed(() => configStore.suppliers.length);
const customerCount = computed(() => configStore.customers.length);
</script>
