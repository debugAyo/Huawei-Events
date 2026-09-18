"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

type Theme = "light" | "dark";

type Value = {
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggle: () => void;
};

const Ctx = createContext<Value>({
  theme: "light",
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

function systemTheme(): Theme {
  if (typeof window === "undefined" || !window.matchMedia) return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function persist(theme: Theme) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.cookie = `theme=${theme}; path=/; max-age=31536000; samesite=lax`;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const initial: Theme = readCookieTheme() ?? systemTheme();
    setTheme(initial);
    persist(initial);
  }, []);

  useEffect(() => {
    persist(theme);
  }, [theme]);

  return (
    <Ctx.Provider
      value={{
        theme,
        setTheme,
        toggle: () => setTheme((t) => (t === "dark" ? "light" : "dark")),
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useTheme() {
  return useContext(Ctx);
}
