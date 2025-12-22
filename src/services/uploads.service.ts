import type {
  PaginatedResponse,
  PresignedUrlResponse,
  SearchParams,
  Upload,
} from '../types';
import baseApi from './base.api';

class UploadsService {
  private get api() {
    return baseApi.api;
  }

  /**
   * Generate a presigned URL for uploading a file
   * @param fileMimetype - The MIME type of the file to upload
   * @returns Presigned URL and file key
   */
  async generatePresignedUrl(
    fileMimetype: string,
  ): Promise<PresignedUrlResponse> {
    const response = await this.api.post('/uploads/presigned-url/upload', {
      file_mimetype: fileMimetype,
    });
    return {
      url: response.data.data.url,
      key: response.data.data.key,
    };
  }

  /**
   * Search for uploads with pagination
   * @param params - Search parameters (query, page, limit, etc.)
   * @returns Paginated list of uploads
   */
  async search(params?: SearchParams): Promise<PaginatedResponse<Upload>> {
    const response = await this.api.get('/uploads/search', { params });
    return response.data;
  }

  /**
   * Get upload by ID
   * @param id - Upload ID
   * @returns Upload details
   */
  async getById(id: string): Promise<Upload> {
    const response = await this.api.get(`/uploads/${id}`);
    return response.data;
  }

  /**
   * Delete an upload
   * @param id - Upload ID
   */
  async delete(id: string): Promise<void> {
    await this.api.delete(`/uploads/${id}`);
  }
}

export default new UploadsService();
