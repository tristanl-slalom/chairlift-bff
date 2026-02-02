import axios, { AxiosInstance } from 'axios';
import {
  Booking,
  CreateBookingRequest,
  BookingsApiResponse
} from '../types/booking.types';
import logger from '../utils/logger';

export class BookingsApiClient {
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
        logger.info('Bookings API request', {
          method: config.method,
          url: config.url
        });
        return config;
      },
      (error) => {
        logger.error('Bookings API request error', { error });
        return Promise.reject(error);
      }
    );

    this.client.interceptors.response.use(
      (response) => {
        logger.info('Bookings API response', {
          status: response.status,
          url: response.config.url
        });
        return response;
      },
      (error) => {
        logger.error('Bookings API response error', {
          status: error.response?.status,
          message: error.message,
          url: error.config?.url
        });
        return Promise.reject(error);
      }
    );
  }

  async createBooking(request: CreateBookingRequest): Promise<Booking> {
    const response = await this.client.post<BookingsApiResponse<Booking>>(
      '/bookings',
      request
    );
    return response.data.data;
  }

  async getBooking(bookingId: string): Promise<Booking> {
    const response = await this.client.get<BookingsApiResponse<Booking>>(
      `/bookings/${bookingId}`
    );
    return response.data.data;
  }

  async listCustomerBookings(customerId: string): Promise<Booking[]> {
    const response = await this.client.get<BookingsApiResponse<Booking[]>>(
      `/bookings/customer/${customerId}`
    );
    return response.data.data;
  }
}

const BOOKINGS_API_URL = process.env.BOOKINGS_API_URL || 'http://localhost:3003';
export const bookingsApiClient = new BookingsApiClient(BOOKINGS_API_URL);
