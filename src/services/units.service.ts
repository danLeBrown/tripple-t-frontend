import type { PaginatedResponse, SearchParams, Unit } from '../types';
import baseApi from './base.api';

class UnitsService {
  private get api() {
    return baseApi.api;
  }

  async search(params?: SearchParams): Promise<PaginatedResponse<Unit>> {
    const response = await this.api.get('/units/search', { params });
    return response.data;
  }

  async getById(id: string): Promise<Unit> {
    const response = await this.api.get(`/units/${id}`);
    return response.data;
  }

  async create(
    unit: Omit<Unit, 'id' | 'created_at' | 'updated_at' | 'slug'>,
  ): Promise<Unit> {
    const response = await this.api.post('/units', unit);
    return response.data;
  }

  async update(
    id: string,
    unit: Partial<Omit<Unit, 'id' | 'created_at' | 'updated_at' | 'slug'>>,
  ): Promise<Unit> {
    const response = await this.api.patch(`/units/${id}`, unit);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(`/units/${id}`);
  }
}

export default new UnitsService();
