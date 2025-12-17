import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from '../models/Order';
import Delivery from '../models/Delivery';
import User from '../models/User';
import Product from '../models/Product';
import { UserRole } from '../types';

dotenv.config();

const createMissingDeliveries = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log('Connected to MongoDB');

    // Find all orders that are not 'pending' or 'cancelled'
    const orders = await Order.find({
      status: { $in: ['processing', 'shipped', 'delivered'] }
    });

    console.log(`Found ${orders.length} orders to check`);

    // Get an available rider (or first rider)
    const rider = await User.findOne({ role: UserRole.RIDER });
    
    if (!rider) {
      console.log('No rider found in the system');
      return;
    }

    console.log(`Using rider: ${rider.name} (${rider._id})`);

    let created = 0;
    let skipped = 0;

    for (const order of orders) {
      // Check if delivery already exists
      const existingDelivery = await Delivery.findOne({ order: order._id, deleted: false });
      
      if (existingDelivery) {
        skipped++;
        continue;
      }

      // Get seller from first product in items
      const firstItem: any = order.items[0];
      if (!firstItem) {
        console.log(`Skipping order ${order._id} - no items found`);
        skipped++;
        continue;
      }

      // Get the product to find seller
      const product = await Product.findById(firstItem.product);
      if (!product) {
        console.log(`Skipping order ${order._id} - product not found`);
        skipped++;
        continue;
      }

      // Create delivery record
      const trackingNumber = `TRK${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
      
      const delivery = await Delivery.create({
        order: order._id,
        seller: product.seller,
        rider: rider._id,
        buyer: order.buyer,
        packageName: order.items.map((item: any) => item.productName || 'Product').join(', '),
        trackingNumber,
        price: order.totalAmount,
        status: order.status === 'shipped' ? 'in_transit' : 
                order.status === 'delivered' ? 'delivered' : 'assigned',
        riderAccepted: undefined, // Let rider decide to accept or reject
        deleted: false
      });

      console.log(`Created delivery ${delivery._id} for order ${order._id} - Status: ${delivery.status}`);
      created++;
    }

    console.log(`\nMigration complete!`);
    console.log(`Created: ${created} deliveries`);
    console.log(`Skipped: ${skipped} orders (already have deliveries)`);

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error creating missing deliveries:', error);
    process.exit(1);
  }
};

createMissingDeliveries();
