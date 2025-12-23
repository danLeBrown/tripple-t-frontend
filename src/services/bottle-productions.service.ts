import type {
  BottleProduction,
  CreateBottleProductionRequest,
  PaginatedResponse,
  SearchParams,
  UpdateBottleProductionRequest,
} from '../types';
import baseApi from './base.api';

class BottleProductionsService {
  private get api() {
    return baseApi.api;
  }

  async search(
    params?: SearchParams,
  ): Promise<PaginatedResponse<BottleProduction>> {
    const response = await this.api.get('/bottle-productions/search', {
      params,
    });
    return response.data;
  }

  async getById(id: string): Promise<BottleProduction> {
    const response = await this.api.get(`/bottle-productions/${id}`);
    return response.data;
  }

  async create(
    data: CreateBottleProductionRequest,
  ): Promise<BottleProduction> {
    const response = await this.api.post('/bottle-productions', data);
    return response.data;
  }

  async update(
    id: string,
    data: UpdateBottleProductionRequest,
  ): Promise<BottleProduction> {
    const response = await this.api.patch(`/bottle-productions/${id}`, data);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(`/bottle-productions/${id}`);
  }
}

export default new BottleProductionsService();

