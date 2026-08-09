import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireAdmin } from "@/lib/admin";
import { EventForm } from "@/components/admin/EventForm";
import { CopyLinkButton } from "@/components/CopyLinkButton";
import { getEventShortUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function EditEventPage({
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

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-sm text-slate-400 transition hover:text-emerald-300"
        >
          <ArrowLeft size={15} /> Back to dashboard
        </Link>
        <CopyLinkButton url={getEventShortUrl(event.slug)} />
      </div>
      <div>
        <h1 className="text-2xl font-bold">Edit event</h1>
        <p className="mt-1 text-sm text-slate-400">
          Changes are published immediately.
        </p>
      </div>
      <EventForm mode="edit" event={event} />
    </div>
  );
}
