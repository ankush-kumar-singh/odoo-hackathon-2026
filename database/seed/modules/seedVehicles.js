import { faker } from '@faker-js/faker';
import { Vehicle, VehicleType } from '../../../backend/src/models/index.js';

const manufacturerMap = {
  BUS: ['Tata', 'Ashok Leyland', 'Eicher', 'Volvo'],
  VAN: ['Mahindra', 'Maruti Suzuki', 'Toyota', 'Force'],
  TRUCK: ['Tata', 'Ashok Leyland', 'Eicher', 'BharatBenz'],
  MINI_BUS: ['Tata', 'Force', 'Mahindra'],
  SUV: ['Mahindra', 'Toyota', 'Maruti Suzuki', 'Tata'],
  TATA_ACE: ['Tata'],
  TEMPO: ['Force', 'Mahindra'],
  AUTO: ['Bajaj', 'Piaggio'],
};

const modelMap = {
  BUS: ['Starbus', 'LPO', 'CityRide', 'Ultra'],
  VAN: ['Supro', 'Tourister', 'Urban', 'King'],
  TRUCK: ['Dost', 'BOSS', 'Eicher 20.16', 'BharatBenz 1217'],
  MINI_BUS: ['Winger', 'Traveller', 'MAV'],
  SUV: ['Scorpio', 'Innova', 'XUV700', 'Brezza'],
  TATA_ACE: ['Ace'],
  TEMPO: ['Tempo Traveller', 'Ace Tempo'],
  AUTO: ['RE', 'Ape'],
};

export const seedVehicles = async () => {
  faker.seed(2026);
  const vehicleTypes = await VehicleType.find({}).lean();

  const vehicles = Array.from({ length: 50 }, (_, index) => {
    const type = vehicleTypes[index % vehicleTypes.length];
    const manufacturer = manufacturerMap[type.name][index % manufacturerMap[type.name].length];
    const model = modelMap[type.name][index % modelMap[type.name].length];
    const registrationNumber = `DL${String(index + 1).padStart(2, '0')}${faker.string.alpha({ length: 2, casing: 'upper' })}${faker.string.numeric(4)}`;

    return {
      registrationNumber,
      vehicleTypeId: type._id,
      make: manufacturer,
      model,
      yearOfManufacture: 2018 + (index % 8),
      capacityWeightKg: [3500, 4200, 6500, 9000, 12000, 15000][index % 6],
      status: index % 10 === 0 ? 'under_maintenance' : index % 7 === 0 ? 'retired' : 'available',
      isActive: true,
    };
  });

  const created = await Vehicle.bulkWrite(
    vehicles.map((vehicle) => ({
      updateOne: {
        filter: { registrationNumber: vehicle.registrationNumber },
        update: { $setOnInsert: vehicle },
        upsert: true,
      },
    }))
  );

  return {
    count: created.upsertedCount + created.modifiedCount,
    inserted: created.upsertedCount,
  };
};
