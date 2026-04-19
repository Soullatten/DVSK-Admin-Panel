import { Request, Response, NextFunction } from 'express';
import admin from '../config/firebase.js';
import prisma from '../config/prisma.js';

export interface AdminRequest extends Request {
  admin?: any;
}

export const protectAdmin = async (req: AdminRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      res.status(401).json({ message: 'Not authorized - No token' });
      return;
    }

    // 1. Verify the Firebase token
    const decodedToken = await admin.auth().verifyIdToken(token);

    // 2. Check if this user exists in your Postgres DB and is an ADMIN
    const user = await prisma.user.findUnique({
      where: { firebaseUid: decodedToken.uid }
    });

    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
      res.status(403).json({ message: 'Forbidden - Admins only' });
      return;
    }

    req.admin = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};