import { useState, useEffect } from "react";

export function useMainWebsite<T>(endpoint: string) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("adminAuthToken");
        const response = await fetch(`http://localhost:5000/api${endpoint}`, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });

        if (!response.ok) throw new Error("Failed to fetch data");
        
        const result = await response.json();
        setData(result);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [endpoint]);

  const viewOnMainWebsite = (path: string) => {
    window.open(`http://localhost:5173/${path}`, "_blank");
  };

  return { data, loading, error, viewOnMainWebsite };
}