"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/#events", label: "Events" },
  { href: "/#about", label: "About" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-500 text-slate-950">
            <Zap size={18} strokeWidth={2.5} />
          </span>
          <span className="text-lg font-bold tracking-tight">
            Huawei<span className="text-emerald-400">Events</span>
          </span>
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-slate-300 transition hover:text-white"
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/admin"
            className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-emerald-400/50 hover:text-emerald-300"
          >
            Admin
          </Link>
        </div>

        <button
          className="rounded-lg p-2 text-slate-200 hover:bg-white/5 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      <div className={cn("md:hidden", open ? "block" : "hidden")}>
        <div className="space-y-1 border-t border-white/10 bg-slate-950/95 px-4 pb-4 pt-2">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-200 hover:bg-white/5"
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/admin"
            onClick={() => setOpen(false)}
            className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-200 hover:bg-white/5"
          >
            Admin
          </Link>
        </div>
      </div>
    </header>
  );
}
