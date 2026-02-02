import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { bookingsApiClient } from '../clients/bookings-api.client';
import { createSuccessResponse, createErrorResponse } from '../utils/response';
import logger from '../utils/logger';

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const customerId = event.pathParameters?.customerId;

    if (!customerId) {
      return createErrorResponse('Customer ID is required', 400);
    }

    logger.info('Listing customer bookings', { customerId });

    const bookings = await bookingsApiClient.listCustomerBookings(customerId);

    return createSuccessResponse(bookings);
  } catch (error) {
    logger.error('Error listing customer bookings', { error });
    return createErrorResponse(
      error instanceof Error ? error.message : 'Failed to list customer bookings',
      500
    );
  }
};
