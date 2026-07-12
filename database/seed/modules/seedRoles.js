import { Role } from '../../../backend/src/models/index.js';

export const seedRoles = async () => {
  const roles = [
    { name: 'admin', permissions: ['manage_users', 'manage_fleet', 'manage_trips', 'manage_maintenance', 'manage_finance', 'view_reports'], description: 'System administrator' },
    { name: 'fleet_manager', permissions: ['manage_fleet', 'manage_trips', 'manage_maintenance', 'view_reports'], description: 'Fleet operations manager' },
    { name: 'dispatcher', permissions: ['manage_trips', 'view_reports'], description: 'Operations dispatcher' },
    { name: 'driver', permissions: ['view_assigned_trips'], description: 'Operational driver' },
    { name: 'accountant', permissions: ['manage_finance', 'view_reports'], description: 'Finance and expense controller' },
  ];

  const created = await Role.bulkWrite(
    roles.map((role) => ({
      updateOne: {
        filter: { name: role.name },
        update: { $setOnInsert: role },
        upsert: true,
      },
    }))
  );

  return {
    count: created.upsertedCount + created.modifiedCount,
    inserted: created.upsertedCount,
  };
};
