import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { EventForm } from "@/components/admin/EventForm";

export const metadata = { title: "New event" };

export default function NewEventPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        href="/admin"
        className="inline-flex items-center gap-1.5 text-sm text-slate-400 transition hover:text-emerald-300"
      >
        <ArrowLeft size={15} /> Back to dashboard
      </Link>
      <div>
        <h1 className="text-2xl font-bold">Create event</h1>
        <p className="mt-1 text-sm text-slate-400">
          Fill in the details below. Leave the slug blank to auto-generate a
          share link.
        </p>
      </div>
      <EventForm mode="create" />
    </div>
  );
}
