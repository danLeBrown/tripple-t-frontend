import baseApi from './base.api';
import type { Product, PaginatedResponse, SearchParams } from '../types';

class ProductsService {
  private get api() {
    return baseApi.api;
  }

  async search(params?: SearchParams): Promise<PaginatedResponse<Product>> {
    const response = await this.api.get('/products/search', { params });
    return response.data;
  }

  async getById(id: string): Promise<Product> {
    const response = await this.api.get(`/products/${id}`);
    return response.data;
  }

  async create(product: Omit<Product, 'id' | 'created_at' | 'updated_at' | 'slug'>): Promise<Product> {
    const response = await this.api.post('/products', product);
    return response.data;
  }

  async update(id: string, product: Partial<Omit<Product, 'id' | 'created_at' | 'updated_at' | 'slug'>>): Promise<Product> {
    const response = await this.api.patch(`/products/${id}`, product);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(`/products/${id}`);
  }
}

export default new ProductsService();

