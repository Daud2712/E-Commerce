import { Schema, model } from 'mongoose';
import { UserRole, UserStatus } from '../types';

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: Object.values(UserRole),
    default: UserRole.BUYER,
  },
  status: {
    type: String,
    enum: Object.values(UserStatus),
    default: UserStatus.PENDING,
  },
  isAvailable: { type: Boolean, default: false },
  registrationNumber: { type: String, unique: true, sparse: true },
  deliveryAddress: {
    street: { type: String },
    city: { type: String },
    state: { type: String },
    postalCode: { type: String },
    country: { type: String },
    phone: { type: String },
    additionalInfo: { type: String },
  },
  approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  approvedAt: { type: Date },
  rejectedAt: { type: Date },
  rejectionReason: { type: String },
  suspendedAt: { type: Date },
  suspensionReason: { type: String },
}, { timestamps: true });

const User = model('User', userSchema);
export default User;
