import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { customersApiClient } from '../clients/customers-api.client';
import { createSuccessResponse, createErrorResponse } from '../utils/response';
import logger from '../utils/logger';

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const customerId = event.pathParameters?.id;

    if (!customerId) {
      return createErrorResponse('Customer ID is required', 400);
    }

    if (!event.body) {
      return createErrorResponse('Request body is required', 400);
    }

    const updateRequest = JSON.parse(event.body);

    logger.info('Updating customer', { customerId });

    const customer = await customersApiClient.updateCustomer(
      customerId,
      updateRequest
    );

    return createSuccessResponse(customer);
  } catch (error) {
    logger.error('Error updating customer', { error });
    return createErrorResponse(
      error instanceof Error ? error.message : 'Failed to update customer',
      500
    );
  }
};
