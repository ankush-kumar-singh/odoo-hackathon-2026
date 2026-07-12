import { VehicleType } from '../../../backend/src/models/index.js';

// Vehicle types are lookup documents reused by every vehicle record.
export const seedVehicleTypes = async () => {
  const types = [
    { name: 'BUS', description: 'Urban transport bus' },
    { name: 'VAN', description: 'Passenger van' },
    { name: 'TRUCK', description: 'Freight truck' },
    { name: 'MINI_BUS', description: 'Small passenger bus' },
    { name: 'SUV', description: 'Utility SUV' },
    { name: 'TATA_ACE', description: 'Compact cargo vehicle' },
    { name: 'TEMPO', description: 'Three-wheeler cargo carrier' },
    { name: 'AUTO', description: 'Three-wheeler passenger carrier' },
  ];

  const created = await VehicleType.bulkWrite(
    types.map((type) => ({
      updateOne: {
        filter: { name: type.name },
        update: { $setOnInsert: type },
        upsert: true,
      },
    }))
  );

  return {
    count: await VehicleType.countDocuments({}),
    inserted: created.upsertedCount,
  };
};
