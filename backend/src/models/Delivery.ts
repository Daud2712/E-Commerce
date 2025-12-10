import { Schema, model, Document } from 'mongoose';
import { UserRole } from '../types';

export interface IDelivery extends Document {
  seller: Schema.Types.ObjectId;
  driver?: Schema.Types.ObjectId;
  buyer: Schema.Types.ObjectId; // Changed to reference User
  packageName: string;
  status: 'pending' | 'assigned' | 'in-transit' | 'delivered';
  trackingNumber: string;
  price: number; // Added price
}

const deliverySchema = new Schema({
  seller: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  driver: { type: Schema.Types.ObjectId, ref: 'User' },
  buyer: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // Changed to reference User
  packageName: { type: String, required: true },
  status: {
    type: String,
    enum: ['pending', 'assigned', 'in-transit', 'delivered'],
    default: 'pending',
  },
  trackingNumber: { type: String, required: true, unique: true },
  price: { type: Number, required: true }, // Added price
}, { timestamps: true });

const Delivery = model<IDelivery>('Delivery', deliverySchema);
export default Delivery;
