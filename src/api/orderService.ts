// dvsk-admin/src/api/orderService.ts
import { apiClient } from "./client";

export interface ApiOrderItem {
  id: string;
  productId: string;
  variantId: string;
  quantity: number;
  unitPrice: string | number;
  totalPrice: string | number;
  productName: string;
  size: string;
  color: string;
  image?: string | null;
  product?: {
    id: string;
    slug: string;
  } | null;
  ProductVariant?: {
    id: string;
    size: string;
    color: string;
  } | null;
}

export interface ApiOrder {
  id: string;
  orderNumber: string;
  userId: string;
  addressId: string;
  subtotal: string | number;
  shippingCost: string | number;
  discount: string | number;
  tax: string | number;
  total: string | number;
  couponCode?: string | null;
  status: string;
  notes?: string | null;
  adminNotes?: string | null;
  shippingProvider?: string | null;
  trackingNumber?: string | null;
  createdAt: string;
  updatedAt: string;

  User?: {
    id?: string;
    name?: string | null;
    email?: string | null;
    phone?: string | null;
  } | null;

  Address?: {
    id: string;
    label: string;
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string | null;
    city: string;
    state: string;
    pincode: string;
    country: string;
  } | null;

  items?: ApiOrderItem[];

  Payment?: {
    id: string;
    orderId: string;
    amount: string | number;
    currency: string;
    method?: string | null;
    status?: string;
    createdAt: string;
  } | null;
}

export interface OrderStatsSummary {
  daily: {
    date: string;    // "2026-04-22"
    count: number;   // number of orders that day
    revenue: number; // total revenue that day
  }[];
  totalOrders: number;
  totalRevenue: number;
}

export const orderService = {
  // GET /api/orders
  list: async () => {
    const res = await apiClient.get<ApiOrder[]>("/orders");
    return res.data;
  },

  // GET /api/orders/:id
  getById: async (id: string) => {
    const res = await apiClient.get<ApiOrder>(`/orders/${id}`);
    return res.data;
  },

  // PATCH /api/orders/:id/status
  updateStatus: async (id: string, status: string) => {
    const res = await apiClient.patch<ApiOrder>(`/orders/${id}/status`, {
      status,
    });
    return res.data;
  },

  // GET /api/orders/stats/summary
  stats: async () => {
    const res = await apiClient.get<OrderStatsSummary>(
      "/orders/stats/summary"
    );
    return res.data;
  },
};