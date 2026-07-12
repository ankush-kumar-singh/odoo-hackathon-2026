import { faker } from '@faker-js/faker';
import { MaintenanceLog, Vehicle, User } from '../../../backend/src/models/index.js';

export const seedMaintenanceLogs = async () => {
  faker.seed(2026);
  const vehicles = await Vehicle.find({}).lean();
  const users = await User.find({}).lean();

  const logs = Array.from({ length: 150 }, (_, index) => {
    const vehicle = vehicles[index % vehicles.length];
    return {
      vehicleId: vehicle?._id,
      maintenanceDate: faker.date.recent({ days: 120 }),
      maintenanceType: faker.helpers.arrayElement(['Brake Service', 'Oil Change', 'Tyre Replacement', 'Battery Replacement', 'Engine Tune-up']),
      description: faker.lorem.sentence(),
      costAmount: faker.number.float({ min: 800, max: 12000, precision: 0.01 }),
      status: faker.helpers.arrayElement(['scheduled', 'in_progress', 'completed', 'cancelled']),
      notes: faker.lorem.sentence(),
      createdBy: users[index % users.length]?._id || null,
      updatedBy: users[(index + 1) % users.length]?._id || null,
    };
  });

  const created = await MaintenanceLog.bulkWrite(
    logs.map((log) => ({
      updateOne: {
        filter: { vehicleId: log.vehicleId, maintenanceDate: log.maintenanceDate },
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
