import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { flightsApiClient } from '../clients/flights-api.client';
import { successResponse, errorResponse } from '../utils/response';
import logger from '../utils/logger';

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const flightId = event.pathParameters?.id;

    if (!flightId) {
      return errorResponse('Flight ID is required', 400);
    }

    logger.info('Getting flight', { flightId });

    const flight = await flightsApiClient.getFlight(flightId);

    return successResponse(flight);
  } catch (error) {
    logger.error('Error getting flight', { error });
    return errorResponse(
      error instanceof Error ? error.message : 'Failed to get flight',
      500
    );
  }
};
