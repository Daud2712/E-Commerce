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
  address?: string;
}

export interface Delivery {
  _id: string;
  trackingNumber: string;
  packageName: string;
  status: 'pending' | 'in-transit' | 'delivered';
  buyer: {
    _id: string;
    name: string;
    address: string;
  };
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
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface CreateDeliveryFormData {
  packageName: string;
  buyerName: string;
  buyerAddress: string;
}