export interface StatusConfig {
  statusKey: string;
  displayName: string;
  displayOrder: number;
  color: string;
  icon: string;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStatusConfigRequest {
  statusKey: string;
  displayName: string;
  displayOrder: number;
  color: string;
  icon: string;
  isDefault?: boolean;
}

export interface UpdateStatusConfigRequest {
  displayName?: string;
  displayOrder?: number;
  color?: string;
  icon?: string;
  isDefault?: boolean;
}

export interface ReorderStatusesRequest {
  statuses: Array<{
    statusKey: string;
    displayOrder: number;
  }>;
}

export interface StatusConfigApiResponse<T> {
  data: T;
}

export interface StatusConfigApiErrorResponse {
  error: string;
}
