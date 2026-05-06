"use client";

import { useEffect, useRef } from "react";
import { io, type Socket } from "socket.io-client";

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3000";

export interface QueueUpdatePayload {
  message: string;
  current_token: number;
  now_serving_user?: { name: string; email: string } | null;
}

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(SOCKET_URL, { transports: ["websocket"] });
  }
  return socket;
}

export function useQueueSocket(
  queueId: string | undefined | null,
  onUpdate: (payload: QueueUpdatePayload) => void
) {
  const cb = useRef(onUpdate);
  cb.current = onUpdate;

  useEffect(() => {
    if (!queueId) return;
    const s = getSocket();
    s.emit("join_queue_room", queueId);
    const handler = (p: QueueUpdatePayload) => cb.current(p);
    s.on("queue_updated", handler);
    return () => {
      s.off("queue_updated", handler);
    };
  }, [queueId]);
}
