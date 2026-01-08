import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole, UserStatus } from '../types'; // Import UserRole and UserStatus

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

// Extend the Request interface to include the user property
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: UserRole; // Use UserRole type
        status: UserStatus; // Add status
      };
    }
  }
}

export const auth = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Authentication failed.' });
    }

    const decodedToken = jwt.verify(token, JWT_SECRET) as { userId: string; role: UserRole; status: UserStatus }; // Include status

    req.user = {
      id: decodedToken.userId,
      role: decodedToken.role,
      status: decodedToken.status,
    };

    // Block access if account is not approved (except for admin)
    if (req.user.role !== UserRole.ADMIN && req.user.status !== UserStatus.APPROVED) {
      return res.status(403).json({ 
        message: 'Your account is pending admin approval. Access denied.',
        status: req.user.status,
        requiresAdminApproval: true
      });
    }

    next();
  } catch (error) {
    res.status(401).json({ message: 'Authentication failed.' });
  }
};

// Optional auth middleware - tries to authenticate but doesn't fail if no token
export const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      const decodedToken = jwt.verify(token, JWT_SECRET) as { userId: string; role: UserRole; status: UserStatus };
      req.user = {
        id: decodedToken.userId,
        role: decodedToken.role,
        status: decodedToken.status,
      };
    }
    // Continue even if no token or invalid token
    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

// Export authenticate as alias for auth
export const authenticate = auth;
