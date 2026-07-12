import { faker } from '@faker-js/faker';
import { Trip, Vehicle, Driver, User } from '../../../backend/src/models/index.js';

export const seedTrips = async () => {
  faker.seed(2026);
  const vehicles = await Vehicle.find({ isActive: true, status: 'available' }).lean();
  const drivers = await Driver.find({ isActive: true, status: 'active' }).lean();
  const users = await User.find({}).lean();

  const trips = Array.from({ length: 500 }, (_, index) => {
    const vehicle = vehicles[index % vehicles.length];
    const driver = drivers[index % drivers.length];
    const start = faker.date.soon({ days: 30 });
    const end = new Date(start.getTime() + 3 * 60 * 60 * 1000);

    return {
      vehicleId: vehicle?._id,
      driverId: driver?._id,
      routeName: faker.helpers.arrayElement(['North Corridor', 'Industrial Loop', 'Airport Express', 'City Circle', 'Warehouse Run']),
      origin: faker.helpers.arrayElement(['Delhi Depot', 'Mumbai Hub', 'Bengaluru Yard', 'Chennai Terminal', 'Hyderabad Base']),
      destination: faker.helpers.arrayElement(['Airport', 'Warehouse', 'IT Park', 'Market Zone', 'Port Terminal']),
      scheduledStartAt: start,
      scheduledEndAt: end,
      cargoWeightKg: faker.number.int({ min: 1000, max: vehicle?.capacityWeightKg || 12000 }),
      revenueAmount: faker.number.float({ min: 800, max: 5000, precision: 0.01 }),
      status: faker.helpers.arrayElement(['planned', 'in_progress', 'completed', 'cancelled', 'delayed']),
      notes: faker.lorem.sentence(),
      createdBy: users[index % users.length]?._id || null,
      updatedBy: users[(index + 1) % users.length]?._id || null,
    };
  });

  const created = await Trip.bulkWrite(
    trips.map((trip) => ({
      updateOne: {
        filter: { vehicleId: trip.vehicleId, driverId: trip.driverId, scheduledStartAt: trip.scheduledStartAt },
        update: { $setOnInsert: trip },
        upsert: true,
      },
    }))
  );

  return {
    count: created.upsertedCount + created.modifiedCount,
    inserted: created.upsertedCount,
  };
};
