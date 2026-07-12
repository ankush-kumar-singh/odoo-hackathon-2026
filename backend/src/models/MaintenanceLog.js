import mongoose from 'mongoose';

const maintenanceLogSchema = new mongoose.Schema(
  {
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    maintenanceDate: { type: Date, required: true },
    maintenanceType: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    costAmount: { type: Number, default: 0, min: 0 },
    status: { type: String, enum: ['scheduled', 'in_progress', 'completed', 'cancelled'], default: 'scheduled' },
    notes: { type: String, default: '' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

maintenanceLogSchema.index({ vehicle: 1, status: 1, maintenanceDate: 1 });

export const MaintenanceLog = mongoose.model('MaintenanceLog', maintenanceLogSchema);
