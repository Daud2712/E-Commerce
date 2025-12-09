import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

export const auth = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Authentication failed.' });
    }

    const decodedToken = jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
    // @ts-ignore
    req.userId = decodedToken.userId;
    // @ts-ignore
    req.role = decodedToken.role;

    next();
  } catch (error) {
    res.status(401).json({ message: 'Authentication failed.' });
  }
};
