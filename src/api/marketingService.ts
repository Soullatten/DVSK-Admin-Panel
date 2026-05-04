import { apiClient } from "./client";

interface Envelope<T> { success: boolean; data: T; message?: string }

const unwrap = <T,>(r: { data: Envelope<T> }): T => r.data?.data;
const list = async <T,>(path: string): Promise<T[]> => {
  const r = await apiClient.get<Envelope<T[]>>(path);
  return Array.isArray(r.data?.data) ? r.data.data : [];
};

export const campaignsApi = {
  list: () => list<any>("/admin/campaigns"),
  create: async (payload: any) => unwrap<any>(await apiClient.post("/admin/campaigns", payload)),
  update: async (id: string, payload: any) => unwrap<any>(await apiClient.put(`/admin/campaigns/${id}`, payload)),
  remove: async (id: string) => apiClient.delete(`/admin/campaigns/${id}`),
};

export const automationsApi = {
  list: () => list<any>("/admin/automations"),
  create: async (payload: any) => unwrap<any>(await apiClient.post("/admin/automations", payload)),
  update: async (id: string, payload: any) => unwrap<any>(await apiClient.put(`/admin/automations/${id}`, payload)),
  remove: async (id: string) => apiClient.delete(`/admin/automations/${id}`),
};

export const giftCardsApi = {
  list: () => list<any>("/admin/gift-cards"),
  create: async (payload: any) => unwrap<any>(await apiClient.post("/admin/gift-cards", payload)),
  update: async (id: string, payload: any) => unwrap<any>(await apiClient.put(`/admin/gift-cards/${id}`, payload)),
  remove: async (id: string) => apiClient.delete(`/admin/gift-cards/${id}`),
};

export const marketsApi = {
  list: () => list<any>("/admin/markets"),
  create: async (payload: any) => unwrap<any>(await apiClient.post("/admin/markets", payload)),
  update: async (id: string, payload: any) => unwrap<any>(await apiClient.put(`/admin/markets/${id}`, payload)),
  remove: async (id: string) => apiClient.delete(`/admin/markets/${id}`),
};

export const catalogsApi = {
  list: () => list<any>("/admin/catalogs"),
  create: async (payload: any) => unwrap<any>(await apiClient.post("/admin/catalogs", payload)),
  update: async (id: string, payload: any) => unwrap<any>(await apiClient.put(`/admin/catalogs/${id}`, payload)),
  remove: async (id: string) => apiClient.delete(`/admin/catalogs/${id}`),
};

export const companiesApi = {
  list: (category?: string) => list<any>(`/admin/companies${category ? `?category=${category}` : ""}`),
  create: async (payload: any) => unwrap<any>(await apiClient.post("/admin/companies", payload)),
  update: async (id: string, payload: any) => unwrap<any>(await apiClient.put(`/admin/companies/${id}`, payload)),
  remove: async (id: string) => apiClient.delete(`/admin/companies/${id}`),
};

export const abandonedCheckoutsApi = {
  list: () => list<any>("/admin/abandoned-checkouts"),
};
