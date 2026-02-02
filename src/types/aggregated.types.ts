// Aggregated types for BFF responses that combine multiple services
import { Flight } from './flight.types';
import { Customer } from './customer.types';
import { Booking } from './booking.types';

// Booking details with flight and customer information
export interface BookingDetails extends Booking {
  flight: Flight;
  customer: Customer;
}

// Customer dashboard with all bookings including flight details
export interface CustomerDashboard {
  customer: Customer;
  bookings: Array<{
    booking: Booking;
    flight: Flight;
  }>;
}

// Flight search result with availability information
export interface FlightWithAvailability extends Flight {
  hasAvailableSeats: boolean;
  lowestPrice: number;
}
