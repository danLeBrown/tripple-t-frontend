import type { Expense, PaginatedResponse, SearchParams } from '../types';
import baseApi from './base.api';

class ExpensesService {
  private get api() {
    return baseApi.api;
  }

  async search(params?: SearchParams): Promise<PaginatedResponse<Expense>> {
    const response = await this.api.get('/expenses/search', { params });
    return response.data;
  }

  async getById(id: string): Promise<Expense> {
    const response = await this.api.get(`/expenses/${id}`);
    return response.data;
  }

  async create(
    expense: Omit<
      Expense,
      'id' | 'created_at' | 'updated_at' | 'has_been_calculated'
    > & {
      has_been_calculated?: boolean;
    },
  ): Promise<Expense> {
    const response = await this.api.post('/expenses', expense);
    return response.data;
  }

  async update(
    id: string,
    expense: {
      narration?: string;
      has_been_calculated?: boolean;
      reported_at?: number;
    },
  ): Promise<Expense> {
    const response = await this.api.patch(`/expenses/${id}`, expense);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(`/expenses/${id}`);
  }
}

export default new ExpensesService();
