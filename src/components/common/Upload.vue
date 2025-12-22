<template>
  <div class="upload-component">
    <!-- File Input -->
    <div
      v-if="!file"
      class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center"
    >
      <input
        ref="fileInputRef"
        type="file"
        accept="image/*,application/pdf"
        class="hidden"
        @change="handleFileSelect"
      />
      <div class="space-y-4">
        <svg
          class="mx-auto h-12 w-12 text-gray-400"
          stroke="currentColor"
          fill="none"
          viewBox="0 0 48 48"
        >
          <path
            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <div>
          <button
            type="button"
            @click="fileInputRef?.click()"
            class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Select File
          </button>
          <p class="mt-2 text-sm text-gray-500">
            Images (PNG, JPG, GIF) or PDF up to 10MB
          </p>
        </div>
      </div>
    </div>

    <!-- Preview and Edit Section -->
    <div v-else class="space-y-4">
      <!-- Image Preview/Crop Area -->
      <div
        v-if="isImageFile"
        class="border border-gray-300 rounded-lg overflow-hidden bg-gray-50"
      >
        <div
          ref="cropperContainerRef"
          class="relative"
          style="max-height: 500px; min-height: 300px"
        >
          <img
            ref="imageRef"
            :src="previewUrl"
            alt="Preview"
            class="max-w-full max-h-[500px] mx-auto"
            style="display: none"
          />
        </div>
      </div>

      <!-- PDF Preview -->
      <div
        v-else-if="isPdfFile"
        class="border border-gray-300 rounded-lg overflow-hidden bg-gray-50"
      >
        <div class="p-4">
          <div class="flex items-center justify-center p-8 bg-white rounded-lg">
            <div class="text-center">
              <svg
                class="mx-auto h-16 w-16 text-red-500"
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
              <p class="mt-4 text-sm font-medium text-gray-900">
                {{ file?.name }}
              </p>
              <p class="mt-1 text-xs text-gray-500">PDF Document</p>
            </div>
          </div>
          <div class="mt-4">
            <iframe
              :src="previewUrl"
              class="w-full h-[600px] border border-gray-200 rounded"
              type="application/pdf"
            ></iframe>
          </div>
        </div>
      </div>

      <!-- Controls -->
      <div class="flex flex-wrap gap-2">
        <button
          type="button"
          @click="resetFile"
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Change File
        </button>
        <button
          v-if="isImageFile && showCropControls"
          type="button"
          @click="toggleCrop"
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {{ isCropping ? 'Cancel Crop' : 'Crop Image' }}
        </button>
        <button
          v-if="isCropping && isImageFile"
          type="button"
          @click="applyCrop"
          class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Apply Crop
        </button>
      </div>

      <!-- File Name Input -->
      <div>
        <label
          for="upload-name"
          class="block text-sm font-medium text-gray-700 mb-1"
        >
          File Name
        </label>
        <input
          id="upload-name"
          v-model="fileName"
          type="text"
          placeholder="Enter a name for this file"
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          :disabled="isUploading"
        />
      </div>

      <!-- Upload Progress -->
      <div v-if="isUploading" class="space-y-2">
        <div class="flex justify-between items-center text-sm">
          <span class="font-medium text-gray-700">Uploading file...</span>
          <span class="font-semibold text-blue-600">{{ uploadProgress }}%</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
          <div
            class="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out"
            :style="{ width: `${uploadProgress}%` }"
          ></div>
        </div>
        <p class="text-xs text-gray-500">
          {{ uploadStatusText }}
        </p>
      </div>

      <!-- Upload Button -->
      <div class="flex justify-end gap-2">
        <button
          v-if="!isUploading && !uploadedKey"
          type="button"
          @click="handleUpload"
          :disabled="!fileName.trim()"
          class="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Upload
        </button>
        <button
          v-if="uploadedKey && !isUploading"
          type="button"
          disabled
          class="px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-md cursor-not-allowed"
        >
          Uploaded Successfully
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Cropper from 'cropperjs';
import { computed, nextTick, onUnmounted, ref, watch } from 'vue';

import uploadsService from '../../services/uploads.service';
import { useAlertStore } from '../../stores/alert';
import type { Upload } from '../../types';

interface Props {
  modelValue?: string; // The uploaded file key
  showCropControls?: boolean; // Whether to show crop controls (default: true for images)
}

interface Emits {
  (e: 'update:modelValue', value: string | null): void;
  (e: 'uploaded', data: { key: string; name: string; upload?: Upload }): void;
}

const props = withDefaults(defineProps<Props>(), {
  showCropControls: true,
});

const emit = defineEmits<Emits>();

const fileInputRef = ref<HTMLInputElement | null>(null);
const imageRef = ref<HTMLImageElement | null>(null);
const cropperContainerRef = ref<HTMLDivElement | null>(null);
const file = ref<File | null>(null);
const previewUrl = ref<string>('');
const fileName = ref<string>('');
const uploadProgress = ref<number>(0);
const isUploading = ref<boolean>(false);
const uploadedKey = ref<string | null>(props.modelValue || null);
const isCropping = ref<boolean>(false);
const cropper = ref<Cropper | null>(null);
const alertStore = useAlertStore();

// Computed properties for file type checking
const isImageFile = computed(() => {
  return file.value?.type.startsWith('image/') ?? false;
});

const isPdfFile = computed(() => {
  return file.value?.type === 'application/pdf';
});

const uploadStatusText = computed(() => {
  if (uploadProgress.value === 0) {
    return 'Preparing upload...';
  } else if (uploadProgress.value < 50) {
    return 'Uploading to storage...';
  } else if (uploadProgress.value < 100) {
    return 'Finalizing upload...';
  } else {
    return 'Upload complete!';
  }
});

// Watch for external changes to modelValue
watch(
  () => props.modelValue,
  (newValue) => {
    uploadedKey.value = newValue || null;
  },
);

function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement;
  const selectedFile = target.files?.[0];

  if (!selectedFile) {
    return;
  }

  // Validate file size (10MB limit)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (selectedFile.size > maxSize) {
    alertStore.error('File size must be less than 10MB');
    return;
  }

  // Validate file type
  const isImage = selectedFile.type.startsWith('image/');
  const isPdf = selectedFile.type === 'application/pdf';

  if (!isImage && !isPdf) {
    alertStore.error('Please select an image file (PNG, JPG, GIF) or PDF');
    return;
  }

  file.value = selectedFile;
  fileName.value = selectedFile.name.replace(/\.[^/.]+$/, ''); // Remove extension

  // Create preview URL
  previewUrl.value = URL.createObjectURL(selectedFile);

  // Reset upload state
  uploadProgress.value = 0;
  uploadedKey.value = null;
  emit('update:modelValue', null);

  // Initialize cropper only for images
  if (isImage) {
    nextTick(() => {
      if (imageRef.value) {
        imageRef.value.onload = () => {
          initCropper();
        };
        // If image is already loaded
        if (imageRef.value.complete) {
          initCropper();
        }
      }
    });
  }
}

function initCropper() {
  if (!imageRef.value || !cropperContainerRef.value) {
    return;
  }

  // Destroy existing cropper if any
  if (cropper.value) {
    cropper.value.destroy();
    cropper.value = null;
  }

  // Show image
  imageRef.value.style.display = 'block';

  // Wait a bit for DOM to update
  nextTick(() => {
    if (!imageRef.value) {
      return;
    }

    // Initialize cropper
    cropper.value = new Cropper(imageRef.value, {
      aspectRatio: NaN as any, // Free aspect ratio
      viewMode: 1,
      dragMode: 'move' as any,
      autoCropArea: 0.8,
      restore: false,
      guides: true,
      center: true,
      highlight: false,
      cropBoxMovable: true,
      cropBoxResizable: true,
      toggleable: false,
      ready() {
        // Cropper is ready
      },
    } as any);
  });
}

function toggleCrop() {
  if (!cropper.value) {
    return;
  }

  if (isCropping.value) {
    // Cancel crop - restore original
    (cropper.value as any).reset();
    isCropping.value = false;
  } else {
    // Enable crop mode
    isCropping.value = true;
  }
}

function applyCrop() {
  if (!cropper.value) {
    return;
  }

  // Get cropped canvas
  const canvas = (cropper.value as any).getCroppedCanvas({
    maxWidth: 2048,
    maxHeight: 2048,
  });

  if (!canvas) {
    return;
  }

  // Convert canvas to blob
  canvas.toBlob(
    (blob: Blob | null) => {
      if (!blob) {
        return;
      }

      // Create new file from blob
      const croppedFile = new File([blob], file.value?.name || 'cropped.jpg', {
        type: blob.type,
      });

      file.value = croppedFile;

      // Update preview
      const newPreviewUrl = URL.createObjectURL(blob);
      URL.revokeObjectURL(previewUrl.value);
      previewUrl.value = newPreviewUrl;

      // Reset cropper
      isCropping.value = false;
      nextTick(() => {
        initCropper();
      });
    },
    file.value?.type || 'image/jpeg',
    0.9, // Quality
  );
}

function resetFile() {
  // Clean up
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value);
  }
  if (cropper.value) {
    cropper.value.destroy();
    cropper.value = null;
  }

  // Reset state
  file.value = null;
  previewUrl.value = '';
  fileName.value = '';
  uploadProgress.value = 0;
  uploadedKey.value = null;
  isCropping.value = false;

  // Reset file input
  if (fileInputRef.value) {
    fileInputRef.value.value = '';
  }

  emit('update:modelValue', null);
}

async function handleUpload() {
  if (!file.value || !fileName.value.trim()) {
    alertStore.error('Please provide a file name');
    return;
  }

  try {
    isUploading.value = true;
    uploadProgress.value = 0;

    // Step 1: Get presigned URL
    uploadProgress.value = 5;
    const { url, key } = await uploadsService.generatePresignedUrl(
      file.value.type,
    );
    uploadProgress.value = 10;

    // Step 2: Upload file to S3 using presigned URL
    // Progress will be updated by the XMLHttpRequest progress event
    await uploadToS3(url, file.value);

    // Step 3: Create upload record in database
    uploadProgress.value = 95;
    const upload = await uploadsService.create(
      fileName.value.trim(),
      key,
      file.value.type,
      file.value.size,
    );

    // Step 4: Update state
    uploadedKey.value = key;
    uploadProgress.value = 100;
    emit('update:modelValue', key);
    emit('uploaded', { key, name: fileName.value, upload });
  } catch (error: any) {
    console.error('Upload error:', error);
    alertStore.error(
      error.response?.data?.message ||
        'Failed to upload file. Please try again.',
    );
    uploadProgress.value = 0;
  } finally {
    isUploading.value = false;
  }
}

function uploadToS3(presignedUrl: string, file: File): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        // Map progress from 10% to 90% (since we start at 10% and end at 95%)
        const progress = (e.loaded / e.total) * 80; // 80% of the range (10-90%)
        uploadProgress.value = Math.round(10 + progress);
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status === 200 || xhr.status === 204) {
        resolve();
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`));
      }
    });

    xhr.addEventListener('error', () => {
      reject(new Error('Upload failed'));
    });

    xhr.addEventListener('abort', () => {
      reject(new Error('Upload aborted'));
    });

    xhr.open('PUT', presignedUrl);
    xhr.setRequestHeader('Content-Type', file.type);
    xhr.send(file);
  });
}

onUnmounted(() => {
  // Cleanup
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value);
  }
  if (cropper.value) {
    cropper.value.destroy();
  }
});
</script>

<style scoped>
.upload-component {
  @apply w-full;
}
</style>
