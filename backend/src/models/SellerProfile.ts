import { Schema, model } from 'mongoose';

const sellerProfileSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  shopName: { type: String, required: true },
  businessLicense: { type: String }, // File path or URL
  idDocument: { type: String }, // File path or URL
  businessDescription: { type: String },
  businessAddress: {
    street: { type: String },
    city: { type: String },
    state: { type: String },
    postalCode: { type: String },
    country: { type: String },
  },
  phoneNumber: { type: String },
  approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  approvedAt: { type: Date },
}, { timestamps: true });

const SellerProfile = model('SellerProfile', sellerProfileSchema);
export default SellerProfile;
