import { useEffect } from "react";
import type { Socket } from "socket.io-client";
import { connectLiveFeed } from "./liveSocket";

/**
 * Subscribe a CRUD admin page to backend "admin:data_changed" broadcasts.
 * Whenever Navya (or any future actor) creates/updates/deletes a resource of
 * this type, the page calls `refresh()` to re-fetch its data.
 *
 * Type names match the URL slug used on the admin nav, e.g.:
 *   "campaigns", "automations", "gift-cards", "markets", "catalogs",
 *   "companies", "purchase-orders", "products", "discounts".
 */
export function useAdminDataRefresh(type: string, refresh: () => void) {
  useEffect(() => {
    let cancelled = false;
    let socket: Socket | null = null;
    (async () => {
      socket = await connectLiveFeed();
      if (cancelled) {
        socket.disconnect();
        return;
      }
      socket.on("admin:data_changed", (payload: { type: string }) => {
        if (payload?.type === type) refresh();
      });
    })();
    return () => {
      cancelled = true;
      socket?.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);
}
