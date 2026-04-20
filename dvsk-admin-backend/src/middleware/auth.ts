import { Request, Response, NextFunction } from 'express';
import admin from '../config/firebase.js';
import prisma from '../config/prisma.js';

export interface AdminRequest extends Request {
  admin?: any;
}

export const protectAdmin = async (req: AdminRequest, res: Response, next: NextFunction): Promise<void> => {
  // 1. ALLOW PREFLIGHT REQUESTS TO PASS
  if (req.method === 'OPTIONS') {
    next(); 
    return;
  }

  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      // Return a proper status so you can see it in DevTools (not Status 0)
      res.status(401).json({ message: 'Not authorized - No token' });
      return;
    }

    const decodedToken = await admin.auth().verifyIdToken(token);

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
    console.error("Auth Error:", error);
    res.status(401).json({ message: 'Invalid token' });
  }
};