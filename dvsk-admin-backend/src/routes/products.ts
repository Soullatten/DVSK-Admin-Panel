import { Router, Response } from 'express';
import prisma from '../config/prisma.js';
import { protectAdmin, AdminRequest } from '../middleware/auth.js';

const router = Router();

// GET /api/products
router.get('/', protectAdmin, async (req: AdminRequest, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      include: { Category: true, ProductVariant: true, ProductImage: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /api/products/:id/status
router.patch('/:id/status', protectAdmin, async (req: AdminRequest, res: Response) => {
  try {
    const { isActive, isFeatured } = req.body;
    const product = await prisma.product.update({
      where: { id: String(req.params.id) }, // <-- FIXED HERE
      data: { 
        ...(isActive !== undefined && { isActive }),
        ...(isFeatured !== undefined && { isFeatured })
      }
    });
    res.json(product);
  } catch (error) {
    res.status(400).json({ message: 'Update failed' });
  }
});

export default router;