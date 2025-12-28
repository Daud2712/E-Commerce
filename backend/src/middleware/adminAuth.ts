import { Request, Response, NextFunction } from 'express';
import { UserRole, UserStatus } from '../types';

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  if (req.user.role !== UserRole.ADMIN) {
    return res.status(403).json({ message: 'Admin access required' });
  }

  next();
};

export const requireApprovedStatus = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  // Admin and buyers don't need approval
  if (req.user.role === UserRole.ADMIN || req.user.role === UserRole.BUYER) {
    return next();
  }

  // Sellers and riders need approval
  if (req.user.status !== UserStatus.APPROVED) {
    return res.status(403).json({ 
      message: 'Your account is pending approval', 
      status: req.user.status 
    });
  }

  next();
};

export const requireRole = (roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    next();
  };
};
