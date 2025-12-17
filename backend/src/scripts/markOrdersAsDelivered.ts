import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from '../models/Order';
import Delivery from '../models/Delivery';

// Load environment variables
dotenv.config();

async function updateOrdersToDelivered() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || '');
    console.log('Connected to MongoDB');

    // Find orders with status 'shipped' that have deliveries
    const deliveries = await Delivery.find({
      deleted: false,
      status: 'in_transit',
      order: { $exists: true }
    });

    console.log(`Found ${deliveries.length} in-transit deliveries`);

    let updatedOrders = 0;
    let updatedDeliveries = 0;

    for (const delivery of deliveries) {
      // Update delivery to delivered
      delivery.status = 'delivered';
      await delivery.save();
      updatedDeliveries++;
      console.log(`✓ Updated delivery ${delivery._id} to 'delivered'`);

      // Update corresponding order
      if (delivery.order) {
        const order = await Order.findById(delivery.order);
        if (order && order.status !== 'delivered' && order.status !== 'received') {
          order.status = 'delivered';
          await order.save();
          updatedOrders++;
          console.log(`✓ Updated order ${order._id} to 'delivered'`);
        }
      }
    }

    console.log(`\nUpdate complete!`);
    console.log(`Updated ${updatedDeliveries} deliveries to 'delivered'`);
    console.log(`Updated ${updatedOrders} orders to 'delivered'`);
    console.log(`\nBuyers can now confirm receipt of these orders!`);

    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('Error during update:', error);
    process.exit(1);
  }
}

updateOrdersToDelivered();
