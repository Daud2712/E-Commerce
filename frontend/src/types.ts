export enum UserRole {
  Buyer = 'buyer',
  Seller = 'seller',
  Driver = 'driver',
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  registrationNumber?: string; // New field
  isAvailable?: boolean;
}

export interface Delivery {
  _id: string;
  trackingNumber: string;
  packageName: string;
  status: 'pending' | 'in-transit' | 'delivered';
  price: number;
  buyer: User; // Changed to reference User with new fields
  seller: {
    _id: string;
    name: string;
  };
  driver?: {
    _id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  registrationNumber?: string; // New field
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface CreateDeliveryFormData {
  packageName: string;
  buyerRegistrationNumber: string; // Changed from buyerEmail
  price: number;
  quantity?: number; // Optional quantity for bulk creation
}