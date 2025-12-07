import baseApi from './base.api';
import type { Customer } from '../types';

class CustomersService {
  private get api() {
    return baseApi.api;
  }

  async getAll(): Promise<Customer[]> {
    const response = await this.api.get('/customers');
    return response.data;
  }

  async getById(id: string): Promise<Customer> {
    const response = await this.api.get(`/customers/${id}`);
    return response.data;
  }

  async create(customer: Omit<Customer, 'id' | 'created_at' | 'updated_at'>): Promise<Customer> {
    const response = await this.api.post('/customers', customer);
    return response.data;
  }

  async update(id: string, customer: Partial<Omit<Customer, 'id' | 'created_at' | 'updated_at'>>): Promise<Customer> {
    const response = await this.api.patch(`/customers/${id}`, customer);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(`/customers/${id}`);
  }
}

export default new CustomersService();

