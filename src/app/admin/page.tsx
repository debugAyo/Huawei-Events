/* eslint-disable react-hooks/purity -- server component, Date.now() is evaluated once per request */
import { requireAdmin } from "@/lib/admin";
import type { EventRow, RegistrationRow } from "@/lib/types";
import {
  AdminDashboard,
  type DashboardEvent,
  type DashboardRegistration,
} from "@/components/admin/AdminDashboard";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const { supabase } = await requireAdmin();

  const [{ data: events }, { data: counts }, { data: recentRows }] =
    await Promise.all([
      supabase
        .from("events")
        .select("*")
        .order("start_time", { ascending: false }),
      supabase
        .from("event_registration_counts")
        .select("event_id, confirmed_count, waitlisted_count"),
      supabase
        .from("registrations")
        .select("id, event_id, full_name, email, status, created_at")
        .order("created_at", { ascending: false })
        .limit(6),
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

  const dashboardEvents: DashboardEvent[] = allEvents.map((e) => {
    const c = countMap.get(e.id);
    return {
      ...e,
      confirmed: c?.confirmed ?? 0,
      waitlisted: c?.waitlisted ?? 0,
    };
  });

  const now = Date.now();
  const upcoming = dashboardEvents
    .filter(
      (e) => e.status === "published" && new Date(e.start_time).getTime() > now,
    )
    .sort(
      (a, b) =>
        new Date(a.start_time).getTime() - new Date(b.start_time).getTime(),
    )
    .slice(0, 3);

  const eventById = new Map(dashboardEvents.map((e) => [e.id, e]));
  const recent: DashboardRegistration[] = (recentRows ?? []).flatMap((r) => {
    const ev = eventById.get(r.event_id);
    if (!ev) return [];
    return [
      {
        id: r.id,
        full_name: r.full_name,
        email: r.email,
        status: r.status as RegistrationRow["status"],
        created_at: r.created_at,
        event_title: ev.title,
        event_slug: ev.slug,
        event_id: ev.id,
      },
    ];
  });

  const totalConfirmed = dashboardEvents.reduce(
    (sum, e) => sum + e.confirmed,
    0,
  );
  const totalWaitlisted = dashboardEvents.reduce(
    (sum, e) => sum + e.waitlisted,
    0,
  );
  const published = allEvents.filter((e) => e.status === "published").length;

  return (
    <AdminDashboard
      events={dashboardEvents}
      upcoming={upcoming}
      recent={recent}
      stats={{
        totalEvents: allEvents.length,
        published,
        confirmed: totalConfirmed,
        waitlisted: totalWaitlisted,
      }}
    />
  );
}
