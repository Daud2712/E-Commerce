import { Router } from 'express';
import { createDelivery, getDeliveries, getDeliveryByTrackingNumber, updateDeliveryStatus, assignDriver } from '../controllers/deliveries';
import { auth } from '../middleware/auth';
import { UserRole } from '../types';

const router = Router();

// Seller creates a delivery
router.post('/', auth, (req, res, next) => {
    // @ts-ignore
    if (req.role !== UserRole.Seller) {
        return res.status(403).json({ message: 'Access denied. Only sellers can create deliveries.' });
    }
    next();
}, createDelivery);

// Seller or Driver gets their deliveries
router.get('/', auth, getDeliveries);

// Public route to track a delivery
router.get('/:trackingNumber', getDeliveryByTrackingNumber);

// Driver updates a delivery status
router.put('/:id/status', auth, (req, res, next) => {
    // @ts-ignore
    if (req.role !== UserRole.Driver) {
        return res.status(403).json({ message: 'Access denied. Only drivers can update deliveries.' });
    }
    next();
}, updateDeliveryStatus);

// Seller assigns a driver
router.put('/:id/assign-driver', auth, (req, res, next) => {
    // @ts-ignore
    if (req.role !== UserRole.Seller) {
        return res.status(403).json({ message: 'Access denied. Only sellers can assign drivers.' });
    }
    next();
}, assignDriver);

export default router;
