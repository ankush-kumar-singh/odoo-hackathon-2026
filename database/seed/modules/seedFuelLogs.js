import { faker } from '@faker-js/faker';
import { FuelLog, Trip, User } from '../../../backend/src/models/index.js';

export const seedFuelLogs = async () => {
  faker.seed(2026);
  const trips = await Trip.find({}).lean();
  const users = await User.find({}).lean();

  const logs = Array.from({ length: 800 }, (_, index) => {
    const trip = trips[index % trips.length];
    return {
      tripId: trip?._id,
      fuelDate: faker.date.recent({ days: 60 }),
      fuelType: faker.helpers.arrayElement(['diesel', 'petrol', 'cng', 'electric', 'hybrid']),
      quantityLiters: faker.number.int({ min: 20, max: 120 }),
      costAmount: faker.number.float({ min: 1200, max: 9000, precision: 0.01 }),
      odometerReading: faker.number.int({ min: 1000, max: 250000 }),
      notes: faker.lorem.sentence(),
      createdBy: users[index % users.length]?._id || null,
      updatedBy: users[(index + 1) % users.length]?._id || null,
    };
  });

  const created = await FuelLog.bulkWrite(
    logs.map((log) => ({
      updateOne: {
        filter: { tripId: log.tripId, fuelDate: log.fuelDate },
        update: { $setOnInsert: log },
        upsert: true,
      },
    }))
  );

  return {
    count: created.upsertedCount + created.modifiedCount,
    inserted: created.upsertedCount,
  };
};
