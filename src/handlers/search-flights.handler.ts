import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { flightsApiClient } from '../clients/flights-api.client';
import { successResponse, errorResponse } from '../utils/response';
import logger from '../utils/logger';

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const { origin, destination, departureDate } = event.queryStringParameters || {};

    logger.info('Searching flights', { origin, destination, departureDate });

    const flights = await flightsApiClient.searchFlights(
      origin,
      destination,
      departureDate
    );

    return successResponse(flights);
  } catch (error) {
    logger.error('Error searching flights', { error });
    return errorResponse(
      error instanceof Error ? error.message : 'Failed to search flights',
      500
    );
  }
};
