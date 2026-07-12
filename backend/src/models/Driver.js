/**
 * Driver schema for TransitOps dispatch and trip assignment.
 * Drivers are linked to users where a system account exists.
 */
import mongoose from 'mongoose';

const driverSchema = new mongoose.Schema(
  {
    // Optional link to an internal user account.
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    // Internal driver identifier.
    employeeNumber: {
      type: String,
      required: [true, 'Employee number is required.'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    fullName: {
      type: String,
      required: [true, 'Driver full name is required.'],
      trim: true,
      minlength: [2, 'Driver name must be at least 2 characters long.'],
    },
    // Unique license number used for validation and assignment rules.
    licenseNumber: {
      type: String,
      required: [true, 'License number is required.'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    licenseExpiryDate: {
      type: Date,
      required: [true, 'License expiry date is required.'],
    },
    phoneNumber: {
      type: String,
      default: '',
      trim: true,
    },
    address: {
      type: String,
      default: '',
      trim: true,
    },
    // Current availability status for the driver.
    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended', 'on_leave'],
      default: 'active',
    },
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
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Helpful for dispatch and license-based assignment checks.
driverSchema.index({ status: 1, isActive: 1 });
driverSchema.index({ licenseExpiryDate: 1, isActive: 1 });

export const Driver = mongoose.model('Driver', driverSchema);
