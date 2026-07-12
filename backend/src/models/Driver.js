import mongoose from 'mongoose';

const driverSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    employeeNumber: { type: String, required: true, unique: true, trim: true },
    fullName: { type: String, required: true, trim: true },
    licenseNumber: { type: String, required: true, unique: true, trim: true },
    licenseExpiryDate: { type: Date, required: true },
    phoneNumber: { type: String, default: '' },
    address: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

driverSchema.index({ isActive: 1, licenseExpiryDate: 1 });

export const Driver = mongoose.model('Driver', driverSchema);
