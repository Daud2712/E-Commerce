import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import User from '../models/User';
import { UserRole, UserStatus } from '../types';

// Load environment variables from backend/.env
dotenv.config({ path: path.join(__dirname, '../../.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/freshedtz';

const checkAndMakeAdmins = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Check all users first
    const allUsers = await User.find({}).select('email role status');
    console.log(`Found ${allUsers.length} total users in database:`);
    allUsers.forEach(user => {
      console.log(`  - ${user.email} | Role: ${user.role} | Status: ${user.status}`);
    });
    console.log('');

    const adminEmails = [
      'nehemiahernest3@gmail.com',
      'daud@kidoncho.com'
    ];

    console.log('Updating admin accounts...\n');
    for (const email of adminEmails) {
      const user = await User.findOne({ email });
      
      if (user) {
        const oldRole = user.role;
        const oldStatus = user.status;
        
        user.role = UserRole.ADMIN;
        user.status = UserStatus.APPROVED;
        await user.save();
        
        console.log(`✅ ${email}`);
        console.log(`   Role: ${oldRole} → admin`);
        console.log(`   Status: ${oldStatus} → approved\n`);
      } else {
        console.log(`❌ User not found: ${email}\n`);
      }
    }

    console.log('✅ Admin update complete');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

checkAndMakeAdmins();
