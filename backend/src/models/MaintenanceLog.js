/**
 * Maintenance log schema for TransitOps fleet upkeep tracking.
 * Each document records work performed on a vehicle.
 */
import mongoose from 'mongoose';

const maintenanceLogSchema = new mongoose.Schema(
  {
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: [true, 'Vehicle reference is required.'],
    },
    maintenanceDate: {
      type: Date,
      required: [true, 'Maintenance date is required.'],
    },
    maintenanceType: {
      type: String,
      required: [true, 'Maintenance type is required.'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    costAmount: {
      type: Number,
      default: 0,
      min: [0, 'Maintenance cost cannot be negative.'],
    },
    status: {
      type: String,
      enum: ['scheduled', 'in_progress', 'completed', 'cancelled'],
      default: 'scheduled',
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

// Used for fleet maintenance planning and service history review.
maintenanceLogSchema.index({ vehicleId: 1, status: 1, maintenanceDate: -1 });

export const MaintenanceLog = mongoose.model('MaintenanceLog', maintenanceLogSchema);
