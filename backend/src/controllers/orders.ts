import { Response } from 'express';
import Order from '../models/Order';
import Product from '../models/Product';
import { AuthRequest, UserRole } from '../types';
import mongoose from 'mongoose';
import { emitToSeller, emitToUser } from '../utils/socket';

// @desc    Create new order (checkout)
// @route   POST /api/orders/checkout
// @access  Private (Buyer only)
export const checkout = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated.' });
  }

  if (req.user.role !== UserRole.BUYER) {
    return res.status(403).json({ message: 'Only buyers can place orders.' });
  }

  const { items, shippingAddress, paymentMethod } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'Order must contain at least one item.' });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    let totalAmount = 0;
    const orderItems: any[] = [];

    for (const item of items) {
      const { productId, quantity } = item;

      if (!productId || !quantity || quantity < 1) {
        throw new Error('Invalid item in cart data.');
      }

      const product = await Product.findById(productId).session(session);

      if (!product || product.deleted) {
        throw new Error(`Product not found or is unavailable: ${productId}`);
      }

      if (product.stock < quantity) {
        throw new Error(`Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${quantity}`);
      }

      product.stock -= quantity;
      await product.save({ session });

      orderItems.push({
        product: product._id,
        productName: product.name,
        quantity,
        price: product.price,
      });

      totalAmount += product.price * quantity;
    }

    const orderData = {
      buyer: new mongoose.Types.ObjectId(req.user.id),
      items: orderItems,
      totalAmount,
      shippingAddress,
      status: 'pending',
      paymentStatus: paymentMethod === 'cash' ? 'pending' : 'pending',
      paymentMethod: paymentMethod || 'pending',
    };

    const [order] = await Order.create([orderData], { session });

    await session.commitTransaction();
    session.endSession();

    // Get unique seller IDs from the order items
    const sellerIds = new Set<string>();
    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (product && product.seller) {
        sellerIds.add(product.seller.toString());
      }
    }

    // Notify each seller about new order
    sellerIds.forEach(sellerId => {
      emitToSeller(sellerId, 'newOrder', {
        orderId: order._id,
        buyerId: req.user!.id,
        totalAmount,
        items: orderItems,
      });
    });

    // Notify buyer that order was placed
    emitToUser(req.user!.id, 'orderPlaced', {
      orderId: order._id,
      buyerId: req.user!.id,
      totalAmount,
      status: 'pending',
      message: 'Your order has been placed successfully!',
    });

    res.status(201).json({
      message: 'Order placed successfully!',
      order
    });
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();

    console.error('Error during checkout transaction:', {
      message: error.message,
      stack: error.stack,
      body: req.body,
      user: req.user
    });

    res.status(500).json({
      message: error.message || 'Checkout failed. Please try again.',
      error: error.message,
    });
  }
};

// @desc    Get buyer's orders
// @route   GET /api/orders/my-orders
// @access  Private (Buyer only)
export const getBuyerOrders = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated.' });
  }

  try {
    const orders = await Order.find({ buyer: req.user.id })
      .populate('items.product', 'name images')
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (error: any) {
    console.error('Error fetching buyer orders:', error);
    res.status(500).json({ message: 'Failed to fetch orders.' });
  }
};

// @desc    Get single order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated.' });
  }

  try {
    const order = await Order.findById(req.params.id)
      .populate('buyer', 'name email')
      .populate('items.product', 'name images');

    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    const buyerId = (order.buyer as any)._id ? (order.buyer as any)._id.toString() : order.buyer.toString();
    if (buyerId !== req.user.id && req.user.role !== UserRole.SELLER) {
      return res.status(403).json({ message: 'Not authorized to view this order.' });
    }

    res.status(200).json(order);
  } catch (error: any) {
    console.error('Error fetching order:', error);
    res.status(500).json({ message: 'Failed to fetch order.' });
  }
};

// @desc    Get all orders (for sellers to see orders of their products)
// @route   GET /api/orders
// @access  Private (Seller only)
export const getAllOrders = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated.' });
  }

  if (req.user.role !== UserRole.SELLER) {
    return res.status(403).json({ message: 'Only sellers can view all orders.' });
  }

  try {
    // Get all product IDs for the current seller
    const sellerProducts = await Product.find({ seller: req.user.id, deleted: false }).select('_id');
    const sellerProductIds = sellerProducts.map(p => p._id);

    // Find all orders containing at least one of the seller's products
    const sellerOrders = await Order.find({
      'items.product': { $in: sellerProductIds },
    })
      .populate('buyer', 'name email')
      .populate('items.product', 'name seller')
      .sort({ createdAt: -1 });

    res.status(200).json(sellerOrders);
  } catch (error: any) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Failed to fetch orders.' });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private (Seller only)
export const updateOrderStatus = async (req: AuthRequest, res: Response) => {
  const { status } = req.body;

  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated.' });
  }

  if (req.user.role !== UserRole.SELLER) {
    return res.status(403).json({ message: 'Only sellers can update order status.' });
  }

  try {
    const order = await Order.findById(req.params.id).populate('items.product', 'seller');

    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    // Check if seller owns at least one product in the order
    const hasSellersProduct = order.items.some((item: any) =>
      item.product?.seller?.toString() === req.user!.id
    );

    if (!hasSellersProduct) {
      return res.status(403).json({ message: 'Not authorized to update this order.' });
    }

    order.status = status;
    await order.save();

    if (order.buyer) {
      const buyerId = order.buyer.toString();
      if (status === 'shipped') {
        emitToUser(buyerId, 'orderShipped', {
          orderId: order._id,
          message: 'Your order has been shipped and is on the way!',
          timestamp: new Date()
        });
      } else if (status === 'delivered') {
        emitToUser(buyerId, 'orderDelivered', {
          orderId: order._id,
          message: 'Your order has been delivered!',
          timestamp: new Date()
        });
      } else {
        // For other status updates like 'processing'
        emitToUser(buyerId, 'orderUpdate', {
          orderId: order._id,
          status: order.status,
          message: `Your order status has been updated to ${status}`,
          timestamp: new Date()
        });
      }
    }

    res.status(200).json(order);
  } catch (error: any) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Failed to update order status.' });
  }
};

// @desc    Cancel order
// @route   DELETE /api/orders/:id
// @access  Private (Buyer only - can only cancel pending orders)
export const cancelOrder = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated.' });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const order = await Order.findById(req.params.id).session(session);

    if (!order) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Order not found.' });
    }

    // Check authorization
    if (order.buyer.toString() !== req.user.id) {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({ message: 'Not authorized to cancel this order.' });
    }

    // Can only cancel pending orders
    if (order.status !== 'pending') {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Can only cancel pending orders.' });
    }

    // Restore stock
    for (const item of order.items) {
      const product = await Product.findById(item.product).session(session);
      if (product) {
        product.stock += item.quantity;
        product.isAvailable = true;
        await product.save({ session });
      }
    }

    order.status = 'cancelled';
    await order.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({ message: 'Order cancelled successfully.', order });
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();
    console.error('Error cancelling order:', error);
    res.status(500).json({ message: 'Failed to cancel order.' });
  }
};
