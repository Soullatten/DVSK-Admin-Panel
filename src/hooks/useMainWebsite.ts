import { useState, useEffect } from "react";
import { apiClient } from "../api/client";
import { STOREFRONT_URL } from "../config";

export function useMainWebsite<T>(endpoint: string) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiClient.get(endpoint);
        const payload = response.data?.data ?? response.data;
        setData(Array.isArray(payload) ? payload : []);
      } catch (err: any) {
        const msg =
          err?.response?.data?.error?.message ||
          err?.response?.data?.message ||
          err?.message ||
          "Failed to fetch data";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [endpoint]);

  const viewOnMainWebsite = (path: string) => {
    window.open(`${STOREFRONT_URL}/${path.replace(/^\//, "")}`, "_blank");
  };

  return { data, loading, error, viewOnMainWebsite };
}
