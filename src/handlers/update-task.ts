import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { tasksApiClient } from '../clients/tasks-api.client';
import { TasksService } from '../services/tasks.service';
import { successResponse, errorResponse } from '../utils/response';
import logger from '../utils/logger';
import { AxiosError } from 'axios';

const tasksService = new TasksService(tasksApiClient);

const handleAxiosError = (error: unknown): APIGatewayProxyResult => {
  if (error instanceof AxiosError) {
    const status = error.response?.status || 500;
    const message = error.response?.data?.error || error.message;
    return errorResponse(message, status);
  }
  return errorResponse('Internal server error', 500);
};

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const taskId = event.pathParameters?.id;

    if (!taskId) {
      return errorResponse('Task ID is required', 400);
    }

    if (!event.body) {
      return errorResponse('Request body is required', 400);
    }

    const request = JSON.parse(event.body);
    const task = await tasksService.updateTask(taskId, request);
    return successResponse(task);
  } catch (error) {
    logger.error('Error in updateTask handler', { error });
    return handleAxiosError(error);
  }
};
