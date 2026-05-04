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

  user?: {
    id?: string;
    name?: string | null;
    email?: string | null;
    phone?: string | null;
  } | null;

  address?: {
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

  payment?: {
    id?: string;
    orderId?: string;
    amount?: string | number;
    currency?: string;
    method?: string | null;
    status?: string;
    createdAt?: string;
  } | null;
}

export interface OrderStatsSummary {
  period?: string;
  daily: {
    date: string;
    count: number;
    revenue: number;
  }[];
  totalOrders: number;
  totalRevenue: number;
  totalSubtotal?: number;
  totalDiscount?: number;
  totalShipping?: number;
  totalTax?: number;
  netSales?: number;
  activeDays?: number;
}

export type StatsPeriod = "Today" | "Last 7 days" | "Last 30 days" | "Last 90 days";

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const orderService = {
  list: async (): Promise<ApiOrder[]> => {
    const res = await apiClient.get<ApiEnvelope<ApiOrder[]>>("/orders/admin/all");
    const payload = res.data?.data;
    return Array.isArray(payload) ? payload : [];
  },

  getById: async (id: string): Promise<ApiOrder | null> => {
    const res = await apiClient.get<ApiEnvelope<ApiOrder>>(`/orders/${id}`);
    return res.data?.data ?? null;
  },

  getByIdAdmin: async (id: string): Promise<ApiOrder | null> => {
    const res = await apiClient.get<ApiEnvelope<ApiOrder>>(`/orders/admin/${id}`);
    return res.data?.data ?? null;
  },

  updateStatus: async (id: string, status: string): Promise<ApiOrder | null> => {
    const res = await apiClient.put<ApiEnvelope<ApiOrder>>(
      `/orders/admin/${id}/status`,
      { status }
    );
    return res.data?.data ?? null;
  },

  stats: async (period: StatsPeriod = "Last 30 days"): Promise<OrderStatsSummary> => {
    const res = await apiClient.get<ApiEnvelope<OrderStatsSummary>>(
      "/orders/admin/stats",
      { params: { period } }
    );
    const payload = res.data?.data;
    return payload ?? { daily: [], totalOrders: 0, totalRevenue: 0 };
  },

  liveFeed: async (
    period: "Today" | "Last 7 days" | "Last 30 days" = "Today",
    limit: number = 20
  ): Promise<Array<{ id: string; city: string; amount: string; time: string; lat: number; lng: number; ts: number; createdAt: string }>> => {
    const res = await apiClient.get<ApiEnvelope<any[]>>(
      "/orders/admin/live-feed",
      { params: { period, limit } }
    );
    return Array.isArray(res.data?.data) ? res.data.data : [];
  },
};
