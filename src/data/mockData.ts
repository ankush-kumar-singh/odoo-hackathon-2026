import { Vehicle, Driver, Trip, MaintenanceLog, FuelLog, ExpenseLog } from '../types';

export const initialVehicles: Vehicle[] = [
  {
    id: 'veh-1',
    registrationNumber: 'TRK-8829',
    name: 'Volvo FH16 Heavy',
    type: 'Truck',
    maxLoadCapacity: 15000,
    odometer: 145200,
    acquisitionCost: 125000,
    status: 'Available',
    region: 'North'
  },
  {
    id: 'veh-2',
    registrationNumber: 'VAN-4402',
    name: 'Ford Transit Cargo',
    type: 'Van',
    maxLoadCapacity: 1200,
    odometer: 62400,
    acquisitionCost: 45000,
    status: 'Available',
    region: 'East'
  },
  {
    id: 'veh-3',
    registrationNumber: 'SED-1192',
    name: 'Toyota Camry Hybrid',
    type: 'Sedan',
    maxLoadCapacity: 400,
    odometer: 32430,
    acquisitionCost: 28000,
    status: 'On Trip',
    region: 'West'
  },
  {
    id: 'veh-4',
    registrationNumber: 'REF-5591',
    name: 'Scania R500 Reefer',
    type: 'Reefer',
    maxLoadCapacity: 18000,
    odometer: 198000,
    acquisitionCost: 160000,
    status: 'In Shop',
    region: 'South'
  },
  {
    id: 'veh-5',
    registrationNumber: 'VAN-05',
    name: 'Mercedes Sprinter',
    type: 'Van',
    maxLoadCapacity: 2000,
    odometer: 12500,
    acquisitionCost: 52000,
    status: 'Available',
    region: 'North'
  },
  {
    id: 'veh-6',
    registrationNumber: 'TRK-2281',
    name: 'Peterbilt 579 Semi',
    type: 'Truck',
    maxLoadCapacity: 20000,
    odometer: 215400,
    acquisitionCost: 145000,
    status: 'Available',
    region: 'Midwest'
  },
  {
    id: 'veh-7',
    registrationNumber: 'REF-9920',
    name: 'Thermo King Reefer',
    type: 'Reefer',
    maxLoadCapacity: 16500,
    odometer: 87400,
    acquisitionCost: 135000,
    status: 'On Trip',
    region: 'South'
  },
  {
    id: 'veh-8',
    registrationNumber: 'VAN-1120',
    name: 'Ram ProMaster 2500',
    type: 'Van',
    maxLoadCapacity: 1800,
    odometer: 48900,
    acquisitionCost: 38000,
    status: 'In Shop',
    region: 'East'
  }
];

export const initialDrivers: Driver[] = [
  {
    id: 'drv-1',
    name: 'Alex Mercer',
    licenseNumber: 'DL-77382910',
    licenseCategory: 'Heavy Commercial (Class A)',
    licenseExpiryDate: '2027-10-15',
    contactNumber: '+1 (555) 234-5678',
    safetyScore: 94,
    status: 'Available'
  },
  {
    id: 'drv-2',
    name: 'Sarah Connor',
    licenseNumber: 'DL-33490122',
    licenseCategory: 'Commercial (Class B)',
    licenseExpiryDate: '2026-12-05',
    contactNumber: '+1 (555) 876-5432',
    safetyScore: 98,
    status: 'Available'
  },
  {
    id: 'drv-3',
    name: 'Jordan Belfort',
    licenseNumber: 'DL-99201123',
    licenseCategory: 'Standard (Class C)',
    licenseExpiryDate: '2026-09-20',
    contactNumber: '+1 (555) 445-9988',
    safetyScore: 82,
    status: 'On Trip'
  },
  {
    id: 'drv-4',
    name: 'Carlos Ruiz',
    licenseNumber: 'DL-11029384',
    licenseCategory: 'Heavy Commercial (Class A)',
    licenseExpiryDate: '2028-01-10',
    contactNumber: '+1 (555) 303-4922',
    safetyScore: 75,
    status: 'Off Duty'
  },
  {
    id: 'drv-5',
    name: 'Dwight Schrute',
    licenseNumber: 'DL-88291022',
    licenseCategory: 'Commercial (Class B)',
    licenseExpiryDate: '2028-04-30',
    contactNumber: '+1 (555) 777-1234',
    safetyScore: 61,
    status: 'Suspended'
  },
  {
    id: 'drv-6',
    name: 'Marcus Vance',
    licenseNumber: 'DL-12290481',
    licenseCategory: 'Heavy Commercial (Class A)',
    licenseExpiryDate: '2027-08-14',
    contactNumber: '+1 (555) 998-1122',
    safetyScore: 91,
    status: 'On Trip'
  },
  {
    id: 'drv-7',
    name: 'Elena Rostova',
    licenseNumber: 'DL-55409121',
    licenseCategory: 'Commercial (Class B)',
    licenseExpiryDate: '2026-11-30',
    contactNumber: '+1 (555) 881-2299',
    safetyScore: 95,
    status: 'Available'
  },
  {
    id: 'drv-8',
    name: 'John Doe',
    licenseNumber: 'DL-44810293',
    licenseCategory: 'Standard (Class C)',
    licenseExpiryDate: '2027-05-18',
    contactNumber: '+1 (555) 334-9981',
    safetyScore: 88,
    status: 'Available'
  }
];

export const initialTrips: Trip[] = [
  {
    id: 'trip-101',
    source: 'Chicago Logistics Hub',
    destination: 'Detroit Distribution Center',
    vehicleId: 'veh-1',
    driverId: 'drv-1',
    cargoWeight: 12400,
    plannedDistance: 450,
    actualDistance: 452,
    status: 'Completed',
    fuelConsumed: 180,
    revenue: 3200,
    createdAt: '2026-07-01T10:00:00Z'
  },
  {
    id: 'trip-102',
    source: 'Seattle Seaport',
    destination: 'Portland Warehouse',
    vehicleId: 'veh-2',
    driverId: 'drv-2',
    cargoWeight: 850,
    plannedDistance: 280,
    actualDistance: 280,
    status: 'Completed',
    fuelConsumed: 42,
    revenue: 1400,
    createdAt: '2026-07-03T08:30:00Z'
  },
  {
    id: 'trip-103',
    source: 'Los Angeles Terminal',
    destination: 'Las Vegas Depot',
    vehicleId: 'veh-3',
    driverId: 'drv-3',
    cargoWeight: 300,
    plannedDistance: 430,
    status: 'Dispatched',
    createdAt: '2026-07-11T14:00:00Z'
  },
  {
    id: 'trip-104',
    source: 'Houston Freight Port',
    destination: 'New Orleans Hub',
    vehicleId: 'veh-7',
    driverId: 'drv-6',
    cargoWeight: 14200,
    plannedDistance: 560,
    status: 'Dispatched',
    createdAt: '2026-07-12T01:15:00Z'
  },
  {
    id: 'trip-105',
    source: 'Atlanta Logistics Yard',
    destination: 'Miami Port Authority',
    vehicleId: 'veh-1',
    driverId: 'drv-1',
    cargoWeight: 11000,
    plannedDistance: 1050,
    actualDistance: 1062,
    status: 'Completed',
    fuelConsumed: 430,
    revenue: 7200,
    createdAt: '2026-07-05T06:00:00Z'
  },
  {
    id: 'trip-106',
    source: 'Boston Hub',
    destination: 'New York JFK Airport',
    vehicleId: 'veh-2',
    driverId: 'drv-7',
    cargoWeight: 950,
    plannedDistance: 350,
    actualDistance: 355,
    status: 'Completed',
    fuelConsumed: 54,
    revenue: 1850,
    createdAt: '2026-07-07T09:00:00Z'
  },
  {
    id: 'trip-107',
    source: 'Denver Depot',
    destination: 'Salt Lake City Terminal',
    vehicleId: 'veh-5',
    driverId: 'drv-8',
    cargoWeight: 1600,
    plannedDistance: 850,
    actualDistance: 848,
    status: 'Completed',
    fuelConsumed: 128,
    revenue: 4100,
    createdAt: '2026-07-08T11:30:00Z'
  },
  {
    id: 'trip-108',
    source: 'Phoenix Logistics Yard',
    destination: 'San Diego Hub',
    vehicleId: 'veh-6',
    driverId: 'drv-2',
    cargoWeight: 18500,
    plannedDistance: 570,
    actualDistance: 570,
    status: 'Completed',
    fuelConsumed: 235,
    revenue: 4900,
    createdAt: '2026-07-09T07:45:00Z'
  }
];

export const initialMaintenanceLogs: MaintenanceLog[] = [
  {
    id: 'maint-1',
    vehicleId: 'veh-1',
    description: 'Scheduled Engine Tuning & Oil Change',
    cost: 850,
    startDate: '2026-06-15',
    endDate: '2026-06-16',
    status: 'Completed'
  },
  {
    id: 'maint-2',
    vehicleId: 'veh-4',
    description: 'Compressor Leak Repair & Refrigerant Refill',
    cost: 2100,
    startDate: '2026-07-10',
    status: 'Active'
  },
  {
    id: 'maint-3',
    vehicleId: 'veh-8',
    description: 'Brake Pad Replacement & Rotor Surfacing',
    cost: 620,
    startDate: '2026-07-11',
    status: 'Active'
  },
  {
    id: 'maint-4',
    vehicleId: 'veh-2',
    description: 'Tire Rotation & Wheel Alignment',
    cost: 180,
    startDate: '2026-06-20',
    endDate: '2026-06-20',
    status: 'Completed'
  },
  {
    id: 'maint-5',
    vehicleId: 'veh-6',
    description: 'Transmission Fluid Flush & Spark Plug Swap',
    cost: 1250,
    startDate: '2026-06-28',
    endDate: '2026-06-29',
    status: 'Completed'
  }
];

export const initialFuelLogs: FuelLog[] = [
  {
    id: 'fuel-1',
    vehicleId: 'veh-1',
    liters: 180,
    cost: 270,
    date: '2026-07-02'
  },
  {
    id: 'fuel-2',
    vehicleId: 'veh-2',
    liters: 42,
    cost: 63,
    date: '2026-07-03'
  },
  {
    id: 'fuel-3',
    vehicleId: 'veh-3',
    liters: 30,
    cost: 45,
    date: '2026-07-06'
  },
  {
    id: 'fuel-4',
    vehicleId: 'veh-1',
    liters: 210,
    cost: 315,
    date: '2026-07-05'
  },
  {
    id: 'fuel-5',
    vehicleId: 'veh-2',
    liters: 54,
    cost: 81,
    date: '2026-07-07'
  },
  {
    id: 'fuel-6',
    vehicleId: 'veh-5',
    liters: 128,
    cost: 192,
    date: '2026-07-08'
  },
  {
    id: 'fuel-7',
    vehicleId: 'veh-6',
    liters: 235,
    cost: 352,
    date: '2026-07-09'
  },
  {
    id: 'fuel-8',
    vehicleId: 'veh-1',
    liters: 190,
    cost: 285,
    date: '2026-07-10'
  }
];

export const initialExpenseLogs: ExpenseLog[] = [
  {
    id: 'exp-1',
    vehicleId: 'veh-1',
    type: 'Toll',
    cost: 75,
    date: '2026-07-02',
    description: 'I-80 Highway Toll Pass'
  },
  {
    id: 'exp-2',
    vehicleId: 'veh-2',
    type: 'Permit',
    cost: 150,
    date: '2026-07-03',
    description: 'Port Access Registration Fee'
  },
  {
    id: 'exp-3',
    vehicleId: 'veh-1',
    type: 'Insurance',
    cost: 450,
    date: '2026-07-01',
    description: 'Monthly Fleet Commercial Liability Coverage'
  },
  {
    id: 'exp-4',
    vehicleId: 'veh-6',
    type: 'Toll',
    cost: 120,
    date: '2026-07-09',
    description: 'Interstate Turnpikes tolls'
  },
  {
    id: 'exp-5',
    vehicleId: 'veh-4',
    type: 'Other',
    cost: 220,
    date: '2026-07-11',
    description: 'Emergency Refrigeration Temperature Calibration Check'
  }
];
