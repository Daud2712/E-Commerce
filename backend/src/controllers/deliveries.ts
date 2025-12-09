import { Request, Response } from 'express';
import Delivery from '../models/Delivery';
import { v4 as uuidv4 } from 'uuid';

// Seller: Create a new delivery
export const createDelivery = async (req: Request, res: Response) => {
  const { buyer, packageName } = req.body;
  // @ts-ignore
  const sellerId = req.userId; // This will come from auth middleware

  try {
    const trackingNumber = uuidv4();
    const delivery = new Delivery({
      seller: sellerId,
      buyer,
      packageName,
      trackingNumber,
    });
    await delivery.save();
    res.status(201).json(delivery);
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong.' });
  }
};

// Seller or Driver: Get all deliveries associated with them
export const getDeliveries = async (req: Request, res: Response) => {
  // @ts-ignore
  const { userId, role } = req; // This will come from auth middleware

  try {
    let deliveries;
    if (role === 'seller') {
      deliveries = await Delivery.find({ seller: userId });
    } else if (role === 'driver') {
      deliveries = await Delivery.find({ driver: userId });
    } else {
        return res.status(403).json({ message: 'Not authorized' });
    }
    res.status(200).json(deliveries);
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong.' });
  }
};

// Anyone: Get a delivery by tracking number
export const getDeliveryByTrackingNumber = async (req: Request, res: Response) => {
    const { trackingNumber } = req.params;
    try {
        const delivery = await Delivery.findOne({ trackingNumber });
        if (!delivery) {
            return res.status(404).json({ message: 'Delivery not found.' });
        }
        res.status(200).json(delivery);
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong.' });
    }
}

// Driver: Update a delivery's status
export const updateDeliveryStatus = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;
    // @ts-ignore
    const { userId, role } = req;

    try {
        const delivery = await Delivery.findById(id);
        if (!delivery) {
            return res.status(404).json({ message: 'Delivery not found.' });
        }

        if (delivery.driver?.toString() !== userId) {
            return res.status(403).json({ message: 'Not authorized to update this delivery.' });
        }

        delivery.status = status;
        await delivery.save();

        // TODO: Emit socket event here to notify seller and buyer
        // req.app.get('io').emit(`delivery-update:${delivery.id}`, delivery);

        res.status(200).json(delivery);
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong.' });
    }
}

// Seller: Assign a driver to a delivery
export const assignDriver = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { driverId } = req.body;
    // @ts-ignore
    const { userId } = req;

    try {
        const delivery = await Delivery.findById(id);
        if (!delivery) {
            return res.status(404).json({ message: 'Delivery not found.' });
        }

        if (delivery.seller.toString() !== userId) {
            return res.status(403).json({ message: 'Not authorized to assign a driver to this delivery.' });
        }

        delivery.driver = driverId;
        delivery.status = 'assigned';
        await delivery.save();

        res.status(200).json(delivery);
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong.' });
    }
}
