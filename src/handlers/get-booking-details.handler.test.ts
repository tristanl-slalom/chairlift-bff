import { APIGatewayProxyEvent } from 'aws-lambda';
import { handler } from './get-booking-details.handler';
import { AggregationService } from '../services/aggregation.service';

// Mock the aggregation service
jest.mock('../services/aggregation.service');
jest.mock('../clients/flights-api.client');
jest.mock('../clients/customers-api.client');
jest.mock('../clients/bookings-api.client');

describe('get-booking-details handler', () => {
  const mockEvent: Partial<APIGatewayProxyEvent> = {
    pathParameters: {
      id: 'booking-123'
    }
  };

  it('should return 400 if booking ID is missing', async () => {
    const event = { ...mockEvent, pathParameters: null } as APIGatewayProxyEvent;
    const result = await handler(event);

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body).error).toBe('Booking ID is required');
  });

  it('should return booking details on success', async () => {
    const mockBookingDetails = {
      bookingId: 'booking-123',
      confirmationCode: 'ABC123',
      customerId: 'customer-123',
      flightId: 'flight-123',
      passengers: [],
      pricing: { baseFare: 299, taxes: 50, total: 349 },
      payment: { transactionId: 'txn-123', status: 'COMPLETED' },
      status: 'CONFIRMED',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      flight: {
        flightId: 'flight-123',
        flightNumber: 'AA100',
        airlineCode: 'AA',
        origin: 'LAX',
        destination: 'JFK',
        departureDate: '2024-03-15',
        departureTime: '10:00',
        arrivalDate: '2024-03-15',
        arrivalTime: '18:00',
        duration: 300,
        aircraft: 'Boeing 737',
        capacity: { economy: 100, business: 20, first: 10 },
        availableSeats: { economy: 50, business: 10, first: 5 },
        pricing: { economy: 299, business: 899, first: 1499 },
        status: 'SCHEDULED',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      },
      customer: {
        customerId: 'customer-123',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      }
    };

    // Mock the AggregationService
    (AggregationService.prototype.getBookingDetails as jest.Mock) = jest.fn().mockResolvedValue(mockBookingDetails);

    const result = await handler(mockEvent as APIGatewayProxyEvent);

    expect(result.statusCode).toBe(200);
    const body = JSON.parse(result.body);
    expect(body).toEqual(mockBookingDetails);
  });
});
