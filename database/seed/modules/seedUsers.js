import { faker } from '@faker-js/faker';
import { User, Role } from '../../../backend/src/models/index.js';

// Users are seeded after roles so every user can reference a valid role.
export const seedUsers = async () => {
  faker.seed(2026);

  const roles = await Role.find({}).lean();
  const roleMap = new Map(roles.map((role) => [role.name, role._id]));
  const roleOrder = ['admin', 'fleet_manager', 'dispatcher', 'driver', 'accountant'];

  const users = Array.from({ length: 15 }, (_, index) => {
    const roleName = roleOrder[index % roleOrder.length];
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();

    return {
      fullName: `${firstName} ${lastName}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@transitops.in`,
      passwordHash: '$2b$12$8u9mNHzReV9YQ5F4R0GJNeRzy0b7JLoGJ4p7Qyq3rH1w7kq4u6D2u',
      roleId: roleMap.get(roleName),
      phoneNumber: faker.phone.number('+91##########'),
      isActive: true,
    };
  });

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
    count: await User.countDocuments({}),
    inserted: created.upsertedCount,
  };
};
