import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { AggregationService } from '../services/aggregation.service';
import { flightsApiClient } from '../clients/flights-api.client';
import { customersApiClient } from '../clients/customers-api.client';
import { bookingsApiClient } from '../clients/bookings-api.client';
import { createSuccessResponse, createErrorResponse } from '../utils/response';
import logger from '../utils/logger';

const aggregationService = new AggregationService(
  flightsApiClient,
  customersApiClient,
  bookingsApiClient
);

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const bookingId = event.pathParameters?.id;

    if (!bookingId) {
      return createErrorResponse('Booking ID is required', 400);
    }

    logger.info('Getting booking details (aggregated)', { bookingId });

    const bookingDetails = await aggregationService.getBookingDetails(bookingId);

    return createSuccessResponse(bookingDetails);
  } catch (error) {
    logger.error('Error getting booking details', { error });
    return createErrorResponse(
      error instanceof Error ? error.message : 'Failed to get booking details',
      500
    );
  }
};
