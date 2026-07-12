import { faker } from '@faker-js/faker';
import { Expense, Vehicle, Trip, User } from '../../../backend/src/models/index.js';

export const seedExpenses = async () => {
  faker.seed(2026);
  const vehicles = await Vehicle.find({}).lean();
  const trips = await Trip.find({}).lean();
  const users = await User.find({}).lean();

  const expenses = Array.from({ length: 400 }, (_, index) => {
    const vehicle = vehicles[index % vehicles.length];
    const trip = trips[index % trips.length];
    return {
      vehicleId: vehicle?._id,
      tripId: trip?._id,
      expenseType: faker.helpers.arrayElement(['toll', 'parking', 'repair', 'insurance', 'permit', 'salary', 'misc']),
      expenseDate: faker.date.recent({ days: 90 }),
      amount: faker.number.float({ min: 150, max: 18000, precision: 0.01 }),
      description: faker.lorem.sentence(),
      notes: faker.lorem.sentence(),
      createdBy: users[index % users.length]?._id || null,
      updatedBy: users[(index + 1) % users.length]?._id || null,
    };
  });

  const created = await Expense.bulkWrite(
    expenses.map((expense) => ({
      updateOne: {
        filter: { vehicleId: expense.vehicleId, expenseDate: expense.expenseDate, description: expense.description },
        update: { $setOnInsert: expense },
        upsert: true,
      },
    }))
  );

  return {
    count: created.upsertedCount + created.modifiedCount,
    inserted: created.upsertedCount,
  };
};
