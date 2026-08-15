"use client";
import { create } from "zustand";

interface User {
  id: string; email: string; full_name: string; role: string;
}

interface AppState {
  user: User | null;
  token: string | null;
  cityId: string | null;
  scenarioId: string | null;
  policyId: string | null;
  currentYear: number;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  setCity: (id: string) => void;
  setScenario: (id: string) => void;
  setPolicy: (id: string) => void;
  setYear: (y: number) => void;
  hydrate: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  token: null,
  cityId: null,
  scenarioId: null,
  policyId: null,
  currentYear: 2025,
  setAuth: (user, token) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("cv_token", token);
      localStorage.setItem("cv_user", JSON.stringify(user));
    }
    set({ user, token });
  },
  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("cv_token");
      localStorage.removeItem("cv_user");
    }
    set({ user: null, token: null });
  },
  setCity: (id) => set({ cityId: id }),
  setScenario: (id) => set({ scenarioId: id }),
  setPolicy: (id) => set({ policyId: id }),
  setYear: (y) => set({ currentYear: y }),
  hydrate: () => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("cv_token");
      const userStr = localStorage.getItem("cv_user");
      if (token && userStr) {
        set({ token, user: JSON.parse(userStr) });
      }
    }
  },
}));
