import { http } from "../../shared/api/http";
import type { User } from "../../entities/user/types";

export const authApi = {
  register: (username: string, email: string, password: string) =>
    http<User>("/api/auth/register", { method: "POST", json: { username, email, password } }),

  login: (email: string, password: string) =>
    http<{ user: User }>("/api/auth/login", { method: "POST", json: { email, password } }),

  logout: () => http<{ ok: true }>("/api/auth/logout", { method: "POST" }),

  me: () => http<User>("/api/auth/me"),
};