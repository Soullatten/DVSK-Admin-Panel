import { apiClient } from "./client";

export const uploadProductImage = (file: File) => {
  const formData = new FormData();
  formData.append("image", file);
  return apiClient.post("/upload/product-image", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// send multiple images with positions (0 = cover)
export const attachProductImages = (
  productId: string,
  images: { url: string; alt?: string }[]
) => apiClient.post(`/products/${productId}/images`, { images });

// add variants (sizes) for a product
export const addProductVariants = (
  productId: string,
  payload: {
    sizes: string[];
    color: string;
    colorHex?: string;
    priceOverride?: string;
    stock?: number;
  }
) => apiClient.post(`/products/${productId}/variants`, payload);