import { AggregationService } from './aggregation.service';
import { FlightsApiClient } from '../clients/flights-api.client';
import { CustomersApiClient } from '../clients/customers-api.client';
import { BookingsApiClient } from '../clients/bookings-api.client';
import { Flight } from '../types/flight.types';
import { Customer } from '../types/customer.types';
import { Booking } from '../types/booking.types';

// Mock the clients
jest.mock('../clients/flights-api.client');
jest.mock('../clients/customers-api.client');
jest.mock('../clients/bookings-api.client');

describe('AggregationService', () => {
  let service: AggregationService;
  let mockFlightsClient: jest.Mocked<FlightsApiClient>;
  let mockCustomersClient: jest.Mocked<CustomersApiClient>;
  let mockBookingsClient: jest.Mocked<BookingsApiClient>;

  const mockFlight: Flight = {
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
  };

  const mockCustomer: Customer = {
    customerId: 'customer-123',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  };

  const mockBooking: Booking = {
    bookingId: 'booking-123',
    confirmationCode: 'ABC123',
    customerId: 'customer-123',
    flightId: 'flight-123',
    passengers: [
      {
        firstName: 'John',
        lastName: 'Doe',
        cabinClass: 'economy'
      }
    ],
    pricing: {
      baseFare: 299,
      taxes: 50,
      total: 349
    },
    payment: {
      transactionId: 'txn-123',
      status: 'COMPLETED'
    },
    status: 'CONFIRMED',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  };

  beforeEach(() => {
    mockFlightsClient = new FlightsApiClient('http://test') as jest.Mocked<FlightsApiClient>;
    mockCustomersClient = new CustomersApiClient('http://test') as jest.Mocked<CustomersApiClient>;
    mockBookingsClient = new BookingsApiClient('http://test') as jest.Mocked<BookingsApiClient>;

    service = new AggregationService(
      mockFlightsClient,
      mockCustomersClient,
      mockBookingsClient
    );
  });

  describe('getBookingDetails', () => {
    it('should fetch booking details with flight and customer data', async () => {
      mockBookingsClient.getBooking = jest.fn().mockResolvedValue(mockBooking);
      mockFlightsClient.getFlight = jest.fn().mockResolvedValue(mockFlight);
      mockCustomersClient.getCustomer = jest.fn().mockResolvedValue(mockCustomer);

      const result = await service.getBookingDetails('booking-123');

      expect(result).toEqual({
        ...mockBooking,
        flight: mockFlight,
        customer: mockCustomer
      });
      expect(mockBookingsClient.getBooking).toHaveBeenCalledWith('booking-123');
      expect(mockFlightsClient.getFlight).toHaveBeenCalledWith('flight-123');
      expect(mockCustomersClient.getCustomer).toHaveBeenCalledWith('customer-123');
    });

    it('should handle errors when fetching booking details', async () => {
      mockBookingsClient.getBooking = jest.fn().mockRejectedValue(new Error('Booking not found'));

      await expect(service.getBookingDetails('booking-123')).rejects.toThrow('Booking not found');
    });
  });

  describe('getCustomerDashboard', () => {
    it('should fetch customer dashboard with all bookings and flight details', async () => {
      const mockBookings = [mockBooking];

      mockCustomersClient.getCustomer = jest.fn().mockResolvedValue(mockCustomer);
      mockBookingsClient.listCustomerBookings = jest.fn().mockResolvedValue(mockBookings);
      mockFlightsClient.getFlight = jest.fn().mockResolvedValue(mockFlight);

      const result = await service.getCustomerDashboard('customer-123');

      expect(result).toEqual({
        customer: mockCustomer,
        bookings: [
          {
            booking: mockBooking,
            flight: mockFlight
          }
        ]
      });
      expect(mockCustomersClient.getCustomer).toHaveBeenCalledWith('customer-123');
      expect(mockBookingsClient.listCustomerBookings).toHaveBeenCalledWith('customer-123');
      expect(mockFlightsClient.getFlight).toHaveBeenCalledWith('flight-123');
    });

    it('should handle multiple bookings', async () => {
      const mockBooking2 = { ...mockBooking, bookingId: 'booking-456', flightId: 'flight-456' };
      const mockFlight2 = { ...mockFlight, flightId: 'flight-456' };
      const mockBookings = [mockBooking, mockBooking2];

      mockCustomersClient.getCustomer = jest.fn().mockResolvedValue(mockCustomer);
      mockBookingsClient.listCustomerBookings = jest.fn().mockResolvedValue(mockBookings);
      mockFlightsClient.getFlight = jest
        .fn()
        .mockResolvedValueOnce(mockFlight)
        .mockResolvedValueOnce(mockFlight2);

      const result = await service.getCustomerDashboard('customer-123');

      expect(result.bookings).toHaveLength(2);
      expect(mockFlightsClient.getFlight).toHaveBeenCalledTimes(2);
    });
  });

  describe('searchFlightsWithAvailability', () => {
    it('should enhance flights with availability information', async () => {
      const mockFlights = [mockFlight];
      mockFlightsClient.searchFlights = jest.fn().mockResolvedValue(mockFlights);

      const result = await service.searchFlightsWithAvailability('LAX', 'JFK', '2024-03-15');

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        ...mockFlight,
        hasAvailableSeats: true,
        lowestPrice: 299
      });
      expect(mockFlightsClient.searchFlights).toHaveBeenCalledWith('LAX', 'JFK', '2024-03-15');
    });

    it('should calculate lowest price correctly', async () => {
      const flightWithLimitedSeats = {
        ...mockFlight,
        availableSeats: { economy: 0, business: 10, first: 0 }
      };
      mockFlightsClient.searchFlights = jest.fn().mockResolvedValue([flightWithLimitedSeats]);

      const result = await service.searchFlightsWithAvailability('LAX', 'JFK', '2024-03-15');

      expect(result[0].lowestPrice).toBe(899); // Business class price
    });

    it('should handle flights with no available seats', async () => {
      const fullFlight = {
        ...mockFlight,
        availableSeats: { economy: 0, business: 0, first: 0 }
      };
      mockFlightsClient.searchFlights = jest.fn().mockResolvedValue([fullFlight]);

      const result = await service.searchFlightsWithAvailability('LAX', 'JFK', '2024-03-15');

      expect(result[0]).toMatchObject({
        hasAvailableSeats: false,
        lowestPrice: 0
      });
    });
  });
});
