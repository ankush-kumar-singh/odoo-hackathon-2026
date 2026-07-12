import { faker } from '@faker-js/faker';
import { Notification, User, Trip } from '../../../backend/src/models/index.js';

export const seedNotifications = async () => {
  faker.seed(2026);
  const users = await User.find({}).lean();
  const trips = await Trip.find({}).lean();

  const notifications = Array.from({ length: 100 }, (_, index) => ({
    recipientId: users[index % users.length]?._id || null,
    type: faker.helpers.arrayElement(['trip_assignment', 'trip_delay', 'maintenance_due', 'license_expiring', 'vehicle_alert', 'expense_approval', 'system_notice']),
    title: faker.helpers.arrayElement(['Trip Assigned', 'Maintenance Reminder', 'License Expiry', 'Vehicle Alert', 'Expense Approval Needed']),
    message: faker.lorem.sentence(),
    relatedEntityType: 'Trip',
    relatedEntityId: trips[index % trips.length]?._id || null,
    isRead: faker.datatype.boolean(),
  }));

  const created = await Notification.bulkWrite(
    notifications.map((notification) => ({
      updateOne: {
        filter: { recipientId: notification.recipientId, title: notification.title, message: notification.message },
        update: { $setOnInsert: notification },
        upsert: true,
      },
    }))
  );

  return {
    count: created.upsertedCount + created.modifiedCount,
    inserted: created.upsertedCount,
  };
};
