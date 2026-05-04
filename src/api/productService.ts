import { apiClient } from "./client";

export const productService = {
  // Public route (Admins can use this to list too)
  listProducts: async (params?: any) => {
    const response = await apiClient.get("/products", { params });
    return response.data;
  },

  // Get single product by slug
  getProduct: async (slug: string) => {
    const response = await apiClient.get(`/products/${slug}`);
    return response.data;
  },

  // Admin routes
  createProduct: async (productData: any) => {
    const response = await apiClient.post("/products", productData);
    return response.data;
  },

  updateProduct: async (id: string, productData: any) => {
    const response = await apiClient.put(`/products/${id}`, productData);
    return response.data;
  },

  deleteProduct: async (id: string) => {
    const response = await apiClient.delete(`/products/${id}`);
    return response.data;
  },

  addVariant: async (productId: string, variantData: any) => {
    const response = await apiClient.post(`/products/${productId}/variants`, variantData);
    return response.data;
  },

  updateVariant: async (productId: string, variantId: string, variantData: any) => {
    const response = await apiClient.put(`/products/${productId}/variants/${variantId}`, variantData);
    return response.data;
  },

  removeImage: async (productId: string, imageId: string) => {
    const response = await apiClient.delete(`/products/${productId}/images/${imageId}`);
    return response.data;
  },
};

export const createProduct = (payload: {
  name: string;
  slug: string;
  description: string;
  shortDesc?: string;
  basePrice: string;  // Decimal as string "1999.00"
  salePrice?: string;
  categoryId: string;
  tag?: "NEW_SEASON" | "CORE" | "ESSENTIALS" | "LIMITED_EDITION" | "SALE";
  gender: "MEN" | "WOMEN" | "UNISEX";
}) => apiClient.post("/products", payload);