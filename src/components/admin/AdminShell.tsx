"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import {
  LayoutDashboard,
  PlusCircle,
  LogOut,
  Home,
  Zap,
  Menu,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/events/new", label: "New event", icon: PlusCircle },
  { href: "/", label: "View site", icon: Home },
];

export function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const isLogin = pathname === "/admin/login";
  const [open, setOpen] = useState(false);

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  if (isLogin) {
    return (
      <div className="min-h-screen bg-slate-950">{children}</div>
    );
  }

  const SidebarContent = (
    <div className="flex h-full flex-col">
      <Link href="/admin" className="flex items-center gap-2 px-2 py-3">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-500 text-slate-950">
          <Zap size={18} strokeWidth={2.5} />
        </span>
        <div>
          <div className="text-sm font-bold leading-tight">
            Huawei<span className="text-emerald-400">Events</span>
          </div>
          <div className="text-[10px] uppercase tracking-wider text-slate-500">
            Admin panel
          </div>
        </div>
      </Link>

      <nav className="mt-4 space-y-1">
        {NAV.map((item) => {
          const active =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition",
                active
                  ? "bg-emerald-500/10 text-emerald-300"
                  : "text-slate-400 hover:bg-white/5 hover:text-white",
              )}
            >
              <item.icon size={17} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <button
        onClick={logout}
        className="mt-auto flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 transition hover:bg-white/5 hover:text-rose-300"
      >
        <LogOut size={17} />
        Sign out
      </button>
    </div>
  );

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-60 shrink-0 border-r border-white/10 bg-slate-950 p-4 lg:block">
        {SidebarContent}
      </aside>

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-40 flex items-center justify-between border-b border-white/10 bg-slate-950/90 px-4 py-3 backdrop-blur lg:hidden">
          <Link href="/admin" className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-500 text-slate-950">
              <Zap size={16} strokeWidth={2.5} />
            </span>
            <span className="text-sm font-bold">
              Huawei<span className="text-emerald-400">Events</span>
            </span>
          </Link>
          <button
            onClick={() => setOpen((v) => !v)}
            className="rounded-lg p-2 text-slate-300 hover:bg-white/5"
            aria-label="Toggle admin menu"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </header>

        {open && (
          <div className="border-b border-white/10 bg-slate-950 p-4 lg:hidden">
            {SidebarContent}
          </div>
        )}

        <main className="p-4 sm:p-8">{children}</main>
      </div>
    </div>
  );
}
