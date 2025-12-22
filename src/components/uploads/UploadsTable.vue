<template>
  <div>
    <DataTable
      title="Uploads"
      :columns="columns"
      :data="uploads"
      :loading="loading || isSubmitting"
      :error="error"
      :pagination="pagination"
      :search-query="searchQuery"
      :get-row-id="(row) => row.id"
      @create="showCreateModal = true"
      @edit="handleEdit"
      @delete="handleDelete"
      @update:search-query="handleSearch"
      @prev-page="handlePrevPage"
      @next-page="handleNextPage"
    >
      <template #cell-name="{ value }">
        <span class="font-medium text-gray-900">{{ value }}</span>
      </template>
      <template #cell-file_mimetype="{ value }">
        <span class="text-sm text-gray-600">{{ value }}</span>
      </template>
      <template #cell-file_size="{ value }">
        {{ formatFileSize(value) }}
      </template>
      <template #cell-relative_url="{ value }">
        <a
          :href="getFileUrl(value)"
          target="_blank"
          rel="noopener noreferrer"
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
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
          View File
        </a>
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

    <!-- Delete Confirmation Modal -->
    <Modal
      :is-open="showDeleteModal"
      title="Delete Upload"
      :show-footer="true"
      @close="showDeleteModal = false"
      @confirm="confirmDelete"
    >
      <p class="text-gray-700">
        Are you sure you want to delete
        <span class="font-semibold">{{ deletingUpload?.name }}</span
        >? This action cannot be undone.
      </p>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { format } from 'date-fns';
import { onMounted, ref } from 'vue';

import uploadsService from '../../services/uploads.service';
import { useAlertStore } from '../../stores/alert';
import type { Upload as UploadType } from '../../types';
import DataTable from '../common/DataTable.vue';
import Modal from '../common/Modal.vue';
import Upload from '../common/Upload.vue';

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
const isSubmitting = ref(false);
const showCreateModal = ref(false);
const showDeleteModal = ref(false);
const deletingUpload = ref<UploadType | null>(null);
const editingUpload = ref<UploadType | null>(null);
const uploadedKey = ref<string | null>(null);

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

function handleEdit(upload: UploadType) {
  editingUpload.value = upload;
  // For now, we'll just show a message that editing is not supported
  // In the future, you might want to allow editing the name
  alertStore.error('Editing uploads is not currently supported');
}

function handleDelete(upload: UploadType) {
  deletingUpload.value = upload;
  showDeleteModal.value = true;
}

async function confirmDelete() {
  if (!deletingUpload.value) {
    return;
  }

  isSubmitting.value = true;

  try {
    await uploadsService.delete(deletingUpload.value.id);
    alertStore.success('Upload deleted successfully');
    showDeleteModal.value = false;
    deletingUpload.value = null;
    await fetchUploads();
  } catch (err: any) {
    alertStore.error(
      err.response?.data?.message ||
        'Failed to delete upload. Please try again.',
    );
  } finally {
    isSubmitting.value = false;
  }
}

function handleUploaded(data: { key: string; name: string }) {
  alertStore.success(`File "${data.name}" uploaded successfully`);
  showCreateModal.value = false;
  uploadedKey.value = null;
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

function getFileUrl(relativeUrl: string): string {
  // Construct the full URL to the file
  // This assumes files are stored in S3 and accessible via a CDN or direct S3 URL
  // You may need to adjust this based on your backend configuration
  const baseUrl =
    import.meta.env.VITE_FILE_BASE_URL ||
    'https://staging-api.danlebrown.com/tripple-t';
  return `${baseUrl}/files/${relativeUrl}`;
}

onMounted(() => {
  fetchUploads();
});
</script>
