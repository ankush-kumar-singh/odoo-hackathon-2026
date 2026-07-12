import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDatabase from '../../backend/src/config/database.js';
import { Role, User, VehicleType, Vehicle, Driver, Trip, FuelLog, MaintenanceLog, Expense, Notification } from '../../backend/src/models/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../backend/.env') });

const seedSampleData = async () => {
  console.log('Connecting to MongoDB...');
  await connectDatabase();

  const roles = [
    { name: 'admin', permissions: ['manage_users', 'manage_fleet', 'manage_trips'], description: 'System administrator' },
    { name: 'fleet_manager', permissions: ['manage_fleet', 'manage_trips'], description: 'Fleet operations manager' },
    { name: 'dispatcher', permissions: ['manage_trips'], description: 'Operations dispatcher' },
    { name: 'driver', permissions: ['view_assigned_trips'], description: 'Operational driver' },
    { name: 'accountant', permissions: ['manage_finance'], description: 'Finance controller' },
  ];

  const roleDocs = [];
  for (const role of roles) {
    const doc = await Role.findOneAndUpdate(
      { name: role.name },
      { $setOnInsert: role },
      { upsert: true, new: true }
    );
    roleDocs.push(doc);
  }

  const vehicleTypes = [
    { name: 'BUS', description: 'City bus' },
    { name: 'VAN', description: 'Passenger van' },
    { name: 'TRUCK', description: 'Cargo truck' },
    { name: 'SUV', description: 'Utility SUV' },
  ];

  const vehicleTypeDocs = [];
  for (const type of vehicleTypes) {
    const doc = await VehicleType.findOneAndUpdate(
      { name: type.name },
      { $setOnInsert: type },
      { upsert: true, new: true }
    );
    vehicleTypeDocs.push(doc);
  }

  const users = [
    { fullName: 'Ankush Kumar Singh', email: 'ankush@transitops.in', passwordHash: '$2b$12$8u9mNHzReV9YQ5F4R0GJNeRzy0b7JLoGJ4p7Qyq3rH1w7kq4u6D2u', roleId: roleDocs[0]._id, phoneNumber: '+919876543210', isActive: true },
    { fullName: 'Amardeep Yadav', email: 'amardeep@transitops.in', passwordHash: '$2b$12$8u9mNHzReV9YQ5F4R0GJNeRzy0b7JLoGJ4p7Qyq3rH1w7kq4u6D2u', roleId: roleDocs[1]._id, phoneNumber: '+919812345678', isActive: true },
    { fullName: 'Ravi Sharma', email: 'ravi@transitops.in', passwordHash: '$2b$12$8u9mNHzReV9YQ5F4R0GJNeRzy0b7JLoGJ4p7Qyq3rH1w7kq4u6D2u', roleId: roleDocs[2]._id, phoneNumber: '+919855566677', isActive: true },
  ];

  const userDocs = [];
  for (const user of users) {
    const doc = await User.findOneAndUpdate(
      { email: user.email },
      { $setOnInsert: user },
      { upsert: true, new: true }
    );
    userDocs.push(doc);
  }

  const vehicles = [
    { registrationNumber: 'DL01AB1234', vehicleTypeId: vehicleTypeDocs[0]._id, make: 'Tata', model: 'Starbus', yearOfManufacture: 2022, capacityWeightKg: 12000, status: 'available', isActive: true },
    { registrationNumber: 'DL02CD5678', vehicleTypeId: vehicleTypeDocs[1]._id, make: 'Mahindra', model: 'Supro', yearOfManufacture: 2021, capacityWeightKg: 4500, status: 'in_transit', isActive: true },
    { registrationNumber: 'DL03EF9012', vehicleTypeId: vehicleTypeDocs[2]._id, make: 'Ashok Leyland', model: 'Dost', yearOfManufacture: 2020, capacityWeightKg: 8000, status: 'under_maintenance', isActive: true },
    { registrationNumber: 'DL04GH3456', vehicleTypeId: vehicleTypeDocs[3]._id, make: 'Toyota', model: 'Innova', yearOfManufacture: 2023, capacityWeightKg: 6000, status: 'available', isActive: true },
  ];

  const vehicleDocs = [];
  for (const vehicle of vehicles) {
    const doc = await Vehicle.findOneAndUpdate(
      { registrationNumber: vehicle.registrationNumber },
      { $setOnInsert: vehicle },
      { upsert: true, new: true }
    );
    vehicleDocs.push(doc);
  }

  const drivers = [
    { userId: userDocs[0]._id, employeeNumber: 'DRV001', fullName: 'Amit Verma', licenseNumber: 'LIC001', licenseExpiryDate: new Date('2030-12-31'), phoneNumber: '+919700000001', address: '12, Janpath, Delhi', status: 'active', isActive: true },
    { userId: userDocs[1]._id, employeeNumber: 'DRV002', fullName: 'Suresh Kumar', licenseNumber: 'LIC002', licenseExpiryDate: new Date('2029-09-15'), phoneNumber: '+919700000002', address: '14, MG Road, Mumbai', status: 'active', isActive: true },
    { userId: null, employeeNumber: 'DRV003', fullName: 'Nikhil Rao', licenseNumber: 'LIC003', licenseExpiryDate: new Date('2031-01-10'), phoneNumber: '+919700000003', address: '8, Ring Road, Hyderabad', status: 'active', isActive: true },
  ];

  const driverDocs = [];
  for (const driver of drivers) {
    const doc = await Driver.findOneAndUpdate(
      { licenseNumber: driver.licenseNumber },
      { $setOnInsert: driver },
      { upsert: true, new: true }
    );
    driverDocs.push(doc);
  }

  const trips = [
    { vehicleId: vehicleDocs[0]._id, driverId: driverDocs[0]._id, routeName: 'Airport Express', origin: 'Central Depot', destination: 'Airport Terminal', scheduledStartAt: new Date('2026-07-15T08:00:00Z'), scheduledEndAt: new Date('2026-07-15T10:00:00Z'), cargoWeightKg: 4000, revenueAmount: 1800, status: 'completed', notes: 'Completed on time', createdBy: userDocs[0]._id, updatedBy: userDocs[0]._id },
    { vehicleId: vehicleDocs[1]._id, driverId: driverDocs[1]._id, routeName: 'Warehouse Run', origin: 'Warehouse B', destination: 'Industrial Park', scheduledStartAt: new Date('2026-07-16T09:00:00Z'), scheduledEndAt: new Date('2026-07-16T12:00:00Z'), cargoWeightKg: 3500, revenueAmount: 2200, status: 'in_progress', notes: 'In transit', createdBy: userDocs[1]._id, updatedBy: userDocs[1]._id },
    { vehicleId: vehicleDocs[3]._id, driverId: driverDocs[2]._id, routeName: 'City Circle', origin: 'North Hub', destination: 'Market Street', scheduledStartAt: new Date('2026-07-17T06:00:00Z'), scheduledEndAt: new Date('2026-07-17T08:00:00Z'), cargoWeightKg: 2800, revenueAmount: 1500, status: 'cancelled', notes: 'Cancelled due to weather', createdBy: userDocs[2]._id, updatedBy: userDocs[2]._id },
  ];

  const tripDocs = [];
  for (const trip of trips) {
    const doc = await Trip.findOneAndUpdate(
      { vehicleId: trip.vehicleId, driverId: trip.driverId, scheduledStartAt: trip.scheduledStartAt },
      { $setOnInsert: trip },
      { upsert: true, new: true }
    );
    tripDocs.push(doc);
  }

  const fuelLogs = [
    { tripId: tripDocs[0]._id, fuelDate: new Date('2026-07-15'), fuelType: 'diesel', quantityLiters: 65, costAmount: 4200, odometerReading: 12450, notes: 'Refueled before dispatch', createdBy: userDocs[0]._id, updatedBy: userDocs[0]._id },
    { tripId: tripDocs[1]._id, fuelDate: new Date('2026-07-16'), fuelType: 'cng', quantityLiters: 35, costAmount: 2100, odometerReading: 12890, notes: 'Mid-route refuel', createdBy: userDocs[1]._id, updatedBy: userDocs[1]._id },
  ];

  for (const log of fuelLogs) {
    await FuelLog.findOneAndUpdate(
      { tripId: log.tripId, fuelDate: log.fuelDate },
      { $setOnInsert: log },
      { upsert: true, new: true }
    );
  }

  const maintenanceLogs = [
    { vehicleId: vehicleDocs[2]._id, maintenanceDate: new Date('2026-07-10'), maintenanceType: 'Brake Inspection', description: 'Routine brake service', costAmount: 1800, status: 'completed', notes: 'Completed on schedule', createdBy: userDocs[2]._id, updatedBy: userDocs[2]._id },
    { vehicleId: vehicleDocs[0]._id, maintenanceDate: new Date('2026-07-12'), maintenanceType: 'Oil Change', description: 'Engine oil and filter replacement', costAmount: 1400, status: 'scheduled', notes: 'Next service window', createdBy: userDocs[1]._id, updatedBy: userDocs[1]._id },
  ];

  for (const log of maintenanceLogs) {
    await MaintenanceLog.findOneAndUpdate(
      { vehicleId: log.vehicleId, maintenanceDate: log.maintenanceDate },
      { $setOnInsert: log },
      { upsert: true, new: true }
    );
  }

  const expenses = [
    { vehicleId: vehicleDocs[0]._id, tripId: tripDocs[0]._id, expenseType: 'repair', expenseDate: new Date('2026-07-15'), amount: 5600, description: 'Suspension repair', notes: 'Cost covered by maintenance budget', createdBy: userDocs[0]._id, updatedBy: userDocs[0]._id },
    { vehicleId: vehicleDocs[1]._id, tripId: tripDocs[1]._id, expenseType: 'toll', expenseDate: new Date('2026-07-16'), amount: 250, description: 'Highway toll charge', notes: 'Route toll', createdBy: userDocs[1]._id, updatedBy: userDocs[1]._id },
  ];

  for (const expense of expenses) {
    await Expense.findOneAndUpdate(
      { vehicleId: expense.vehicleId, expenseDate: expense.expenseDate, description: expense.description },
      { $setOnInsert: expense },
      { upsert: true, new: true }
    );
  }

  const notifications = [
    { recipientId: userDocs[0]._id, type: 'trip_assignment', title: 'Trip Assigned', message: 'Your next trip has been assigned.', relatedEntityType: 'Trip', relatedEntityId: tripDocs[0]._id, isRead: false },
    { recipientId: userDocs[1]._id, type: 'maintenance_due', title: 'Maintenance Reminder', message: 'Vehicle service is due soon.', relatedEntityType: 'Vehicle', relatedEntityId: vehicleDocs[2]._id, isRead: false },
  ];

  for (const notification of notifications) {
    await Notification.findOneAndUpdate(
      { recipientId: notification.recipientId, title: notification.title },
      { $setOnInsert: notification },
      { upsert: true, new: true }
    );
  }

  console.log('Sample data inserted successfully.');
  process.exit(0);
};

seedSampleData().catch((error) => {
  console.error('Sample data insertion failed:', error);
  process.exit(1);
});
