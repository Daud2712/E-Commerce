import { Request, Response } from 'express';
import User from '../models/User';
import { UserRole, UserStatus } from '../types';

interface AuthRequest extends Request {
    user?: {
        id: string;
        role: UserRole;
        status: UserStatus;
    };
}

// Get all users with the 'rider' role
export const getRiders = async (req: Request, res: Response) => {
    try {
        const riders = await User.find({ role: UserRole.RIDER, isAvailable: true }).select('name isAvailable');
        res.status(200).json(riders);
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

// Update a rider's availability status
export const updateRiderAvailability = async (req: AuthRequest, res: Response) => {
    try {
        const { isAvailable } = req.body;

        if (typeof isAvailable !== 'boolean') {
            return res.status(400).json({ message: 'Invalid value for isAvailable. Must be a boolean.' });
        }

        if (!req.user || req.user.role !== UserRole.RIDER) {
            return res.status(403).json({ message: 'Access denied. Only riders can update their availability.' });
        }

        const rider = await User.findByIdAndUpdate(
            req.user.id,
            { isAvailable },
            { new: true, runValidators: true }
        ).select('-password'); // Exclude password from the returned object

        if (!rider) {
            return res.status(404).json({ message: 'Rider not found.' });
        }

        res.status(200).json({ message: 'Rider availability updated successfully.', rider });

    } catch (error) {
        res.status(500).json({ message: 'Something went wrong.' });
    }
}

// Get current user profile
export const getMyProfile = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated.' });
        }

        const user = await User.findById(userId).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ message: 'Something went wrong.' });
    }
};

// Update user profile (name and delivery address)
export const updateProfile = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated.' });
        }

        const { name, deliveryAddress } = req.body;

        const updateData: any = {};
        if (name) updateData.name = name;
        if (deliveryAddress) updateData.deliveryAddress = deliveryAddress;

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            updateData,
            { new: true, runValidators: true }
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found.' });
        }

        res.status(200).json({ message: 'Profile updated successfully.', user: updatedUser });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: 'Something went wrong.' });
    }
};

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
