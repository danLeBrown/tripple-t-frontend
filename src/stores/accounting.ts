import { defineStore } from 'pinia';
import { ref } from 'vue';

import expensesService from '../services/expenses.service';
import type { Expense, SearchParams } from '../types';

export const useAccountingStore = defineStore('accounting', () => {
  const expenses = ref<Expense[]>([]);

  // Pagination metadata
  const pagination = ref({
    total: 0,
    limit: 10,
    page: 0,
  });

  const loading = ref(false);
  const error = ref<string | null>(null);

  // Expenses
  async function fetchExpenses(params?: SearchParams) {
    loading.value = true;
    error.value = null;
    try {
      const response = await expensesService.search(params);
      expenses.value = response.data;
      pagination.value = {
        total: response.total,
        limit: response.limit,
        page: response.page,
      };
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : 'Failed to fetch expenses';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function createExpense(
    expense: Omit<
      Expense,
      'id' | 'created_at' | 'updated_at' | 'has_been_calculated'
    > & {
      has_been_calculated?: boolean;
    },
  ) {
    loading.value = true;
    error.value = null;
    try {
      await expensesService.create(expense);
      // Refetch to get updated list from server
      await fetchExpenses();
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : 'Failed to create expense';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function updateExpense(
    id: string,
    expense: {
      narration?: string;
      has_been_calculated?: boolean;
      reported_at?: number;
    },
  ) {
    loading.value = true;
    error.value = null;
    try {
      await expensesService.update(id, expense);
      // Refetch to get updated list from server
      await fetchExpenses();
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : 'Failed to update expense';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function deleteExpense(id: string) {
    loading.value = true;
    error.value = null;
    try {
      await expensesService.delete(id);
      expenses.value = expenses.value.filter((e) => e.id !== id);
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : 'Failed to delete expense';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  return {
    expenses,
    pagination,
    loading,
    error,
    fetchExpenses,
    createExpense,
    updateExpense,
    deleteExpense,
  };
});

