import { Router } from 'express';
import { getRiders, getUserById, updateRiderAvailability, deleteAccount, getMyProfile, updateProfile } from '../controllers/users';
import { auth } from '../middleware/auth';

const router = Router();

// Get all riders (for sellers to assign)
router.get('/riders', auth, getRiders);

// Update a rider's availability status (only for riders)
router.patch('/riders/availability', auth, updateRiderAvailability);

// Get current user profile
router.get('/me/profile', auth, getMyProfile);

// Update current user profile
router.patch('/me/profile', auth, updateProfile);

// Get a single user by ID
router.get('/:id', auth, getUserById);

// Delete user account
router.delete('/me', auth, deleteAccount);

export default router;
