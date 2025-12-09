<template>
  <div>
    <DataTable
      title="Expenses"
      :columns="columns"
      :data="accountingStore.expenses"
      :loading="accountingStore.loading || isSubmitting"
      :error="accountingStore.error"
      :pagination="accountingStore.pagination"
      :search-query="searchQuery"
      :get-row-id="(row) => row.id"
      @create="showCreateModal = true"
      @edit="handleEdit"
      @delete="handleDelete"
      @update:search-query="handleSearch"
      @prev-page="handlePrevPage"
      @next-page="handleNextPage"
    >
      <template #cell-category="{ value }">
        <span
          :class="[
            'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
            getCategoryBadgeClass(value),
          ]"
        >
          {{ formatCategoryLabel(value) }}
        </span>
      </template>
      <template #cell-amount="{ value }">
        ₦{{ value.toLocaleString() }}
      </template>
      <template #cell-reported_at="{ value }">
        {{ formatDate(value) }}
      </template>
      <template #cell-has_been_calculated="{ value }">
        <span
          :class="[
            'px-2 py-1 text-xs rounded-full',
            value ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800',
          ]"
        >
          {{ value ? 'Yes' : 'No' }}
        </span>
      </template>
    </DataTable>
    <Modal
      :is-open="showModal"
      :title="editingExpense ? 'Edit Expense' : 'Create Expense'"
      :show-footer="true"
      @close="closeModal"
    >
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div v-if="!editingExpense">
          <label class="block text-sm font-medium text-gray-700 mb-1"
            >Category</label
          >
          <select
            v-model="formData.category"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          >
            <option value="">Select a category</option>
            <option
              v-for="category in expenseCategories"
              :key="category"
              :value="category"
            >
              {{ categoryLabels[category] }}
            </option>
          </select>
        </div>
        <div v-if="!editingExpense">
          <label class="block text-sm font-medium text-gray-700 mb-1"
            >Amount</label
          >
          <div class="relative">
            <div
              class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
            >
              <span class="text-gray-500 text-sm">₦</span>
            </div>
            <input
              v-model="amountDisplay"
              @input="handleAmountInput"
              type="text"
              required
              class="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="0.00"
            />
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1"
            >Narration</label
          >
          <textarea
            v-model="formData.narration"
            required
            rows="3"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            placeholder="Enter expense description"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1"
            >Reported Date</label
          >
          <input
            v-model="formData.reported_at"
            type="date"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>
        <div v-if="editingExpense" class="flex items-center">
          <input
            v-model="formData.has_been_calculated"
            type="checkbox"
            id="has_been_calculated"
            class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label
            for="has_been_calculated"
            class="ml-2 text-sm text-gray-700 cursor-pointer"
          >
            Has been calculated
          </label>
        </div>
      </form>
      <template #footer>
        <button
          type="button"
          @click="closeModal"
          :disabled="isSubmitting"
          class="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
        <button
          type="button"
          @click="handleSubmit"
          :disabled="isSubmitting"
          class="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <svg
            v-if="isSubmitting"
            class="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            />
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          {{ editingExpense ? 'Update' : 'Create' }}
        </button>
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { format, fromUnixTime, getUnixTime } from 'date-fns';
import { onMounted, reactive, ref, watch } from 'vue';

import { useAccountingStore } from '../../stores/accounting';
import { useAlertStore } from '../../stores/alert';
import type { Expense, ExpenseCategory } from '../../types';
import DataTable from '../common/DataTable.vue';
import Modal from '../common/Modal.vue';

const accountingStore = useAccountingStore();
const alertStore = useAlertStore();
const showModal = ref(false);
const showCreateModal = ref(false);
const editingExpense = ref<Expense | null>(null);
const isSubmitting = ref(false);
const searchQuery = ref('');
const currentPage = ref(0);

// Map category values to display labels
const categoryLabels: Record<ExpenseCategory, string> = {
  utility: 'Utility',
  office_supplies: 'Office Supplies',
  salary: 'Salary',
  maintenance: 'Maintenance',
  miscellaneous: 'Miscellaneous',
  bonus: 'Bonus',
  allowances: 'Allowances',
};

// Sort categories by their display labels
const expenseCategories: ExpenseCategory[] = (
  [
    'utility',
    'office_supplies',
    'salary',
    'maintenance',
    'miscellaneous',
    'bonus',
    'allowances',
  ] as ExpenseCategory[]
).sort((a, b) => categoryLabels[a].localeCompare(categoryLabels[b]));

const formData = reactive({
  category: '' as ExpenseCategory | '',
  amount: 0,
  narration: '',
  reported_at: '',
  has_been_calculated: false,
});

const amountDisplay = ref('');

const columns = [
  { key: 'category', label: 'Category' },
  { key: 'amount', label: 'Amount' },
  { key: 'narration', label: 'Narration' },
  { key: 'reported_at', label: 'Date' },
  { key: 'has_been_calculated', label: 'Calculated' },
];

onMounted(() => {
  accountingStore.fetchExpenses();
});

let searchTimeout: ReturnType<typeof setTimeout> | null = null;

function handleSearch(query: string) {
  searchQuery.value = query;
  currentPage.value = 0;

  // Debounce search
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }
  searchTimeout = setTimeout(() => {
    accountingStore.fetchExpenses({
      query: query || undefined,
      page: 0,
    });
  }, 300);
}

function handlePrevPage() {
  if (currentPage.value > 0) {
    currentPage.value--;
    accountingStore.fetchExpenses({
      query: searchQuery.value || undefined,
      page: currentPage.value,
    });
  }
}

function handleNextPage() {
  const totalPages = Math.ceil(
    (accountingStore.pagination.total || 0) /
      (accountingStore.pagination.limit || 10),
  );
  if (currentPage.value < totalPages - 1) {
    currentPage.value++;
    accountingStore.fetchExpenses({
      query: searchQuery.value || undefined,
      page: currentPage.value,
    });
  }
}

function formatCategoryLabel(category: ExpenseCategory): string {
  return categoryLabels[category] || category;
}

function getCategoryBadgeClass(category: ExpenseCategory): string {
  const badgeClasses: Record<ExpenseCategory, string> = {
    utility: 'bg-blue-100 text-blue-800',
    office_supplies: 'bg-purple-100 text-purple-800',
    salary: 'bg-green-100 text-green-800',
    maintenance: 'bg-orange-100 text-orange-800',
    miscellaneous: 'bg-gray-100 text-gray-800',
    bonus: 'bg-yellow-100 text-yellow-800',
    allowances: 'bg-pink-100 text-pink-800',
  };
  return badgeClasses[category] ?? 'bg-gray-100 text-gray-800';
}

function formatDate(timestamp: number): string {
  const date = fromUnixTime(timestamp);
  return format(date, 'MMM d, yyyy');
}

function dateToTimestamp(dateString: string): number {
  // For date-only inputs, set time to start of day (00:00:00)
  const date = new Date(dateString);
  date.setHours(0, 0, 0, 0);
  return getUnixTime(date);
}

function timestampToDateInput(timestamp: number): string {
  const date = fromUnixTime(timestamp);
  return format(date, 'yyyy-MM-dd');
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

function handleAmountInput(event: Event) {
  const input = event.target as HTMLInputElement;
  const value = input.value;
  const numericValue = parseCurrency(value);
  formData.amount = numericValue;
  // Update display with formatted value
  amountDisplay.value = formatCurrency(numericValue);
}

function handleEdit(expense: Expense) {
  editingExpense.value = expense;
  formData.narration = expense.narration;
  formData.reported_at = timestampToDateInput(expense.reported_at);
  formData.has_been_calculated = expense.has_been_calculated || false;
  amountDisplay.value = formatCurrency(expense.amount);
  showModal.value = true;
}

function handleDelete(expense: Expense) {
  if (confirm(`Are you sure you want to delete this expense?`)) {
    accountingStore.deleteExpense(expense.id);
    alertStore.success('Expense deleted successfully');
  }
}

function closeModal() {
  showModal.value = false;
  showCreateModal.value = false;
  editingExpense.value = null;
  formData.category = '' as ExpenseCategory | '';
  formData.amount = 0;
  formData.narration = '';
  formData.reported_at = '';
  formData.has_been_calculated = false;
  amountDisplay.value = '';
}

async function handleSubmit() {
  isSubmitting.value = true;
  try {
    if (editingExpense.value) {
      await accountingStore.updateExpense(editingExpense.value.id, {
        narration: formData.narration,
        reported_at: dateToTimestamp(formData.reported_at),
        has_been_calculated: formData.has_been_calculated,
      });
      alertStore.success('Expense updated successfully');
    } else {
      await accountingStore.createExpense({
        category: formData.category as ExpenseCategory,
        amount: formData.amount,
        narration: formData.narration,
        reported_at: dateToTimestamp(formData.reported_at),
        has_been_calculated: formData.has_been_calculated,
      });
      alertStore.success('Expense created successfully');
    }
    closeModal();
  } catch (error) {
    // Error alert is handled by API interceptor
    console.error('Failed to save expense:', error);
  } finally {
    isSubmitting.value = false;
  }
}

watch(showCreateModal, (val) => {
  if (val) {
    showModal.value = true;
    editingExpense.value = null;
    formData.category = '' as ExpenseCategory | '';
    formData.amount = 0;
    formData.narration = '';
    formData.reported_at = '';
    formData.has_been_calculated = false;
    amountDisplay.value = '';
  }
});
</script>
