import { defineStore } from 'pinia';
import { ref } from 'vue';

export type AlertType = 'success' | 'error' | 'warning' | 'info';

export interface Alert {
  id: string;
  type: AlertType;
  message: string;
  duration?: number; // Auto-dismiss after this many milliseconds (0 = no auto-dismiss)
}

export const useAlertStore = defineStore('alert', () => {
  const alerts = ref<Alert[]>([]);

  function addAlert(alert: Omit<Alert, 'id'>) {
    const id = Math.random().toString(36).substring(2, 15);
    const newAlert: Alert = {
      id,
      ...alert,
      duration: alert.duration ?? 5000, // Default 5 seconds (must come after spread to override)
    };

    alerts.value.push(newAlert);

    // Auto-dismiss if duration is set
    if (newAlert.duration && newAlert.duration > 0) {
      setTimeout(() => {
        removeAlert(id);
      }, newAlert.duration);
    }

    return id;
  }

  function removeAlert(id: string) {
    const index = alerts.value.findIndex((alert) => alert.id === id);
    if (index > -1) {
      alerts.value.splice(index, 1);
    }
  }

  function clearAll() {
    alerts.value = [];
  }

  // Convenience methods
  function success(message: string, duration?: number) {
    return addAlert({ type: 'success', message, duration });
  }

  function error(message: string, duration?: number) {
    return addAlert({ type: 'error', message, duration });
  }

  function warning(message: string, duration?: number) {
    return addAlert({ type: 'warning', message, duration });
  }

  function info(message: string, duration?: number) {
    return addAlert({ type: 'info', message, duration });
  }

  return {
    alerts,
    addAlert,
    removeAlert,
    clearAll,
    success,
    error,
    warning,
    info,
  };
});
