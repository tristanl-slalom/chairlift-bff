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
    if (!event.body) {
      return errorResponse('Request body is required', 400);
    }

    const request = JSON.parse(event.body);
    const task = await tasksService.createTask(request);
    return successResponse(task, 201);
  } catch (error) {
    logger.error('Error in createTask handler', { error });
    return handleAxiosError(error);
  }
};
