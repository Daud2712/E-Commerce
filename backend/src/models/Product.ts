import { Schema, model, Document } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  description?: string;
  price: number;
  stock: number;
  seller: Schema.Types.ObjectId;
  images: string[];
  category?: string;
  isAvailable: boolean;
  deleted: boolean;
}

const productSchema = new Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  price: { type: Number, required: true, min: 0 },
  stock: { type: Number, required: true, min: 0, default: 0 },
  seller: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  images: { type: [String], default: [] },
  category: { type: String, trim: true },
  isAvailable: { type: Boolean, default: true },
  deleted: { type: Boolean, default: false },
}, { timestamps: true });

const Product = model<IProduct>('Product', productSchema);
export default Product;
