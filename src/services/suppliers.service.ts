import baseApi from './base.api';
import type { Supplier, PaginatedResponse, SearchParams } from '../types';

class SuppliersService {
  private get api() {
    return baseApi.api;
  }

  async search(params?: SearchParams): Promise<PaginatedResponse<Supplier>> {
    const response = await this.api.get('/suppliers/search', { params });
    return response.data;
  }

  async getById(id: string): Promise<Supplier> {
    const response = await this.api.get(`/suppliers/${id}`);
    return response.data;
  }

  async create(supplier: Omit<Supplier, 'id' | 'created_at' | 'updated_at'>): Promise<Supplier> {
    const response = await this.api.post('/suppliers', supplier);
    return response.data;
  }

  async update(id: string, supplier: Partial<Omit<Supplier, 'id' | 'created_at' | 'updated_at'>>): Promise<Supplier> {
    const response = await this.api.patch(`/suppliers/${id}`, supplier);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(`/suppliers/${id}`);
  }
}

export default new SuppliersService();

