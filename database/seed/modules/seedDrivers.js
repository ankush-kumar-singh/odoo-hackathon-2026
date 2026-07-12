import { faker } from '@faker-js/faker';
import { Driver, User } from '../../../backend/src/models/index.js';

// Drivers are seeded before trips so each trip can reference a valid driver.
export const seedDrivers = async () => {
  faker.seed(2026);
  const users = await User.find({}).lean();

  const drivers = Array.from({ length: 50 }, (_, index) => ({
    userId: users[index % users.length]?._id || null,
    employeeNumber: `DRV${String(index + 1).padStart(3, '0')}`,
    fullName: faker.person.fullName(),
    licenseNumber: `LIC${String(index + 1).padStart(4, '0')}`,
    licenseExpiryDate: faker.date.future({ years: 5 }),
    phoneNumber: faker.phone.number('+91##########'),
    address: `${faker.location.streetAddress()}, ${faker.location.city()}, ${faker.location.state()}`,
    status: index % 10 === 0 ? 'suspended' : 'active',
    isActive: true,
  }));

  const created = await Driver.bulkWrite(
    drivers.map((driver) => ({
      updateOne: {
        filter: { licenseNumber: driver.licenseNumber },
        update: { $setOnInsert: driver },
        upsert: true,
      },
    }))
  );

  return {
    count: await Driver.countDocuments({}),
    inserted: created.upsertedCount,
  };
};
