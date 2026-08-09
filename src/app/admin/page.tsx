import Link from "next/link";
import {
  CalendarDays,
  Users,
  Pencil,
  ListChecks,
  ExternalLink,
  MousePointerClick,
} from "lucide-react";
import { requireAdmin } from "@/lib/admin";
import { DeleteEventButton } from "@/components/admin/DeleteEventButton";
import { EVENT_STATUS_LABELS, formatDate, cn } from "@/lib/utils";
import type { EventRow } from "@/lib/types";

export const dynamic = "force-dynamic";

const STATUS_STYLES: Record<string, string> = {
  published: "bg-green-400/10 text-green-300",
  draft: "bg-slate-400/10 text-slate-300",
  cancelled: "bg-rose-400/10 text-rose-300",
  completed: "bg-sky-400/10 text-sky-300",
};

export default async function AdminDashboard() {
  const { supabase } = await requireAdmin();

  const [{ data: events }, { data: counts }] = await Promise.all([
    supabase
      .from("events")
      .select("*")
      .order("start_time", { ascending: false }),
    supabase
      .from("event_registration_counts")
      .select("event_id, confirmed_count, waitlisted_count"),
  ]);

  const allEvents: EventRow[] = events ?? [];
  const countMap = new Map<
    string,
    { confirmed: number; waitlisted: number }
  >();
  for (const c of counts ?? []) {
    countMap.set(c.event_id, {
      confirmed: c.confirmed_count ?? 0,
      waitlisted: c.waitlisted_count ?? 0,
    });
  }

  const totalConfirmed = [...countMap.values()].reduce(
    (sum, c) => sum + c.confirmed,
    0,
  );
  const totalWaitlisted = [...countMap.values()].reduce(
    (sum, c) => sum + c.waitlisted,
    0,
  );
  const published = allEvents.filter((e) => e.status === "published").length;

  const stats = [
    { label: "Total events", value: allEvents.length, icon: CalendarDays },
    { label: "Published", value: published, icon: CalendarDays },
    { label: "Confirmed", value: totalConfirmed, icon: Users },
    { label: "Waitlisted", value: totalWaitlisted, icon: Users },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-400">
          Manage your events and registrations.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-white/10 bg-slate-900/60 p-5"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">{s.label}</span>
              <s.icon size={18} className="text-emerald-400" />
            </div>
            <div className="mt-2 text-3xl font-bold">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Events table */}
      <div className="rounded-2xl border border-white/10 bg-slate-900/40">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <h2 className="font-semibold">All events</h2>
          <Link
            href="/admin/events/new"
            className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
          >
            + New event
          </Link>
        </div>

        {allEvents.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-400">
            No events yet. Create your first one.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wider text-slate-500">
                  <th className="px-5 py-3 font-medium">Event</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Starts</th>
                  <th className="px-4 py-3 font-medium">Registrations</th>
                  <th className="px-4 py-3 font-medium">
                    <span className="inline-flex items-center gap-1">
                      <MousePointerClick size={13} /> Clicks
                    </span>
                  </th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {allEvents.map((event) => {
                  const c = countMap.get(event.id);
                  return (
                    <tr
                      key={event.id}
                      className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]"
                    >
                      <td className="px-5 py-4">
                        <div className="font-medium text-slate-100">
                          {event.title}
                        </div>
                        <div className="text-xs text-slate-500">
                          /r/{event.slug}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={cn(
                            "rounded-full px-2.5 py-1 text-xs font-medium",
                            STATUS_STYLES[event.status],
                          )}
                        >
                          {EVENT_STATUS_LABELS[event.status]}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-slate-400">
                        {formatDate(event.start_time)}
                      </td>
                      <td className="px-4 py-4">
                        <span className="font-semibold text-green-300">
                          {c?.confirmed ?? 0}
                        </span>
                        <span className="text-slate-500">
                          {c?.waitlisted ? ` (+${c.waitlisted} WL)` : ""}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-slate-400">
                        {event.click_count}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/events/${event.slug}`}
                            title="View on site"
                            className="rounded-lg p-2 text-slate-400 transition hover:bg-white/5 hover:text-white"
                          >
                            <ExternalLink size={16} />
                          </Link>
                          <Link
                            href={`/admin/events/${event.id}/registrations`}
                            title="Registrations"
                            className="rounded-lg p-2 text-slate-400 transition hover:bg-white/5 hover:text-emerald-300"
                          >
                            <ListChecks size={16} />
                          </Link>
                          <Link
                            href={`/admin/events/${event.id}/edit`}
                            title="Edit"
                            className="rounded-lg p-2 text-slate-400 transition hover:bg-white/5 hover:text-emerald-300"
                          >
                            <Pencil size={16} />
                          </Link>
                          <DeleteEventButton id={event.id} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
