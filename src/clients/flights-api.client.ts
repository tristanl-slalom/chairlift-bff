import axios, { AxiosInstance } from 'axios';
import { Flight, FlightsApiResponse } from '../types/flight.types';
import logger from '../utils/logger';

export class FlightsApiClient {
  private client: AxiosInstance;

  constructor(baseURL: string) {
    this.client = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    this.client.interceptors.request.use(
      (config) => {
        logger.info('Flights API request', {
          method: config.method,
          url: config.url
        });
        return config;
      },
      (error) => {
        logger.error('Flights API request error', { error });
        return Promise.reject(error);
      }
    );

    this.client.interceptors.response.use(
      (response) => {
        logger.info('Flights API response', {
          status: response.status,
          url: response.config.url
        });
        return response;
      },
      (error) => {
        logger.error('Flights API response error', {
          status: error.response?.status,
          message: error.message,
          url: error.config?.url
        });
        return Promise.reject(error);
      }
    );
  }

  async getFlight(flightId: string): Promise<Flight> {
    const response = await this.client.get<FlightsApiResponse<Flight>>(
      `/flights/${flightId}`
    );
    return response.data.data;
  }

  async searchFlights(
    origin?: string,
    destination?: string,
    departureDate?: string
  ): Promise<Flight[]> {
    const params: Record<string, string> = {};
    if (origin) params.origin = origin;
    if (destination) params.destination = destination;
    if (departureDate) params.departureDate = departureDate;

    const response = await this.client.get<FlightsApiResponse<Flight[]>>(
      '/flights/search',
      { params }
    );
    return response.data.data;
  }
}

const FLIGHTS_API_URL = process.env.FLIGHTS_API_URL || 'http://localhost:3001';
export const flightsApiClient = new FlightsApiClient(FLIGHTS_API_URL);
