import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock axios.create before importing the client to prevent module-level instantiation errors
mockedAxios.create = jest.fn().mockReturnValue({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  interceptors: {
    request: { use: jest.fn() },
    response: { use: jest.fn() }
  }
} as any);

import { FlightsApiClient } from './flights-api.client';

describe('FlightsApiClient', () => {
  let client: FlightsApiClient;
  const baseURL = 'http://test-api.com';

  beforeEach(() => {
    const mockAxiosInstance = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
      interceptors: {
        request: { use: jest.fn() },
        response: { use: jest.fn() }
      }
    } as any;

    mockedAxios.create.mockReturnValue(mockAxiosInstance);
    client = new FlightsApiClient(baseURL);
  });

  describe('getFlight', () => {
    it('should fetch a flight by ID', async () => {
      const mockFlight = {
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

      const mockAxiosInstance = mockedAxios.create();
      (mockAxiosInstance.get as jest.Mock).mockResolvedValue({
        data: { data: mockFlight }
      });

      const result = await client.getFlight('flight-123');

      expect(result).toEqual(mockFlight);
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/flights/flight-123');
    });
  });

  describe('searchFlights', () => {
    it('should search flights with query parameters', async () => {
      const mockFlights = [
        {
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
        }
      ];

      const mockAxiosInstance = mockedAxios.create();
      (mockAxiosInstance.get as jest.Mock).mockResolvedValue({
        data: { data: mockFlights }
      });

      const result = await client.searchFlights('LAX', 'JFK', '2024-03-15');

      expect(result).toEqual(mockFlights);
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/flights/search', {
        params: {
          origin: 'LAX',
          destination: 'JFK',
          departureDate: '2024-03-15'
        }
      });
    });
  });
});
