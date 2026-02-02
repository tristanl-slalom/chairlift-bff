import axios, { AxiosInstance } from 'axios';
import {
  Customer,
  UpdateCustomerRequest,
  CustomersApiResponse
} from '../types/customer.types';
import logger from '../utils/logger';

export class CustomersApiClient {
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
        logger.info('Customers API request', {
          method: config.method,
          url: config.url
        });
        return config;
      },
      (error) => {
        logger.error('Customers API request error', { error });
        return Promise.reject(error);
      }
    );

    this.client.interceptors.response.use(
      (response) => {
        logger.info('Customers API response', {
          status: response.status,
          url: response.config.url
        });
        return response;
      },
      (error) => {
        logger.error('Customers API response error', {
          status: error.response?.status,
          message: error.message,
          url: error.config?.url
        });
        return Promise.reject(error);
      }
    );
  }

  async getCustomer(customerId: string): Promise<Customer> {
    const response = await this.client.get<CustomersApiResponse<Customer>>(
      `/customers/${customerId}`
    );
    return response.data.data;
  }

  async updateCustomer(
    customerId: string,
    request: UpdateCustomerRequest
  ): Promise<Customer> {
    const response = await this.client.put<CustomersApiResponse<Customer>>(
      `/customers/${customerId}`,
      request
    );
    return response.data.data;
  }
}

const CUSTOMERS_API_URL = process.env.CUSTOMERS_API_URL || 'http://localhost:3002';
export const customersApiClient = new CustomersApiClient(CUSTOMERS_API_URL);
