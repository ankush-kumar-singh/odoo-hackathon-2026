/**
 * Lookup model for vehicle categories used by the fleet module.
 */
import mongoose from 'mongoose';

const vehicleTypeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Vehicle type name is required.'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

vehicleTypeSchema.index({ isActive: 1, name: 1 });

export const VehicleType = mongoose.model('VehicleType', vehicleTypeSchema);
