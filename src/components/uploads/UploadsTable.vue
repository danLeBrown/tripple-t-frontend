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

    <!-- Delete Confirmation Modal -->
    <Modal
      :is-open="showDeleteModal"
      title="Delete Upload"
      :show-footer="true"
      :is-submitting="isSubmitting"
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
import {
  DocumentIcon,
  PhotoIcon,
  DocumentTextIcon,
  FilmIcon,
  MusicalNoteIcon,
  ArchiveBoxIcon,
  CodeBracketIcon,
  RectangleStackIcon,
} from '@heroicons/vue/24/outline';
import { format } from 'date-fns';
import { onMounted, ref } from 'vue';

import uploadsService from '../../services/uploads.service';
import { useAlertStore } from '../../stores/alert';
import type { Upload as UploadType } from '../../types';
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
const isSubmitting = ref(false);
const showCreateModal = ref(false);
const showViewModal = ref(false);
const showDeleteModal = ref(false);
const deletingUpload = ref<UploadType | null>(null);
const viewingUpload = ref<UploadType | null>(null);
const editingUpload = ref<UploadType | null>(null);
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
  if (!deletingUpload.value || isSubmitting.value) {
    return;
  }

  isSubmitting.value = true;

  try {
    const response = await uploadsService.delete(deletingUpload.value.id);
    showDeleteModal.value = false;
    deletingUpload.value = null;
    await fetchUploads();
    
    // Only show success message if backend doesn't provide one
    const successMessage =
      (response as any)?.data?.message || 'Upload deleted successfully';
    alertStore.success(successMessage);
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

function getFileTypeIcon(mimetype: string) {
  if (mimetype.startsWith('image/')) {
    return PhotoIcon;
  } else if (mimetype === 'application/pdf') {
    return DocumentTextIcon;
  } else if (
    mimetype.startsWith('video/') ||
    mimetype === 'application/vnd.apple.mpegurl'
  ) {
    return FilmIcon;
  } else if (mimetype.startsWith('audio/')) {
    return MusicalNoteIcon;
  } else if (
    mimetype.includes('zip') ||
    mimetype.includes('rar') ||
    mimetype.includes('tar') ||
    mimetype.includes('archive')
  ) {
    return ArchiveBoxIcon;
  } else if (
    mimetype.includes('javascript') ||
    mimetype.includes('json') ||
    mimetype.includes('xml') ||
    mimetype.includes('html') ||
    mimetype.includes('css')
  ) {
    return CodeBracketIcon;
  } else if (
    mimetype.includes('word') ||
    mimetype.includes('excel') ||
    mimetype.includes('powerpoint') ||
    mimetype.includes('office') ||
    mimetype.includes('officedocument')
  ) {
    return DocumentIcon;
  } else {
    return RectangleStackIcon;
  }
}

function getFileTypeIconClass(mimetype: string): string {
  if (mimetype.startsWith('image/')) {
    return 'text-blue-500';
  } else if (mimetype === 'application/pdf') {
    return 'text-red-500';
  } else if (mimetype.startsWith('video/')) {
    return 'text-purple-500';
  } else if (mimetype.startsWith('audio/')) {
    return 'text-green-500';
  } else if (
    mimetype.includes('zip') ||
    mimetype.includes('rar') ||
    mimetype.includes('tar')
  ) {
    return 'text-yellow-600';
  } else if (
    mimetype.includes('javascript') ||
    mimetype.includes('json') ||
    mimetype.includes('xml')
  ) {
    return 'text-orange-500';
  } else if (
    mimetype.includes('word') ||
    mimetype.includes('excel') ||
    mimetype.includes('powerpoint')
  ) {
    return 'text-blue-600';
  } else {
    return 'text-gray-500';
  }
}

function getFileTypeLabel(mimetype: string): string {
  if (mimetype.startsWith('image/')) {
    const subtype = mimetype.split('/')[1]?.toUpperCase();
    return subtype || 'Image';
  } else if (mimetype === 'application/pdf') {
    return 'PDF';
  } else if (mimetype.startsWith('video/')) {
    const subtype = mimetype.split('/')[1]?.toUpperCase();
    return subtype ? `Video (${subtype})` : 'Video';
  } else if (mimetype.startsWith('audio/')) {
    const subtype = mimetype.split('/')[1]?.toUpperCase();
    return subtype ? `Audio (${subtype})` : 'Audio';
  } else if (mimetype.includes('zip')) {
    return 'ZIP Archive';
  } else if (mimetype.includes('rar')) {
    return 'RAR Archive';
  } else if (mimetype.includes('tar')) {
    return 'TAR Archive';
  } else if (mimetype.includes('javascript')) {
    return 'JavaScript';
  } else if (mimetype.includes('json')) {
    return 'JSON';
  } else if (mimetype.includes('xml')) {
    return 'XML';
  } else if (mimetype.includes('html')) {
    return 'HTML';
  } else if (mimetype.includes('word') || mimetype.includes('document')) {
    return 'Word Document';
  } else if (mimetype.includes('excel') || mimetype.includes('spreadsheet')) {
    return 'Excel Spreadsheet';
  } else if (mimetype.includes('powerpoint') || mimetype.includes('presentation')) {
    return 'PowerPoint';
  } else {
    // Extract the main type and subtype
    const parts = mimetype.split('/');
    if (parts.length === 2) {
      const [mainType, subType] = parts;
      return `${mainType.charAt(0).toUpperCase() + mainType.slice(1)} (${subType.toUpperCase()})`;
    }
    return mimetype;
  }
}

onMounted(() => {
  fetchUploads();
});
</script>
