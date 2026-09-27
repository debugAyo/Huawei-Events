"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from "react";
import type { ReactNode } from "react";

type Theme = "light" | "dark";

type Value = {
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggle: () => void;
};

const Ctx = createContext<Value>({
  theme: "dark",
  setTheme: () => {},
  toggle: () => {},
});

function readCookieTheme(): Theme | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(/(?:^|; )theme=([^;]+)/);
  if (!m) return null;
  const v = (m[1] ?? "").trim();
  return v === "dark" || v === "light" ? v : null;
}

function persist(theme: Theme) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.classList.toggle("light", theme === "light");
  document.documentElement.style.colorScheme = theme;
  document.cookie = `theme=${theme}; path=/; max-age=31536000; samesite=lax`;
}

let current: Theme | null = null;
const listeners = new Set<() => void>();

function getSnapshot(): Theme {
  if (current === null) {
    current = readCookieTheme() ?? "dark";
  }
  return current;
}

function getServerSnapshot(): Theme {
  return "dark";
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function setTheme(theme: Theme) {
  current = theme;
  for (const listener of listeners) listener();
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    persist(theme);
  }, [theme]);

  const value = useMemo<Value>(
    () => ({
      theme,
      setTheme,
      toggle: () => setTheme(theme === "dark" ? "light" : "dark"),
    }),
    [theme],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useTheme() {
  return useContext(Ctx);
}
