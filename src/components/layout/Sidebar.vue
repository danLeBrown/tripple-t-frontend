<template>
  <aside class="w-64 bg-gray-900 text-white min-h-screen">
    <div class="p-6">
      <h1 class="text-2xl font-bold">Tripple T</h1>
      <p class="text-gray-400 text-sm mt-1">Dashboard</p>
    </div>
    <nav class="mt-8">
      <router-link
        to="/"
        class="block px-6 py-3 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
        active-class="bg-gray-800 text-white"
      >
        Dashboard
      </router-link>
      <div class="mt-4">
        <div
          class="px-6 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider"
        >
          Configuration
        </div>
        <router-link
          to="/configuration/products"
          class="block px-6 py-3 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
          active-class="bg-gray-800 text-white"
        >
          Products
        </router-link>
        <router-link
          to="/configuration/colors"
          class="block px-6 py-3 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
          active-class="bg-gray-800 text-white"
        >
          Colors
        </router-link>
        <router-link
          to="/configuration/sizes"
          class="block px-6 py-3 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
          active-class="bg-gray-800 text-white"
        >
          Sizes
        </router-link>
        <router-link
          to="/configuration/units"
          class="block px-6 py-3 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
          active-class="bg-gray-800 text-white"
        >
          Units
        </router-link>
        <router-link
          to="/configuration/suppliers"
          class="block px-6 py-3 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
          active-class="bg-gray-800 text-white"
        >
          Suppliers
        </router-link>
        <router-link
          to="/configuration/customers"
          class="block px-6 py-3 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
          active-class="bg-gray-800 text-white"
        >
          Customers
        </router-link>
      </div>
    </nav>
  </aside>
</template>

<script setup lang="ts"></script>
