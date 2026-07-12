import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema(
  {
    registrationNumber: { type: String, required: true, unique: true, trim: true },
    vehicleType: { type: String, required: true, trim: true },
    make: { type: String, required: true, trim: true },
    model: { type: String, required: true, trim: true },
    yearOfManufacture: { type: Number, default: null },
    capacityWeightKg: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ['available', 'in_transit', 'under_maintenance', 'retired', 'inactive'], default: 'available' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

vehicleSchema.index({ status: 1, isActive: 1 });

export const Vehicle = mongoose.model('Vehicle', vehicleSchema);
