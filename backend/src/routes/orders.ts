import { Router, Response } from 'express';
import { checkout, getBuyerOrders, getOrderById, getAllOrders, updateOrderStatus, cancelOrder, confirmReceipt } from '../controllers/orders';
import { auth } from '../middleware/auth';
import { UserRole, AuthRequest } from '../types';

const router = Router();

// @route   POST /api/orders/checkout
// @desc    Create new order (checkout)
// @access  Private (Buyer only)
router.post('/checkout', auth, (req: AuthRequest, res: Response, next) => {
  if (!req.user || req.user.role !== UserRole.BUYER) {
    return res.status(403).json({ message: 'Access denied. Only buyers can place orders.' });
  }
  checkout(req, res);
});

// @route   GET /api/orders/my-orders
// @desc    Get buyer's orders
// @access  Private (Buyer only)
router.get('/my-orders', auth, (req: AuthRequest, res: Response) => {
  if (!req.user || req.user.role !== UserRole.BUYER) {
    return res.status(403).json({ message: 'Access denied. Only buyers can view their orders.' });
  }
  getBuyerOrders(req, res);
});

// @route   GET /api/orders
// @desc    Get all orders for seller
// @access  Private (Seller only)
router.get('/', auth, (req: AuthRequest, res: Response) => {
  if (!req.user || req.user.role !== UserRole.SELLER) {
    return res.status(403).json({ message: 'Access denied. Only sellers can view orders.' });
  }
  getAllOrders(req, res);
});

// @route   GET /api/orders/:id
// @desc    Get single order by ID
// @access  Private
router.get('/:id', auth, getOrderById);

// @route   PUT /api/orders/:id/status
// @desc    Update order status
// @access  Private (Seller only)
router.put('/:id/status', auth, (req: AuthRequest, res: Response) => {
  if (!req.user || req.user.role !== UserRole.SELLER) {
    return res.status(403).json({ message: 'Access denied. Only sellers can update order status.' });
  }
  updateOrderStatus(req, res);
});

// @route   DELETE /api/orders/:id
// @desc    Cancel order
// @access  Private (Buyer only)
router.delete('/:id', auth, (req: AuthRequest, res: Response) => {
  if (!req.user || req.user.role !== UserRole.BUYER) {
    return res.status(403).json({ message: 'Access denied. Only buyers can cancel orders.' });
  }
  cancelOrder(req, res);
});

// @route   PUT /api/orders/:id/confirm-receipt
// @desc    Buyer confirms receipt of order
// @access  Private (Buyer only)
router.put('/:id/confirm-receipt', auth, (req: AuthRequest, res: Response) => {
  if (!req.user || req.user.role !== UserRole.BUYER) {
    return res.status(403).json({ message: 'Access denied. Only buyers can confirm receipt.' });
  }
  confirmReceipt(req, res);
});

export default router;
