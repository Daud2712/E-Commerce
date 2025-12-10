import { Request, Response } from 'express';
import User from '../models/User';
import { UserRole } from '../types';

interface AuthRequest extends Request {
    user?: {
        id: string;
        role: UserRole;
    };
}

// Get all users with the 'driver' role
export const getDrivers = async (req: Request, res: Response) => {
    try {
        const drivers = await User.find({ role: UserRole.Driver, isAvailable: true }).select('name isAvailable');
        res.status(200).json(drivers);
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong.' });
    }
}

// Get a single user by ID
export const getUserById = async (req: Request, res: Response) => {
    try {
        const user = await User.findById(req.params.id).select('-password'); // Exclude password
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error('Error fetching user by ID:', error);
        res.status(500).json({ message: 'Something went wrong.' });
    }
};

// Update a driver's availability status
export const updateDriverAvailability = async (req: AuthRequest, res: Response) => {
    try {
        const { isAvailable } = req.body;

        if (typeof isAvailable !== 'boolean') {
            return res.status(400).json({ message: 'Invalid value for isAvailable. Must be a boolean.' });
        }

        if (!req.user || req.user.role !== UserRole.Driver) {
            return res.status(403).json({ message: 'Access denied. Only drivers can update their availability.' });
        }

        const driver = await User.findByIdAndUpdate(
            req.user.id,
            { isAvailable },
            { new: true, runValidators: true }
        ).select('-password'); // Exclude password from the returned object

        if (!driver) {
            return res.status(404).json({ message: 'Driver not found.' });
        }

        res.status(200).json({ message: 'Driver availability updated successfully.', driver });

    } catch (error) {
        res.status(500).json({ message: 'Something went wrong.' });
    }
}

export const deleteAccount = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated.' });
        }

        const deletedUser = await User.findByIdAndDelete(userId);

        if (!deletedUser) {
            return res.status(404).json({ message: 'User not found.' });
        }

        res.status(200).json({ message: 'Account deleted successfully.' });
    } catch (error) {
        console.error('Error deleting account:', error);
        res.status(500).json({ message: 'Something went wrong.' });
    }
};
