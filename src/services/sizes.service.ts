import baseApi from './base.api';
import type { Size, PaginatedResponse, SearchParams } from '../types';

class SizesService {
  private get api() {
    return baseApi.api;
  }

  async search(params?: SearchParams): Promise<PaginatedResponse<Size>> {
    const response = await this.api.get('/sizes/search', { params });
    return response.data;
  }

  async getById(id: string): Promise<Size> {
    const response = await this.api.get(`/sizes/${id}`);
    return response.data;
  }

  async create(size: Omit<Size, 'id' | 'created_at' | 'updated_at'>): Promise<Size> {
    const response = await this.api.post('/sizes', size);
    return response.data;
  }

  async update(id: string, size: Partial<Omit<Size, 'id' | 'created_at' | 'updated_at'>>): Promise<Size> {
    const response = await this.api.patch(`/sizes/${id}`, size);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(`/sizes/${id}`);
  }
}

export default new SizesService();

