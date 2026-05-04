import { io, type Socket } from "socket.io-client";
import { auth } from "./firebase";
import { getAuthToken } from "../api/client";

const SOCKET_URL = "http://localhost:5000";

export async function connectLiveFeed(): Promise<Socket> {
  let token = getAuthToken();
  try {
    if (auth.currentUser) {
      token = await auth.currentUser.getIdToken();
    }
  } catch {
    // fall back to whatever's stored
  }

  const socket = io(`${SOCKET_URL}/live`, {
    auth: { token },
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 2000,
  });

  return socket;
}
