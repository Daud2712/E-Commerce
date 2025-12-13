export enum UserRole {
  BUYER = 'buyer',
  SELLER = 'seller',
  RIDER = 'rider',
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

export interface DeliveryAddress {
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  phone?: string;
  additionalInfo?: string;
}

export interface UpdateProfileData {
  name?: string;
  deliveryAddress?: DeliveryAddress;
}

export interface Delivery {
  _id: string;
  seller: string;
  rider?: string;
  buyer: string;
  packageName: string;
  status: 'pending' | 'assigned' | 'in_transit' | 'delivered' | 'received';
  trackingNumber: string;
  price: number;
  riderAccepted?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IProduct {
  _id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  seller: string;
  images: string[];
  category?: string;
  isAvailable: boolean;
  deleted: boolean;
  createdAt: string;
  updatedAt: string;
}

import { Request } from 'express'; // Import Request here

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: UserRole;
  };
}