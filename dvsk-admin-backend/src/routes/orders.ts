// src/routes/orders.ts
import { Router, Response } from "express";
import prisma from "../config/prisma.js";
import { protectAdmin, AdminRequest } from "../middleware/auth.js";

const router = Router();

// GET /api/orders  -> list + basic info for table + charts
router.get("/", protectAdmin, async (req: AdminRequest, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        User: true,
        Address: true,
        items: {
          include: {
            product: true,
            ProductVariant: true,
          },
        },
      },
    });

    res.json(orders);
  } catch (error) {
    console.error("Get orders error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/orders/:id  -> full detail for sidebar/modal
router.get("/:id", protectAdmin, async (req: AdminRequest, res: Response) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: String(req.params.id) },
      include: {
        User: true,
        Address: true,
        items: {
          include: {
            product: true,
            ProductVariant: true,
          },
        },
        Payment: true,
      },
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Remove card/secret payment details if any (you probably don't store them anyway)
    const safeOrder = {
      ...order,
      Payment: order.Payment
        ? {
            id: order.Payment.id,
            orderId: order.Payment.orderId,
            amount: order.Payment.amount,
            currency: order.Payment.currency,
            method: order.Payment.method,
            status: order.Payment.status,
            createdAt: order.Payment.createdAt,
          }
        : null,
    };

    res.json(safeOrder);
  } catch (error) {
    console.error("Get order detail error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/orders/stats -> for charts
router.get("/stats/summary", protectAdmin, async (req: AdminRequest, res: Response) => {
  try {
    // Example: last 30 days
    const since = new Date();
    since.setDate(since.getDate() - 30);

    const orders = await prisma.order.findMany({
      where: { createdAt: { gte: since } },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        createdAt: true,
        total: true,
        status: true,
      },
    });

    // Group by date (YYYY-MM-DD)
    const byDate: Record<string, { date: string; count: number; revenue: number }> =
      {};

    for (const o of orders) {
      const key = o.createdAt.toISOString().slice(0, 10);
      if (!byDate[key]) {
        byDate[key] = { date: key, count: 0, revenue: 0 };
      }
      byDate[key].count += 1;
      byDate[key].revenue += Number(o.total);
    }

    const daily = Object.values(byDate);

    // Overall summary
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total), 0);

    res.json({
      daily,
      totalOrders,
      totalRevenue,
    });
  } catch (error) {
    console.error("Order stats error:", error);
    res.status(500).json({ message: "Stats error" });
  }
});

export default router;