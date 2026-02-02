// Booking types for BFF layer
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CHECKED_IN' | 'CANCELLED';
export type CabinClass = 'economy' | 'business' | 'first';
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';

export interface Passenger {
  firstName: string;
  lastName: string;
  seatNumber?: string;
  cabinClass: CabinClass;
}

export interface BookingPricing {
  baseFare: number;
  taxes: number;
  total: number;
}

export interface Payment {
  transactionId: string;
  status: PaymentStatus;
}

export interface Booking {
  bookingId: string;
  confirmationCode: string;
  customerId: string;
  flightId: string;
  passengers: Passenger[];
  pricing: BookingPricing;
  payment: Payment;
  status: BookingStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBookingRequest {
  customerId: string;
  flightId: string;
  passengers: Passenger[];
  pricing: BookingPricing;
  payment: Payment;
}

export interface BookingsApiResponse<T> {
  data: T;
  error?: string;
}
