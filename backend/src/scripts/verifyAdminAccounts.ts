import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import User from '../models/User';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/freshedtz';

const verifyAdminAccounts = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    const allUsers = await User.find({});
    console.log(`Total users in database: ${allUsers.length}\n`);

    const adminEmails = [
      'nehemiahernest3@gmail.com',
      'daud@kidoncho.com'
    ];

    const testPasswords = [
      'Ephra@2424#',
      'Daud@2712'
    ];

    for (let i = 0; i < adminEmails.length; i++) {
      const email = adminEmails[i];
      const password = testPasswords[i];
      
      console.log(`\n--- Checking ${email} ---`);
      const user = await User.findOne({ email });
      
      if (user) {
        console.log(`✅ User found`);
        console.log(`   Name: ${user.name}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Status: ${user.status}`);
        console.log(`   Password hash: ${user.password.substring(0, 20)}...`);
        
        // Test password
        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
          console.log(`   ✅ Password "${password}" matches!`);
        } else {
          console.log(`   ❌ Password "${password}" does NOT match!`);
        }
      } else {
        console.log(`❌ User NOT found`);
      }
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

verifyAdminAccounts();
