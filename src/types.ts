export type UserRole = 'Fleet Manager' | 'Driver' | 'Safety Officer' | 'Financial Analyst';

export type VehicleStatus = 'Available' | 'On Trip' | 'In Shop' | 'Retired';
export type VehicleType = 'Truck' | 'Van' | 'Sedan' | 'Reefer';

export interface Vehicle {
  id: string;
  registrationNumber: string;
  name: string;
  type: VehicleType;
  maxLoadCapacity: number; // in kg
  odometer: number; // in km
  acquisitionCost: number; // in USD
  status: VehicleStatus;
  region: string;
}

export type DriverStatus = 'Available' | 'On Trip' | 'Off Duty' | 'Suspended';

export interface Driver {
  id: string;
  name: string;
  licenseNumber: string;
  licenseCategory: string;
  licenseExpiryDate: string; // YYYY-MM-DD
  contactNumber: string;
  safetyScore: number; // 0-100
  status: DriverStatus;
}

export type TripStatus = 'Draft' | 'Dispatched' | 'Completed' | 'Cancelled';

export interface Trip {
  id: string;
  source: string;
  destination: string;
  vehicleId: string;
  driverId: string;
  cargoWeight: number; // in kg
  plannedDistance: number; // in km
  actualDistance?: number; // in km (entered on completion)
  status: TripStatus;
  fuelConsumed?: number; // in liters (entered on completion)
  revenue?: number; // in USD (generated or custom-entered)
  createdAt: string;
}

export interface MaintenanceLog {
  id: string;
  vehicleId: string;
  description: string;
  cost: number;
  startDate: string;
  endDate?: string;
  status: 'Active' | 'Completed';
}

export interface FuelLog {
  id: string;
  vehicleId: string;
  liters: number;
  cost: number;
  date: string;
}

export interface ExpenseLog {
  id: string;
  vehicleId: string;
  type: 'Toll' | 'Permit' | 'Insurance' | 'Other';
  cost: number;
  date: string;
  description: string;
}
