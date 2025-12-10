import { Request, Response, NextFunction } from 'express';
import Delivery from '../models/Delivery';
import User from '../models/User'; // Import User model to fetch seller's name
import { v4 as uuidv4 } from 'uuid';
import { UserRole } from '../types';

// Extend the Request interface for authenticated requests
interface AuthRequest extends Request {
  user?: {
    id: string;
    role: UserRole;
  };
}

// Seller: Create a new delivery
export const createDelivery = async (req: AuthRequest, res: Response) => {
  const { buyerRegistrationNumber, packageName, price, quantity } = req.body; // Added quantity

  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated.' });
  }

  // Fetch seller's name from the User model
  const seller = await User.findById(req.user.id).select('name');
  if (!seller) {
      return res.status(404).json({ message: 'Seller not found.' });
  }

  try {
    // Find the buyer by registrationNumber
    const buyerUser = await User.findOne({ registrationNumber: buyerRegistrationNumber, role: UserRole.Buyer });
    if (!buyerUser) {
      return res.status(404).json({ message: 'Buyer with this registration number not found or is not a buyer.' });
    }

    const deliveriesToCreate = quantity ? Math.min(Math.max(1, quantity), 10) : 1; // Ensure quantity is between 1 and 10, default to 1
    const createdDeliveries = [];

    for (let i = 0; i < deliveriesToCreate; i++) {
        const trackingNumber = uuidv4();
        const delivery = new Delivery({
            seller: req.user.id,
            buyer: buyerUser._id,
            packageName,
            price,
            trackingNumber,
        });
        await delivery.save();

        // Populate seller and buyer info for the response
        const populatedDelivery = await delivery.populate([
            { path: 'seller', select: 'name' },
            { path: 'buyer', select: 'name email registrationNumber' }
        ]);
        createdDeliveries.push(populatedDelivery);
    }

    res.status(201).json(createdDeliveries);
  } catch (error: any) {
    console.error('Error creating delivery:', error);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      return res.status(400).json({ message: 'Delivery validation failed: ' + errors.join(', ') });
    }
    res.status(500).json({ message: 'Something went wrong.' });
  }
};

// Seller or Driver: Get all deliveries associated with them
export const getDeliveries = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated.' });
  }

  const { id: userId, role } = req.user;

  try {
    let deliveries;
    if (role === UserRole.Seller) {
      deliveries = await Delivery.find({ seller: userId })
                                 .populate('seller', 'name')
                                 .populate('driver', 'name')
                                 .populate('buyer', 'name email registrationNumber'); // Populate buyer details
    } else if (role === UserRole.Driver) {
      deliveries = await Delivery.find({ driver: userId })
                                 .populate('seller', 'name')
                                 .populate('driver', 'name')
                                 .populate('buyer', 'name email registrationNumber'); // Populate buyer details
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
        const delivery = await Delivery.findOne({ trackingNumber })
                                       .populate('seller', 'name')
                                       .populate('driver', 'name')
                                       .populate('buyer', 'name email registrationNumber'); // Populate buyer details
        if (!delivery) {
            return res.status(404).json({ message: 'Delivery not found.' });
        }
        res.status(200).json(delivery);
    } catch (error: any) {
        console.error('Error getting delivery by tracking number:', error);
        res.status(500).json({ message: error.message || 'Something went wrong.' });
    }
}

// Driver: Update a delivery's status
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

        // Only driver assigned to this delivery can update status
        if (role !== UserRole.Driver || delivery.driver?.toString() !== userId) {
            return res.status(403).json({ message: 'Not authorized to update this delivery.' });
        }

        const updatedDelivery = await Delivery.findByIdAndUpdate(
            id,
            { status: status },
            { new: true } // Return the updated document
        );

        if (!updatedDelivery) {
            return res.status(404).json({ message: 'Delivery not found after update attempt.' });
        }

        // TODO: Emit socket event here to notify seller and buyer
        // req.app.get('io').emit(`delivery-update:${updatedDelivery.id}`, updatedDelivery);

        // Correct Mongoose v6 populate for document instance
        const populatedDelivery = await updatedDelivery.populate([
          { path: 'seller', select: 'name' },
          { path: 'driver', select: 'name' },
          { path: 'buyer', select: 'name email registrationNumber' } // Populate buyer details
        ]);

        res.status(200).json(populatedDelivery);
    } catch (error: any) {
        console.error('Error updating delivery status:', error);
        res.status(500).json({ message: error.message || 'Something went wrong.' });
    }
}

// Seller: Assign a driver to a delivery
export const assignDriver = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { driverId } = req.body;

    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated.' });
    }
    const { id: userId, role } = req.user;


    try {
        const delivery = await Delivery.findById(id);
        if (!delivery) {
            return res.status(404).json({ message: 'Delivery not found.' });
        }

        // Only the seller who created this delivery can assign a driver
        if (role !== UserRole.Seller || delivery.seller.toString() !== userId) {
            return res.status(403).json({ message: 'Not authorized to assign a driver to this delivery.' });
        }

        const driver = await User.findById(driverId);
        if (!driver || driver.role !== UserRole.Driver) {
            return res.status(400).json({ message: 'Invalid driver ID or user is not a driver.' });
        }

        const assignedDelivery = await Delivery.findByIdAndUpdate(
            id,
            { driver: driverId, status: 'assigned' },
            { new: true } // Return the updated document
        );

        if (!assignedDelivery) {
            return res.status(404).json({ message: 'Delivery not found after driver assignment attempt.' });
        }

        // Correct Mongoose v6 populate for document instance
        const populatedDelivery = await assignedDelivery.populate([
          { path: 'seller', select: 'name' },
          { path: 'driver', select: 'name' },
          { path: 'buyer', select: 'name email registrationNumber' } // Populate buyer details
        ]);

        res.status(200).json(populatedDelivery);
    } catch (error: any) {
        console.error('Error assigning driver:', error);
        res.status(500).json({ message: error.message || 'Something went wrong.' });
    }
}

// Buyer: Get all deliveries associated with them
export const getBuyerDeliveries = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated.' });
  }

  const { id: userId, role } = req.user;

  if (role !== UserRole.Buyer) {
    return res.status(403).json({ message: 'Access denied. Only buyers can view their deliveries.' });
  }

  try {
    const deliveries = await Delivery.find({ buyer: userId }) // Corrected query
                                     .populate('seller', 'name')
                                     .populate('driver', 'name')
                                     .populate('buyer', 'name email registrationNumber'); // Populate buyer details
    res.status(200).json(deliveries);
  } catch (error: any) {
    console.error('Error getting buyer deliveries:', error);
    res.status(500).json({ message: error.message || 'Something went wrong.' });
  }
};
