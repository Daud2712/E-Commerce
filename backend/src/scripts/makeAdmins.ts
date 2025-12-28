import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User';
import { UserRole, UserStatus } from '../types';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/freshedtz';

const makeAdmins = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    const adminEmails = [
      'nehemiahernest3@gmail.com',
      'daud@kidoncho.com'
    ];

    for (const email of adminEmails) {
      const user = await User.findOne({ email });
      
      if (user) {
        user.role = UserRole.ADMIN;
        user.status = UserStatus.APPROVED;
        await user.save();
        console.log(`✅ Updated ${email} to ADMIN role with APPROVED status`);
      } else {
        console.log(`❌ User not found: ${email}`);
      }
    }

    console.log('\n✅ Admin accounts updated successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error updating admin accounts:', error);
    process.exit(1);
  }
};

makeAdmins();
