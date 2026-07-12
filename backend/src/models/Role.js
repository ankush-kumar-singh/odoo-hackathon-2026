/**
 * Role schema for TransitOps authorization and access control.
 * Roles are shared lookup documents that can be reused by many users.
 */
import mongoose from 'mongoose';

const roleSchema = new mongoose.Schema(
  {
    // Human-readable role name such as admin, dispatcher, or driver.
    name: {
      type: String,
      required: [true, 'Role name is required.'],
      unique: true,
      trim: true,
      minlength: [2, 'Role name must be at least 2 characters long.'],
    },
    // Permissions linked to this role.
    permissions: {
      type: [String],
      default: [],
      validate: {
        validator: (permissions) => permissions.every((permission) => typeof permission === 'string' && permission.trim().length > 0),
        message: 'Each permission must be a non-empty string.',
      },
    },
    // Optional explanation that describes the role's purpose.
    description: {
      type: String,
      default: '',
      trim: true,
    },
    // Whether the role is active and available for assignment.
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Used for RBAC lookups and filtering by active roles.
roleSchema.index({ isActive: 1, name: 1 });

export const Role = mongoose.model('Role', roleSchema);
