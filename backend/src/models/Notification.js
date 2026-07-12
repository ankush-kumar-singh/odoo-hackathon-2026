/**
 * Notification model for dispatch, maintenance, and system alerts.
 */
import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Recipient is required.'],
    },
    type: {
      type: String,
      enum: ['trip_assignment', 'trip_delay', 'maintenance_due', 'license_expiring', 'vehicle_alert', 'expense_approval', 'system_notice'],
      default: 'system_notice',
    },
    title: {
      type: String,
      required: [true, 'Notification title is required.'],
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Notification message is required.'],
      trim: true,
    },
    relatedEntityType: {
      type: String,
      default: '',
      trim: true,
    },
    relatedEntityId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({ recipientId: 1, isRead: 1, createdAt: -1 });

export const Notification = mongoose.model('Notification', notificationSchema);
