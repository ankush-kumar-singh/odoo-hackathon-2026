/**
 * User schema for TransitOps authentication and access control.
 * Users are the main identity documents for the platform.
 */
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    // Display name shown in the application and reports.
    fullName: {
      type: String,
      required: [true, 'Full name is required.'],
      trim: true,
      minlength: [2, 'Full name must be at least 2 characters long.'],
    },
    // Unique email address used for authentication and notifications.
    email: {
      type: String,
      required: [true, 'Email is required.'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Email format is invalid.'],
    },
    // Hashed password stored securely.
    passwordHash: {
      type: String,
      required: [true, 'Password hash is required.'],
      minlength: [60, 'Password hash looks too short.'],
    },
    // Reference to the role assigned to this user.
    roleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Role',
      required: [true, 'A role reference is required.'],
    },
    // Contact number for dispatch and operations coordination.
    phoneNumber: {
      type: String,
      default: '',
      trim: true,
    },
    // Whether the account is active.
    isActive: {
      type: Boolean,
      default: true,
    },
    // Most recent successful login timestamp.
    lastLoginAt: {
      type: Date,
      default: null,
    },
    // Soft delete marker for user records.
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Useful for authentication and user lookup queries.
userSchema.index({ email: 1, isActive: 1 });
userSchema.index({ roleId: 1, createdAt: -1 });

export const User = mongoose.model('User', userSchema);
