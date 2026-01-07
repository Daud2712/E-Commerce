import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { UserRole, UserStatus } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

export const register = async (req: Request, res: Response) => {
  const { name, email, password, role, registrationNumber } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists.' });
    }

    let generatedRegistrationNumber: string | undefined;
    if (role === UserRole.BUYER) {
        // Find the highest existing registration number
        const lastBuyer = await User.findOne({ role: UserRole.BUYER })
                                    .sort({ registrationNumber: -1 })
                                    .select('registrationNumber');

        let nextNumber = 100;
        if (lastBuyer && lastBuyer.registrationNumber) {
            const lastNum = parseInt(lastBuyer.registrationNumber, 10);
            if (!isNaN(lastNum) && lastNum >= 100) {
                nextNumber = lastNum + 1;
            }
        }
        generatedRegistrationNumber = nextNumber.toString().padStart(6, '0');
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // Determine initial status based on role
    let initialStatus = UserStatus.PENDING;
    
    // Buyers are auto-approved - they can login immediately
    if (role === UserRole.BUYER) {
      initialStatus = UserStatus.APPROVED;
    }
    // Sellers, Riders, and Admins need admin approval (PENDING)

    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: role || UserRole.BUYER,
      status: initialStatus,
      ...(role === UserRole.BUYER && generatedRegistrationNumber && { registrationNumber: generatedRegistrationNumber }),
    });

    await user.save();

    // Generate token for buyers (auto-approved), but not for others
    if (initialStatus === UserStatus.APPROVED && role === UserRole.BUYER) {
      const token = jwt.sign({ userId: user.id, role: user.role, status: user.status }, JWT_SECRET, {
        expiresIn: '1h',
      });
      
      return res.status(201).json({ 
        token,
        userId: user.id,
        role: user.role,
        status: user.status,
        registrationNumber: generatedRegistrationNumber,
        message: 'Registration successful. Your account is approved. You can now access the dashboard.'
      });
    }

    // For non-buyers (sellers, riders, admins): pending approval
    res.status(201).json({ 
      message: 'Registration successful. Your account is pending admin approval. Please wait for email confirmation before logging in.',
      isPending: true,
      status: initialStatus
    });
  } catch (error: any) {
    if (error.code === 11000 && error.keyPattern && error.keyPattern.registrationNumber) {
      return res.status(400).json({ message: 'Registration number already in use.' });
    }
    res.status(500).json({ message: 'Something went wrong.' });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    // Check if account is suspended
    if (user.status === UserStatus.SUSPENDED) {
      return res.status(403).json({ 
        message: 'Your account has been suspended.', 
        reason: user.suspensionReason 
      });
    }

    // Buyers can login if they are approved
    if (user.role === UserRole.BUYER) {
      if (user.status !== UserStatus.APPROVED) {
        return res.status(403).json({ 
          message: 'Your buyer account is not approved yet. Please wait for admin confirmation or contact support.',
          status: user.status
        });
      }

      const token = jwt.sign({ userId: user.id, role: user.role, status: user.status }, JWT_SECRET, {
        expiresIn: '1h',
      });

      return res.status(200).json({ 
        token, 
        userId: user.id, 
        role: user.role,
        status: user.status,
        message: 'Login successful.'
      });
    }

    // ONLY ADMIN ACCOUNTS can login (for approval system)
    if (user.role !== UserRole.ADMIN) {
      return res.status(403).json({ 
        message: 'Only admin and buyer accounts can login. Your account is pending admin approval.',
        requiresAdminApproval: true
      });
    }

    // Check if admin account is pending
    if (user.status === UserStatus.PENDING) {
      return res.status(403).json({ 
        message: 'Your admin account is pending verification. Please contact a system administrator.',
        isPending: true
      });
    }

    // Check if admin account is rejected
    if (user.status === UserStatus.REJECTED) {
      return res.status(403).json({ 
        message: 'Your admin account has been rejected.', 
        reason: user.rejectionReason 
      });
    }

    // Admin must be approved (either by another admin or auto-approved from before)
    if (user.status === UserStatus.APPROVED) {
      // Allow both:
      // 1. Old admin accounts (approved without approvedBy - auto-approved before)
      // 2. New admin accounts (approved with approvedBy - manually approved)
      const token = jwt.sign({ userId: user.id, role: user.role, status: user.status }, JWT_SECRET, {
        expiresIn: '1h',
      });

      return res.status(200).json({ 
        token, 
        userId: user.id, 
        role: user.role,
        status: user.status,
        message: 'Login successful. You can now approve pending accounts.'
      });
    }

    const token = jwt.sign({ userId: user.id, role: user.role, status: user.status }, JWT_SECRET, {
      expiresIn: '1h',
    });

    res.status(200).json({ 
      token, 
      userId: user.id, 
      role: user.role,
      status: user.status,
      message: 'Login successful. You can now approve pending accounts.'
    });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong.' });
  }
};
