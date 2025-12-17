import { Request, Response, NextFunction } from 'express';
import Delivery from '../models/Delivery';
import User from '../models/User'; // Import User model to fetch seller's name
import { UserRole } from '../types';
import { emitToUser, emitToRider, emitToSeller } from '../utils/socket';

// Extend the Request interface for authenticated requests
interface AuthRequest extends Request {
  user?: {
    id: string;
    role: UserRole;
  };
}

// Seller or Rider: Get all deliveries associated with them
export const getDeliveries = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated.' });
  }

  const { id: userId, role } = req.user;

  try {
    let deliveries;
    if (role === UserRole.SELLER) {
      deliveries = await Delivery.find({ seller: userId, deleted: false })
                                 .populate('seller', 'name')
                                 .populate('rider', 'name')
                                 .populate('buyer', 'name email registrationNumber deliveryAddress'); // Populate buyer details
    } else if (role === UserRole.RIDER) {
      deliveries = await Delivery.find({ rider: userId, deleted: false })
                                 .populate('seller', 'name')
                                 .populate('rider', 'name')
                                 .populate('buyer', 'name email registrationNumber deliveryAddress'); // Populate buyer details with address
    } else {
        return res.status(403).json({ message: 'Not authorized to view deliveries.' });
    }
    res.status(200).json(deliveries);
  } catch (error: any) {
    console.error('Error getting deliveries:', error);
    res.status(500).json({ message: error.message || 'Something went wrong.' });
  }
};

// Anyone: Get a delivery by tracking number
export const getDeliveryByTrackingNumber = async (req: Request, res: Response) => {
    const { trackingNumber } = req.params;
    try {
        const delivery = await Delivery.findOne({ trackingNumber, deleted: false })
                                       .populate('seller', 'name')
                                       .populate('rider', 'name')
                                       .populate('buyer', 'name email registrationNumber deliveryAddress'); // Populate buyer details
        if (!delivery) {
            return res.status(404).json({ message: 'Delivery not found.' });
        }
        res.status(200).json(delivery);
    } catch (error: any) {
        console.error('Error getting delivery by tracking number:', error);
        res.status(500).json({ message: error.message || 'Something went wrong.' });
    }
}

// Rider: Update a delivery's status
export const updateDeliveryStatus = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated.' });
    }
    const { id: userId, role } = req.user;


    try {
        const delivery = await Delivery.findById(id);
        if (!delivery) {
            return res.status(404).json({ message: 'Delivery not found.' });
        }

        // Only rider assigned to this delivery can update status
        if (role !== UserRole.RIDER || delivery.rider?.toString() !== userId) {
            return res.status(403).json({ message: 'Not authorized to update this delivery.' });
        }

        console.log(`[DELIVERY UPDATE] Rider ${userId} updating delivery ${id} status to ${status}`);

        const updatedDelivery = await Delivery.findByIdAndUpdate(
            id,
            { status: status },
            { new: true } // Return the updated document
        );

        if (!updatedDelivery) {
            return res.status(404).json({ message: 'Delivery not found after update attempt.' });
        }

        // Sync order status with delivery status
        if (updatedDelivery.order) {
          const Order = (await import('../models/Order')).default;
          const order = await Order.findById(updatedDelivery.order);
          
          if (order) {
            // Map delivery status to order status
            if (status === 'in_transit' && order.status !== 'shipped') {
              order.status = 'shipped';
              await order.save();
              console.log(`[DELIVERY UPDATE] Synced order ${order._id} status to 'shipped'`);
              
              // Notify seller about status change
              if (updatedDelivery.seller) {
                emitToSeller(updatedDelivery.seller.toString(), 'orderUpdate', {
                  orderId: order._id,
                  status: 'shipped',
                  message: 'Order is now in transit',
                  timestamp: new Date()
                });
              }
            } else if (status === 'delivered' && order.status !== 'delivered') {
              order.status = 'delivered';
              await order.save();
              console.log(`[DELIVERY UPDATE] Synced order ${order._id} status to 'delivered'`);
              
              // Notify seller about status change
              if (updatedDelivery.seller) {
                emitToSeller(updatedDelivery.seller.toString(), 'orderUpdate', {
                  orderId: order._id,
                  status: 'delivered',
                  message: 'Order has been delivered to customer',
                  timestamp: new Date()
                });
              }
            }
          }
        }

        // Correct Mongoose v6 populate for document instance
        const populatedDelivery = await updatedDelivery.populate([
          { path: 'seller', select: 'name' },
          { path: 'rider', select: 'name' },
          { path: 'buyer', select: 'name email registrationNumber deliveryAddress' } // Populate buyer details
        ]);

        // Notify the buyer about delivery status change
        if (updatedDelivery.buyer) {
          let message = '';
          if (status === 'in_transit') {
            message = 'Your delivery is now in transit';
          } else if (status === 'delivered') {
            message = 'Your delivery has been completed!';
          } else if (status === 'cancelled') {
            message = 'Your delivery has been cancelled';
          } else {
            const displayStatus = status.replace(/_/g, ' ');
            message = `Your delivery status has been updated to ${displayStatus}`;
          }

          emitToUser(updatedDelivery.buyer.toString(), 'deliveryUpdate', {
            deliveryId: updatedDelivery._id,
            trackingNumber: updatedDelivery.trackingNumber,
            status: status,
            message: message,
            timestamp: new Date()
          });
        }

        // Notify the rider about delivery status change
        if (updatedDelivery.rider && (status === 'in_transit' || status === 'delivered')) {
          const displayStatus = status.replace(/_/g, ' ');
          emitToUser(updatedDelivery.rider.toString(), 'deliveryUpdate', {
            deliveryId: updatedDelivery._id,
            trackingNumber: updatedDelivery.trackingNumber,
            status: status,
            message: `Delivery status updated to ${displayStatus}`,
            timestamp: new Date()
          });
        }

        res.status(200).json(populatedDelivery);
    } catch (error: any) {
        console.error('Error updating delivery status:', error);
        res.status(500).json({ message: error.message || 'Something went wrong.' });
    }
}

// Seller: Assign a rider to a delivery
export const assignRider = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { riderId } = req.body;

    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated.' });
    }
    const { id: userId, role } = req.user;


    try {
        const delivery = await Delivery.findById(id);
        if (!delivery) {
            return res.status(404).json({ message: 'Delivery not found.' });
        }

        // Only the seller who created this delivery can assign a rider
        if (role !== UserRole.SELLER || delivery.seller.toString() !== userId) {
            return res.status(403).json({ message: 'Not authorized to assign a rider to this delivery.' });
        }

        const rider = await User.findById(riderId);
        if (!rider || rider.role !== UserRole.RIDER) {
            return res.status(400).json({ message: 'Invalid rider ID or user is not a rider.' });
        }

        // Allow reassignment - set riderAccepted to null for new assignment
        console.log(`[ASSIGN RIDER] Updating delivery ${id} with rider ${riderId}`);
        const assignedDelivery = await Delivery.findByIdAndUpdate(
            id,
            {
                rider: riderId,
                status: 'assigned',
                riderAccepted: null  // Reset acceptance status for new/reassigned rider
            },
            { new: true } // Return the updated document
        );

        if (!assignedDelivery) {
            return res.status(404).json({ message: 'Delivery not found after rider assignment attempt.' });
        }
        
        console.log(`[ASSIGN RIDER] Successfully assigned delivery ${assignedDelivery._id} to rider ${assignedDelivery.rider}`);

        // Correct Mongoose v6 populate for document instance
        const populatedDelivery = await assignedDelivery.populate([
          { path: 'seller', select: 'name' },
          { path: 'rider', select: 'name' },
          { path: 'buyer', select: 'name email registrationNumber deliveryAddress' } // Populate buyer details
        ]);

        // Notify the rider about the assignment
        if (riderId) {
          console.log(`[DELIVERY] Assigning delivery ${assignedDelivery._id} to rider ${riderId}`);
          emitToRider(riderId, 'deliveryAssigned', {
            deliveryId: assignedDelivery._id,
            trackingNumber: assignedDelivery.trackingNumber,
            buyerName: (populatedDelivery.buyer as any)?.name,
            message: 'You have been assigned a new delivery',
            timestamp: new Date()
          });
        }

        // Notify the buyer that a rider has been assigned
        if (assignedDelivery.buyer) {
          emitToUser(assignedDelivery.buyer.toString(), 'riderAssigned', {
            deliveryId: assignedDelivery._id,
            trackingNumber: assignedDelivery.trackingNumber,
            riderName: (populatedDelivery.rider as any)?.name,
            message: 'A rider has been assigned to your delivery',
            timestamp: new Date()
          });
        }

        res.status(200).json(populatedDelivery);
    } catch (error: any) {
        console.error('Error assigning rider:', error);
        res.status(500).json({ message: error.message || 'Something went wrong.' });
    }
}

// Buyer: Get all deliveries associated with them
export const getBuyerDeliveries = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated.' });
  }

  const { id: userId, role } = req.user;

  if (role !== UserRole.BUYER) {
    return res.status(403).json({ message: 'Access denied. Only buyers can view their deliveries.' });
  }

  try {
    const deliveries = await Delivery.find({ buyer: userId, deleted: false }) // Corrected query
                                     .populate('seller', 'name')
                                     .populate('rider', 'name')
                                     .populate('buyer', 'name email registrationNumber deliveryAddress'); // Populate buyer details
    res.status(200).json(deliveries);
  } catch (error: any) {
    console.error('Error getting buyer deliveries:', error);
    res.status(500).json({ message: error.message || 'Something went wrong.' });
  }
};

// Seller or Rider: Delete a delivery (soft delete)
export const deleteDelivery = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated.' });
  }

  const { id: userId, role } = req.user;

  try {
    const delivery = await Delivery.findById(id);
    if (!delivery) {
      return res.status(404).json({ message: 'Delivery not found.' });
    }

    // Only the seller who created this delivery or the assigned rider can delete it
    if (
      (role !== UserRole.SELLER || delivery.seller.toString() !== userId) &&
      (role !== UserRole.RIDER || delivery.rider?.toString() !== userId)
    ) {
      return res.status(403).json({ message: 'Not authorized to delete this delivery.' });
    }

    // Soft delete the delivery
    await Delivery.findByIdAndUpdate(id, { deleted: true });

    res.status(200).json({ message: 'Delivery deleted successfully.' });
  } catch (error: any) {
    console.error('Error deleting delivery:', error);
    res.status(500).json({ message: error.message || 'Something went wrong.' });
  }
};

// Buyer: Mark a delivery as received
export const receiveDelivery = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated.' });
    }
    const { id: userId, role } = req.user;


    try {
        const delivery = await Delivery.findById(id);
        if (!delivery) {
            return res.status(404).json({ message: 'Delivery not found.' });
        }

        // Only the buyer of this delivery can mark it as received
        if (role !== UserRole.BUYER || delivery.buyer.toString() !== userId) {
            return res.status(403).json({ message: 'Not authorized to mark this delivery as received.' });
        }

        const updatedDelivery = await Delivery.findByIdAndUpdate(
            id,
            { status: 'received' },
            { new: true } // Return the updated document
        );

        if (!updatedDelivery) {
            return res.status(404).json({ message: 'Delivery not found after update attempt.' });
        }

        // Correct Mongoose v6 populate for document instance
        const populatedDelivery = await updatedDelivery.populate([
          { path: 'seller', select: 'name' },
          { path: 'rider', select: 'name' },
          { path: 'buyer', select: 'name email registrationNumber deliveryAddress' } // Populate buyer details
        ]);

        res.status(200).json(populatedDelivery);
    } catch (error: any) {
        console.error('Error marking delivery as received:', error);
        res.status(500).json({ message: error.message || 'Something went wrong.' });
    }
}

// Buyer: Undo received status (change back to delivered)
export const unreceiveDelivery = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated.' });
    }
    const { id: userId, role } = req.user;

    try {
        const delivery = await Delivery.findById(id);
        if (!delivery) {
            return res.status(404).json({ message: 'Delivery not found.' });
        }

        // Only the buyer of this delivery can undo received status
        if (role !== UserRole.BUYER || delivery.buyer.toString() !== userId) {
            return res.status(403).json({ message: 'Not authorized to undo received status for this delivery.' });
        }

        // Only allow undoing if current status is 'received'
        if (delivery.status !== 'received') {
            return res.status(400).json({ message: 'Can only undo received status when delivery is marked as received.' });
        }

        const updatedDelivery = await Delivery.findByIdAndUpdate(
            id,
            { status: 'delivered' },
            { new: true }
        );

        if (!updatedDelivery) {
            return res.status(404).json({ message: 'Delivery not found after update attempt.' });
        }

        const populatedDelivery = await updatedDelivery.populate([
          { path: 'seller', select: 'name' },
          { path: 'rider', select: 'name' },
          { path: 'buyer', select: 'name email registrationNumber deliveryAddress' }
        ]);

        res.status(200).json(populatedDelivery);
    } catch (error: any) {
        console.error('Error undoing received status:', error);
        res.status(500).json({ message: error.message || 'Something went wrong.' });
    }
}

// Rider: Accept an assigned delivery
export const acceptDelivery = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated.' });
    }
    const { id: userId, role } = req.user;

    try {
        const delivery = await Delivery.findById(id);
        if (!delivery) {
            return res.status(404).json({ message: 'Delivery not found.' });
        }

        // Only the assigned rider can accept
        if (role !== UserRole.RIDER || delivery.rider?.toString() !== userId) {
            return res.status(403).json({ message: 'Not authorized to accept this delivery.' });
        }

        // Can only accept if not already accepted or rejected
        if (delivery.riderAccepted === true) {
            return res.status(400).json({ message: 'You have already accepted this delivery.' });
        }

        const updatedDelivery = await Delivery.findByIdAndUpdate(
            id,
            { riderAccepted: true },
            { new: true }
        );

        if (!updatedDelivery) {
            return res.status(404).json({ message: 'Delivery not found after update attempt.' });
        }

        const populatedDelivery = await updatedDelivery.populate([
          { path: 'seller', select: 'name' },
          { path: 'rider', select: 'name' },
          { path: 'buyer', select: 'name email registrationNumber deliveryAddress' }
        ]);

        res.status(200).json(populatedDelivery);
    } catch (error: any) {
        console.error('Error accepting delivery:', error);
        res.status(500).json({ message: error.message || 'Something went wrong.' });
    }
}

// Rider: Reject an assigned delivery
export const rejectDelivery = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated.' });
    }
    const { id: userId, role } = req.user;

    try {
        const delivery = await Delivery.findById(id);
        if (!delivery) {
            return res.status(404).json({ message: 'Delivery not found.' });
        }

        // Only the assigned rider can reject
        if (role !== UserRole.RIDER || delivery.rider?.toString() !== userId) {
            return res.status(403).json({ message: 'Not authorized to reject this delivery.' });
        }

        // Clear rider assignment and reset status to pending
        const updatedDelivery = await Delivery.findByIdAndUpdate(
            id,
            {
                rider: null,
                riderAccepted: null,
                status: 'pending'
            },
            { new: true }
        );

        if (!updatedDelivery) {
            return res.status(404).json({ message: 'Delivery not found after update attempt.' });
        }

        const populatedDelivery = await updatedDelivery.populate([
          { path: 'seller', select: 'name' },
          { path: 'buyer', select: 'name email registrationNumber deliveryAddress' }
        ]);

            res.status(200).json(populatedDelivery);
          } catch (error: any) {
            console.error('Error rejecting delivery:', error);
            res.status(500).json({ message: error.message || 'Something went wrong.' });
          }
        }
        
        // Rider: Get deliveries assigned to them
        export const getRiderDeliveries = async (req: AuthRequest, res: Response) => {
          if (!req.user) {
            return res.status(401).json({ message: 'Not authenticated.' });
          }
        
          const { id: userId, role } = req.user;
        
          if (role !== UserRole.RIDER) {
            return res.status(403).json({ message: 'Access denied. Only riders can view their assigned deliveries.' });
          }
        
          try {
            console.log(`[RIDER DELIVERIES] Fetching deliveries for rider: ${userId}`);
            const deliveries = await Delivery.find({ rider: userId, deleted: false })
                                             .populate('seller', 'name')
                                             .populate('rider', 'name')
                                             .populate('buyer', 'name email registrationNumber deliveryAddress')
                                             .populate('order', 'paymentStatus paymentMethod');
            console.log(`[RIDER DELIVERIES] Found ${deliveries.length} deliveries for rider ${userId}`);
            console.log(`[RIDER DELIVERIES] Delivery IDs:`, deliveries.map(d => d._id));
            res.status(200).json(deliveries);
          } catch (error: any) {
            console.error('Error getting rider deliveries:', error);
            res.status(500).json({ message: error.message || 'Something went wrong.' });
          }
        };
