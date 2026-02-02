import { StatusConfigApiClient } from '../clients/status-config-api.client';
import {
  StatusConfig,
  CreateStatusConfigRequest,
  UpdateStatusConfigRequest,
  ReorderStatusesRequest
} from '../types/status-config.types';
import logger from '../utils/logger';

export class StatusConfigService {
  constructor(private statusConfigApiClient: StatusConfigApiClient) {}

  async createStatus(request: CreateStatusConfigRequest): Promise<StatusConfig> {
    logger.info('Creating status', { statusKey: request.statusKey });
    return await this.statusConfigApiClient.createStatus(request);
  }

  async getStatus(statusKey: string): Promise<StatusConfig> {
    logger.info('Getting status', { statusKey });
    return await this.statusConfigApiClient.getStatus(statusKey);
  }

  async listStatuses(): Promise<StatusConfig[]> {
    logger.info('Listing statuses');
    return await this.statusConfigApiClient.listStatuses();
  }

  async updateStatus(statusKey: string, request: UpdateStatusConfigRequest): Promise<StatusConfig> {
    logger.info('Updating status', { statusKey });
    return await this.statusConfigApiClient.updateStatus(statusKey, request);
  }

  async deleteStatus(statusKey: string): Promise<void> {
    logger.info('Deleting status', { statusKey });
    await this.statusConfigApiClient.deleteStatus(statusKey);
  }

  async reorderStatuses(request: ReorderStatusesRequest): Promise<void> {
    logger.info('Reordering statuses', { count: request.statuses.length });
    await this.statusConfigApiClient.reorderStatuses(request);
  }
}
