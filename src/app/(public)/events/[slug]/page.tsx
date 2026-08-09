/* eslint-disable react-hooks/purity -- server component, Date.now() is evaluated once per request */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  CalendarDays,
  Clock,
  MapPin,
  Tag,
  Users,
  ImageOff,
  Link2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { RegistrationForm } from "@/components/RegistrationForm";
import { CopyLinkButton } from "@/components/CopyLinkButton";
import {
  formatDate,
  formatTime,
  formatNaira,
  getEventShortUrl,
  isSupabaseConfigured,
  cn,
} from "@/lib/utils";
import { generateEventQrDataUrl } from "@/lib/qrcode";

export const dynamic = "force-dynamic";

async function getEvent(slug: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("events")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  return data;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  if (!isSupabaseConfigured()) return {};
  const event = await getEvent(slug);
  if (!event) return { title: "Event not found" };
  return {
    title: event.title,
    description:
      event.tagline ??
      `Join ${event.title} at Huawei on ${formatDate(event.start_time)}.`,
    openGraph: {
      title: event.title,
      description: event.tagline ?? undefined,
      images: event.cover_image_url ? [{ url: event.cover_image_url }] : undefined,
    },
  };
}

export default async function EventPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  if (!isSupabaseConfigured()) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-slate-300">
        <p className="text-center text-sm">
          Supabase is not configured. See the README to finish setup.
        </p>
      </div>
    );
  }

  const supabase = await createClient();
  const { data: event } = await supabase
    .from("events")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (!event) notFound();

  const { data: countRow } = await supabase
    .from("event_registration_counts")
    .select("confirmed_count, waitlisted_count")
    .eq("event_id", event.id)
    .maybeSingle();

  const confirmedCount = (countRow?.confirmed_count as number) ?? 0;
  const waitlistedCount = (countRow?.waitlisted_count as number) ?? 0;

  const isPast = new Date(event.start_time).getTime() < Date.now();
  const spotsLeft =
    event.capacity != null ? Math.max(0, event.capacity - confirmedCount) : null;
  const isFull = spotsLeft === 0;

  const shortUrl = getEventShortUrl(event.slug);
  const description: string | null = event.description;
  const qrDataUrl = await generateEventQrDataUrl(shortUrl);

  return (
    <article className="mx-auto max-w-5xl px-4 py-10">
      {/* Cover */}
      <div className="relative aspect-[16/7] overflow-hidden rounded-3xl border border-white/10 bg-slate-800">
        {event.cover_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={event.cover_image_url}
            alt={event.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="grid h-full w-full place-items-center text-slate-600">
            <ImageOff size={48} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_360px]">
        {/* Left column */}
        <div>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {event.category && (
              <span className="rounded-full bg-emerald-400/10 px-3 py-1 font-semibold text-emerald-300">
                {event.category}
              </span>
            )}
            <span className="rounded-full bg-white/5 px-3 py-1 text-slate-300">
              {formatNaira(event.price)}
            </span>
            {event.organizer && (
              <span className="rounded-full bg-white/5 px-3 py-1 text-slate-300">
                {event.organizer}
              </span>
            )}
          </div>

          <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
            {event.title}
          </h1>
          {event.tagline && (
            <p className="mt-2 text-lg text-slate-400">{event.tagline}</p>
          )}

          <div className="mt-6 grid gap-3 rounded-2xl border border-white/10 bg-slate-900/60 p-5 text-sm sm:grid-cols-2">
            <div className="flex items-center gap-3">
              <CalendarDays className="shrink-0 text-emerald-400" size={18} />
              <div>
                <div className="text-xs uppercase tracking-wide text-slate-500">
                  Date
                </div>
                <div className="font-medium text-slate-200">
                  {formatDate(event.start_time)}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="shrink-0 text-emerald-400" size={18} />
              <div>
                <div className="text-xs uppercase tracking-wide text-slate-500">
                  Time
                </div>
                <div className="font-medium text-slate-200">
                  {formatTime(event.start_time)}
                  {event.end_time && ` – ${formatTime(event.end_time)}`}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="shrink-0 text-emerald-400" size={18} />
              <div>
                <div className="text-xs uppercase tracking-wide text-slate-500">
                  Venue
                </div>
                <div className="font-medium text-slate-200">
                  {event.venue ?? "TBA"}, {event.city}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Tag className="shrink-0 text-emerald-400" size={18} />
              <div>
                <div className="text-xs uppercase tracking-wide text-slate-500">
                  Price
                </div>
                <div className="font-medium text-slate-200">
                  {formatNaira(event.price)}
                </div>
              </div>
            </div>
          </div>

          {/* Capacity */}
          {event.capacity != null && (
            <div className="mt-4 rounded-2xl border border-white/10 bg-slate-900/60 p-5">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 font-medium text-slate-300">
                  <Users size={16} className="text-emerald-400" />
                  {isFull ? "Event is full" : `${spotsLeft} spots left`}
                </span>
                <span className="text-slate-500">
                  {confirmedCount}/{event.capacity} registered
                </span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    isFull ? "bg-rose-400" : "bg-green-400",
                  )}
                  style={{
                    width: `${Math.min(
                      100,
                      (confirmedCount / event.capacity) * 100,
                    )}%`,
                  }}
                />
              </div>
              {isFull && waitlistedCount > 0 && (
                <p className="mt-2 text-xs text-slate-400">
                  {waitlistedCount} on the waitlist — you can still join it.
                </p>
              )}
            </div>
          )}

          {/* Description */}
          {description && (
            <div className="mt-8">
              <h2 className="mb-3 text-lg font-bold">About this event</h2>
              <div className="space-y-3 text-[15px] leading-relaxed text-slate-300">
                {description.split(/\r?\n+/).map((line, i) =>
                  line.trim() ? <p key={i}>{line}</p> : null,
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right column — registration card */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-bold">
                {isFull ? "Join waitlist" : "Register"}
              </h2>
              <span
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-semibold",
                  isPast
                    ? "bg-slate-500/10 text-slate-400"
                    : isFull
                      ? "bg-rose-400/10 text-rose-300"
                      : "bg-green-400/10 text-green-300",
                )}
              >
                {isPast ? "Ended" : isFull ? "Full" : "Open"}
              </span>
            </div>

            <RegistrationForm
              eventId={event.id}
              isPast={isPast}
              shortUrl={shortUrl}
            />

            <div className="mt-5 border-t border-white/10 pt-4">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-xs text-slate-400">
                  <Link2 size={14} />
                  Share this event
                </span>
                <CopyLinkButton url={shortUrl} />
              </div>
              <div className="mt-4 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qrDataUrl}
                  alt={`QR code to register for ${event.title}`}
                  width={160}
                  height={160}
                  className="rounded-xl bg-white p-2"
                />
              </div>
              <p className="mt-2 text-center text-xs text-slate-500">
                Scan to open registration
              </p>
            </div>
          </div>
        </aside>
      </div>
    </article>
  );
}
