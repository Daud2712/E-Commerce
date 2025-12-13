import { Schema, model } from 'mongoose';
import { UserRole } from '../types'; // I will create this type file next

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: Object.values(UserRole),
    default: UserRole.BUYER,
  },
  isAvailable: { type: Boolean, default: false },
  registrationNumber: { type: String, unique: true, sparse: true }, // Added for buyers
  deliveryAddress: {
    street: { type: String },
    city: { type: String },
    state: { type: String },
    postalCode: { type: String },
    country: { type: String },
    phone: { type: String },
    additionalInfo: { type: String }, // For apartment number, landmarks, etc.
  },
}, { timestamps: true });

const User = model('User', userSchema);
export default User;
