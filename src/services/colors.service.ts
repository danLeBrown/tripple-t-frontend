import type { Colour, PaginatedResponse, SearchParams } from '../types';
import baseApi from './base.api';

class ColorsService {
  private get api() {
    return baseApi.api;
  }

  async search(params?: SearchParams): Promise<PaginatedResponse<Colour>> {
    const response = await this.api.get('/colours/search', { params });
    return response.data;
  }

  async getById(id: string): Promise<Colour> {
    const response = await this.api.get(`/colours/${id}`);
    return response.data;
  }

  async create(
    colour: Omit<Colour, 'id' | 'created_at' | 'updated_at' | 'slug'>,
  ): Promise<Colour> {
    const response = await this.api.post('/colours', colour);
    return response.data;
  }

  async update(
    id: string,
    colour: Partial<Omit<Colour, 'id' | 'created_at' | 'updated_at'>>,
  ): Promise<Colour> {
    const response = await this.api.patch(`/colours/${id}`, colour);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(`/colours/${id}`);
  }
}

export default new ColorsService();
