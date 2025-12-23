<template>
  <div>
    <DataTable
      title="Bottle Production Records"
      :columns="columns"
      :data="bottleProductions"
      :loading="loading || isSubmitting"
      :error="error"
      :pagination="pagination"
      :search-query="searchQuery"
      :get-row-id="(row) => row.id"
      :show-actions="true"
      :show-edit="false"
      @create="showCreateModal = true"
      @delete="handleDeleteClick"
      @update:search-query="handleSearch"
      @prev-page="handlePrevPage"
      @next-page="handleNextPage"
    >
      <template #cell-supplier_name="{ value }">
        <span class="font-medium text-gray-900">{{ value }}</span>
      </template>
      <template #cell-preform_product="{ row }">
        <div class="flex items-center gap-2">
          <component
            :is="getProductTypeIcon('Preform')"
            class="w-5 h-5 shrink-0"
            :class="getProductTypeIconClass('Preform')"
          />
          <span class="text-sm text-gray-900">{{ row.preform_name }}</span>
        </div>
      </template>
      <template #cell-bottle_product="{ row }">
        <div class="flex items-center gap-2">
          <component
            :is="getProductTypeIcon('Bottle')"
            class="w-5 h-5 shrink-0"
            :class="getProductTypeIconClass('Bottle')"
          />
          <span class="text-sm text-gray-900">{{ row.bottle_name }}</span>
        </div>
      </template>
      <template #cell-preforms_used="{ row }">
        <div class="text-sm text-gray-600">
          <div>{{ row.preforms_used }} used</div>
          <div class="text-xs text-gray-500">
            {{ row.preforms_defective }} defective
          </div>
        </div>
      </template>
      <template #cell-bottles_produced="{ row }">
        <div class="text-sm text-gray-600">
          <div>{{ row.bottles_produced }} produced</div>
          <div class="text-xs text-gray-500">
            {{ row.bottles_defective }} defective
          </div>
        </div>
      </template>
      <template #cell-efficiency="{ row }">
        <span class="text-sm font-medium text-gray-900">
          {{
            row.preforms_used > 0
              ? ((row.bottles_successful / row.preforms_used) * 100).toFixed(1)
              : 0
          }}%
        </span>
      </template>
      <template #cell-produced_at="{ value }">
        {{ formatDate(value) }}
      </template>
    </DataTable>

    <!-- Create Bottle Production Modal -->
    <Modal
      :is-open="showCreateModal"
      title="Create Bottle Production Record"
      :show-footer="true"
      :is-submitting="isSubmitting"
      @close="closeModal"
      @confirm="handleSubmit"
    >
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Preform Supplier Selection -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2"
            >Preform Supplier *</label
          >
          <div class="relative">
            <input
              v-model="supplierSearchQuery"
              @input="searchSuppliers"
              @focus="showSupplierDropdown = true"
              type="text"
              placeholder="Search for a supplier..."
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
            <div
              v-if="searchingSuppliers"
              class="absolute right-3 top-1/2 transform -translate-y-1/2"
            >
              <div
                class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"
              ></div>
            </div>
            <div
              v-if="showSupplierDropdown && suppliers.length > 0"
              class="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
            >
              <button
                v-for="supplier in suppliers"
                :key="supplier.id"
                type="button"
                @click="selectSupplier(supplier)"
                class="w-full text-left px-4 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
              >
                <div class="font-medium text-gray-900">
                  {{ supplier.business_name }}
                </div>
                <div class="text-sm text-gray-500">
                  {{ supplier.contact_person_first_name }}
                  {{ supplier.contact_person_last_name }}
                </div>
              </button>
            </div>
          </div>
          <div
            v-if="selectedSupplier"
            class="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md"
          >
            <div class="flex items-center justify-between">
              <div>
                <div class="font-medium text-gray-900">
                  {{ selectedSupplier.business_name }}
                </div>
                <div class="text-sm text-gray-600">
                  {{ selectedSupplier.contact_person_first_name }}
                  {{ selectedSupplier.contact_person_last_name }}
                </div>
              </div>
              <button
                type="button"
                @click="selectedSupplier = null"
                class="text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            </div>
          </div>
        </div>

        <!-- Preform Section -->
        <div class="border-t border-gray-200 pt-4">
          <h3 class="text-sm font-medium text-gray-900 mb-4">Preform</h3>

          <!-- Preform Product Selection -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2"
              >Preform Product *</label
            >
            <div class="relative">
              <input
                v-model="preformProductSearch"
                @input="searchPreformProducts"
                @focus="showPreformProductDropdown = true"
                type="text"
                placeholder="Search for a preform product..."
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
              <div
                v-if="searchingPreformProducts"
                class="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                <div
                  class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"
                ></div>
              </div>
              <div
                v-if="showPreformProductDropdown && preformProducts.length > 0"
                class="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
              >
                <button
                  v-for="product in preformProducts"
                  :key="product.id"
                  type="button"
                  @click="selectPreformProduct(product)"
                  class="w-full text-left px-4 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none flex items-center gap-2"
                >
                  <component
                    :is="getProductTypeIcon(product.type)"
                    class="w-4 h-4 shrink-0"
                    :class="getProductTypeIconClass(product.type)"
                  />
                  <span>
                    {{
                      product.name ||
                      `${product.type} - ${product.size}${product.unit} (${product.colour})`
                    }}
                  </span>
                </button>
              </div>
            </div>
            <div
              v-if="selectedPreformProduct"
              class="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <component
                    :is="getProductTypeIcon(selectedPreformProduct.type)"
                    class="w-5 h-5 shrink-0"
                    :class="
                      getProductTypeIconClass(selectedPreformProduct.type)
                    "
                  />
                  <div>
                    <div class="font-medium text-gray-900">
                      {{
                        selectedPreformProduct.name ||
                        `${selectedPreformProduct.type} - ${selectedPreformProduct.size}${selectedPreformProduct.unit} (${selectedPreformProduct.colour})`
                      }}
                    </div>
                    <div class="text-sm text-gray-600">
                      Size: {{ selectedPreformProduct.size
                      }}{{ selectedPreformProduct.unit }}, Color:
                      {{ selectedPreformProduct.colour }}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  @click="removePreformProduct"
                  class="text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>

          <!-- Preform Details -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1"
                >Preform Size</label
              >
              <input
                v-model.number="preformSize"
                type="number"
                step="0.1"
                min="0"
                disabled
                class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed outline-none"
              />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1"
                >Preforms Used *</label
              >
              <input
                v-model.number="preformsUsed"
                type="number"
                min="1"
                step="1"
                required
                class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1"
                >Preforms Defective *</label
              >
              <input
                v-model.number="preformsDefective"
                type="number"
                min="0"
                step="1"
                required
                class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
            <div class="flex items-end">
              <div
                class="w-full p-2 bg-gray-50 border border-gray-200 rounded-md"
              >
                <div class="text-xs text-gray-600">Successful</div>
                <div class="text-sm font-medium text-gray-900">
                  {{ preformsSuccessful }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Bottle Section -->
        <div class="border-t border-gray-200 pt-4">
          <h3 class="text-sm font-medium text-gray-900 mb-4">Bottle</h3>

          <!-- Bottle Product Selection -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2"
              >Bottle Product *</label
            >
            <div class="relative">
              <input
                v-model="bottleProductSearch"
                @input="searchBottleProducts"
                @focus="showBottleProductDropdown = true"
                type="text"
                placeholder="Search for a bottle product..."
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
              <div
                v-if="searchingBottleProducts"
                class="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                <div
                  class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"
                ></div>
              </div>
              <div
                v-if="showBottleProductDropdown && bottleProducts.length > 0"
                class="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
              >
                <button
                  v-for="product in bottleProducts"
                  :key="product.id"
                  type="button"
                  @click="selectBottleProduct(product)"
                  class="w-full text-left px-4 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none flex items-center gap-2"
                >
                  <component
                    :is="getProductTypeIcon(product.type)"
                    class="w-4 h-4 shrink-0"
                    :class="getProductTypeIconClass(product.type)"
                  />
                  <span>
                    {{
                      product.name ||
                      `${product.type} - ${product.size}${product.unit} (${product.colour})`
                    }}
                  </span>
                </button>
              </div>
            </div>
            <div
              v-if="selectedBottleProduct"
              class="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <component
                    :is="getProductTypeIcon(selectedBottleProduct.type)"
                    class="w-5 h-5 shrink-0"
                    :class="getProductTypeIconClass(selectedBottleProduct.type)"
                  />
                  <div>
                    <div class="font-medium text-gray-900">
                      {{
                        selectedBottleProduct.name ||
                        `${selectedBottleProduct.type} - ${selectedBottleProduct.size}${selectedBottleProduct.unit} (${selectedBottleProduct.colour})`
                      }}
                    </div>
                    <div class="text-sm text-gray-600">
                      Size: {{ selectedBottleProduct.size
                      }}{{ selectedBottleProduct.unit }}, Color:
                      {{ selectedBottleProduct.colour }}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  @click="removeBottleProduct"
                  class="text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>

          <!-- Bottle Details -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1"
                >Bottle Size</label
              >
              <input
                v-model.number="bottleSize"
                type="number"
                step="0.1"
                min="0"
                disabled
                class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed outline-none"
              />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1"
                >Bottle Color</label
              >
              <input
                v-model="bottleColor"
                type="text"
                disabled
                class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed outline-none"
              />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1"
                >Bottles Produced *</label
              >
              <input
                v-model.number="bottlesProduced"
                type="number"
                min="0"
                step="1"
                required
                class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1"
                >Bottles Defective *</label
              >
              <input
                v-model.number="bottlesDefective"
                type="number"
                min="0"
                step="1"
                required
                class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
            <div class="flex items-end">
              <div
                class="w-full p-2 bg-gray-50 border border-gray-200 rounded-md"
              >
                <div class="text-xs text-gray-600">Successful</div>
                <div class="text-sm font-medium text-gray-900">
                  {{ bottlesSuccessful }}
                </div>
              </div>
            </div>
            <div class="flex items-end">
              <div
                class="w-full p-2 bg-gray-50 border border-gray-200 rounded-md"
              >
                <div class="text-xs text-gray-600">Efficiency</div>
                <div class="text-sm font-medium text-gray-900">
                  {{ efficiency }}%
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Production Date -->
        <div class="border-t border-gray-200 pt-4">
          <label class="block text-sm font-medium text-gray-700 mb-2"
            >Production Date *</label
          >
          <input
            v-model="producedAt"
            type="date"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>

        <!-- Notes -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2"
            >Notes (Optional)</label
          >
          <textarea
            v-model="notes"
            rows="3"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            placeholder="Add any additional notes about this production run..."
          ></textarea>
        </div>
      </form>
    </Modal>

    <!-- Delete Confirmation Modal -->
    <Modal
      :is-open="showDeleteModal"
      title="Delete Production Record"
      :show-footer="true"
      :is-submitting="isSubmitting"
      @close="closeDeleteModal"
      @confirm="confirmDelete"
    >
      <div class="space-y-4">
        <p class="text-gray-700">
          Are you sure you want to delete this production record? This action
          cannot be undone.
        </p>
        <div class="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <p class="text-sm text-yellow-800">
            <strong>Warning:</strong> Deleting this production record will
            reduce the available stock. Make sure this is the intended action.
          </p>
        </div>
        <div v-if="recordToDelete" class="text-sm text-gray-600">
          <p><strong>Preform:</strong> {{ recordToDelete.preform_name }}</p>
          <p><strong>Bottle:</strong> {{ recordToDelete.bottle_name }}</p>
          <p>
            <strong>Bottles Produced:</strong>
            {{ recordToDelete.bottles_produced }}
          </p>
          <p>
            <strong>Production Date:</strong>
            {{ formatDate(recordToDelete.produced_at) }}
          </p>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { format, fromUnixTime, getUnixTime } from 'date-fns';
import { computed, onMounted, ref } from 'vue';

import bottleProductionsService from '../../services/bottle-productions.service';
import productsService from '../../services/products.service';
import suppliersService from '../../services/suppliers.service';
import { useAlertStore } from '../../stores/alert';
import type {
  BottleProduction,
  CreateBottleProductionRequest,
  Product,
  Supplier,
} from '../../types';
import {
  getProductTypeIcon,
  getProductTypeIconClass,
} from '../../utils/product-types';
import DataTable from '../common/DataTable.vue';
import Modal from '../common/Modal.vue';

const alertStore = useAlertStore();

const bottleProductions = ref<BottleProduction[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const pagination = ref<{
  total: number;
  limit: number;
  page: number;
}>({
  total: 0,
  limit: 10,
  page: 0,
});
const searchQuery = ref('');
const isSubmitting = ref(false);
const showCreateModal = ref(false);
const showDeleteModal = ref(false);
const recordToDelete = ref<BottleProduction | null>(null);

// Form state
const selectedSupplier = ref<Supplier | null>(null);
const supplierSearchQuery = ref('');
const suppliers = ref<Supplier[]>([]);
const showSupplierDropdown = ref(false);
const searchingSuppliers = ref(false);

const preformProductSearch = ref('');
const preformProducts = ref<Product[]>([]);
const selectedPreformProduct = ref<Product | null>(null);
const showPreformProductDropdown = ref(false);
const searchingPreformProducts = ref(false);

const bottleProductSearch = ref('');
const bottleProducts = ref<Product[]>([]);
const selectedBottleProduct = ref<Product | null>(null);
const showBottleProductDropdown = ref(false);
const searchingBottleProducts = ref(false);

const producedAt = ref<string>('');
const preformSize = ref<number>(0);
const preformsUsed = ref<number>(0);
const preformsDefective = ref<number>(0);
const bottleSize = ref<number>(0);
const bottleColor = ref<string>('');
const bottlesProduced = ref<number>(0);
const bottlesDefective = ref<number>(0);
const notes = ref<string>('');

const columns = [
  { key: 'supplier_name', label: 'Supplier' },
  { key: 'preform_product', label: 'Preform Product' },
  { key: 'bottle_product', label: 'Bottle Product' },
  { key: 'preforms_used', label: 'Preforms' },
  { key: 'bottles_produced', label: 'Bottles' },
  { key: 'efficiency', label: 'Efficiency' },
  { key: 'produced_at', label: 'Production Date' },
];

const preformsSuccessful = computed(() => {
  return Math.max(0, preformsUsed.value - preformsDefective.value);
});

const bottlesSuccessful = computed(() => {
  return Math.max(0, bottlesProduced.value - bottlesDefective.value);
});

const efficiency = computed(() => {
  if (preformsUsed.value === 0) return 0;
  return ((bottlesSuccessful.value / preformsUsed.value) * 100).toFixed(1);
});

async function fetchBottleProductions() {
  loading.value = true;
  error.value = null;

  try {
    const response = await bottleProductionsService.search({
      query: searchQuery.value || undefined,
      page: pagination.value.page,
      limit: pagination.value.limit,
    });

    bottleProductions.value = response.data;
    pagination.value = {
      total: response.total,
      limit: response.limit,
      page: response.page,
    };
  } catch (err: any) {
    error.value =
      err.response?.data?.message ||
      'Failed to fetch bottle production records. Please try again.';
    console.error('Error fetching bottle production records:', err);
  } finally {
    loading.value = false;
  }
}

function handleSearch(query: string) {
  searchQuery.value = query;
  pagination.value.page = 0;
  fetchBottleProductions();
}

function handlePrevPage() {
  if (pagination.value.page > 0) {
    pagination.value.page--;
    fetchBottleProductions();
  }
}

function handleNextPage() {
  if (
    (pagination.value.page + 1) * pagination.value.limit <
    pagination.value.total
  ) {
    pagination.value.page++;
    fetchBottleProductions();
  }
}

// Supplier search
let supplierSearchTimeout: ReturnType<typeof setTimeout> | null = null;

async function searchSuppliers() {
  if (supplierSearchTimeout) {
    clearTimeout(supplierSearchTimeout);
  }

  supplierSearchTimeout = setTimeout(async () => {
    if (!supplierSearchQuery.value.trim()) {
      suppliers.value = [];
      searchingSuppliers.value = false;
      return;
    }

    searchingSuppliers.value = true;
    try {
      const response = await suppliersService.search({
        query: supplierSearchQuery.value,
        limit: 10,
      });
      suppliers.value = response.data;
    } catch (err) {
      console.error('Error searching suppliers:', err);
      suppliers.value = [];
    } finally {
      searchingSuppliers.value = false;
    }
  }, 300);
}

function selectSupplier(supplier: Supplier) {
  selectedSupplier.value = supplier;
  supplierSearchQuery.value = '';
  suppliers.value = [];
  showSupplierDropdown.value = false;
}

// Preform product search
let preformProductSearchTimeout: ReturnType<typeof setTimeout> | null = null;

async function searchPreformProducts() {
  if (preformProductSearchTimeout) {
    clearTimeout(preformProductSearchTimeout);
  }

  preformProductSearchTimeout = setTimeout(async () => {
    if (!preformProductSearch.value.trim()) {
      preformProducts.value = [];
      searchingPreformProducts.value = false;
      return;
    }

    searchingPreformProducts.value = true;
    try {
      const response = await productsService.search({
        query: preformProductSearch.value,
        limit: 100,
      });
      // Filter to only show Preform products
      preformProducts.value = response.data.filter((p) => p.type === 'Preform');
    } catch (err) {
      console.error('Error searching preform products:', err);
      preformProducts.value = [];
    } finally {
      searchingPreformProducts.value = false;
    }
  }, 300);
}

function selectPreformProduct(product: Product) {
  selectedPreformProduct.value = product;
  preformProductSearch.value = '';
  preformProducts.value = [];
  showPreformProductDropdown.value = false;
  // Auto-fill preform size from selected product
  preformSize.value = product.size || 0;
}

function removePreformProduct() {
  selectedPreformProduct.value = null;
  preformSize.value = 0;
}

// Bottle product search
let bottleProductSearchTimeout: ReturnType<typeof setTimeout> | null = null;

async function searchBottleProducts() {
  if (bottleProductSearchTimeout) {
    clearTimeout(bottleProductSearchTimeout);
  }

  bottleProductSearchTimeout = setTimeout(async () => {
    if (!bottleProductSearch.value.trim()) {
      bottleProducts.value = [];
      searchingBottleProducts.value = false;
      return;
    }

    searchingBottleProducts.value = true;
    try {
      const response = await productsService.search({
        query: bottleProductSearch.value,
        limit: 100,
      });
      // Filter to only show Bottle products
      bottleProducts.value = response.data.filter((p) => p.type === 'Bottle');
    } catch (err) {
      console.error('Error searching bottle products:', err);
      bottleProducts.value = [];
    } finally {
      searchingBottleProducts.value = false;
    }
  }, 300);
}

function selectBottleProduct(product: Product) {
  selectedBottleProduct.value = product;
  bottleProductSearch.value = '';
  bottleProducts.value = [];
  showBottleProductDropdown.value = false;
  // Auto-fill bottle size and color from selected product
  bottleSize.value = product.size || 0;
  bottleColor.value = product.colour || '';
}

function removeBottleProduct() {
  selectedBottleProduct.value = null;
  bottleSize.value = 0;
  bottleColor.value = '';
}

async function handleSubmit() {
  if (!selectedSupplier.value) {
    alertStore.error('Please select a preform supplier');
    return;
  }

  if (!selectedPreformProduct.value) {
    alertStore.error('Please select a preform product');
    return;
  }

  if (!selectedBottleProduct.value) {
    alertStore.error('Please select a bottle product');
    return;
  }

  if (!preformsUsed.value || preformsUsed.value <= 0) {
    alertStore.error('Please enter a valid number of preforms used');
    return;
  }

  if (preformsDefective.value < 0) {
    alertStore.error('Preforms defective cannot be negative');
    return;
  }

  if (preformsDefective.value > preformsUsed.value) {
    alertStore.error('Preforms defective cannot exceed preforms used');
    return;
  }

  if (bottlesProduced.value < 0) {
    alertStore.error('Bottles produced cannot be negative');
    return;
  }

  if (bottlesDefective.value < 0) {
    alertStore.error('Bottles defective cannot be negative');
    return;
  }

  if (bottlesDefective.value > bottlesProduced.value) {
    alertStore.error('Bottles defective cannot exceed bottles produced');
    return;
  }

  if (!producedAt.value) {
    alertStore.error('Please select a production date');
    return;
  }

  isSubmitting.value = true;

  try {
    const requestBody: CreateBottleProductionRequest = {
      preform_supplier_id: selectedSupplier.value.id,
      preform_product_id: selectedPreformProduct.value.id,
      bottle_product_id: selectedBottleProduct.value.id,
      preform_size: preformSize.value || selectedPreformProduct.value.size || 0,
      preforms_used: preformsUsed.value,
      preforms_defective: preformsDefective.value,
      bottle_size: bottleSize.value || selectedBottleProduct.value.size || 0,
      bottle_color:
        bottleColor.value || selectedBottleProduct.value.colour || '',
      bottles_produced: bottlesProduced.value,
      bottles_defective: bottlesDefective.value,
      produced_at: getUnixTime(new Date(producedAt.value)),
      notes: notes.value.trim() || undefined,
    };

    await bottleProductionsService.create(requestBody);

    alertStore.success('Bottle production record created successfully');
    closeModal();
    await fetchBottleProductions();
  } catch (err: any) {
    alertStore.error(
      err.response?.data?.message ||
        'Failed to create bottle production record. Please try again.',
    );
  } finally {
    isSubmitting.value = false;
  }
}

function closeModal() {
  showCreateModal.value = false;
  selectedSupplier.value = null;
  supplierSearchQuery.value = '';
  suppliers.value = [];
  selectedPreformProduct.value = null;
  preformProductSearch.value = '';
  preformProducts.value = [];
  selectedBottleProduct.value = null;
  bottleProductSearch.value = '';
  bottleProducts.value = [];
  producedAt.value = '';
  preformSize.value = 0;
  preformsUsed.value = 0;
  preformsDefective.value = 0;
  bottleSize.value = 0;
  bottleColor.value = '';
  bottlesProduced.value = 0;
  bottlesDefective.value = 0;
  notes.value = '';
}

function handleDeleteClick(record: BottleProduction) {
  recordToDelete.value = record;
  showDeleteModal.value = true;
}

function closeDeleteModal() {
  showDeleteModal.value = false;
  recordToDelete.value = null;
}

async function confirmDelete() {
  if (!recordToDelete.value) {
    return;
  }

  isSubmitting.value = true;

  try {
    await bottleProductionsService.delete(recordToDelete.value.id);
    alertStore.success('Bottle production record deleted successfully');
    closeDeleteModal();
    await fetchBottleProductions();
  } catch (err: any) {
    alertStore.error(
      err.response?.data?.message ||
        'Failed to delete bottle production record. Please try again.',
    );
  } finally {
    isSubmitting.value = false;
  }
}

function formatDate(timestamp: number): string {
  const date = fromUnixTime(timestamp);
  return format(date, 'MMM dd, yyyy');
}

onMounted(() => {
  fetchBottleProductions();
});
</script>
