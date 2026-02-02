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

    logger.info('Getting customer', { customerId });

    const customer = await customersApiClient.getCustomer(customerId);

    return createSuccessResponse(customer);
  } catch (error) {
    logger.error('Error getting customer', { error });
    return createErrorResponse(
      error instanceof Error ? error.message : 'Failed to get customer',
      500
    );
  }
};
