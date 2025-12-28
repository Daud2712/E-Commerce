import mongoose from 'mongoose';
import User from '../models/User';
import Product from '../models/Product';
import Order from '../models/Order';
import Delivery from '../models/Delivery';
import Expense from '../models/Expense';

const PRODUCTION_MONGO_URI = 'mongodb+srv://ddaud2712_db_user:Kesheni%4027@freshedtz.wafuvnb.mongodb.net/?appName=Freshedtz';

async function clearProductionData() {
  try {
    console.log('🔌 Connecting to PRODUCTION MongoDB...');
    await mongoose.connect(PRODUCTION_MONGO_URI);
    console.log('✅ Connected to PRODUCTION MongoDB');

    console.log('\n⚠️  WARNING: This will delete ALL data from PRODUCTION database!');
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

    console.log('\n🗑️  Deleting all data from PRODUCTION...');
    
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

    console.log('\n✅ All PRODUCTION data has been cleared successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
}

clearProductionData();
