// Flight types for BFF layer
export interface SeatCapacity {
  economy: number;
  business: number;
  first: number;
}

export interface Pricing {
  economy: number;
  business: number;
  first: number;
}

export type FlightStatus =
  | 'SCHEDULED'
  | 'BOARDING'
  | 'DEPARTED'
  | 'IN_FLIGHT'
  | 'LANDED'
  | 'CANCELLED'
  | 'DELAYED';

export interface Flight {
  flightId: string;
  flightNumber: string;
  airlineCode: string;
  origin: string;
  destination: string;
  departureDate: string;
  departureTime: string;
  arrivalDate: string;
  arrivalTime: string;
  duration: number;
  aircraft: string;
  capacity: SeatCapacity;
  availableSeats: SeatCapacity;
  pricing: Pricing;
  status: FlightStatus;
  createdAt: string;
  updatedAt: string;
}

export interface FlightsApiResponse<T> {
  data: T;
  error?: string;
}
