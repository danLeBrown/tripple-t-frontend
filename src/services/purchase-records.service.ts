import type {
    CreatePurchaseRecordsRequest,
    PaginatedResponse,
    PurchaseRecord,
    SearchParams,
} from '../types';
import baseApi from './base.api';

class PurchaseRecordsService {
  private get api() {
    return baseApi.api;
  }

  async search(
    params?: SearchParams,
  ): Promise<PaginatedResponse<PurchaseRecord>> {
    const response = await this.api.get('/purchase-records/search', { params });
    return response.data;
  }

  async getById(id: string): Promise<PurchaseRecord> {
    const response = await this.api.get(`/purchase-records/${id}`);
    return response.data;
  }

  async create(
    supplierId: string,
    data: CreatePurchaseRecordsRequest,
  ): Promise<PurchaseRecord[]> {
    const response = await this.api.post(
      `/purchase-records/suppliers/${supplierId}`,
      data,
    );
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(`/purchase-records/${id}`);
  }
}

export default new PurchaseRecordsService();
