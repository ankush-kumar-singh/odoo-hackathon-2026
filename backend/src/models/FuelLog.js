/**
 * Fuel log schema for TransitOps trip operating costs.
 * Each record captures a fuel purchase or consumption event linked to a trip.
 */
import mongoose from 'mongoose';

const fuelLogSchema = new mongoose.Schema(
  {
    tripId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      required: [true, 'Trip reference is required.'],
    },
    fuelDate: {
      type: Date,
      required: [true, 'Fuel date is required.'],
    },
    fuelType: {
      type: String,
      enum: ['diesel', 'petrol', 'cng', 'electric', 'hybrid'],
      default: 'diesel',
    },
    quantityLiters: {
      type: Number,
      required: [true, 'Fuel quantity is required.'],
      min: [0, 'Fuel quantity must be non-negative.'],
    },
    costAmount: {
      type: Number,
      default: 0,
      min: [0, 'Fuel cost cannot be negative.'],
    },
    odometerReading: {
      type: Number,
      default: null,
      min: [0, 'Odometer reading must be non-negative.'],
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Useful for trip-based fuel analysis and reporting.
fuelLogSchema.index({ tripId: 1, fuelDate: -1 });

export const FuelLog = mongoose.model('FuelLog', fuelLogSchema);
