import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole } from '../types'; // Import UserRole

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

// Extend the Request interface to include the user property
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: UserRole; // Use UserRole type
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

    const decodedToken = jwt.verify(token, JWT_SECRET) as { userId: string; role: UserRole }; // Use UserRole
    
    req.user = {
      id: decodedToken.userId,
      role: decodedToken.role,
    };

    next();
  } catch (error) {
    res.status(401).json({ message: 'Authentication failed.' });
  }
};
