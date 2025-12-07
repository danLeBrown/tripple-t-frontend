<template>
    <div>
        <div class="mb-6">
            <h1 class="text-3xl font-bold text-gray-900 mb-2">Third Parties</h1>
            <p class="text-gray-600">Manage suppliers and customers</p>
        </div>

        <div class="border-b border-gray-200">
            <nav class="-mb-px flex space-x-8">
                <router-link v-for="tab in tabs" :key="tab.id" :to="`/third-parties/${tab.id}`" :class="[
                    'py-4 px-1 border-b-2 font-medium text-sm transition-colors',
                    activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                ]">
                    {{ tab.label }}
                </router-link>
            </nav>
        </div>

        <div class="mt-6">
            <SuppliersTable v-if="activeTab === 'suppliers'" />
            <CustomersTable v-if="activeTab === 'customers'" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import CustomersTable from '../components/configuration/CustomersTable.vue';
import SuppliersTable from '../components/configuration/SuppliersTable.vue';

const route = useRoute();
const router = useRouter();

const tabs = [
    { id: 'suppliers', label: 'Suppliers' },
    { id: 'customers', label: 'Customers' },
];

const activeTab = computed(() => {
    const tab = route.params.tab;
    if (tab && typeof tab === 'string' && tabs.some((t) => t.id === tab)) {
        return tab;
    }
    return 'suppliers';
});

// Redirect to suppliers tab if no tab is specified
watch(
    () => route.path,
    (path) => {
        if (path === '/third-parties') {
            router.replace('/third-parties/suppliers');
        }
    },
    { immediate: true },
);
</script>
