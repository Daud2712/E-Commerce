import { Schema, model, Document } from 'mongoose';
import { UserRole } from '../types';

export interface IDelivery extends Document {
  order: Schema.Types.ObjectId; // Reference to Order
  seller: Schema.Types.ObjectId;
  rider?: Schema.Types.ObjectId;
  buyer: Schema.Types.ObjectId; // Changed to reference User
  packageName: string;
  status: 'pending' | 'assigned' | 'in_transit' | 'delivered' | 'received' | 'paid' | 'payment_failed';
  trackingNumber: string;
  price: number; // Added price
  deleted: boolean;
  riderAccepted?: boolean; // null/undefined: pending, true: accepted, false: rejected
  mpesaCheckoutRequestId?: string;
  mpesaReceiptNumber?: string;
  paidAt?: Date;
}

const deliverySchema = new Schema({
  order: { type: Schema.Types.ObjectId, ref: 'Order' }, // Optional for backward compatibility
  seller: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  rider: { type: Schema.Types.ObjectId, ref: 'User' },
  buyer: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // Changed to reference User
  packageName: { type: String, required: true },
  status: {
    type: String,
    enum: ['pending', 'assigned', 'in_transit', 'delivered', 'received', 'paid', 'payment_failed'],
    default: 'pending',
  },
  trackingNumber: { type: String, required: true, unique: true },
  price: { type: Number, required: true }, // Added price
  deleted: { type: Boolean, default: false },
  riderAccepted: { type: Boolean, default: null }, // null: pending response, true: accepted, false: rejected
  mpesaCheckoutRequestId: { type: String },
  mpesaReceiptNumber: { type: String },
  paidAt: { type: Date },
}, { timestamps: true });

const Delivery = model<IDelivery>('Delivery', deliverySchema);
export default Delivery;
