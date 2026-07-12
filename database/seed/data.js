export const seedRoles = [
  {
    name: 'admin',
    permissions: ['manage_users', 'manage_fleet', 'manage_trips', 'manage_maintenance', 'manage_finance', 'view_reports'],
    description: 'System administrator',
  },
  {
    name: 'fleet_manager',
    permissions: ['manage_fleet', 'manage_trips', 'manage_maintenance', 'view_reports'],
    description: 'Operations fleet manager',
  },
  {
    name: 'dispatcher',
    permissions: ['manage_trips', 'view_reports'],
    description: 'Trip dispatcher',
  },
  {
    name: 'driver',
    permissions: ['view_assigned_trips'],
    description: 'Operational driver',
  },
  {
    name: 'accountant',
    permissions: ['manage_finance', 'view_reports'],
    description: 'Finance operations',
  },
];

export const seedVehicleTypes = [
  { name: 'BUS', description: 'City transit bus' },
  { name: 'VAN', description: 'Passenger van' },
  { name: 'TRUCK', description: 'Freight truck' },
];

export const seedVehicles = [
  {
    registrationNumber: 'DL-01-AB-1234',
    vehicleTypeName: 'BUS',
    make: 'Tata',
    model: 'Starbus',
    yearOfManufacture: 2022,
    capacityWeightKg: 12000,
    status: 'available',
  },
  {
    registrationNumber: 'DL-02-CD-5678',
    vehicleTypeName: 'VAN',
    make: 'Mahindra',
    model: 'Supro',
    yearOfManufacture: 2021,
    capacityWeightKg: 4000,
    status: 'in_transit',
  },
  {
    registrationNumber: 'DL-03-EF-9012',
    vehicleTypeName: 'TRUCK',
    make: 'Ashok Leyland',
    model: 'Dost',
    yearOfManufacture: 2020,
    capacityWeightKg: 8000,
    status: 'under_maintenance',
  },
];

export const seedDrivers = [
  {
    employeeNumber: 'DRV-001',
    fullName: 'Alice Brown',
    licenseNumber: 'LIC-001',
    licenseExpiryDate: '2030-12-31T00:00:00.000Z',
    phoneNumber: '+1-555-0100',
    address: '10 Fleet Road',
    status: 'active',
  },
  {
    employeeNumber: 'DRV-002',
    fullName: 'Mohan Singh',
    licenseNumber: 'LIC-002',
    licenseExpiryDate: '2029-10-15T00:00:00.000Z',
    phoneNumber: '+1-555-0101',
    address: '22 Transit Lane',
    status: 'active',
  },
];

export const seedTrips = [
  {
    routeName: 'North Loop',
    origin: 'Central Depot',
    destination: 'Airport Terminal',
    scheduledStartAt: '2026-07-15T08:00:00.000Z',
    scheduledEndAt: '2026-07-15T10:00:00.000Z',
    cargoWeightKg: 4000,
    revenueAmount: 1500,
    status: 'planned',
    notes: 'Morning route',
  },
  {
    routeName: 'East Corridor',
    origin: 'Warehouse B',
    destination: 'Industrial Park',
    scheduledStartAt: '2026-07-15T12:00:00.000Z',
    scheduledEndAt: '2026-07-15T14:00:00.000Z',
    cargoWeightKg: 3000,
    revenueAmount: 1200,
    status: 'in_progress',
    notes: 'Midday route',
  },
];

export const seedMaintenanceLogs = [
  {
    maintenanceDate: '2026-07-10T00:00:00.000Z',
    maintenanceType: 'Brake Inspection',
    description: 'Routine brake inspection and replacement of worn pads',
    costAmount: 1800,
    status: 'completed',
    notes: 'Completed on schedule',
  },
];

export const seedFuelLogs = [
  {
    fuelDate: '2026-07-12T00:00:00.000Z',
    fuelType: 'diesel',
    quantityLiters: 65,
    costAmount: 4200,
    odometerReading: 12450,
    notes: 'Refueled before dispatch',
  },
];

export const seedExpenses = [
  {
    expenseType: 'repair',
    expenseDate: '2026-07-11T00:00:00.000Z',
    amount: 5600,
    description: 'Suspension repair',
    notes: 'Covered by maintenance budget',
  },
  {
    expenseType: 'toll',
    expenseDate: '2026-07-12T00:00:00.000Z',
    amount: 250,
    description: 'Highway toll',
    notes: 'Route toll charge',
  },
];

export const seedNotifications = [
  {
    type: 'trip_assignment',
    title: 'Trip assigned',
    message: 'A new trip assignment was created for your route.',
  },
  {
    type: 'maintenance_due',
    title: 'Maintenance reminder',
    message: 'Vehicle inspection is due soon.',
  },
];
