import { Request, Response, NextFunction } from 'express';
import admin from '../config/firebase.js';
import prisma from '../config/prisma.js';

export interface AdminRequest extends Request {
  admin?: any;
}

export const protectAdmin = async (req: AdminRequest, res: Response, next: NextFunction): Promise<void> => {
  if (req.method === 'OPTIONS') {
    next();
    return;
  }

  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      res.status(401).json({ message: 'Not authorized - No token' });
      return;
    }

    const decodedToken = await admin.auth().verifyIdToken(token);

    console.log("Decoded token:", {
      uid: decodedToken.uid,
      email: decodedToken.email,
    });

    const user = await prisma.user.findUnique({
      where: { firebaseUid: decodedToken.uid }
    });

    console.log("Prisma user:", user);

    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
      console.log("Auth check failed, user or role invalid");
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