import { Schema, model, Document } from 'mongoose';
import { UserRole } from '../types';

export interface IDelivery extends Document {
  seller: Schema.Types.ObjectId;
  driver?: Schema.Types.ObjectId;
  buyer: {
    name: string;
    address: string;
  };
  packageName: string;
  status: 'pending' | 'assigned' | 'in-transit' | 'delivered';
  trackingNumber: string;
}

const deliverySchema = new Schema({
  seller: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  driver: { type: Schema.Types.ObjectId, ref: 'User' },
  buyer: {
    name: { type: String, required: true },
    address: { type: String, required: true },
  },
  packageName: { type: String, required: true },
  status: {
    type: String,
    enum: ['pending', 'assigned', 'in-transit', 'delivered'],
    default: 'pending',
  },
  trackingNumber: { type: String, required: true, unique: true },
}, { timestamps: true });

const Delivery = model<IDelivery>('Delivery', deliverySchema);
export default Delivery;
