import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User';
import Product from '../models/Product';
import Order from '../models/Order';
import Delivery from '../models/Delivery';
import Expense from '../models/Expense';

dotenv.config();

async function clearAllData() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI || '');
    console.log('✅ Connected to MongoDB');

    console.log('\n⚠️  WARNING: This will delete ALL data from the database!');
    console.log('📊 Database:', mongoose.connection.name);
    console.log('🔗 Host:', mongoose.connection.host);
    
    // Count documents before deletion
    const userCount = await User.countDocuments();
    const productCount = await Product.countDocuments();
    const orderCount = await Order.countDocuments();
    const deliveryCount = await Delivery.countDocuments();
    const expenseCount = await Expense.countDocuments();

    console.log('\n📋 Current Data:');
    console.log(`   Users: ${userCount}`);
    console.log(`   Products: ${productCount}`);
    console.log(`   Orders: ${orderCount}`);
    console.log(`   Deliveries: ${deliveryCount}`);
    console.log(`   Expenses: ${expenseCount}`);

    console.log('\n🗑️  Deleting all data...');
    
    // Delete all data
    await User.deleteMany({});
    console.log('✓ Deleted all users');
    
    await Product.deleteMany({});
    console.log('✓ Deleted all products');
    
    await Order.deleteMany({});
    console.log('✓ Deleted all orders');
    
    await Delivery.deleteMany({});
    console.log('✓ Deleted all deliveries');
    
    await Expense.deleteMany({});
    console.log('✓ Deleted all expenses');

    console.log('\n✅ All data has been cleared successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
}

clearAllData();
