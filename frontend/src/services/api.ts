import axios from 'axios';
import { RegisterFormData, LoginFormData, CreateDeliveryFormData, Delivery, User } from '../types';

const API = axios.create({
  baseURL: 'http://localhost:5000/api', // Adjust this if your backend runs on a different port
});

API.interceptors.request.use((req) => {
  if (localStorage.getItem('token')) {
    // Ensure req.headers is not undefined before attempting to set properties
    if (req.headers) {
      req.headers.Authorization = `Bearer ${localStorage.getItem('token')}`;
    }
  }
  return req;
});

export const register = (formData: RegisterFormData) => API.post('/auth/register', formData);
export const login = (formData: LoginFormData) => API.post('/auth/login', formData);
export const getDeliveryByTrackingNumber = (trackingNumber: string) => API.get(`/deliveries/${trackingNumber}`);
export const getDeliveries = () => API.get('/deliveries');
export const createDelivery = (deliveryData: CreateDeliveryFormData) => API.post('/deliveries', deliveryData);
export const updateDeliveryStatus = (id: string, status: Delivery['status']) => API.put(`/deliveries/${id}/status`, { status });
export const getAvailableDrivers = () => API.get('/users/drivers');
export const assignDriver = (id: string, driverId: string) => API.put(`/deliveries/${id}/assign-driver`, { driverId });
export const getBuyerDeliveries = () => API.get('/deliveries/buyer');

// New API calls
export const getUserProfile = (userId: string) => API.get(`/users/${userId}`); // Assuming a backend endpoint to get user by ID
export const updateDriverAvailability = (isAvailable: boolean) => API.patch('/users/drivers/availability', { isAvailable });
export const deleteAccount = () => API.delete('/users/me');


API.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API call failed:', error.response?.data || error.message || error);
    return Promise.reject(error);
  }
);

export default API;
