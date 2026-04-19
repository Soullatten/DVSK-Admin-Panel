import { Router, Response } from 'express';
import prisma from '../config/prisma.js';
import { protectAdmin, AdminRequest } from '../middleware/auth.js';

const router = Router();

// GET /api/orders
router.get('/', protectAdmin, async (req: AdminRequest, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      include: { User: true, items: true, Address: true, Payment: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /api/orders/:id/status
router.patch('/:id/status', protectAdmin, async (req: AdminRequest, res: Response) => {
  try {
    const { status } = req.body; 
    const order = await prisma.order.update({
      where: { id: String(req.params.id) }, // <-- FIXED HERE
      data: { status }
    });
    res.json(order);
  } catch (error) {
    res.status(400).json({ message: 'Failed to update order status' });
  }
});

export default router;