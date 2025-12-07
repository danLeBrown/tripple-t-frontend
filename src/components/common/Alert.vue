<template>
  <TransitionGroup
    name="alert"
    tag="div"
    class="fixed top-4 right-4 z-[100] space-y-2 max-w-md"
  >
    <div
      v-for="alert in alertStore.alerts"
      :key="alert.id"
      :class="[
        'flex items-start gap-3 p-4 rounded-lg shadow-lg',
        alertClasses[alert.type],
      ]"
    >
      <component
        :is="alertIcons[alert.type]"
        class="w-5 h-5 flex-shrink-0 mt-0.5"
      />
      <div class="flex-1 min-w-0">
        <p class="text-sm font-medium">{{ alert.message }}</p>
      </div>
      <button
        @click="alertStore.removeAlert(alert.id)"
        class="flex-shrink-0 text-current opacity-70 hover:opacity-100 transition-opacity"
      >
        <XMarkIcon class="w-5 h-5" />
      </button>
    </div>
  </TransitionGroup>
</template>

<script setup lang="ts">
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
  XMarkIcon,
} from '@heroicons/vue/24/outline';

import { useAlertStore } from '../../stores/alert';

const alertStore = useAlertStore();

const alertIcons = {
  success: CheckCircleIcon,
  error: XCircleIcon,
  warning: ExclamationTriangleIcon,
  info: InformationCircleIcon,
};

const alertClasses = {
  success: 'bg-green-50 text-green-800 border border-green-200',
  error: 'bg-red-50 text-red-800 border border-red-200',
  warning: 'bg-yellow-50 text-yellow-800 border border-yellow-200',
  info: 'bg-blue-50 text-blue-800 border border-blue-200',
};
</script>

<style scoped>
.alert-enter-active,
.alert-leave-active {
  transition: all 0.3s ease;
}

.alert-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.alert-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.alert-move {
  transition: transform 0.3s ease;
}
</style>
