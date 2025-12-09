import { Request, Response } from 'express';
import User from '../models/User';
import { UserRole } from '../types';

// Get all users with the 'driver' role
export const getDrivers = async (req: Request, res: Response) => {
    try {
        const drivers = await User.find({ role: UserRole.Driver }).select('name');
        res.status(200).json(drivers);
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong.' });
    }
}
