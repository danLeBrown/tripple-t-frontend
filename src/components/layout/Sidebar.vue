<template>
  <aside class="w-64 bg-gray-900 text-white min-h-screen">
    <div class="p-6">
      <h1 class="text-2xl font-bold">Tripple T</h1>
      <p class="text-gray-400 text-sm mt-1">Dashboard</p>
    </div>
    <nav class="mt-8">
      <router-link
        to="/"
        class="flex items-center px-6 py-3 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
        active-class="bg-gray-800 text-white"
      >
        <HomeIcon class="w-5 h-5 mr-3" />
        Dashboard
      </router-link>

      <div class="mt-4">
        <button
          @click="isConfigurationOpen = !isConfigurationOpen"
          class="w-full flex items-center justify-between px-6 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider hover:bg-gray-800 transition-colors"
        >
          <div class="flex items-center">
            <Cog6ToothIcon class="w-4 h-4 mr-2" />
            Configuration
          </div>
          <ChevronDownIcon
            :class="[
              'w-4 h-4 transition-transform duration-200',
              isConfigurationOpen ? 'transform rotate-180' : '',
            ]"
          />
        </button>

        <Transition
          enter-active-class="transition-all duration-200 ease-out"
          enter-from-class="opacity-0 max-h-0"
          enter-to-class="opacity-100 max-h-96"
          leave-active-class="transition-all duration-200 ease-in"
          leave-from-class="opacity-100 max-h-96"
          leave-to-class="opacity-0 max-h-0"
        >
          <div v-show="isConfigurationOpen" class="overflow-hidden">
            <router-link
              to="/configuration/products"
              class="flex items-center px-6 py-3 pl-12 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
              active-class="bg-gray-800 text-white"
            >
              <CubeIcon class="w-5 h-5 mr-3" />
              Products
            </router-link>
            <router-link
              to="/configuration/colors"
              class="flex items-center px-6 py-3 pl-12 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
              active-class="bg-gray-800 text-white"
            >
              <SwatchIcon class="w-5 h-5 mr-3" />
              Colors
            </router-link>
            <router-link
              to="/configuration/sizes"
              class="flex items-center px-6 py-3 pl-12 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
              active-class="bg-gray-800 text-white"
            >
              <ArrowsPointingOutIcon class="w-5 h-5 mr-3" />
              Sizes
            </router-link>
            <router-link
              to="/configuration/units"
              class="flex items-center px-6 py-3 pl-12 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
              active-class="bg-gray-800 text-white"
            >
              <ScaleIcon class="w-5 h-5 mr-3" />
              Units
            </router-link>
            <router-link
              to="/configuration/suppliers"
              class="flex items-center px-6 py-3 pl-12 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
              active-class="bg-gray-800 text-white"
            >
              <TruckIcon class="w-5 h-5 mr-3" />
              Suppliers
            </router-link>
            <router-link
              to="/configuration/customers"
              class="flex items-center px-6 py-3 pl-12 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
              active-class="bg-gray-800 text-white"
            >
              <UserGroupIcon class="w-5 h-5 mr-3" />
              Customers
            </router-link>
          </div>
        </Transition>
      </div>
    </nav>
  </aside>
</template>

<script setup lang="ts">
import {
  ArrowsPointingOutIcon,
  ChevronDownIcon,
  Cog6ToothIcon,
  CubeIcon,
  HomeIcon,
  ScaleIcon,
  SwatchIcon,
  TruckIcon,
  UserGroupIcon,
} from '@heroicons/vue/24/outline';
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const isConfigurationOpen = ref(true);

// Auto-expand configuration section if we're on a configuration route
watch(
  () => route.path,
  (path) => {
    if (path.startsWith('/configuration')) {
      isConfigurationOpen.value = true;
    }
  },
  { immediate: true },
);
</script>
