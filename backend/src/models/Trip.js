import mongoose from 'mongoose';

const tripSchema = new mongoose.Schema(
  {
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    driver: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', required: true },
    routeName: { type: String, required: true, trim: true },
    origin: { type: String, required: true, trim: true },
    destination: { type: String, required: true, trim: true },
    scheduledStartAt: { type: Date, required: true },
    scheduledEndAt: { type: Date, required: true },
    actualStartAt: { type: Date, default: null },
    actualEndAt: { type: Date, default: null },
    cargoWeightKg: { type: Number, default: 0, min: 0 },
    revenueAmount: { type: Number, default: 0, min: 0 },
    status: { type: String, enum: ['planned', 'in_progress', 'completed', 'cancelled', 'delayed'], default: 'planned' },
    notes: { type: String, default: '' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

tripSchema.index({ vehicle: 1, status: 1, scheduledStartAt: 1 });
tripSchema.index({ driver: 1, status: 1, scheduledStartAt: 1 });

export const Trip = mongoose.model('Trip', tripSchema);
