/**
 * Trip schema for TransitOps route and dispatch operations.
 * Trips represent planned routes assigned to a vehicle and driver.
 */
import mongoose from 'mongoose';

const activeTripStatuses = new Set(['planned', 'in_progress', 'delayed']);

const validateTripAssignment = async function (trip) {
  if (!trip.vehicleId || !trip.driverId) {
    return;
  }

  const Vehicle = mongoose.model('Vehicle');
  const Driver = mongoose.model('Driver');

  const [vehicle, driver] = await Promise.all([
    Vehicle.findById(trip.vehicleId),
    Driver.findById(trip.driverId),
  ]);

  if (!vehicle) {
    throw new Error('Assigned vehicle does not exist.');
  }

  if (!driver) {
    throw new Error('Assigned driver does not exist.');
  }

  if (!vehicle.isActive || vehicle.deletedAt) {
    throw new Error('Vehicle is not active.');
  }

  if (!driver.isActive || driver.deletedAt) {
    throw new Error('Driver is not active.');
  }

  if (['under_maintenance', 'retired', 'inactive'].includes(vehicle.status)) {
    throw new Error('Vehicle cannot be assigned in its current status.');
  }

  if (driver.status !== 'active') {
    throw new Error('Driver is not available for assignment.');
  }

  if (driver.licenseExpiryDate && new Date(driver.licenseExpiryDate) < new Date()) {
    throw new Error('Driver license has expired.');
  }

  if (trip.cargoWeightKg > vehicle.capacityWeightKg) {
    throw new Error('Trip cargo weight exceeds vehicle capacity.');
  }

  if (activeTripStatuses.has(trip.status)) {
    const [vehicleTripCount, driverTripCount] = await Promise.all([
      mongoose.model('Trip').countDocuments({
        _id: { $ne: trip._id },
        vehicleId: trip.vehicleId,
        status: { $in: Array.from(activeTripStatuses) },
      }),
      mongoose.model('Trip').countDocuments({
        _id: { $ne: trip._id },
        driverId: trip.driverId,
        status: { $in: Array.from(activeTripStatuses) },
      }),
    ]);

    if (vehicleTripCount > 0) {
      throw new Error('Vehicle already has an active trip.');
    }

    if (driverTripCount > 0) {
      throw new Error('Driver already has an active trip.');
    }
  }
};

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

tripSchema.pre('validate', async function (next) {
  try {
    if (this.scheduledEndAt && this.scheduledStartAt && this.scheduledEndAt < this.scheduledStartAt) {
      throw new Error('Scheduled end time must be after the start time.');
    }

    await validateTripAssignment(this);
    next();
  } catch (error) {
    next(error);
  }
});

// Used for scheduling, dispatch filtering, and trip status dashboards.
tripSchema.index({ vehicleId: 1, status: 1, scheduledStartAt: 1 });
tripSchema.index({ driverId: 1, status: 1, scheduledStartAt: 1 });
tripSchema.index({ status: 1, scheduledStartAt: -1 });

export const Trip = mongoose.model('Trip', tripSchema);
