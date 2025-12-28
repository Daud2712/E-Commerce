import express from 'express';
import * as adminController from '../controllers/admin';
import { auth } from '../middleware/auth';
import { requireAdmin } from '../middleware/adminAuth';

const router = express.Router();

// All routes require authentication and admin role
router.use(auth);
router.use(requireAdmin);

// Get pending users
router.get('/pending-sellers', adminController.getPendingSellers);
router.get('/pending-riders', adminController.getPendingRiders);

// Get all users with filters
router.get('/users', adminController.getAllUsers);

// Get user details
router.get('/users/:userId', adminController.getUserDetails);

// Approve/reject users
router.post('/users/:userId/approve', adminController.approveUser);
router.post('/users/:userId/reject', adminController.rejectUser);

// Suspend/reactivate users
router.post('/users/:userId/suspend', adminController.suspendUser);
router.post('/users/:userId/reactivate', adminController.reactivateUser);

export default router;
