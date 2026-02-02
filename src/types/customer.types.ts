// Customer types for BFF layer
export type LoyaltyTier = 'SILVER' | 'GOLD' | 'PLATINUM';

export interface LoyaltyProgram {
  memberId: string;
  tierLevel: LoyaltyTier;
  totalPoints: number;
  availablePoints: number;
  tierExpiryDate?: string;
}

export interface CustomerPreferences {
  seatPreference?: string;
  mealPreference?: string;
}

export interface Customer {
  customerId: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  nationality?: string;
  loyaltyProgram?: LoyaltyProgram;
  preferences?: CustomerPreferences;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateCustomerRequest {
  email?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  nationality?: string;
  loyaltyProgram?: LoyaltyProgram;
  preferences?: CustomerPreferences;
}

export interface CustomersApiResponse<T> {
  data: T;
  error?: string;
}
