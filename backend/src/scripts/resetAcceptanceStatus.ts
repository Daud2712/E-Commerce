import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const resetAcceptanceStatus = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log('Connected to MongoDB');

    // First, let's see current status
    const deliveries = await mongoose.connection.db.collection('deliveries').find({}).toArray();
    console.log(`Found ${deliveries.length} deliveries`);
    deliveries.forEach((d: any) => {
      console.log(`Delivery ${d._id}: riderAccepted = ${d.riderAccepted}`);
    });

    // Set all to null (pending acceptance)
    const result = await mongoose.connection.db.collection('deliveries').updateMany(
      {},
      { $set: { riderAccepted: null } }
    );

    console.log(`\nUpdated ${result.modifiedCount} deliveries to pending acceptance status`);

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

resetAcceptanceStatus();
