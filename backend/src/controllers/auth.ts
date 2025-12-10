import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { UserRole } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

export const register = async (req: Request, res: Response) => {
  const { name, email, password, role, registrationNumber } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists.' });
    }

    let generatedRegistrationNumber: string | undefined;
    if (role === UserRole.Buyer) {
        // Find the highest existing registration number
        const lastBuyer = await User.findOne({ role: UserRole.Buyer })
                                    .sort({ registrationNumber: -1 }) // Sort in descending order to get the highest
                                    .select('registrationNumber');

        let nextNumber = 100; // Starting number if no buyer exists
        if (lastBuyer && lastBuyer.registrationNumber) {
            const lastNum = parseInt(lastBuyer.registrationNumber, 10);
            if (!isNaN(lastNum) && lastNum >= 100) { // Ensure it's a valid number and at least 100
                nextNumber = lastNum + 1;
            }
        }
        // Format to 6 digits with leading zeros
        generatedRegistrationNumber = nextNumber.toString().padStart(6, '0');
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: role || UserRole.Buyer,
      ...(role === UserRole.Buyer && generatedRegistrationNumber && { registrationNumber: generatedRegistrationNumber }),
    });

    await user.save();

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, {
      expiresIn: '1h',
    });

    res.status(201).json({ token, userId: user.id, role: user.role });
  } catch (error: any) { // Explicitly type error as 'any'
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

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, {
      expiresIn: '1h',
    });

    res.status(200).json({ token, userId: user.id, role: user.role });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong.' });
  }
};
