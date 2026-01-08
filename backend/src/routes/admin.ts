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

// Get all by role
router.get('/buyers', adminController.getAllBuyers);
router.get('/sellers', adminController.getAllSellers);
router.get('/riders', adminController.getAllRiders);

// Get user details
router.get('/users/:userId', adminController.getUserDetails);
router.get('/users/by-email', adminController.findUserByEmailController);

// Approve/reject users
router.post('/users/:userId/approve', adminController.approveUser);
router.post('/users/:userId/reject', adminController.rejectUser);

// Bulk approve all buyers
router.post('/buyers/approve-all', adminController.approveAllBuyers);

// Suspend/reactivate users
router.post('/users/:userId/suspend', adminController.suspendUser);
router.post('/users/:userId/reactivate', adminController.reactivateUser);

// Delete user account
router.delete('/users/:userId/delete', adminController.deleteUser);
router.delete('/users/:userId', adminController.deleteUser);
router.delete('/users', adminController.deleteUserByEmail);

// Bulk delete all non-admin users
router.delete('/users', adminController.deleteAllNonAdminUsers);

// User counts (diagnostics)
router.get('/users/counts', adminController.getUserCounts);

export default router;
