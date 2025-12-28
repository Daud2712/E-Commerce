import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import { UserRole, UserStatus } from '../types';

// PRODUCTION MongoDB connection
const PRODUCTION_MONGO_URI = 'mongodb+srv://ddaud2712_db_user:Kesheni%4027@freshedtz.wafuvnb.mongodb.net/ecommerce';

const adminAccounts = [
  {
    name: 'Nehemiah Ernest',
    email: 'nehemiahernest3@gmail.com',
    password: 'Ephra@2424#',
  },
  {
    name: 'Daud Kidoncho',
    email: 'daud@kidoncho.com',
    password: 'Daud@2712',
  },
];

async function ensureProductionAdmins() {
  try {
    console.log('🔌 Connecting to PRODUCTION MongoDB...');
    await mongoose.connect(PRODUCTION_MONGO_URI);
    console.log('✅ Connected to PRODUCTION database\n');

    for (const account of adminAccounts) {
      console.log(`\n📧 Processing: ${account.email}`);
      
      // Check if user exists
      const existingUser = await User.findOne({ email: account.email });

      if (existingUser) {
        console.log(`   ✓ User already exists`);
        console.log(`   - Role: ${existingUser.role}`);
        console.log(`   - Status: ${existingUser.status}`);
        
        // Update to admin if not already
        let updated = false;
        if (existingUser.role !== UserRole.ADMIN) {
          existingUser.role = UserRole.ADMIN;
          updated = true;
          console.log(`   ✏️  Updated role to ADMIN`);
        }
        
        if (existingUser.status !== UserStatus.APPROVED) {
          existingUser.status = UserStatus.APPROVED;
          updated = true;
          console.log(`   ✏️  Updated status to APPROVED`);
        }

        // Update password
        const hashedPassword = await bcrypt.hash(account.password, 10);
        existingUser.password = hashedPassword;
        updated = true;
        console.log(`   🔐 Password updated`);
        
        if (updated) {
          await existingUser.save();
          console.log(`   💾 Changes saved`);
        }
      } else {
        // Create new admin
        console.log(`   ➕ Creating new admin account...`);
        const hashedPassword = await bcrypt.hash(account.password, 10);
        
        const newAdmin = new User({
          name: account.name,
          email: account.email,
          password: hashedPassword,
          role: UserRole.ADMIN,
          status: UserStatus.APPROVED,
        });

        await newAdmin.save();
        console.log(`   ✅ Admin account created successfully`);
      }

      // Verify password works
      const user = await User.findOne({ email: account.email });
      if (user) {
        const passwordMatch = await bcrypt.compare(account.password, user.password);
        if (passwordMatch) {
          console.log(`   ✅ Password verification: SUCCESS`);
        } else {
          console.log(`   ❌ Password verification: FAILED`);
        }
      }
    }

    console.log('\n\n═══════════════════════════════════════');
    console.log('✅ PRODUCTION ADMIN ACCOUNTS READY');
    console.log('═══════════════════════════════════════\n');
    
    console.log('Admin Credentials:');
    adminAccounts.forEach((account, i) => {
      console.log(`\n${i + 1}. ${account.name}`);
      console.log(`   Email: ${account.email}`);
      console.log(`   Password: ${account.password}`);
    });

    console.log('\n\nYou can now login at:');
    console.log('https://freshedtanzania.co.tz/login\n');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from database');
    process.exit(0);
  }
}

ensureProductionAdmins();
