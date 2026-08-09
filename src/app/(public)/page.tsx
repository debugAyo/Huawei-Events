/* eslint-disable react-hooks/purity -- server component, Date.now() is evaluated once per request */
import type { Metadata } from "next";
import { Sparkles, CalendarClock } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { EventCard } from "@/components/EventCard";
import { SetupBanner } from "@/components/SetupBanner";
import { isSupabaseConfigured } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Upcoming events at Huawei",
};

export const dynamic = "force-dynamic";

export default async function Home() {
  if (!isSupabaseConfigured()) {
    return (
      <div className="mx-auto max-w-6xl space-y-8 px-4 py-16">
        <SetupBanner />
      </div>
    );
  }

  const supabase = await createClient();

  const [eventsRes, countsRes] = await Promise.all([
    supabase
      .from("events")
      .select("*")
      .eq("status", "published")
      .order("start_time", { ascending: true }),
    supabase
      .from("event_registration_counts")
      .select("event_id, confirmed_count"),
  ]);

  const counts = new Map<string, number>();
  for (const row of countsRes.data ?? []) {
    counts.set(row.event_id, row.confirmed_count ?? 0);
  }

  const now = Date.now();
  const events = eventsRes.data ?? [];
  const upcoming = events.filter(
    (e) => new Date(e.start_time).getTime() >= now,
  );
  const past = events.filter((e) => new Date(e.start_time).getTime() < now);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="relative mx-auto max-w-6xl px-4 py-20 text-center sm:py-28">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500 bg-emerald-500 px-4 py-1.5 text-xs font-semibold text-white">
            <Sparkles size={14} />
            Huawei
          </span>
          <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-extrabold leading-tight tracking-tight sm:text-6xl">
            Learn. Build.{" "}
            <span className="text-emerald-500">
              Ship.
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-slate-400 sm:text-lg">
            Discover workshops, hackathons and community events from Huawei —
            register in seconds, no account needed.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a
              href="#events"
              className="rounded-xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
            >
              Browse events
            </a>
          </div>
        </div>
      </section>

      {/* Upcoming */}
      <section id="events" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-2xl font-bold">
              <CalendarClock className="text-emerald-400" size={22} />
              Upcoming events
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              {upcoming.length} event{upcoming.length === 1 ? "" : "s"} on the
              way.
            </p>
          </div>
        </div>

        {upcoming.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-slate-900/40 p-12 text-center text-slate-400">
            No upcoming events right now — check back soon.
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {upcoming.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                registrations={counts.get(event.id)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Past */}
      {past.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pb-20">
          <h2 className="mb-6 text-xl font-bold text-slate-300">
            Past events
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {past.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                registrations={counts.get(event.id)}
              />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
