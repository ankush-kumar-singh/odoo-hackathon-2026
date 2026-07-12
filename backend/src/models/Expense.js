import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema(
  {
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    trip: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', default: null },
    expenseType: { type: String, enum: ['toll', 'parking', 'repair', 'insurance', 'permit', 'salary', 'misc'], default: 'misc' },
    expenseDate: { type: Date, required: true },
    amount: { type: Number, default: 0, min: 0 },
    description: { type: String, default: '' },
    notes: { type: String, default: '' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

expenseSchema.index({ vehicle: 1, expenseDate: 1 });

export const Expense = mongoose.model('Expense', expenseSchema);
