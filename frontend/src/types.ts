export enum UserRole {
  BUYER = 'buyer',
  SELLER = 'seller',
  RIDER = 'rider',
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

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  registrationNumber?: string;
  isAvailable?: boolean;
  deliveryAddress?: DeliveryAddress;
}

export interface Delivery {
  _id: string;
  trackingNumber: string;
  packageName: string;
  status: 'pending' | 'assigned' | 'in_transit' | 'delivered' | 'received' | 'paid' | 'payment_failed';
  price: number;
  buyer: User; // Changed to reference User with new fields
  seller: {
    _id: string;
    name: string;
  };
  rider?: {
    _id: string;
    name: string;
  };
  riderAccepted?: boolean;
  mpesaCheckoutRequestId?: string;
  mpesaReceiptNumber?: string;
  paidAt?: string;
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

export interface UpdateProfileData {
  name?: string;
  deliveryAddress?: DeliveryAddress;
}

export interface IProduct {
  _id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  seller: {
    _id: string;
    name: string;
    email: string;
  };
  images: string[];
  category?: string;
  isAvailable: boolean;
  deleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IOrderItem {
  product: string | IProduct;
  productName: string;
  quantity: number;
  price: number;
}

export interface IOrder {
  _id: string;
  buyer: User;
  items: IOrderItem[];
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    phone?: string;
  };
  paymentStatus: 'pending' | 'paid' | 'failed';
  createdAt: string;
  updatedAt: string;
}