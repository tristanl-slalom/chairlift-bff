import { TasksApiClient } from '../clients/tasks-api.client';
import {
  Task,
  CreateTaskRequest,
  UpdateTaskRequest
} from '../types/task.types';
import logger from '../utils/logger';

export class TasksService {
  constructor(private tasksApiClient: TasksApiClient) {}

  async createTask(request: CreateTaskRequest): Promise<Task> {
    try {
      logger.info('Creating task', { request });
      const task = await this.tasksApiClient.createTask(request);
      logger.info('Task created successfully', { taskId: task.id });
      return task;
    } catch (error) {
      logger.error('Error creating task', { error });
      throw error;
    }
  }

  async getTask(id: string): Promise<Task> {
    try {
      logger.info('Getting task', { taskId: id });
      const task = await this.tasksApiClient.getTask(id);
      return task;
    } catch (error) {
      logger.error('Error getting task', { taskId: id, error });
      throw error;
    }
  }

  async listTasks(status?: string): Promise<Task[]> {
    try {
      logger.info('Listing tasks', { status });
      const tasks = await this.tasksApiClient.listTasks(status);
      return tasks;
    } catch (error) {
      logger.error('Error listing tasks', { status, error });
      throw error;
    }
  }

  async updateTask(id: string, request: UpdateTaskRequest): Promise<Task> {
    try {
      logger.info('Updating task', { taskId: id, request });
      const task = await this.tasksApiClient.updateTask(id, request);
      logger.info('Task updated successfully', { taskId: task.id });
      return task;
    } catch (error) {
      logger.error('Error updating task', { taskId: id, error });
      throw error;
    }
  }

  async deleteTask(id: string): Promise<void> {
    try {
      logger.info('Deleting task', { taskId: id });
      await this.tasksApiClient.deleteTask(id);
      logger.info('Task deleted successfully', { taskId: id });
    } catch (error) {
      logger.error('Error deleting task', { taskId: id, error });
      throw error;
    }
  }
}
