export type Role = "customer" | "admin";

export interface User {
  _id: string;
  name: string;
  email: string;
  role: Role;
  isBlacklisted?: boolean;
}

export type TokenStatus =
  | "waiting"
  | "serving"
  | "done"
  | "cancelled"
  | "skipped";

export interface PopulatedUser {
  _id: string;
  name: string;
  email: string;
  role?: Role;
}

export interface PopulatedQueue {
  _id: string;
  current_token: number;
  service: Service | string;
}

export interface Token {
  _id: string;
  user: string | PopulatedUser;
  queue: string | PopulatedQueue;
  token_number: number;
  status: TokenStatus;
  estimated_time?: number;
  called_time?: string;
  completed_time?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Service {
  _id: string;
  service_name: string;
  description?: string;
}

export interface Queue {
  _id: string;
  service: string | Service;
  current_token: number;
}

export interface Feedback {
  _id: string;
  user: string | null;
  token: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  message?: string;
  massage?: string;
}

export interface TrackResponse {
  message: string;
  token: Token;
  people_ahead: number;
  real_time_estimated_wait: number;
}

export interface DailyStats {
  message: string;
  queueId: string;
  totalServed: number;
  avgWaitTimeMins: number | string;
}
