import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { bookingsApiClient } from '../clients/bookings-api.client';
import { createSuccessResponse, createErrorResponse } from '../utils/response';
import logger from '../utils/logger';

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    if (!event.body) {
      return createErrorResponse('Request body is required', 400);
    }

    const createRequest = JSON.parse(event.body);

    logger.info('Creating booking', { customerId: createRequest.customerId });

    const booking = await bookingsApiClient.createBooking(createRequest);

    return createSuccessResponse(booking, 201);
  } catch (error) {
    logger.error('Error creating booking', { error });
    return createErrorResponse(
      error instanceof Error ? error.message : 'Failed to create booking',
      500
    );
  }
};
