import { Schema, model } from 'mongoose';
import { UserRole } from '../types'; // I will create this type file next

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: Object.values(UserRole),
    default: UserRole.Buyer,
  },
  isAvailable: { type: Boolean, default: false },
  registrationNumber: { type: String, unique: true, sparse: true }, // Added for buyers
}, { timestamps: true });

const User = model('User', userSchema);
export default User;
