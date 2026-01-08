import axios from 'axios';
import { RegisterFormData, LoginFormData, Delivery, User, UpdateProfileData } from '../types';

// Single source of truth for the API base URL
// Development: uses /api proxy (Vite -> localhost:5002) or production backend
// Production (Namecheap): uses deployed backend on Render
const BASE_URL = import.meta.env.VITE_API_URL || '/api';

const API = axios.create({
  baseURL: BASE_URL,
});

API.interceptors.request.use((req) => {
  if (localStorage.getItem('token')) {
    // Ensure req.headers is not undefined before attempting to set properties
    if (req.headers) {
      req.headers.Authorization = `Bearer ${localStorage.getItem('token')}`;
    }
  }
  console.log(`[API] ${req.method?.toUpperCase()} ${req.url}`, req.data || '');
  return req;
});

API.interceptors.response.use(
  (response) => {
    console.log(`[API] Response from ${response.config.url}:`, response.data);
    return response;
  },
  (error) => {
    if (error.response) {
      // The request was made and the server responded with a status code outside 2xx
      console.error(`[API] Error from ${error.config?.url}:`, {
        message: error.response.data?.message || 'Server responded with an error',
        status: error.response.status,
        data: error.response.data,
      });
    } else if (error.request) {
      // The request was made but no response was received
      console.error(`[API] No response from ${error.config?.url}:`, error.request);
    } else {
      // Something happened in setting up the request
      console.error('[API] Request setup error:', error.message);
    }
    return Promise.reject(error);
  }
);

export const register = (formData: RegisterFormData) => API.post('/auth/register', formData);
export const login = (formData: LoginFormData) => API.post('/auth/login', formData);
export const getDeliveryByTrackingNumber = (trackingNumber: string) => API.get(`/deliveries/${trackingNumber}`);
export const getDeliveries = () => API.get('/deliveries');
export const updateDeliveryStatus = (id: string, status: Delivery['status']) => API.put(`/deliveries/${id}/status`, { status });
export const getAvailableRiders = () => API.get('/users/riders'); // Added comment to force recompile
export const assignRider = (id: string, riderId: string) => API.put(`/deliveries/${id}/assign-rider`, { riderId });
export const getBuyerDeliveries = () => API.get('/deliveries/buyer');
export const getRiderDeliveries = () => API.get('/deliveries/rider');
export const deleteDelivery = (id: string) => API.delete(`/deliveries/${id}`);
export const receiveDelivery = (id: string) => API.put(`/deliveries/${id}/receive`);
export const unreceiveDelivery = (id: string) => API.put(`/deliveries/${id}/unreceive`);
export const acceptDelivery = (id: string) => API.put(`/deliveries/${id}/accept`);
export const rejectDelivery = (id: string) => API.put(`/deliveries/${id}/reject`);

// New API calls
export const getUserProfile = (userId: string) => API.get(`/users/${userId}`);
export const getMyProfile = () => API.get('/users/me/profile');
export const updateProfile = (data: UpdateProfileData) => API.patch('/users/me/profile', data);
export const updateRiderAvailability = (isAvailable: boolean) => API.patch('/users/riders/availability', { isAvailable });
export const deleteAccount = () => API.delete('/users/me');

// ...existing code...

// Product API calls
export const createProduct = (productData: FormData) => API.post('/products', productData);
export const getProducts = () => API.get('/products');
export const getProductById = (id: string) => API.get(`/products/${id}`);
export const updateProduct = (id: string, productData: FormData) => API.put(`/products/${id}`, productData);
export const deleteProduct = (id: string) => API.delete(`/products/${id}`);

// Order API calls
export const checkout = (orderData: { items: Array<{ productId: string; quantity: number }>; shippingAddress: any }) => API.post('/orders/checkout', orderData);
export const getBuyerOrders = () => API.get('/orders/my-orders');
export const getOrderById = (id: string) => API.get(`/orders/${id}`);
export const getAllOrders = () => API.get('/orders');
export const updateOrderStatus = (id: string, data: { status: string; assignedRider?: string }) => API.put(`/orders/${id}/status`, data);
export const cancelOrder = (id: string) => API.delete(`/orders/${id}`);
export const confirmReceipt = (id: string) => API.put(`/orders/${id}/confirm-receipt`);
export const updatePaymentStatus = (id: string, paymentStatus: string) => API.put(`/orders/${id}/payment-status`, { paymentStatus });

// Admin API calls
export const getPendingSellers = (token: string) => API.get('/admin/pending-sellers', { headers: { Authorization: `Bearer ${token}` } });
export const getPendingRiders = (token: string) => API.get('/admin/pending-riders', { headers: { Authorization: `Bearer ${token}` } });
export const getAllUsers = (token: string) => API.get('/admin/users', { headers: { Authorization: `Bearer ${token}` } });
export const getAllBuyers = (token: string) => API.get('/admin/buyers', { headers: { Authorization: `Bearer ${token}` } });
export const getAllSellers = (token: string) => API.get('/admin/sellers', { headers: { Authorization: `Bearer ${token}` } });
export const getAllRiders = (token: string) => API.get('/admin/riders', { headers: { Authorization: `Bearer ${token}` } });
export const approveAllBuyers = (token: string) => API.post('/admin/buyers/approve-all', {}, { headers: { Authorization: `Bearer ${token}` } });
export const getUserDetails = (userId: string, token: string) => API.get(`/admin/users/${userId}`, { headers: { Authorization: `Bearer ${token}` } });
export const deleteUser = (userId: string, token: string) => API.delete(`/admin/users/${userId}`, { headers: { Authorization: `Bearer ${token}` } });
export const approveUser = (userId: string, token: string) => API.post(`/admin/users/${userId}/approve`, {}, { headers: { Authorization: `Bearer ${token}` } });
export const rejectUser = (userId: string, reason: string, token: string) => API.post(`/admin/users/${userId}/reject`, { reason }, { headers: { Authorization: `Bearer ${token}` } });
export const suspendUser = (userId: string, reason: string, token: string) => API.post(`/admin/users/${userId}/suspend`, { reason }, { headers: { Authorization: `Bearer ${token}` } });
export const reactivateUser = (userId: string, token: string) => API.post(`/admin/users/${userId}/reactivate`, {}, { headers: { Authorization: `Bearer ${token}` } });


// Helper function to get full image URL
export const getImageUrl = (imagePath: string): string => {
  if (!imagePath) return '';

  // If the path is already a full URL, return it as is.
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // Construct the full URL using a base URL that doesn't include the /api path.
  const backendURL = BASE_URL.replace(/\/api\/?$/, '');
  
  try {
    // Use the URL constructor for robust path joining.
    // It correctly handles slashes, preventing duplicates or missing ones.
    const fullUrl = new URL(imagePath, backendURL);
    return fullUrl.href;
  } catch (error) {
    // If backendURL is relative (e.g. empty string in dev), URL constructor might fail.
    // In that case, return the path as is.
    return imagePath;
  }
};


export default API;
