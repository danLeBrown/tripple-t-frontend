import baseApi from './base.api';
import type { Colour } from '../types';

class ColorsService {
  private get api() {
    return baseApi.api;
  }

  async getAll(): Promise<Colour[]> {
    const response = await this.api.get('/colors');
    return response.data;
  }

  async getById(id: string): Promise<Colour> {
    const response = await this.api.get(`/colors/${id}`);
    return response.data;
  }

  async create(colour: Omit<Colour, 'id' | 'created_at' | 'updated_at'>): Promise<Colour> {
    const response = await this.api.post('/colors', colour);
    return response.data;
  }

  async update(id: string, colour: Partial<Omit<Colour, 'id' | 'created_at' | 'updated_at'>>): Promise<Colour> {
    const response = await this.api.patch(`/colors/${id}`, colour);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(`/colors/${id}`);
  }
}

export default new ColorsService();

