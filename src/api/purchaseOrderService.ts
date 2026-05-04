import { apiClient } from "./client";

export type POStatus = "PROCESSING" | "IN_TRANSIT" | "CUSTOMS" | "DELIVERED" | "CANCELLED";

export interface ApiPurchaseOrderLineItem {
  id: string;
  variantId: string;
  quantity: number;
  unitCost?: string | number | null;
  variant?: {
    id: string;
    size: string;
    color: string;
    sku: string;
    stock: number;
    product: { id: string; name: string; slug: string };
  };
}

export interface ApiPurchaseOrder {
  id: string;
  orderNumber: string;
  supplier: string;
  city: string;
  country: string;
  amount: string | number;
  currency: string;
  itemsLabel: string;
  status: POStatus;
  progress: number;
  eta?: string | null;
  lat?: number | null;
  lng?: number | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  deliveredAt?: string | null;
  lineItems?: ApiPurchaseOrderLineItem[];
}

interface Envelope<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const purchaseOrderService = {
  list: async (): Promise<ApiPurchaseOrder[]> => {
    const res = await apiClient.get<Envelope<ApiPurchaseOrder[]>>("/admin/purchase-orders");
    return Array.isArray(res.data?.data) ? res.data.data : [];
  },

  create: async (payload: {
    supplier: string;
    city: string;
    country: string;
    amount: number;
    currency?: string;
    itemsLabel: string;
    eta?: string;
    lat?: number;
    lng?: number;
    notes?: string;
    lineItems?: { variantId: string; quantity: number; unitCost?: number }[];
  }): Promise<ApiPurchaseOrder | null> => {
    const res = await apiClient.post<Envelope<ApiPurchaseOrder>>(
      "/admin/purchase-orders",
      payload
    );
    return res.data?.data ?? null;
  },

  updateStatus: async (id: string, status: POStatus): Promise<ApiPurchaseOrder | null> => {
    const res = await apiClient.put<Envelope<ApiPurchaseOrder>>(
      `/admin/purchase-orders/${id}/status`,
      { status }
    );
    return res.data?.data ?? null;
  },

  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/purchase-orders/${id}`);
  },
};

// Best-effort browser-side geocoder — used to populate lat/lng when creating a PO.
// Hits Nominatim (free, no API key). Returns null on any failure.
export async function geocodeCity(city: string, country?: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const q = encodeURIComponent([city, country].filter(Boolean).join(", "));
    const r = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${q}&limit=1`);
    if (!r.ok) return null;
    const data = await r.json();
    if (Array.isArray(data) && data.length > 0) {
      const top = data[0];
      return { lat: parseFloat(top.lat), lng: parseFloat(top.lon) };
    }
  } catch {}
  return null;
}
