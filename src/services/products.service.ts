import baseApi from './base.api';
import type { Product } from '../types';

class ProductsService {
  private get api() {
    return baseApi.api;
  }

  async getAll(): Promise<Product[]> {
    const response = await this.api.get('/products');
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

