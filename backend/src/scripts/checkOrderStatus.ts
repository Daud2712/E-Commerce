import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Delivery from '../models/Delivery';
import Order from '../models/Order';

// Load environment variables
dotenv.config();

async function checkOrderAndDeliveryStatus() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || '');
    console.log('Connected to MongoDB');

    // Get all orders
    const orders = await Order.find({}).sort({ createdAt: -1 }).limit(10);
    console.log('\n=== Recent Orders ===');
    orders.forEach(order => {
      console.log(`Order ${order._id}: status=${order.status}, total=${order.totalAmount}, buyer=${order.buyer}`);
    });

    // Get all deliveries
    const deliveries = await Delivery.find({ deleted: false }).sort({ createdAt: -1 }).limit(10);
    console.log('\n=== Recent Deliveries ===');
    deliveries.forEach(delivery => {
      console.log(`Delivery ${delivery._id}: status=${delivery.status}, order=${delivery.order}, riderAccepted=${delivery.riderAccepted}`);
    });

    // Find orders that have deliveries
    const ordersWithDeliveries = await Order.find({
      _id: { $in: deliveries.map(d => d.order) }
    });

    console.log('\n=== Orders with Deliveries ===');
    for (const order of ordersWithDeliveries) {
      const delivery = deliveries.find(d => d.order?.toString() === order._id.toString());
      console.log(`Order ${order._id.toString().substring(0, 8)}: orderStatus=${order.status}, deliveryStatus=${delivery?.status}`);
    }

    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkOrderAndDeliveryStatus();
