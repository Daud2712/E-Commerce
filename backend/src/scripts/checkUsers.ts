// Quick script to check which database users exist
// Run this with: npx ts-node checkUsers.ts

import mongoose from 'mongoose';
import User from '../models/User';

const MONGO_URI = 'mongodb+srv://ddaud2712_db_user:Kesheni%4027@freshedtz.wafuvnb.mongodb.net/ecommerce';

async function checkUsers() {
  try {
    console.log('Connecting to production database...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected\n');

    const users = await User.find({}).select('name email role status');
    
    console.log(`Found ${users.length} users:\n`);
    users.forEach((user, i) => {
      console.log(`${i + 1}. ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Status: ${user.status}\n`);
    });

    // Check specifically for admin accounts
    const admins = users.filter(u => u.role === 'admin');
    console.log(`\n📊 Admin accounts: ${admins.length}`);
    
    if (admins.length === 0) {
      console.log('❌ NO ADMIN ACCOUNTS FOUND!');
      console.log('Run: npx ts-node src/scripts/ensureProductionAdmins.ts');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

checkUsers();
