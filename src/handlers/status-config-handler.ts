import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { statusConfigApiClient } from '../clients/status-config-api.client';
import { StatusConfigService } from '../services/status-config.service';
import { successResponse, errorResponse } from '../utils/response';
import logger from '../utils/logger';
import { AxiosError } from 'axios';

const statusConfigService = new StatusConfigService(statusConfigApiClient);

const handleAxiosError = (error: unknown): APIGatewayProxyResult => {
  if (error instanceof AxiosError) {
    const status = error.response?.status || 500;
    const message = error.response?.data?.error || error.message;
    return errorResponse(message, status);
  }
  return errorResponse('Internal server error', 500);
};

export const createStatus = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    if (!event.body) {
      return errorResponse('Request body is required', 400);
    }

    const request = JSON.parse(event.body);
    const status = await statusConfigService.createStatus(request);
    return successResponse(status, 201);
  } catch (error) {
    logger.error('Error in createStatus handler', { error });
    return handleAxiosError(error);
  }
};

export const getStatus = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const statusKey = event.pathParameters?.statusKey;

    if (!statusKey) {
      return errorResponse('Status key is required', 400);
    }

    const status = await statusConfigService.getStatus(statusKey);
    return successResponse(status);
  } catch (error) {
    logger.error('Error in getStatus handler', { error });
    return handleAxiosError(error);
  }
};

export const listStatuses = async (
  _event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const statuses = await statusConfigService.listStatuses();
    return successResponse(statuses);
  } catch (error) {
    logger.error('Error in listStatuses handler', { error });
    return handleAxiosError(error);
  }
};

export const updateStatus = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const statusKey = event.pathParameters?.statusKey;

    if (!statusKey) {
      return errorResponse('Status key is required', 400);
    }

    if (!event.body) {
      return errorResponse('Request body is required', 400);
    }

    const request = JSON.parse(event.body);
    const status = await statusConfigService.updateStatus(statusKey, request);
    return successResponse(status);
  } catch (error) {
    logger.error('Error in updateStatus handler', { error });
    return handleAxiosError(error);
  }
};

export const deleteStatus = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const statusKey = event.pathParameters?.statusKey;

    if (!statusKey) {
      return errorResponse('Status key is required', 400);
    }

    await statusConfigService.deleteStatus(statusKey);
    return successResponse(null, 204);
  } catch (error) {
    logger.error('Error in deleteStatus handler', { error });
    return handleAxiosError(error);
  }
};

export const reorderStatuses = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    if (!event.body) {
      return errorResponse('Request body is required', 400);
    }

    const request = JSON.parse(event.body);
    await statusConfigService.reorderStatuses(request);
    return successResponse(null, 204);
  } catch (error) {
    logger.error('Error in reorderStatuses handler', { error });
    return handleAxiosError(error);
  }
};
