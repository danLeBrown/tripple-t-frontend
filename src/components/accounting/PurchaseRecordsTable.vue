<template>
  <div>
    <DataTable
      title="Purchase Records"
      :columns="columns"
      :data="purchaseRecords"
      :loading="loading || isSubmitting"
      :error="error"
      :pagination="pagination"
      :search-query="searchQuery"
      :get-row-id="(row) => row.id"
      :show-actions="false"
      @create="showCreateModal = true"
      @update:search-query="handleSearch"
      @prev-page="handlePrevPage"
      @next-page="handleNextPage"
    >
      <template #cell-supplier_name="{ value }">
        <span class="font-medium text-gray-900">{{ value }}</span>
      </template>
      <template #cell-product="{ row }">
        <div class="flex items-center gap-2">
          <component
            :is="getProductTypeIcon(row.product_type)"
            class="w-5 h-5 shrink-0"
            :class="getProductTypeIconClass(row.product_type)"
          />
          <span class="text-sm text-gray-900">{{ row.product_name }}</span>
        </div>
      </template>
      <template #cell-quantity_in_bags="{ value }">
        <span class="text-sm text-gray-600">{{ value }} bags</span>
      </template>
      <template #cell-price_per_bag="{ value }">
        <span class="text-sm text-gray-600">₦{{ value.toLocaleString() }}</span>
      </template>
      <template #cell-total_price="{ value }">
        <span class="font-medium text-gray-900"
          >₦{{ value.toLocaleString() }}</span
        >
      </template>
      <template #cell-purchased_at="{ value }">
        {{ formatDate(value) }}
      </template>
      <template #cell-upload="{ row }">
        <button
          v-if="row.upload"
          @click="viewUpload(row.upload)"
          class="text-blue-600 hover:text-blue-800 underline flex items-center gap-1 text-sm"
        >
          <svg
            class="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </svg>
          View Invoice
        </button>
        <span v-else class="text-sm text-gray-400">No invoice</span>
      </template>
    </DataTable>

    <!-- Create Purchase Records Modal -->
    <Modal
      :is-open="showCreateModal"
      title="Create Purchase Records"
      :show-footer="true"
      :is-submitting="isSubmitting"
      @close="closeModal"
      @confirm="handleSubmit"
    >
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Supplier Selection -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2"
            >Supplier *</label
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

        <!-- Upload Selection (Optional) -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2"
            >Invoice Document (Optional)</label
          >
          <div class="space-y-3">
            <div class="flex gap-2">
              <button
                type="button"
                @click="uploadMode = 'new'"
                :class="[
                  'flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors',
                  uploadMode === 'new'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
                ]"
              >
                Upload New
              </button>
              <button
                type="button"
                @click="uploadMode = 'existing'"
                :class="[
                  'flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors',
                  uploadMode === 'existing'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
                ]"
              >
                Use Existing
              </button>
            </div>

            <!-- New Upload -->
            <div v-if="uploadMode === 'new'">
              <Upload v-model="newUploadKey" @uploaded="handleUploaded" />
            </div>

            <!-- Existing Upload -->
            <div v-else-if="uploadMode === 'existing'">
              <div class="relative">
                <input
                  v-model="uploadSearchQuery"
                  @input="searchUploads"
                  @focus="showUploadDropdown = true"
                  type="text"
                  placeholder="Search for an upload..."
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
                <div
                  v-if="searchingUploads"
                  class="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  <div
                    class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"
                  ></div>
                </div>
                <div
                  v-if="showUploadDropdown && availableUploads.length > 0"
                  class="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
                >
                  <button
                    v-for="upload in availableUploads"
                    :key="upload.id"
                    type="button"
                    @click="selectUpload(upload)"
                    class="w-full text-left px-4 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                  >
                    <div class="font-medium text-gray-900">
                      {{ upload.name }}
                    </div>
                    <div class="text-sm text-gray-500">
                      {{ formatFileSize(upload.file_size) }}
                    </div>
                  </button>
                </div>
              </div>
              <div
                v-if="selectedUpload"
                class="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md"
              >
                <div class="flex items-center justify-between">
                  <div>
                    <div class="font-medium text-gray-900">
                      {{ selectedUpload.name }}
                    </div>
                    <div class="text-sm text-gray-600">
                      {{ formatFileSize(selectedUpload.file_size) }}
                    </div>
                  </div>
                  <button
                    type="button"
                    @click="selectedUpload = null"
                    class="text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Purchase Date -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2"
            >Purchase Date *</label
          >
          <input
            v-model="purchasedAt"
            type="date"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>

        <!-- Purchase Records -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-3"
            >Purchase Records *</label
          >

          <div class="space-y-4">
            <div
              v-for="(record, index) in purchaseRecordsForm"
              :key="index"
              class="p-4 border border-gray-300 rounded-lg space-y-3"
            >
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm font-medium text-gray-700"
                  >Record {{ index + 1 }}</span
                >
                <button
                  type="button"
                  @click="removePurchaseRecord(index)"
                  class="text-red-600 hover:text-red-800 text-sm"
                >
                  Remove
                </button>
              </div>

              <!-- Product Selection -->
              <div>
                <label class="block text-xs font-medium text-gray-600 mb-1"
                  >Product *</label
                >
                <div class="relative">
                  <input
                    v-model="record.productSearch"
                    @input="searchProducts(record, index)"
                    @focus="record.showProductDropdown = true"
                    type="text"
                    placeholder="Search for a product..."
                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                  <div
                    v-if="record.searchingProducts"
                    class="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    <div
                      class="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"
                    ></div>
                  </div>
                  <div
                    v-if="
                      record.showProductDropdown && record.products.length > 0
                    "
                    class="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
                  >
                    <button
                      v-for="product in record.products"
                      :key="product.id"
                      type="button"
                      @click="selectProduct(record, product)"
                      class="w-full text-left px-4 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none text-sm flex items-center gap-2"
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
                  v-if="record.product"
                  class="mt-1 text-xs text-gray-600 flex items-center gap-2"
                >
                  <component
                    :is="getProductTypeIcon(record.product.type)"
                    class="w-4 h-4 shrink-0"
                    :class="getProductTypeIconClass(record.product.type)"
                  />
                  <span>
                    Selected:
                    {{
                      record.product.name ||
                      `${record.product.type} - ${record.product.size}${record.product.unit} (${record.product.colour})`
                    }}
                  </span>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <!-- Quantity -->
                <div>
                  <label class="block text-xs font-medium text-gray-600 mb-1"
                    >Quantity (bags) *</label
                  >
                  <input
                    v-model.number="record.quantity_in_bags"
                    type="number"
                    min="1"
                    step="1"
                    required
                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>

                <!-- Price per bag -->
                <div>
                  <label class="block text-xs font-medium text-gray-600 mb-1"
                    >Price per bag (₦) *</label
                  >
                  <div class="relative">
                    <div
                      class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                    >
                      <span class="text-gray-500 text-xs">₦</span>
                    </div>
                    <input
                      v-model="record.price_per_bag_display"
                      @input="handlePriceInput(record, $event)"
                      type="text"
                      required
                      class="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

              <!-- Total -->
              <div
                v-if="record.quantity_in_bags && record.price_per_bag"
                class="text-sm text-gray-600"
              >
                Total: ₦{{
                  (
                    record.quantity_in_bags * record.price_per_bag
                  ).toLocaleString()
                }}
              </div>
            </div>

            <div
              v-if="purchaseRecordsForm.length === 0"
              class="text-center py-8 text-gray-500 text-sm"
            >
              No purchase records added. Click "Add Record" to get started.
            </div>

            <!-- Add Record Button (at bottom of last record) -->
            <div class="pt-2">
              <button
                type="button"
                @click="addPurchaseRecord"
                ref="addRecordButtonRef"
                class="w-full px-4 py-2 text-sm text-blue-600 hover:text-blue-800 font-medium border-2 border-dashed border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
              >
                + Add Record
              </button>
            </div>
          </div>

          <!-- Total Amount Display -->
          <div
            v-if="purchaseRecordsForm.length > 0"
            class="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg"
          >
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium text-gray-700"
                >Total Amount:</span
              >
              <span class="text-lg font-bold text-gray-900">
                ₦{{ formatCurrency(totalAmount) }}
              </span>
            </div>
          </div>
        </div>
      </form>
    </Modal>

    <!-- View Upload Modal -->
    <ViewUploadModal
      :is-open="showViewModal"
      :upload="viewingUpload"
      @close="showViewModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { format, fromUnixTime, getUnixTime } from 'date-fns';
import { computed, onMounted, ref } from 'vue';

import productsService from '../../services/products.service';
import purchaseRecordsService from '../../services/purchase-records.service';
import suppliersService from '../../services/suppliers.service';
import uploadsService from '../../services/uploads.service';
import { useAlertStore } from '../../stores/alert';
import type {
  CreatePurchaseRecordsRequest,
  Product,
  PurchaseRecord,
  Supplier,
  Upload as UploadType,
} from '../../types';
import {
  getProductTypeIcon,
  getProductTypeIconClass,
} from '../../utils/product-types';
import DataTable from '../common/DataTable.vue';
import Modal from '../common/Modal.vue';
import Upload from '../common/Upload.vue';
import ViewUploadModal from '../common/ViewUploadModal.vue';

const alertStore = useAlertStore();

const purchaseRecords = ref<PurchaseRecord[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const pagination = ref<{
  total: number;
  limit: number;
  page: number;
} | null>(null);
const searchQuery = ref('');
const isSubmitting = ref(false);
const showCreateModal = ref(false);
const showViewModal = ref(false);
const viewingUpload = ref<UploadType | null>(null);

// Form state
const selectedSupplier = ref<Supplier | null>(null);
const supplierSearchQuery = ref('');
const suppliers = ref<Supplier[]>([]);
const showSupplierDropdown = ref(false);
const searchingSuppliers = ref(false);

const uploadMode = ref<'new' | 'existing' | null>(null);
const newUploadKey = ref<string | undefined>(undefined);
const newUploadId = ref<string | undefined>(undefined);
const uploadSearchQuery = ref('');
const availableUploads = ref<UploadType[]>([]);
const selectedUpload = ref<UploadType | null>(null);
const showUploadDropdown = ref(false);
const searchingUploads = ref(false);
const purchasedAt = ref<string>('');
const addRecordButtonRef = ref<HTMLButtonElement | null>(null);

interface PurchaseRecordFormItem {
  product_id: string;
  product: Product | null;
  productSearch: string;
  products: Product[];
  showProductDropdown: boolean;
  searchingProducts: boolean;
  quantity_in_bags: number;
  price_per_bag: number;
  price_per_bag_display: string;
}

const purchaseRecordsForm = ref<PurchaseRecordFormItem[]>([]);

const columns = [
  { key: 'supplier_name', label: 'Supplier' },
  { key: 'product', label: 'Product' },
  { key: 'quantity_in_bags', label: 'Quantity' },
  { key: 'price_per_bag', label: 'Price per Bag' },
  { key: 'total_price', label: 'Total Price' },
  { key: 'purchased_at', label: 'Purchase Date' },
  { key: 'upload', label: 'Invoice' },
];

async function fetchPurchaseRecords() {
  loading.value = true;
  error.value = null;

  try {
    const response = await purchaseRecordsService.search({
      query: searchQuery.value || undefined,
      page: pagination.value?.page || 0,
      limit: pagination.value?.limit || 10,
    });

    purchaseRecords.value = response.data;
    pagination.value = {
      total: response.total,
      limit: response.limit,
      page: response.page,
    };
  } catch (err: any) {
    error.value =
      err.response?.data?.message ||
      'Failed to fetch purchase records. Please try again.';
    console.error('Error fetching purchase records:', err);
  } finally {
    loading.value = false;
  }
}

function handleSearch(query: string) {
  searchQuery.value = query;
  if (pagination.value) {
    pagination.value.page = 0;
  }
  fetchPurchaseRecords();
}

function handlePrevPage() {
  if (pagination.value && pagination.value.page > 0) {
    pagination.value.page--;
    fetchPurchaseRecords();
  }
}

function handleNextPage() {
  if (
    pagination.value &&
    (pagination.value.page + 1) * pagination.value.limit <
      pagination.value.total
  ) {
    pagination.value.page++;
    fetchPurchaseRecords();
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

// Upload search
let uploadSearchTimeout: ReturnType<typeof setTimeout> | null = null;

async function searchUploads() {
  if (uploadSearchTimeout) {
    clearTimeout(uploadSearchTimeout);
  }

  uploadSearchTimeout = setTimeout(async () => {
    if (!uploadSearchQuery.value.trim()) {
      availableUploads.value = [];
      searchingUploads.value = false;
      return;
    }

    searchingUploads.value = true;
    try {
      const response = await uploadsService.search({
        query: uploadSearchQuery.value,
        limit: 10,
      });
      availableUploads.value = response.data;
    } catch (err) {
      console.error('Error searching uploads:', err);
      availableUploads.value = [];
    } finally {
      searchingUploads.value = false;
    }
  }, 300);
}

function selectUpload(upload: UploadType) {
  selectedUpload.value = upload;
  uploadSearchQuery.value = '';
  availableUploads.value = [];
  showUploadDropdown.value = false;
}

async function handleUploaded(data: {
  key: string;
  name: string;
  upload?: UploadType;
}) {
  newUploadKey.value = data.key;
  if (data.upload?.id) {
    newUploadId.value = data.upload.id;
    console.log('Upload ID set from upload object:', newUploadId.value);
  } else {
    // Fallback: fetch the upload by key if not provided
    try {
      const response = await uploadsService.search({
        limit: 100,
      });
      const upload = response.data.find((u) => u.relative_url === data.key);
      if (upload) {
        newUploadId.value = upload.id;
        console.log('Upload ID set from search:', newUploadId.value);
      } else {
        console.warn('Upload not found for key:', data.key);
      }
    } catch (err) {
      console.error('Error fetching upload details:', err);
    }
  }
}

// Product search for each record
let productSearchTimeouts: Map<
  number,
  ReturnType<typeof setTimeout>
> = new Map();

async function searchProducts(record: PurchaseRecordFormItem, index: number) {
  const existingTimeout = productSearchTimeouts.get(index);
  if (existingTimeout) {
    clearTimeout(existingTimeout);
  }

  const timeout = setTimeout(async () => {
    if (!record.productSearch.trim()) {
      record.products = [];
      record.searchingProducts = false;
      return;
    }

    record.searchingProducts = true;
    try {
      const response = await productsService.search({
        query: record.productSearch,
        limit: 100, // Get more to filter out selected ones
      });
      // Get all selected product IDs from other records
      const selectedProductIds = purchaseRecordsForm.value
        .filter((r, i) => i !== index && r.product_id)
        .map((r) => r.product_id);
      // Filter out already selected products
      record.products = response.data.filter(
        (p) => !selectedProductIds.includes(p.id),
      );
    } catch (err) {
      console.error('Error searching products:', err);
      record.products = [];
    } finally {
      record.searchingProducts = false;
    }
  }, 300);

  productSearchTimeouts.set(index, timeout);
}

function selectProduct(record: PurchaseRecordFormItem, product: Product) {
  record.product = product;
  record.product_id = product.id;
  record.productSearch = '';
  record.products = [];
  record.showProductDropdown = false;
}

function addPurchaseRecord() {
  purchaseRecordsForm.value.push({
    product_id: '',
    product: null,
    productSearch: '',
    products: [],
    showProductDropdown: false,
    searchingProducts: false,
    quantity_in_bags: 0,
    price_per_bag: 0,
    price_per_bag_display: '',
  });

  // Auto-scroll to the add record button after adding a new record
  setTimeout(() => {
    addRecordButtonRef.value?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
    });
  }, 100);
}

function removePurchaseRecord(index: number) {
  purchaseRecordsForm.value.splice(index, 1);
}

async function handleSubmit() {
  if (!selectedSupplier.value) {
    alertStore.error('Please select a supplier');
    return;
  }

  if (purchaseRecordsForm.value.length === 0) {
    alertStore.error('Please add at least one purchase record');
    return;
  }

  // Validate all records
  for (const record of purchaseRecordsForm.value) {
    if (!record.product_id) {
      alertStore.error('Please select a product for all records');
      return;
    }
    if (!record.quantity_in_bags || record.quantity_in_bags <= 0) {
      alertStore.error('Please enter a valid quantity for all records');
      return;
    }
    if (!record.price_per_bag || record.price_per_bag <= 0) {
      alertStore.error('Please enter a valid price per bag for all records');
      return;
    }
  }

  if (!purchasedAt.value) {
    alertStore.error('Please select a purchase date');
    return;
  }

  isSubmitting.value = true;

  try {
    const requestBody: CreatePurchaseRecordsRequest = {
      purchased_at: getUnixTime(new Date(purchasedAt.value)),
      purchase_records: purchaseRecordsForm.value.map((record) => ({
        product_id: record.product_id,
        quantity_in_bags: record.quantity_in_bags,
        price_per_bag: record.price_per_bag,
      })),
    };

    // Handle upload - only send upload_id, not the upload object
    if (uploadMode.value === 'new' && newUploadId.value) {
      requestBody.upload_id = newUploadId.value;
      console.log('Sending upload_id (new):', newUploadId.value);
    } else if (uploadMode.value === 'existing' && selectedUpload.value) {
      requestBody.upload_id = selectedUpload.value.id;
      console.log('Sending upload_id (existing):', selectedUpload.value.id);
    } else if (uploadMode.value === 'new') {
      console.warn(
        'New upload mode selected but no upload_id available. Key:',
        newUploadKey.value,
      );
    }

    await purchaseRecordsService.create(selectedSupplier.value.id, requestBody);

    alertStore.success('Purchase records created successfully');
    closeModal();
    await fetchPurchaseRecords();
  } catch (err: any) {
    alertStore.error(
      err.response?.data?.message ||
        'Failed to create purchase records. Please try again.',
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
  uploadMode.value = null;
  newUploadKey.value = undefined;
  newUploadId.value = undefined;
  selectedUpload.value = null;
  uploadSearchQuery.value = '';
  availableUploads.value = [];
  purchaseRecordsForm.value = [];
  purchasedAt.value = '';
}

function viewUpload(upload: UploadType) {
  viewingUpload.value = upload;
  showViewModal.value = true;
}

function formatDate(timestamp: number): string {
  const date = fromUnixTime(timestamp);
  return format(date, 'MMM dd, yyyy');
}

function formatCurrency(value: number): string {
  if (!value && value !== 0) return '';
  // Format as number with commas, no decimals for whole numbers
  return value.toLocaleString('en-NG', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

function parseCurrency(value: string): number {
  // Remove all non-digit characters
  const digits = value.replace(/\D/g, '');
  return digits ? parseInt(digits, 10) : 0;
}

function handlePriceInput(record: PurchaseRecordFormItem, event: Event) {
  const input = event.target as HTMLInputElement;
  const value = input.value;
  const numericValue = parseCurrency(value);
  record.price_per_bag = numericValue;
  // Update display with formatted value
  record.price_per_bag_display = formatCurrency(numericValue);
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) {
    return '0 Bytes';
  }

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

const totalAmount = computed(() => {
  return purchaseRecordsForm.value.reduce((sum, record) => {
    return sum + record.quantity_in_bags * record.price_per_bag;
  }, 0);
});

onMounted(() => {
  fetchPurchaseRecords();
});
</script>
