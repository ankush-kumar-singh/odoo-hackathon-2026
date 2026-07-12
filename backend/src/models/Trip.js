/**
 * Trip schema for TransitOps route and dispatch operations.
 * Trips represent planned routes assigned to a vehicle and driver.
 */
import mongoose from 'mongoose';

const tripSchema = new mongoose.Schema(
  {
    // Vehicle assigned to this trip.
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: [true, 'Vehicle reference is required.'],
    },
    // Driver assigned to this trip.
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Driver',
      required: [true, 'Driver reference is required.'],
    },
    routeName: {
      type: String,
      required: [true, 'Route name is required.'],
      trim: true,
    },
    origin: {
      type: String,
      required: [true, 'Origin is required.'],
      trim: true,
    },
    destination: {
      type: String,
      required: [true, 'Destination is required.'],
      trim: true,
    },
    scheduledStartAt: {
      type: Date,
      required: [true, 'Scheduled start time is required.'],
    },
    scheduledEndAt: {
      type: Date,
      required: [true, 'Scheduled end time is required.'],
    },
    actualStartAt: {
      type: Date,
      default: null,
    },
    actualEndAt: {
      type: Date,
      default: null,
    },
    cargoWeightKg: {
      type: Number,
      default: 0,
      min: [0, 'Cargo weight must be non-negative.'],
    },
    revenueAmount: {
      type: Number,
      default: 0,
      min: [0, 'Revenue cannot be negative.'],
    },
    status: {
      type: String,
      enum: ['planned', 'in_progress', 'completed', 'cancelled', 'delayed'],
      default: 'planned',
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

// Used for scheduling, dispatch filtering, and trip status dashboards.
tripSchema.index({ vehicleId: 1, status: 1, scheduledStartAt: 1 });
tripSchema.index({ driverId: 1, status: 1, scheduledStartAt: 1 });
tripSchema.index({ status: 1, scheduledStartAt: -1 });

export const Trip = mongoose.model('Trip', tripSchema);
