import { APIGatewayProxyEvent } from 'aws-lambda';
import * as handlers from './tasks.handler';
import { TasksService } from '../services/tasks.service';

jest.mock('../clients/tasks-api.client', () => ({
  tasksApiClient: {}
}));

jest.mock('../services/tasks.service');

describe('Tasks Handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createTask', () => {
    it('should create a task successfully', async () => {
      const mockTask = {
        id: '123',
        title: 'Test Task',
        description: 'Test description',
        status: 'TODO' as const,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      };

      (TasksService.prototype.createTask as jest.Mock).mockResolvedValue(mockTask);

      const event = {
        body: JSON.stringify({
          title: 'Test Task',
          description: 'Test description'
        })
      } as APIGatewayProxyEvent;

      const result = await handlers.createTask(event);

      expect(result.statusCode).toBe(201);
      expect(JSON.parse(result.body)).toEqual(mockTask);
    });

    it('should return 400 if body is missing', async () => {
      const event = {} as APIGatewayProxyEvent;

      const result = await handlers.createTask(event);

      expect(result.statusCode).toBe(400);
      expect(JSON.parse(result.body).error).toBe('Request body is required');
    });
  });

  describe('getTask', () => {
    it('should get a task successfully', async () => {
      const mockTask = {
        id: '123',
        title: 'Test Task',
        description: 'Test description',
        status: 'TODO' as const,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      };

      (TasksService.prototype.getTask as jest.Mock).mockResolvedValue(mockTask);

      const event = {
        pathParameters: { id: '123' }
      } as unknown as APIGatewayProxyEvent;

      const result = await handlers.getTask(event);

      expect(result.statusCode).toBe(200);
      expect(JSON.parse(result.body)).toEqual(mockTask);
    });

    it('should return 400 if task ID is missing', async () => {
      const event = {} as APIGatewayProxyEvent;

      const result = await handlers.getTask(event);

      expect(result.statusCode).toBe(400);
      expect(JSON.parse(result.body).error).toBe('Task ID is required');
    });
  });

  describe('listTasks', () => {
    it('should list tasks successfully', async () => {
      const mockTasks = [
        {
          id: '123',
          title: 'Test Task 1',
          description: 'Test description 1',
          status: 'TODO' as const,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z'
        }
      ];

      (TasksService.prototype.listTasks as jest.Mock).mockResolvedValue(mockTasks);

      const event = {} as APIGatewayProxyEvent;

      const result = await handlers.listTasks(event);

      expect(result.statusCode).toBe(200);
      expect(JSON.parse(result.body)).toEqual(mockTasks);
    });
  });

  describe('updateTask', () => {
    it('should update a task successfully', async () => {
      const mockTask = {
        id: '123',
        title: 'Updated Task',
        description: 'Updated description',
        status: 'IN_PROGRESS' as const,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      };

      (TasksService.prototype.updateTask as jest.Mock).mockResolvedValue(mockTask);

      const event = {
        pathParameters: { id: '123' },
        body: JSON.stringify({
          title: 'Updated Task',
          status: 'IN_PROGRESS'
        })
      } as unknown as APIGatewayProxyEvent;

      const result = await handlers.updateTask(event);

      expect(result.statusCode).toBe(200);
      expect(JSON.parse(result.body)).toEqual(mockTask);
    });
  });

  describe('deleteTask', () => {
    it('should delete a task successfully', async () => {
      (TasksService.prototype.deleteTask as jest.Mock).mockResolvedValue(undefined);

      const event = {
        pathParameters: { id: '123' }
      } as unknown as APIGatewayProxyEvent;

      const result = await handlers.deleteTask(event);

      expect(result.statusCode).toBe(200);
      expect(JSON.parse(result.body)).toEqual({ message: 'Task deleted successfully' });
    });
  });
});
