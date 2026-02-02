export interface Task {
  id: string;
  title: string;
  description: string;
  status: string; // Changed from enum to string for dynamic statuses
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskRequest {
  title: string;
  description: string;
  status?: string; // Changed from enum to string for dynamic statuses
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  status?: string; // Changed from enum to string for dynamic statuses
}

export interface TasksApiResponse<T> {
  data: T;
}

export interface TasksApiErrorResponse {
  error: string;
}
