import { faker } from '@faker-js/faker';
import { User, Role } from '../../../backend/src/models/index.js';

export const seedUsers = async () => {
  faker.seed(2026);

  const roles = await Role.find({}).lean();
  const roleMap = new Map(roles.map((role) => [role.name, role._id]));

  const users = Array.from({ length: 15 }, (_, index) => ({
    fullName: faker.person.fullName(),
    email: faker.internet.email({ firstName: faker.person.firstName(), lastName: faker.person.lastName(), provider: 'transitops.in' }),
    passwordHash: '$2b$12$8u9mNHzReV9YQ5F4R0GJNeRzy0b7JLoGJ4p7Qyq3rH1w7kq4u6D2u',
    roleId: roleMap.get(index === 0 ? 'admin' : index === 1 ? 'fleet_manager' : index < 5 ? 'dispatcher' : index < 10 ? 'driver' : 'accountant'),
    phoneNumber: faker.phone.number('+91##########'),
    isActive: true,
  }));

  const created = await User.bulkWrite(
    users.map((user) => ({
      updateOne: {
        filter: { email: user.email },
        update: { $setOnInsert: user },
        upsert: true,
      },
    }))
  );

  return {
    count: created.upsertedCount + created.modifiedCount,
    inserted: created.upsertedCount,
  };
};
