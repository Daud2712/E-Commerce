import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import User from '../models/User';
import { UserRole, UserStatus } from '../types';

// Load environment variables from backend/.env
dotenv.config({ path: path.join(__dirname, '../../.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/freshedtz';

const createAdminAccounts = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    const adminAccounts = [
      {
        email: 'nehemiahernest3@gmail.com',
        password: 'Ephra@2424#',
        name: 'Nehemiah Ernest'
      },
      {
        email: 'daud@kidoncho.com',
        password: 'Daud@2712',
        name: 'Daud Kidoncho'
      }
    ];

    console.log('Creating admin accounts...\n');
    
    for (const account of adminAccounts) {
      // Check if user already exists
      const existingUser = await User.findOne({ email: account.email });
      
      if (existingUser) {
        // Update existing user to admin
        existingUser.role = UserRole.ADMIN;
        existingUser.status = UserStatus.APPROVED;
        await existingUser.save();
        console.log(`✅ Updated existing user: ${account.email}`);
        console.log(`   Role: ${existingUser.role}`);
        console.log(`   Status: ${existingUser.status}\n`);
      } else {
        // Create new admin user
        const hashedPassword = await bcrypt.hash(account.password, 12);
        
        const newUser = new User({
          name: account.name,
          email: account.email,
          password: hashedPassword,
          role: UserRole.ADMIN,
          status: UserStatus.APPROVED
        });
        
        await newUser.save();
        console.log(`✅ Created new admin: ${account.email}`);
        console.log(`   Name: ${account.name}`);
        console.log(`   Role: ${UserRole.ADMIN}`);
        console.log(`   Status: ${UserStatus.APPROVED}\n`);
      }
    }

    console.log('✅ Admin accounts ready!');
    console.log('\nYou can now login with:');
    adminAccounts.forEach(account => {
      console.log(`  - ${account.email} / ${account.password}`);
    });
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

createAdminAccounts();
