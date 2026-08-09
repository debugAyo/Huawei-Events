"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  CalendarDays,
  Users,
  UserPlus,
  Pencil,
  ListChecks,
  ExternalLink,
  MousePointerClick,
  QrCode,
  Search,
  CalendarClock,
  ImageOff,
  TicketCheck,
  ArrowRight,
} from "lucide-react";
import { DeleteEventButton } from "@/components/admin/DeleteEventButton";
import {
  EVENT_STATUS_LABELS,
  REGISTRATION_STATUS_LABELS,
  formatDate,
  formatTime,
  cn,
} from "@/lib/utils";
import type {
  EventStatus,
  EventRow,
  RegistrationRow,
} from "@/lib/types";

export interface DashboardEvent extends EventRow {
  confirmed: number;
  waitlisted: number;
}

export interface DashboardRegistration {
  id: string;
  full_name: string;
  email: string;
  status: RegistrationRow["status"];
  created_at: string;
  event_title: string;
  event_slug: string;
  event_id: string;
}

export interface DashboardStats {
  totalEvents: number;
  published: number;
  confirmed: number;
  waitlisted: number;
}

const STATUS_STYLES: Record<string, string> = {
  published: "bg-green-400/10 text-green-300",
  draft: "bg-slate-400/10 text-slate-300",
  cancelled: "bg-rose-400/10 text-rose-300",
  completed: "bg-sky-400/10 text-sky-300",
};

const FILTERS: { value: "all" | EventStatus; label: string }[] = [
  { value: "all", label: "All" },
  { value: "published", label: "Published" },
  { value: "draft", label: "Drafts" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

function CapacityBar({
  confirmed,
  capacity,
}: {
  confirmed: number;
  capacity: number | null;
}) {
  if (capacity == null) return null;
  const pct = Math.min(100, Math.round((confirmed / capacity) * 100));
  const isFull = confirmed >= capacity;
  return (
    <div>
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-slate-500">
          {confirmed}/{capacity} seats
        </span>
        <span
          className={cn(
            "font-semibold",
            isFull ? "text-rose-300" : "text-green-300",
          )}
        >
          {isFull ? "Full" : `${pct}%`}
        </span>
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/10">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            isFull ? "bg-rose-400" : "bg-green-400",
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  accent?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 transition hover:border-white/20">
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-400">{label}</span>
        <span className={cn("grid h-9 w-9 place-items-center rounded-xl", accent ?? "bg-emerald-500/15")}>
          {icon}
        </span>
      </div>
      <div className="mt-2 text-3xl font-bold">{value}</div>
    </div>
  );
}

export function AdminDashboard({
  events,
  upcoming,
  recent,
  stats,
}: {
  events: DashboardEvent[];
  upcoming: DashboardEvent[];
  recent: DashboardRegistration[];
  stats: DashboardStats;
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | EventStatus>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return events.filter((e) => {
      if (filter !== "all" && e.status !== filter) return false;
      if (!q) return true;
      return `${e.title} ${e.tagline ?? ""} ${e.category ?? ""}`
        .toLowerCase()
        .includes(q);
    });
  }, [events, query, filter]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-400">
            Manage your events and registrations.
          </p>
        </div>
        <Link
          href="/admin/events/new"
          className="flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
        >
          <UserPlus size={16} />
          New event
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total events"
          value={stats.totalEvents}
          icon={<CalendarDays size={18} className="text-emerald-300" />}
        />
        <StatCard
          label="Published"
          value={stats.published}
          icon={<CalendarDays size={18} className="text-green-300" />}
          accent="bg-green-400/10"
        />
        <StatCard
          label="Confirmed"
          value={stats.confirmed}
          icon={<Users size={18} className="text-green-300" />}
          accent="bg-green-400/10"
        />
        <StatCard
          label="Waitlisted"
          value={stats.waitlisted}
          icon={<TicketCheck size={18} className="text-amber-300" />}
          accent="bg-amber-400/10"
        />
      </div>

      {/* Upcoming events */}
      {upcoming.length > 0 && (
        <section>
          <div className="mb-3 flex items-center gap-2">
            <CalendarClock size={17} className="text-emerald-400" />
            <h2 className="font-semibold">Upcoming</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {upcoming.map((e) => {
              const isFull =
                e.capacity != null && e.confirmed >= e.capacity;
              return (
                <div
                  key={e.id}
                  className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 transition hover:border-emerald-400/30"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="text-xs text-slate-500">
                      {formatDate(e.start_time)}
                    </div>
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-1 text-[11px] font-semibold",
                        isFull
                          ? "bg-rose-400/10 text-rose-300"
                          : "bg-green-400/10 text-green-300",
                      )}
                    >
                      {isFull ? "Full" : `${Math.max(0, (e.capacity ?? 0) - e.confirmed)} left`}
                    </span>
                  </div>
                  <h3 className="mt-2 line-clamp-2 font-semibold leading-snug">
                    {e.title}
                  </h3>
                  <div className="mt-3">
                    <CapacityBar confirmed={e.confirmed} capacity={e.capacity} />
                  </div>
                  <Link
                    href={`/admin/events/${e.id}/registrations`}
                    className="mt-4 flex items-center gap-1 text-xs font-medium text-emerald-300 transition hover:text-emerald-200"
                  >
                    View registrations <ArrowRight size={13} />
                  </Link>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Search + filter + events grid */}
      <section>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-semibold">
            All events <span className="text-sm font-normal text-slate-500">({filtered.length})</span>
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search events…"
                className="w-48 rounded-lg border border-white/10 bg-slate-950 py-2 pl-9 pr-3 text-sm text-white placeholder:text-slate-600 focus:border-emerald-400 focus:outline-none"
              />
            </div>
            <div className="flex rounded-lg border border-white/10 bg-slate-950 p-0.5">
              {FILTERS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setFilter(f.value)}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-xs font-medium transition",
                    filter === f.value
                      ? "bg-emerald-500 text-slate-950"
                      : "text-slate-400 hover:text-white",
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-white/10 p-12 text-center text-sm text-slate-400">
            {events.length === 0
              ? "No events yet. Create your first one."
              : "No events match your search or filter."}
          </div>
        ) : (
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((e) => {
              const c = { confirmed: e.confirmed, waitlisted: e.waitlisted };
              return (
                <div
                  key={e.id}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-900/40 transition hover:border-white/20"
                >
                  <div className="relative aspect-[16/9] overflow-hidden bg-slate-800">
                    {e.cover_image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={e.cover_image_url}
                        alt={e.title}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="grid h-full w-full place-items-center text-slate-600">
                        <ImageOff size={36} />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent" />
                    <span
                      className={cn(
                        "absolute left-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-semibold",
                        STATUS_STYLES[e.status],
                      )}
                    >
                      {EVENT_STATUS_LABELS[e.status]}
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="font-semibold leading-snug">{e.title}</h3>
                    {e.tagline && (
                      <p className="mt-1 line-clamp-1 text-xs text-slate-500">
                        {e.tagline}
                      </p>
                    )}
                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <CalendarDays size={13} className="text-emerald-400" />
                        {formatDate(e.start_time)} · {formatTime(e.start_time)}
                      </span>
                    </div>

                    <div className="mt-4">
                      <CapacityBar confirmed={c.confirmed} capacity={e.capacity} />
                    </div>

                    <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                      <MousePointerClick size={13} />
                      {e.click_count} clicks
                      {c.waitlisted > 0 && (
                        <span className="ml-auto text-amber-300">
                          +{c.waitlisted} waitlisted
                        </span>
                      )}
                    </div>

                    <div className="mt-4 flex items-center gap-1 border-t border-white/10 pt-4">
                      <Link
                        href={`/events/${e.slug}`}
                        title="View on site"
                        className="rounded-lg p-2 text-slate-400 transition hover:bg-white/5 hover:text-white"
                      >
                        <ExternalLink size={16} />
                      </Link>
                      <Link
                        href={`/qr/${e.slug}`}
                        title="QR code"
                        target="_blank"
                        className="rounded-lg p-2 text-slate-400 transition hover:bg-white/5 hover:text-emerald-300"
                      >
                        <QrCode size={16} />
                      </Link>
                      <Link
                        href={`/admin/events/${e.id}/registrations`}
                        title="Registrations"
                        className="rounded-lg p-2 text-slate-400 transition hover:bg-white/5 hover:text-emerald-300"
                      >
                        <ListChecks size={16} />
                      </Link>
                      <Link
                        href={`/admin/events/${e.id}/edit`}
                        title="Edit"
                        className="rounded-lg p-2 text-slate-400 transition hover:bg-white/5 hover:text-emerald-300"
                      >
                        <Pencil size={16} />
                      </Link>
                      <div className="ml-auto">
                        <DeleteEventButton id={e.id} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Recent registrations */}
      {recent.length > 0 && (
        <section>
          <div className="mb-3 flex items-center gap-2">
            <UserPlus size={17} className="text-emerald-400" />
            <h2 className="font-semibold">Recent registrations</h2>
          </div>
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/40">
            {recent.map((r, i) => (
              <div
                key={r.id}
                className={cn(
                  "flex flex-wrap items-center gap-3 px-5 py-4 transition hover:bg-white/[0.02]",
                  i !== recent.length - 1 && "border-b border-white/5",
                )}
              >
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-emerald-500/10 text-sm font-bold text-emerald-300">
                  {r.full_name
                    .split(" ")
                    .map((p) => p[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium text-slate-100">
                    {r.full_name}
                  </div>
                  <div className="truncate text-xs text-slate-500">
                    {r.email} ·{" "}
                    <Link
                      href={`/admin/events/${r.event_id}/registrations`}
                      className="text-emerald-300 hover:text-emerald-200"
                    >
                      {r.event_title}
                    </Link>
                  </div>
                </div>
                <span
                  className={cn(
                    "rounded-full px-2.5 py-1 text-[11px] font-medium",
                    STATUS_STYLES[r.status],
                  )}
                >
                  {REGISTRATION_STATUS_LABELS[r.status]}
                </span>
                <span className="w-24 text-right text-xs text-slate-500">
                  {formatDate(r.created_at)}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
