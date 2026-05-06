"use client";

const KEY = "qm_saved_queues";

export interface SavedQueue {
  queueId: string;
  label: string;
}

export function listSavedQueues(): SavedQueue[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as SavedQueue[];
  } catch {
    return [];
  }
}

export function saveQueue(q: SavedQueue) {
  const list = listSavedQueues().filter((x) => x.queueId !== q.queueId);
  list.unshift(q);
  localStorage.setItem(KEY, JSON.stringify(list.slice(0, 10)));
}

export function removeSavedQueue(queueId: string) {
  const list = listSavedQueues().filter((x) => x.queueId !== queueId);
  localStorage.setItem(KEY, JSON.stringify(list));
}
