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

    // All roles start pending until an admin approves
    const initialStatus = UserStatus.PENDING;

    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: role || UserRole.BUYER,
      status: initialStatus,
      ...(role === UserRole.BUYER && generatedRegistrationNumber && { registrationNumber: generatedRegistrationNumber }),
    });

    await user.save();

    res.status(201).json({ 
      message: 'Registration successful. Your account is pending admin approval. Please wait for confirmation before logging in.',
      isPending: true,
      status: initialStatus,
      registrationNumber: generatedRegistrationNumber,
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

    const status = user.status as UserStatus;

    // Block suspended accounts
    if (status === UserStatus.SUSPENDED) {
      return res.status(403).json({ 
        message: 'Your account has been suspended.', 
        reason: user.suspensionReason 
      });
    }

    // Block rejected accounts
    if (status === UserStatus.REJECTED) {
      return res.status(403).json({ 
        message: 'Your account has been rejected.', 
        reason: user.rejectionReason 
      });
    }

    // Enforce approval for all roles
    if (status !== UserStatus.APPROVED) {
      return res.status(403).json({ 
        message: 'Your account is pending admin approval. Please wait for confirmation.',
        status,
        requiresAdminApproval: true
      });
    }

    // Approved users get a token
    const token = jwt.sign({ userId: user.id, role: user.role, status }, JWT_SECRET, {
      expiresIn: '1h',
    });

    res.status(200).json({ 
      token, 
      userId: user.id, 
      role: user.role,
      status,
      message: 'Login successful.'
    });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong.' });
  }
};
