import { api } from "./api";
import type { DailyStats, Service, Token, TrackResponse } from "./types";

export interface QueueListItem {
  _id: string;
  service: Service;
  current_token: number;
  waiting_count: number;
}

export const queueApi = {
  list: () => api.get<{ queues: QueueListItem[] }>("/queue/list"),
  join: (queueId: string) =>
    api.post<{ message: string; token: Token }>("/queue/join", { queueId }),
  cancel: (tokenId: string) =>
    api.delete<{ message: string }>(`/queue/cancel/${tokenId}`),
  track: () => api.get<TrackResponse>("/queue/track"),
};

export interface HistoryItem {
  _id: string;
  token_number: number;
  status: Token["status"];
  user: { _id: string; name: string; email: string } | string;
  createdAt: string;
  called_time?: string;
  completed_time?: string;
}

export const adminApi = {
  callNext: (queueId: string) =>
    api.post<{ message: string; token: Token }>("/admin/call-next", {
      queueId,
    }),
  skip: (queueId: string) =>
    api.post<{ message: string; token: Token }>("/admin/skip", { queueId }),
  blacklist: (userId: string) =>
    api.post<{ message: string }>("/admin/blacklist", { userId }),
  stats: (queueId: string) => api.get<DailyStats>(`/admin/stats/${queueId}`),
  reset: (queueId: string) =>
    api.post<{ message: string }>(`/admin/reset/${queueId}`),
  history: (queueId: string) =>
    api.get<{ history: HistoryItem[] }>(`/admin/history/${queueId}`),
};

export const feedbackApi = {
  submit: (
    tokenId: string,
    rating: number,
    comment?: string,
    isAnonymous?: boolean
  ) =>
    api.post<{ message: string }>("/feedback/submit", {
      tokenId,
      rating,
      comment,
      isAnonymous,
    }),
};
