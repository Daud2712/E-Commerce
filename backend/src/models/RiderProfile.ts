import { Schema, model } from 'mongoose';

const riderProfileSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  vehicleType: { type: String, required: true }, // bike, motorcycle, car, van
  licenseNumber: { type: String, required: true },
  idDocument: { type: String }, // File path or URL
  driverLicense: { type: String }, // File path or URL
  vehicleRegistration: { type: String }, // File path or URL
  phoneNumber: { type: String },
  address: {
    street: { type: String },
    city: { type: String },
    state: { type: String },
    postalCode: { type: String },
    country: { type: String },
  },
  approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  approvedAt: { type: Date },
}, { timestamps: true });

const RiderProfile = model('RiderProfile', riderProfileSchema);
export default RiderProfile;
