/* eslint-disable react-hooks/purity -- server component, Date.now() is evaluated once per request */
import Link from "next/link";
import {
  CalendarDays,
  MapPin,
  Users,
  ArrowRight,
  ImageOff,
} from "lucide-react";
import type { EventRow } from "@/lib/types";
import { cn, formatDate, formatTime, formatNaira } from "@/lib/utils";

export function EventCard({
  event,
  registrations,
}: {
  event: EventRow;
  registrations?: number;
}) {
  const spotsLeft =
    event.capacity != null && registrations != null
      ? Math.max(0, event.capacity - registrations)
      : null;

  const isPast = new Date(event.start_time).getTime() < Date.now();

  return (
    <Link
      href={`/events/${event.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60 transition hover:border-emerald-400/40 hover:shadow-lg hover:shadow-emerald-500/5"
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-slate-800">
        {event.cover_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={event.cover_image_url}
            alt={event.title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="grid h-full w-full place-items-center text-slate-600">
            <ImageOff size={40} />
          </div>
        )}
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          {event.category && (
            <span className="rounded-full bg-slate-950/70 px-3 py-1 text-xs font-semibold text-emerald-300 backdrop-blur">
              {event.category}
            </span>
          )}
          {event.price > 0 && (
            <span className="rounded-full bg-slate-950/70 px-3 py-1 text-xs font-semibold text-amber-300 backdrop-blur">
              {formatNaira(event.price)}
            </span>
          )}
        </div>
        {isPast && (
          <div className="absolute right-3 top-3 rounded-full bg-slate-950/70 px-3 py-1 text-xs font-semibold text-slate-300 backdrop-blur">
            Past
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-center gap-4 text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <CalendarDays size={14} className="text-emerald-400" />
            {formatDate(event.start_time)}
          </span>
          <span>{formatTime(event.start_time)}</span>
        </div>

        <h3 className="text-lg font-bold leading-snug text-white transition group-hover:text-emerald-300">
          {event.title}
        </h3>
        {event.tagline && (
          <p className="line-clamp-2 text-sm leading-relaxed text-slate-400">
            {event.tagline}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between pt-2">
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <MapPin size={14} />
              {event.venue ?? event.city}
            </span>
            {spotsLeft != null && (
              <span
                className={cn(
                  "flex items-center gap-1 font-medium",
                  spotsLeft === 0
                    ? "text-rose-400"
                    : spotsLeft <= 10
                      ? "text-amber-400"
                      : "text-green-400",
                )}
              >
                <Users size={14} />
                {spotsLeft === 0 ? "Full" : `${spotsLeft} spots`}
              </span>
            )}
          </div>
          <ArrowRight
            size={16}
            className="text-slate-500 transition group-hover:translate-x-0.5 group-hover:text-emerald-400"
          />
        </div>
      </div>
    </Link>
  );
}
