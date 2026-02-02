import { FlightsApiClient } from '../clients/flights-api.client';
import { CustomersApiClient } from '../clients/customers-api.client';
import { BookingsApiClient } from '../clients/bookings-api.client';
import {
  BookingDetails,
  CustomerDashboard,
  FlightWithAvailability
} from '../types/aggregated.types';
import { Flight } from '../types/flight.types';
import logger from '../utils/logger';

export class AggregationService {
  constructor(
    private flightsClient: FlightsApiClient,
    private customersClient: CustomersApiClient,
    private bookingsClient: BookingsApiClient
  ) {}

  /**
   * Get booking details with flight and customer information
   * Fetches data from all three services in parallel
   */
  async getBookingDetails(bookingId: string): Promise<BookingDetails> {
    try {
      logger.info('Fetching booking details', { bookingId });

      // First, get the booking to know which flight and customer to fetch
      const booking = await this.bookingsClient.getBooking(bookingId);

      // Then fetch flight and customer in parallel
      const [flight, customer] = await Promise.all([
        this.flightsClient.getFlight(booking.flightId),
        this.customersClient.getCustomer(booking.customerId)
      ]);

      const bookingDetails: BookingDetails = {
        ...booking,
        flight,
        customer
      };

      logger.info('Booking details fetched successfully', { bookingId });
      return bookingDetails;
    } catch (error) {
      logger.error('Error fetching booking details', { bookingId, error });
      throw error;
    }
  }

  /**
   * Get customer dashboard with profile and all bookings with flight details
   * Fetches customer and bookings in parallel, then enriches each booking with flight data
   */
  async getCustomerDashboard(customerId: string): Promise<CustomerDashboard> {
    try {
      logger.info('Fetching customer dashboard', { customerId });

      // Fetch customer and their bookings in parallel
      const [customer, bookings] = await Promise.all([
        this.customersClient.getCustomer(customerId),
        this.bookingsClient.listCustomerBookings(customerId)
      ]);

      // Fetch flight details for all bookings in parallel
      const flightPromises = bookings.map((booking) =>
        this.flightsClient.getFlight(booking.flightId)
      );
      const flights = await Promise.all(flightPromises);

      // Combine bookings with their flight details
      const bookingsWithFlights = bookings.map((booking, index) => ({
        booking,
        flight: flights[index]
      }));

      const dashboard: CustomerDashboard = {
        customer,
        bookings: bookingsWithFlights
      };

      logger.info('Customer dashboard fetched successfully', {
        customerId,
        bookingCount: bookings.length
      });
      return dashboard;
    } catch (error) {
      logger.error('Error fetching customer dashboard', { customerId, error });
      throw error;
    }
  }

  /**
   * Search flights with enhanced availability information
   * Adds computed fields for frontend convenience
   */
  async searchFlightsWithAvailability(
    origin?: string,
    destination?: string,
    departureDate?: string
  ): Promise<FlightWithAvailability[]> {
    try {
      logger.info('Searching flights with availability', {
        origin,
        destination,
        departureDate
      });

      const flights = await this.flightsClient.searchFlights(
        origin,
        destination,
        departureDate
      );

      // Enhance each flight with availability and pricing info
      const enhancedFlights: FlightWithAvailability[] = flights.map(
        (flight) => {
          const hasAvailableSeats =
            flight.availableSeats.economy > 0 ||
            flight.availableSeats.business > 0 ||
            flight.availableSeats.first > 0;

          // Find the lowest available price across all cabin classes
          const availablePrices: number[] = [];
          if (flight.availableSeats.economy > 0) {
            availablePrices.push(flight.pricing.economy);
          }
          if (flight.availableSeats.business > 0) {
            availablePrices.push(flight.pricing.business);
          }
          if (flight.availableSeats.first > 0) {
            availablePrices.push(flight.pricing.first);
          }

          const lowestPrice =
            availablePrices.length > 0 ? Math.min(...availablePrices) : 0;

          return {
            ...flight,
            hasAvailableSeats,
            lowestPrice
          };
        }
      );

      logger.info('Flight search completed', {
        flightCount: enhancedFlights.length
      });
      return enhancedFlights;
    } catch (error) {
      logger.error('Error searching flights', {
        origin,
        destination,
        departureDate,
        error
      });
      throw error;
    }
  }
}
