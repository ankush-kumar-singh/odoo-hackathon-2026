/**
 * Expense schema for TransitOps operating cost tracking.
 * Expenses can be linked to vehicles and optionally to trips.
 */
import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema(
  {
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: [true, 'Vehicle reference is required.'],
    },
    tripId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      default: null,
    },
    expenseType: {
      type: String,
      enum: ['toll', 'parking', 'repair', 'insurance', 'permit', 'salary', 'misc'],
      default: 'misc',
    },
    expenseDate: {
      type: Date,
      required: [true, 'Expense date is required.'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required.'],
      min: [0, 'Amount cannot be negative.'],
    },
    description: {
      type: String,
      default: '',
      trim: true,
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

// Useful for finance reporting by vehicle and date.
expenseSchema.index({ vehicleId: 1, expenseDate: -1 });
expenseSchema.index({ tripId: 1, expenseDate: -1 });

export const Expense = mongoose.model('Expense', expenseSchema);
