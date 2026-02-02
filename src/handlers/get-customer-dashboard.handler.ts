import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { AggregationService } from '../services/aggregation.service';
import { flightsApiClient } from '../clients/flights-api.client';
import { customersApiClient } from '../clients/customers-api.client';
import { bookingsApiClient } from '../clients/bookings-api.client';
import { successResponse, errorResponse } from '../utils/response';
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
    const customerId = event.pathParameters?.id;

    if (!customerId) {
      return errorResponse('Customer ID is required', 400);
    }

    logger.info('Getting customer dashboard (aggregated)', { customerId });

    const dashboard = await aggregationService.getCustomerDashboard(customerId);

    return successResponse(dashboard);
  } catch (error) {
    logger.error('Error getting customer dashboard', { error });
    return errorResponse(
      error instanceof Error ? error.message : 'Failed to get customer dashboard',
      500
    );
  }
};
