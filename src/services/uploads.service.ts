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
   * Create an upload record
   * @param name - Name of the file
   * @param relativeUrl - The key/relative URL from the presigned URL
   * @param fileMimetype - The MIME type of the file
   * @param fileSize - The size of the file in bytes
   * @returns Created upload record
   */
  async create(
    name: string,
    relativeUrl: string,
    fileMimetype: string,
    fileSize: number,
  ): Promise<Upload> {
    const response = await this.api.post('/uploads', {
      name,
      relative_url: relativeUrl,
      file_mimetype: fileMimetype,
      file_size: fileSize,
    });
    return response.data;
  }

  /**
   * Generate a presigned URL for downloading/viewing a file
   * @param key - The file key (relative_url from upload)
   * @returns Presigned URL for viewing the file
   */
  async generateDownloadPresignedUrl(
    key: string,
  ): Promise<PresignedUrlResponse> {
    const response = await this.api.post('/uploads/presigned-url/download', {
      key,
    });
    return {
      url: response.data.data.url,
      key: response.data.data.key,
    };
  }

  /**
   * Delete an upload
   * @param id - Upload ID
   * @returns API response (may contain success message)
   */
  async delete(id: string): Promise<any> {
    const response = await this.api.delete(`/uploads/${id}`);
    return response;
  }
}

export default new UploadsService();
