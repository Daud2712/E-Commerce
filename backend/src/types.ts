export enum UserRole {
  Buyer = 'buyer',
  Seller = 'seller',
  Driver = 'driver',
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  registrationNumber?: string;
  contactNumber?: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface CreateDeliveryFormData {
  buyerRegistrationNumber: string;
  packageName: string;
  price: number;
  quantity?: number; // Optional quantity for bulk creation
}

export interface Delivery {
  _id: string;
  seller: string;
  driver?: string;
  buyer: string;
  packageName: string;
  status: 'pending' | 'assigned' | 'in-transit' | 'delivered';
  trackingNumber: string;
  price: number;
  createdAt: string;
  updatedAt: string;
}