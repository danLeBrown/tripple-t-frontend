<template>
  <div>
    <DataTable
      title="Uploads"
      :columns="columns"
      :data="uploads"
      :loading="loading"
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
      <template #cell-name="{ value, row }">
        <div class="flex items-center gap-2">
          <component
            :is="getFileTypeIcon(row.file_mimetype)"
            class="w-4 h-4 flex-shrink-0"
            :class="getFileTypeIconClass(row.file_mimetype)"
          />
          <span class="font-medium text-gray-900">{{ value }}</span>
        </div>
      </template>
      <template #cell-file_mimetype="{ value }">
        <div class="flex items-center gap-2">
          <component
            :is="getFileTypeIcon(value)"
            class="w-5 h-5 flex-shrink-0"
            :class="getFileTypeIconClass(value)"
          />
          <span class="text-sm text-gray-600">{{ getFileTypeLabel(value) }}</span>
        </div>
      </template>
      <template #cell-file_size="{ value }">
        {{ formatFileSize(value) }}
      </template>
      <template #cell-relative_url="{ row }">
        <button
          @click="viewUpload(row)"
          class="text-blue-600 hover:text-blue-800 underline flex items-center gap-1"
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
          View File
        </button>
      </template>
      <template #cell-created_at="{ value }">
        {{ formatDate(value) }}
      </template>
    </DataTable>

    <!-- Upload Modal -->
    <Modal
      :is-open="showCreateModal"
      title="Upload File"
      :show-footer="false"
      @close="showCreateModal = false"
    >
      <Upload v-model="uploadedKey" @uploaded="handleUploaded" />
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
import { format } from 'date-fns';
import { onMounted, ref } from 'vue';

import uploadsService from '../../services/uploads.service';
import { useAlertStore } from '../../stores/alert';
import type { Upload as UploadType } from '../../types';
import { getFileTypeIcon, getFileTypeIconClass, getFileTypeLabel } from '../../utils/fileTypes';
import DataTable from '../common/DataTable.vue';
import Modal from '../common/Modal.vue';
import Upload from '../common/Upload.vue';
import ViewUploadModal from '../common/ViewUploadModal.vue';

const alertStore = useAlertStore();

const uploads = ref<UploadType[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const pagination = ref<{
  total: number;
  limit: number;
  page: number;
} | null>(null);
const searchQuery = ref('');
const showCreateModal = ref(false);
const showViewModal = ref(false);
const viewingUpload = ref<UploadType | null>(null);
const uploadedKey = ref<string | undefined>(undefined);

const columns = [
  { key: 'name', label: 'Name' },
  { key: 'file_mimetype', label: 'Type' },
  { key: 'file_size', label: 'Size' },
  { key: 'relative_url', label: 'File' },
  { key: 'created_at', label: 'Uploaded' },
];

async function fetchUploads() {
  loading.value = true;
  error.value = null;

  try {
    const response = await uploadsService.search({
      query: searchQuery.value || undefined,
      page: pagination.value?.page || 0,
      limit: pagination.value?.limit || 10,
    });

    uploads.value = response.data;
    pagination.value = {
      total: response.total,
      limit: response.limit,
      page: response.page,
    };
  } catch (err: any) {
    error.value =
      err.response?.data?.message ||
      'Failed to fetch uploads. Please try again.';
    console.error('Error fetching uploads:', err);
  } finally {
    loading.value = false;
  }
}

function handleSearch(query: string) {
  searchQuery.value = query;
  pagination.value = { ...pagination.value!, page: 0 };
  fetchUploads();
}

function handlePrevPage() {
  if (pagination.value && pagination.value.page > 0) {
    pagination.value.page--;
    fetchUploads();
  }
}

function handleNextPage() {
  if (
    pagination.value &&
    (pagination.value.page + 1) * pagination.value.limit <
      pagination.value.total
  ) {
    pagination.value.page++;
    fetchUploads();
  }
}

function viewUpload(upload: UploadType) {
  viewingUpload.value = upload;
  showViewModal.value = true;
}


function handleUploaded(data: { key: string; name: string }) {
  alertStore.success(`File "${data.name}" uploaded successfully`);
  showCreateModal.value = false;
  uploadedKey.value = undefined;
  fetchUploads();
}

function formatDate(timestamp: number): string {
  return format(new Date(timestamp * 1000), 'MMM dd, yyyy HH:mm');
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


onMounted(() => {
  fetchUploads();
});
</script>
