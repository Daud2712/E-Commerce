import { Router } from 'express';
import { getDeliveries, getDeliveryByTrackingNumber, updateDeliveryStatus, assignRider, getBuyerDeliveries, deleteDelivery, receiveDelivery, unreceiveDelivery, acceptDelivery, rejectDelivery, getRiderDeliveries } from '../controllers/deliveries';
import { auth } from '../middleware/auth';
import { UserRole } from '../types';

const router = Router();

// Seller or Rider gets their deliveries
router.get('/', auth, getDeliveries);

// Buyer gets their deliveries
router.get('/buyer', auth, (req, res, next) => {
    if (!req.user || req.user.role !== UserRole.BUYER) {
        return res.status(403).json({ message: 'Access denied. Only buyers can view their deliveries.' });
    }
    next();
}, getBuyerDeliveries);

// Rider gets deliveries assigned to them
router.get('/rider', auth, (req, res, next) => {
    if (!req.user || req.user.role !== UserRole.RIDER) {
        return res.status(403).json({ message: 'Access denied. Only riders can view their assigned deliveries.' });
    }
    next();
}, getRiderDeliveries);

// Public route to track a delivery
router.get('/:trackingNumber', getDeliveryByTrackingNumber);

// Rider updates a delivery status
router.put('/:id/status', auth, (req, res, next) => {
    if (!req.user || req.user.role !== UserRole.RIDER) {
        return res.status(403).json({ message: 'Access denied. Only riders can update deliveries.' });
    }
    next();
}, updateDeliveryStatus);

// Seller assigns a rider
router.put('/:id/assign-rider', auth, (req, res, next) => {
    if (!req.user || req.user.role !== UserRole.SELLER) {
        return res.status(403).json({ message: 'Access denied. Only sellers can assign riders.' });
    }
    next();
}, assignRider);

// Seller or Rider deletes a delivery
router.delete('/:id', auth, (req, res, next) => {
    if (!req.user || (req.user.role !== UserRole.SELLER && req.user.role !== UserRole.RIDER)) {
        return res.status(403).json({ message: 'Access denied. Only sellers or riders can delete deliveries.' });
    }
    next();
}, deleteDelivery);

// Buyer marks a delivery as received
router.put('/:id/receive', auth, (req, res, next) => {
    if (!req.user || req.user.role !== UserRole.BUYER) {
        return res.status(403).json({ message: 'Access denied. Only buyers can mark deliveries as received.' });
    }
    next();
}, receiveDelivery);

// Buyer undoes received status (change back to delivered)
router.put('/:id/unreceive', auth, (req, res, next) => {
    if (!req.user || req.user.role !== UserRole.BUYER) {
        return res.status(403).json({ message: 'Access denied. Only buyers can undo received status.' });
    }
    next();
}, unreceiveDelivery);

// Rider accepts an assigned delivery
router.put('/:id/accept', auth, (req, res, next) => {
    if (!req.user || req.user.role !== UserRole.RIDER) {
        return res.status(403).json({ message: 'Access denied. Only riders can accept deliveries.' });
    }
    next();
}, acceptDelivery);

// Rider rejects an assigned delivery
router.put('/:id/reject', auth, (req, res, next) => {
    if (!req.user || req.user.role !== UserRole.RIDER) {
        return res.status(403).json({ message: 'Access denied. Only riders can reject deliveries.' });
    }
    next();
}, rejectDelivery);

export default router;
