import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Delivery from '../models/Delivery';
import Order from '../models/Order';

// Load environment variables
dotenv.config();

async function syncOrderStatusFromDeliveries() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || '');
    console.log('Connected to MongoDB');

    // Find all deliveries with status 'delivered' or 'received'
    const deliveries = await Delivery.find({
      status: { $in: ['delivered', 'received'] },
      deleted: false,
      order: { $exists: true }
    }).populate('order');

    console.log(`Found ${deliveries.length} deliveries with status delivered/received`);

    let updatedCount = 0;

    for (const delivery of deliveries) {
      if (delivery.order) {
        const order = await Order.findById(delivery.order);
        
        if (order) {
          let shouldUpdate = false;
          let newStatus = order.status;

          // If delivery is delivered and order is not, update to delivered
          if (delivery.status === 'delivered' && order.status !== 'delivered' && order.status !== 'received') {
            newStatus = 'delivered';
            shouldUpdate = true;
          }

          // If delivery is received and order is not, update to received
          if (delivery.status === 'received' && order.status !== 'received') {
            newStatus = 'received';
            shouldUpdate = true;
          }

          if (shouldUpdate) {
            order.status = newStatus as any;
            await order.save();
            console.log(`Updated order ${order._id} status from '${order.status}' to '${newStatus}'`);
            updatedCount++;
          }
        }
      }
    }

    console.log(`\nMigration complete!`);
    console.log(`Updated ${updatedCount} orders`);

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('Error during migration:', error);
    process.exit(1);
  }
}

syncOrderStatusFromDeliveries();
