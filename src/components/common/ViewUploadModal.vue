<template>
  <Modal
    :is-open="isOpen"
    :title="upload?.name || 'View File'"
    :show-footer="false"
    @close="$emit('close')"
  >
    <template #title-icon>
      <component
        v-if="fileTypeIcon"
        :is="fileTypeIcon"
        class="w-6 h-6 flex-shrink-0"
        :class="fileTypeIconClass"
      />
    </template>
    <div v-if="loading" class="flex items-center justify-center p-8">
      <div class="text-center">
        <div
          class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"
        ></div>
        <p class="mt-4 text-sm text-gray-600">Loading file...</p>
      </div>
    </div>

    <div v-else-if="error" class="p-8 text-center">
      <div class="text-red-600 mb-4">
        <svg
          class="mx-auto h-12 w-12"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <p class="text-sm text-gray-700">{{ error }}</p>
      <button
        @click="loadFile"
        class="mt-4 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Retry
      </button>
    </div>

    <div v-else-if="viewUrl" class="space-y-4">
      <!-- Image Preview -->
      <div v-if="isImage" class="flex justify-center">
        <img
          :src="viewUrl"
          :alt="upload?.name"
          class="max-w-full max-h-[600px] rounded-lg border border-gray-300"
          @load="onImageLoad"
          @error="onImageError"
        />
      </div>

      <!-- PDF Preview -->
      <div
        v-else-if="isPdf"
        class="border border-gray-300 rounded-lg overflow-hidden"
      >
        <iframe
          :src="viewUrl"
          class="w-full h-[600px]"
          type="application/pdf"
          @load="onIframeLoad"
        ></iframe>
      </div>

      <!-- Other File Types -->
      <div v-else class="text-center p-8">
        <div class="flex items-center justify-center mb-4">
          <svg
            class="h-16 w-16 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          </svg>
        </div>
        <p class="text-sm text-gray-600 mb-4">
          Preview not available for this file type
        </p>
        <a
          :href="viewUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg
            class="w-4 h-4 mr-2"
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
          Download File
        </a>
      </div>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue';

import uploadsService from '../../services/uploads.service';
import { useAlertStore } from '../../stores/alert';
import type { Upload } from '../../types';
import { getFileTypeIcon, getFileTypeIconClass } from '../../utils/fileTypes';
import Modal from './Modal.vue';

interface Props {
  isOpen: boolean;
  upload: Upload | null;
}

interface Emits {
  (e: 'close'): void;
}

const props = defineProps<Props>();
defineEmits<Emits>();

const alertStore = useAlertStore();
const loading = ref(false);
const error = ref<string | null>(null);
const viewUrl = ref<string | null>(null);

const isImage = computed(() => {
  return props.upload?.file_mimetype.startsWith('image/') ?? false;
});

const isPdf = computed(() => {
  return props.upload?.file_mimetype === 'application/pdf';
});

const fileTypeIcon = computed(() => {
  if (!props.upload?.file_mimetype) return null;
  return getFileTypeIcon(props.upload.file_mimetype);
});

const fileTypeIconClass = computed(() => {
  if (!props.upload?.file_mimetype) return '';
  return getFileTypeIconClass(props.upload.file_mimetype);
});

async function loadFile() {
  if (!props.upload?.relative_url) {
    error.value = 'No file key available';
    loading.value = false;
    return;
  }

  loading.value = true;
  error.value = null;
  viewUrl.value = null;

  try {
    // Step 1: Get presigned URL
    const { url } = await uploadsService.generateDownloadPresignedUrl(
      props.upload.relative_url,
    );

    console.log('Presigned URL generated:', url);

    // Step 2: Fetch the file data from the presigned URL
    // This explicitly makes the HTTP call and handles CORS properly
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(
        `Failed to fetch file: ${response.status} ${response.statusText}`,
      );
    }

    // Step 3: Create a blob from the response
    const blob = await response.blob();
    console.log('File blob created:', blob.type, blob.size);

    // Step 4: Create an object URL from the blob
    // This allows us to use it in img/iframe tags without CORS issues
    const objectUrl = URL.createObjectURL(blob);
    viewUrl.value = objectUrl;

    // Set loading to false immediately after creating the object URL
    // The @load handlers will ensure proper display, but we don't want to
    // stay in loading state if they don't fire (e.g., cached content)
    loading.value = false;
  } catch (err: any) {
    console.error('Error loading file:', err);
    const errorMessage =
      err.response?.data?.message ||
      err.message ||
      'Failed to load file. Please try again.';
    error.value = errorMessage;
    alertStore.error(errorMessage);
    loading.value = false;
  }
}

function onImageLoad() {
  console.log('Image loaded successfully');
  loading.value = false;
}

function onImageError(event: Event) {
  console.error('Image failed to load:', event);
  loading.value = false;
  error.value =
    'Failed to load image. The file may be corrupted or inaccessible.';
}

function onIframeLoad() {
  console.log('Iframe loaded (PDF)');
  // Loading is already set to false, but ensure it stays false
  loading.value = false;
}

// Load file when modal opens or upload changes
watch(
  () => [props.isOpen, props.upload],
  ([newIsOpen, newUpload]) => {
    if (newIsOpen && newUpload) {
      loadFile();
    } else if (!newIsOpen) {
      // Clean up when modal closes
      if (viewUrl.value) {
        // Revoke the object URL to free up memory
        URL.revokeObjectURL(viewUrl.value);
      }
      viewUrl.value = null;
      error.value = null;
    }
  },
  { immediate: true },
);

// Cleanup object URL on unmount
onUnmounted(() => {
  if (viewUrl.value) {
    URL.revokeObjectURL(viewUrl.value);
  }
});
</script>
