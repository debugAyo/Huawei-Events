import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Users, AlertTriangle, CheckCircle2 } from "lucide-react";
import { requireAdmin } from "@/lib/admin";
import { RegistrationsTable } from "@/components/admin/RegistrationsTable";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function RegistrationsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { supabase } = await requireAdmin();

  const { data: event } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!event) notFound();

  const { data: registrations } = await supabase
    .from("registrations")
    .select("*")
    .eq("event_id", id)
    .order("created_at", { ascending: true });

  const confirmed =
    registrations?.filter((r) => r.status === "confirmed").length ?? 0;
  const waitlisted =
    registrations?.filter((r) => r.status === "waitlisted").length ?? 0;
  const checkedIn =
    registrations?.filter((r) => r.status === "checked_in").length ?? 0;
  const capacity = event.capacity ?? null;

  return (
    <div className="space-y-6">
      <Link
        href="/admin"
        className="inline-flex items-center gap-1.5 text-sm text-slate-400 transition hover:text-emerald-300"
      >
        <ArrowLeft size={15} /> Back to dashboard
      </Link>

      <div>
        <h1 className="text-2xl font-bold">{event.title}</h1>
        <p className="mt-1 text-sm text-slate-400">
          {formatDateTime(event.start_time)} ·{" "}
          {capacity ? `${capacity} seats` : "Unlimited seating"}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400">Confirmed</span>
            <CheckCircle2 size={18} className="text-emerald-400" />
          </div>
          <div className="mt-2 text-3xl font-bold">
            {confirmed}
            {capacity != null && (
              <span className="text-base font-normal text-slate-500">
                {" "}
                / {capacity}
              </span>
            )}
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400">Waitlisted</span>
            <AlertTriangle size={18} className="text-amber-400" />
          </div>
          <div className="mt-2 text-3xl font-bold">{waitlisted}</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400">Checked in</span>
            <Users size={18} className="text-sky-400" />
          </div>
          <div className="mt-2 text-3xl font-bold">{checkedIn}</div>
        </div>
      </div>

      <RegistrationsTable
        eventTitle={event.title}
        registrations={registrations ?? []}
      />
    </div>
  );
}
