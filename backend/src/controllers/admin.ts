import { Request, Response } from 'express';
import User from '../models/User';
import SellerProfile from '../models/SellerProfile';
import RiderProfile from '../models/RiderProfile';
import { UserRole, UserStatus } from '../types';
import { Types } from 'mongoose';

// Helper: get user by email (case-insensitive)
const findUserByEmail = async (email: string) => {
  return User.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } }).select('-password');
};

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

// Get all buyers
export const getAllBuyers = async (req: Request, res: Response) => {
  try {
    const buyers = await User.find({
      role: UserRole.BUYER,
    })
      .select('-password')
      .populate('approvedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(buyers);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Get all sellers
export const getAllSellers = async (req: Request, res: Response) => {
  try {
    const sellers = await User.find({
      role: UserRole.SELLER,
    })
      .select('-password')
      .populate('approvedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(sellers);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Get all riders
export const getAllRiders = async (req: Request, res: Response) => {
  try {
    const riders = await User.find({
      role: UserRole.RIDER,
    })
      .select('-password')
      .populate('approvedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(riders);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Approve all pending buyers
export const approveAllBuyers = async (req: Request, res: Response) => {
  try {
    const adminId = req.user?.id ? new Types.ObjectId(req.user.id) : undefined;

    const result = await User.updateMany(
      { 
        role: UserRole.BUYER, 
        status: UserStatus.PENDING 
      },
      {
        $set: {
          status: UserStatus.APPROVED,
          approvedBy: adminId,
          approvedAt: new Date()
        }
      }
    );

    res.json({ 
      message: `Successfully approved ${result.modifiedCount} buyer account(s)`,
      approvedCount: result.modifiedCount
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Get all users (with filters) - excludes BUYER and ADMIN roles
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const { role, status } = req.query;
    const filter: any = {
      role: { $in: [UserRole.SELLER, UserRole.RIDER] } // Only show sellers and riders
    };

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

// Find user by email (admin)
export const findUserByEmailController = async (req: Request, res: Response) => {
  try {
    const { email } = req.query;
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ message: 'Email query param is required' });
    }

    const user = await findUserByEmail(email.trim());
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
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

// Delete pending user account
export const deletePendingUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Only allow deletion of pending sellers and riders
    if (user.status !== UserStatus.PENDING || (user.role !== UserRole.SELLER && user.role !== UserRole.RIDER)) {
      return res.status(403).json({ message: 'Only pending seller and rider accounts can be deleted' });
    }

    // Delete associated profiles
    if (user.role === UserRole.SELLER) {
      await SellerProfile.deleteMany({ user: userId });
    } else if (user.role === UserRole.RIDER) {
      await RiderProfile.deleteMany({ user: userId });
    }

    // Delete user
    await User.deleteOne({ _id: userId });

    res.json({ message: `${user.role} account deleted successfully`, deletedUser: user });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Delete any user account (admin function)
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent deletion of admin accounts
    if (user.role === UserRole.ADMIN) {
      return res.status(403).json({ message: 'Cannot delete admin accounts' });
    }

    // Delete associated profiles
    if (user.role === UserRole.SELLER) {
      await SellerProfile.deleteMany({ user: userId });
    } else if (user.role === UserRole.RIDER) {
      await RiderProfile.deleteMany({ user: userId });
    }

    // Delete user
    await User.deleteOne({ _id: userId });

    res.json({ 
      message: `${user.role.charAt(0).toUpperCase() + user.role.slice(1)} account deleted successfully`, 
      deletedUser: { name: user.name, email: user.email, role: user.role } 
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Delete user by email (admin)
export const deleteUserByEmail = async (req: Request, res: Response) => {
  try {
    const { email } = req.query;
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ message: 'Email query param is required' });
    }

    const user = await findUserByEmail(email.trim());
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === UserRole.ADMIN) {
      return res.status(403).json({ message: 'Cannot delete admin accounts' });
    }

    // Delete associated profiles
    if (user.role === UserRole.SELLER) {
      await SellerProfile.deleteMany({ user: user._id });
    } else if (user.role === UserRole.RIDER) {
      await RiderProfile.deleteMany({ user: user._id });
    }

    await User.deleteOne({ _id: user._id });

    res.json({
      message: `${user.role.charAt(0).toUpperCase() + user.role.slice(1)} account deleted successfully`,
      deletedUser: { name: user.name, email: user.email, role: user.role }
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Delete all pending accounts (sellers and riders)
export const deleteAllPendingAccounts = async (req: Request, res: Response) => {
  try {
    // Find all pending sellers and riders
    const pendingUsers = await User.find({
      status: UserStatus.PENDING,
      $or: [
        { role: UserRole.SELLER },
        { role: UserRole.RIDER }
      ]
    });

    if (pendingUsers.length === 0) {
      return res.json({ message: 'No pending accounts found', deletedCount: 0 });
    }

    let deletedCount = 0;

    // Delete each pending user and their profiles
    for (const user of pendingUsers) {
      // Delete seller profile if exists
      if (user.role === UserRole.SELLER) {
        await SellerProfile.deleteMany({ user: user._id });
      }

      // Delete rider profile if exists
      if (user.role === UserRole.RIDER) {
        await RiderProfile.deleteMany({ user: user._id });
      }

      // Delete user
      await User.deleteOne({ _id: user._id });
      deletedCount++;
    }

    res.json({ 
      message: `Successfully deleted ${deletedCount} pending account(s)`,
      deletedCount,
      deletedUsers: pendingUsers.map(u => ({ name: u.name, email: u.email, role: u.role }))
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// User counts by role/status for diagnostics
export const getUserCounts = async (req: Request, res: Response) => {
  try {
    const roles = [UserRole.ADMIN, UserRole.BUYER, UserRole.SELLER, UserRole.RIDER];
    const statuses = [UserStatus.APPROVED, UserStatus.PENDING, UserStatus.REJECTED, UserStatus.SUSPENDED];

    const roleCounts: Record<string, number> = {};
    for (const role of roles) {
      roleCounts[role] = await User.countDocuments({ role });
    }

    const statusCounts: Record<string, number> = {};
    for (const status of statuses) {
      statusCounts[status] = await User.countDocuments({ status });
    }

    const total = await User.countDocuments({});

    res.json({ total, roles: roleCounts, statuses: statusCounts });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Delete all non-admin users (bulk)
export const deleteAllNonAdminUsers = async (req: Request, res: Response) => {
  try {
    // Find all users except admins
    const users = await User.find({
      role: { $ne: UserRole.ADMIN }
    }).select('name email role _id');

    if (users.length === 0) {
      return res.json({ message: 'No non-admin users found', deletedCount: 0 });
    }

    const sellerIds = users
      .filter(u => u.role === UserRole.SELLER)
      .map(u => u._id);
    const riderIds = users
      .filter(u => u.role === UserRole.RIDER)
      .map(u => u._id);

    // Remove associated profiles
    if (sellerIds.length > 0) {
      await SellerProfile.deleteMany({ user: { $in: sellerIds } });
    }
    if (riderIds.length > 0) {
      await RiderProfile.deleteMany({ user: { $in: riderIds } });
    }

    // Delete all non-admin users
    const result = await User.deleteMany({ role: { $ne: UserRole.ADMIN } });

    res.json({
      message: `Successfully deleted ${result.deletedCount || 0} user(s) (excluding admins)`,
      deletedCount: result.deletedCount || 0,
      deletedUsers: users.map(u => ({ name: u.name, email: u.email, role: u.role }))
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
