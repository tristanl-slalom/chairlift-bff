import axios, { AxiosInstance } from 'axios';
import {
  StatusConfig,
  CreateStatusConfigRequest,
  UpdateStatusConfigRequest,
  ReorderStatusesRequest,
  StatusConfigApiResponse
} from '../types/status-config.types';
import logger from '../utils/logger';

export class StatusConfigApiClient {
  private client: AxiosInstance;

  constructor(baseURL: string) {
    this.client = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    this.client.interceptors.request.use(
      (config) => {
        logger.info('Status Config API request', {
          method: config.method,
          url: config.url
        });
        return config;
      },
      (error) => {
        logger.error('Status Config API request error', { error });
        return Promise.reject(error);
      }
    );

    this.client.interceptors.response.use(
      (response) => {
        logger.info('Status Config API response', {
          status: response.status,
          url: response.config.url
        });
        return response;
      },
      (error) => {
        logger.error('Status Config API response error', {
          status: error.response?.status,
          message: error.message,
          url: error.config?.url
        });
        return Promise.reject(error);
      }
    );
  }

  async createStatus(request: CreateStatusConfigRequest): Promise<StatusConfig> {
    const response = await this.client.post<StatusConfigApiResponse<StatusConfig>>(
      '/statuses',
      request
    );
    return response.data.data;
  }

  async getStatus(statusKey: string): Promise<StatusConfig> {
    const response = await this.client.get<StatusConfigApiResponse<StatusConfig>>(
      `/statuses/${statusKey}`
    );
    return response.data.data;
  }

  async listStatuses(): Promise<StatusConfig[]> {
    const response = await this.client.get<StatusConfigApiResponse<StatusConfig[]>>(
      '/statuses'
    );
    return response.data.data;
  }

  async updateStatus(statusKey: string, request: UpdateStatusConfigRequest): Promise<StatusConfig> {
    const response = await this.client.put<StatusConfigApiResponse<StatusConfig>>(
      `/statuses/${statusKey}`,
      request
    );
    return response.data.data;
  }

  async deleteStatus(statusKey: string): Promise<void> {
    await this.client.delete(`/statuses/${statusKey}`);
  }

  async reorderStatuses(request: ReorderStatusesRequest): Promise<void> {
    await this.client.post('/statuses/reorder', request);
  }
}

const TASKS_API_URL = process.env.TASKS_API_URL || 'http://localhost:3001';
export const statusConfigApiClient = new StatusConfigApiClient(TASKS_API_URL);
