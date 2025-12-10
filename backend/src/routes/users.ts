import { Router } from 'express';
import { getDrivers, getUserById, updateDriverAvailability, deleteAccount } from '../controllers/users';
import { auth } from '../middleware/auth';

const router = Router();

// Get all drivers (for sellers to assign)
router.get('/drivers', auth, getDrivers);

// Update a driver's availability status (only for drivers)
router.patch('/drivers/availability', auth, updateDriverAvailability);

// Get a single user by ID
router.get('/:id', auth, getUserById);

// Delete user account
router.delete('/me', auth, deleteAccount);

export default router;
