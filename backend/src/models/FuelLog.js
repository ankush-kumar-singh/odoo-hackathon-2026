import mongoose from 'mongoose';

const fuelLogSchema = new mongoose.Schema(
  {
    trip: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true },
    fuelDate: { type: Date, required: true },
    fuelType: { type: String, enum: ['diesel', 'petrol', 'cng', 'electric', 'hybrid'], default: 'diesel' },
    quantityLiters: { type: Number, default: 0, min: 0 },
    costAmount: { type: Number, default: 0, min: 0 },
    odometerReading: { type: Number, default: null },
    notes: { type: String, default: '' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

fuelLogSchema.index({ trip: 1, fuelDate: 1 });

export const FuelLog = mongoose.model('FuelLog', fuelLogSchema);
