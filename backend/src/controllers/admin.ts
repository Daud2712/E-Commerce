import { Request, Response } from 'express';
import User from '../models/User';
import SellerProfile from '../models/SellerProfile';
import RiderProfile from '../models/RiderProfile';
import { UserRole, UserStatus } from '../types';
import { Types } from 'mongoose';

// Get all pending sellers
export const getPendingSellers = async (req: Request, res: Response) => {
  try {
    const sellers = await User.find({
      role: UserRole.SELLER,
      status: UserStatus.PENDING,
    }).select('-password');

    const sellersWithProfiles = await Promise.all(
      sellers.map(async (seller) => {
        const profile = await SellerProfile.findOne({ user: seller._id });
        return {
          ...seller.toObject(),
          profile,
        };
      })
    );

    res.json(sellersWithProfiles);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Get all pending riders
export const getPendingRiders = async (req: Request, res: Response) => {
  try {
    const riders = await User.find({
      role: UserRole.RIDER,
      status: UserStatus.PENDING,
    }).select('-password');

    const ridersWithProfiles = await Promise.all(
      riders.map(async (rider) => {
        const profile = await RiderProfile.findOne({ user: rider._id });
        return {
          ...rider.toObject(),
          profile,
        };
      })
    );

    res.json(ridersWithProfiles);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Get all users (with filters)
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const { role, status } = req.query;
    const filter: any = {};

    if (role) filter.role = role;
    if (status) filter.status = status;

    const users = await User.find(filter)
      .select('-password')
      .populate('approvedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Approve user
export const approveUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const adminId = req.user?.id ? new Types.ObjectId(req.user.id) : undefined;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.status === UserStatus.APPROVED) {
      return res.status(400).json({ message: 'User is already approved' });
    }

    user.status = UserStatus.APPROVED;
    user.approvedBy = adminId;
    user.approvedAt = new Date();
    await user.save();

    // Update profile approval
    if (user.role === UserRole.SELLER) {
      await SellerProfile.findOneAndUpdate(
        { user: userId },
        { approvedBy: adminId, approvedAt: new Date() }
      );
    } else if (user.role === UserRole.RIDER) {
      await RiderProfile.findOneAndUpdate(
        { user: userId },
        { approvedBy: adminId, approvedAt: new Date() }
      );
    }

    res.json({ message: 'User approved successfully', user });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Reject user
export const rejectUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.status = UserStatus.REJECTED;
    user.rejectedAt = new Date();
    user.rejectionReason = reason || 'Not specified';
    await user.save();

    res.json({ message: 'User rejected', user });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Suspend user
export const suspendUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === UserRole.ADMIN) {
      return res.status(403).json({ message: 'Cannot suspend admin users' });
    }

    user.status = UserStatus.SUSPENDED;
    user.suspendedAt = new Date();
    user.suspensionReason = reason || 'Not specified';
    await user.save();

    res.json({ message: 'User suspended', user });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Reactivate user
export const reactivateUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.status = UserStatus.APPROVED;
    user.suspendedAt = undefined;
    user.suspensionReason = undefined;
    await user.save();

    res.json({ message: 'User reactivated', user });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Get user details with profile
export const getUserDetails = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId)
      .select('-password')
      .populate('approvedBy', 'name email');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let profile = null;
    if (user.role === UserRole.SELLER) {
      profile = await SellerProfile.findOne({ user: userId });
    } else if (user.role === UserRole.RIDER) {
      profile = await RiderProfile.findOne({ user: userId });
    }

    res.json({ user, profile });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
