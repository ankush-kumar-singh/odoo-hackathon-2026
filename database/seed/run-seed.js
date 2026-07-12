import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDatabase from '../../backend/src/config/database.js';
import { Role, User, VehicleType, Vehicle, Driver, Trip, MaintenanceLog, FuelLog, Expense, Notification } from '../../backend/src/models/index.js';
import {
  seedRoles,
  seedVehicleTypes,
  seedVehicles,
  seedDrivers,
  seedTrips,
  seedMaintenanceLogs,
  seedFuelLogs,
  seedExpenses,
  seedNotifications,
} from './data.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../backend/.env') });

const seedDatabase = async () => {
  await connectDatabase();

  await Role.deleteMany({});
  await User.deleteMany({});
  await VehicleType.deleteMany({});
  await Vehicle.deleteMany({});
  await Driver.deleteMany({});
  await Trip.deleteMany({});
  await MaintenanceLog.deleteMany({});
  await FuelLog.deleteMany({});
  await Expense.deleteMany({});
  await Notification.deleteMany({});

  const createdRoles = await Role.insertMany(seedRoles);

  const adminRole = createdRoles.find((role) => role.name === 'admin');
  const fleetManagerRole = createdRoles.find((role) => role.name === 'fleet_manager');

  await User.create({
    fullName: 'System Administrator',
    email: 'admin@transitops.local',
    passwordHash: '$2b$12$8u9mNHzReV9YQ5F4R0GJNeRzy0b7JLoGJ4p7Qyq3rH1w7kq4u6D2u',
    roleId: adminRole._id,
    phoneNumber: '+1-555-0000',
    isActive: true,
  });

  const createdVehicleTypes = await VehicleType.insertMany(seedVehicleTypes);
  const vehicleTypeMap = new Map(createdVehicleTypes.map((type) => [type.name, type]));

  const createdVehicles = await Vehicle.insertMany(
    seedVehicles.map((vehicle) => ({
      ...vehicle,
      vehicleTypeId: vehicleTypeMap.get(vehicle.vehicleTypeName)._id,
    }))
  );

  const createdDrivers = await Driver.insertMany(seedDrivers);

  const createdTrips = await Trip.insertMany(
    seedTrips.map((trip, index) => ({
      ...trip,
      vehicleId: createdVehicles[index % createdVehicles.length]._id,
      driverId: createdDrivers[index % createdDrivers.length]._id,
      createdBy: null,
      updatedBy: null,
    }))
  );

  await MaintenanceLog.insertMany(
    seedMaintenanceLogs.map((log, index) => ({
      ...log,
      vehicleId: createdVehicles[index % createdVehicles.length]._id,
      createdBy: null,
      updatedBy: null,
    }))
  );

  await FuelLog.insertMany(
    seedFuelLogs.map((log, index) => ({
      ...log,
      tripId: createdTrips[index % createdTrips.length]._id,
      createdBy: null,
      updatedBy: null,
    }))
  );

  await Expense.insertMany(
    seedExpenses.map((expense, index) => ({
      ...expense,
      vehicleId: createdVehicles[index % createdVehicles.length]._id,
      tripId: createdTrips[index % createdTrips.length]._id,
      createdBy: null,
      updatedBy: null,
    }))
  );

  await Notification.insertMany(
    seedNotifications.map((notification, index) => ({
      ...notification,
      recipientId: createdDrivers[index % createdDrivers.length].userId || null,
      relatedEntityType: 'Trip',
      relatedEntityId: createdTrips[index % createdTrips.length]._id,
    }))
  );

  console.log('Database seed completed successfully.');
  process.exit(0);
};

seedDatabase().catch((error) => {
  console.error('Database seed failed:', error);
  process.exit(1);
});
