import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDatabase from '../../backend/src/config/database.js';
import { seedRoles } from './modules/seedRoles.js';
import { seedVehicleTypes } from './modules/seedVehicleTypes.js';
import { seedUsers } from './modules/seedUsers.js';
import { seedVehicles } from './modules/seedVehicles.js';
import { seedDrivers } from './modules/seedDrivers.js';
import { seedTrips } from './modules/seedTrips.js';
import { seedFuelLogs } from './modules/seedFuelLogs.js';
import { seedMaintenanceLogs } from './modules/seedMaintenanceLogs.js';
import { seedExpenses } from './modules/seedExpenses.js';
import { seedNotifications } from './modules/seedNotifications.js';
import { Role, User, VehicleType, Vehicle, Driver, Trip, FuelLog, MaintenanceLog, Expense, Notification } from '../../backend/src/models/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../backend/.env') });

const collections = [
  { name: 'roles', model: Role },
  { name: 'users', model: User },
  { name: 'vehicle_types', model: VehicleType },
  { name: 'vehicles', model: Vehicle },
  { name: 'drivers', model: Driver },
  { name: 'trips', model: Trip },
  { name: 'fuel_logs', model: FuelLog },
  { name: 'maintenance_logs', model: MaintenanceLog },
  { name: 'expenses', model: Expense },
  { name: 'notifications', model: Notification },
];

const seedDatabase = async () => {
  console.log('Connecting to MongoDB...');
  await connectDatabase();

  console.log('Clearing existing seed collections...');
  for (const collection of collections) {
    await collection.model.deleteMany({});
  }

  const steps = [
    ['roles', seedRoles],
    ['vehicle_types', seedVehicleTypes],
    ['users', seedUsers],
    ['vehicles', seedVehicles],
    ['drivers', seedDrivers],
    ['trips', seedTrips],
    ['fuel_logs', seedFuelLogs],
    ['maintenance_logs', seedMaintenanceLogs],
    ['expenses', seedExpenses],
    ['notifications', seedNotifications],
  ];

  const results = [];
  for (const [name, operation] of steps) {
    console.log(`Seeding ${name}...`);
    const result = await operation();
    results.push({ name, ...result });
  }

  const validationReport = await validateSeedData();
  console.log('Seed summary:');
  for (const result of results) {
    console.log(`- ${result.name}: ${result.inserted} inserted / ${result.count} total`);
  }
  console.log(JSON.stringify(validationReport, null, 2));
};

const validateSeedData = async () => {
  const report = {};
  for (const collection of collections) {
    const count = await collection.model.countDocuments({});
    report[collection.name] = count;
  }

  return {
    counts: report,
    status: 'seed_complete',
  };
};

seedDatabase().catch((error) => {
  console.error('Database seed failed:', error);
  process.exit(1);
});
