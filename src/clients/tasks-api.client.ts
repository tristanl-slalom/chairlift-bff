import axios, { AxiosInstance } from 'axios';
import {
  Task,
  CreateTaskRequest,
  UpdateTaskRequest,
  TasksApiResponse
} from '../types/task.types';
import logger from '../utils/logger';

export class TasksApiClient {
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
        logger.info('Tasks API request', {
          method: config.method,
          url: config.url
        });
        return config;
      },
      (error) => {
        logger.error('Tasks API request error', { error });
        return Promise.reject(error);
      }
    );

    this.client.interceptors.response.use(
      (response) => {
        logger.info('Tasks API response', {
          status: response.status,
          url: response.config.url
        });
        return response;
      },
      (error) => {
        logger.error('Tasks API response error', {
          status: error.response?.status,
          message: error.message,
          url: error.config?.url
        });
        return Promise.reject(error);
      }
    );
  }

  async createTask(request: CreateTaskRequest): Promise<Task> {
    const response = await this.client.post<TasksApiResponse<Task>>(
      '/tasks',
      request
    );
    return response.data.data;
  }

  async getTask(id: string): Promise<Task> {
    const response = await this.client.get<TasksApiResponse<Task>>(
      `/tasks/${id}`
    );
    return response.data.data;
  }

  async listTasks(status?: string): Promise<Task[]> {
    const params = status ? { status } : {};
    const response = await this.client.get<TasksApiResponse<Task[]>>(
      '/tasks',
      { params }
    );
    return response.data.data;
  }

  async updateTask(id: string, request: UpdateTaskRequest): Promise<Task> {
    const response = await this.client.put<TasksApiResponse<Task>>(
      `/tasks/${id}`,
      request
    );
    return response.data.data;
  }

  async deleteTask(id: string): Promise<void> {
    await this.client.delete(`/tasks/${id}`);
  }
}

const TASKS_API_URL = process.env.TASKS_API_URL || 'http://localhost:3001';
export const tasksApiClient = new TasksApiClient(TASKS_API_URL);
