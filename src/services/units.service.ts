import baseApi from './base.api';
import type { Unit } from '../types';

class UnitsService {
  private get api() {
    return baseApi.api;
  }

  async getAll(): Promise<Unit[]> {
    const response = await this.api.get('/units');
    return response.data;
  }

  async getById(id: string): Promise<Unit> {
    const response = await this.api.get(`/units/${id}`);
    return response.data;
  }

  async create(unit: Omit<Unit, 'id'>): Promise<Unit> {
    const response = await this.api.post('/units', unit);
    return response.data;
  }

  async update(id: string, unit: Partial<Unit>): Promise<Unit> {
    const response = await this.api.patch(`/units/${id}`, unit);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(`/units/${id}`);
  }
}

export default new UnitsService();

