/**
 * Vehicle schema for TransitOps fleet management.
 * Vehicles represent operational assets that can be assigned to trips.
 */
import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema(
  {
    // Unique registration plate or fleet tag.
    registrationNumber: {
      type: String,
      required: [true, 'Registration number is required.'],
      unique: true,
      trim: true,
      uppercase: true,
      minlength: [3, 'Registration number must be at least 3 characters long.'],
    },
    // Vehicle category such as bus, truck, van, or car.
    vehicleTypeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'VehicleType',
      required: [true, 'Vehicle type is required.'],
    },
    make: {
      type: String,
      required: [true, 'Vehicle make is required.'],
      trim: true,
    },
    model: {
      type: String,
      required: [true, 'Vehicle model is required.'],
      trim: true,
    },
    yearOfManufacture: {
      type: Number,
      default: null,
      min: [1900, 'Year of manufacture is unrealistic.'],
      max: [new Date().getFullYear() + 1, 'Year of manufacture cannot be in the future.'],
    },
    // Maximum payload capacity in kilograms.
    capacityWeightKg: {
      type: Number,
      required: [true, 'Capacity weight is required.'],
      min: [0, 'Capacity must be non-negative.'],
    },
    // Current operational status of the vehicle.
    status: {
      type: String,
      enum: ['available', 'in_transit', 'under_maintenance', 'retired', 'inactive'],
      default: 'available',
    },
    // Whether the vehicle is active in the fleet.
    isActive: {
      type: Boolean,
      default: true,
    },
    // Reference to the current active trip, if any.
    currentTripId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      default: null,
    },
    // Soft delete marker for historical retention.
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Used by dispatch and fleet assignment workflows.
vehicleSchema.index({ status: 1, isActive: 1 });
vehicleSchema.index({ vehicleTypeId: 1, status: 1 });

export const Vehicle = mongoose.model('Vehicle', vehicleSchema);
