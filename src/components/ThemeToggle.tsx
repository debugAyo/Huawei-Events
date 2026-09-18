"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { cn } from "@/lib/utils";

export function ThemeToggle({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  const { theme, toggle } = useTheme();

  if (compact) {
    return (
      <button
        onClick={toggle}
        title={theme === "dark" ? "Switch to light" : "Switch to dark"}
        aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        className={cn(
          "grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-slate-300 transition hover:border-emerald-400/50 hover:text-emerald-300",
          className,
        )}
      >
        {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
      </button>
    );
  }

  return (
    <button
      onClick={toggle}
      className={cn(
        "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/5",
        className,
      )}
    >
      {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
      {theme === "dark" ? "Light mode" : "Dark mode"}
    </button>
  );
}
